import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { TaskScheduler } from "../../ports/repositories/TaskScheduler.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import { TaskAlreadyCompletedError } from "../../../domain/errors/TaskAlreadyCompletedError.js";
import {
  ConflictError,
  NotFoundError
} from "../../../shared/errors/index.js";
import { Logger } from "../../../shared/logger/Logger.js";
import mongoose from "mongoose";

export class UpdateDueDateTask {
  constructor(
    private taskRepository: TaskRepository,
    private taskScheduler: TaskScheduler,
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(
    taskId: string,
    newDueAt: Date,
    requestBy: string
  ): Promise<void> {

    this.logger.info("Updating task due date", {
      taskId,
      newDueAt,
      requestBy
    });

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.warn("Task due date update failed - task not found", {
        taskId
      });
      throw new NotFoundError("Task not found");
    }

    try {
      task.updateDueDate(newDueAt);
    } catch (err) {
      if (err instanceof TaskAlreadyCompletedError) {
        this.logger.warn(
          "Task due date update failed - task already completed",
          { taskId, requestBy }
        );
        throw new ConflictError(err.message);
      }
      throw err;  
    }

    const session=await mongoose.startSession();
    session.startTransaction();
    try{
        await this.taskRepository.update(task,session);
        const taskAudit = new TaskAudit(
          null,
          taskId,
          TaskAuditAction.TASK_DUEDATE_UPDATED,
          requestBy,
          new Date()
        ); 
        await this.auditRepository.save(taskAudit,session);
        await session.commitTransaction();

        this.logger.info("Task due date updated and audit committed", {
          taskId,
          newDueAt,
          requestBy
        });
    }catch(err){
      await session.abortTransaction();

      this.logger.error("UpdateDueDateTask failed, transaction rolled back", {
        taskId,
        requestBy,
        error: err
      });
      throw err;
    }finally{
      session.endSession();
    }
    

     
    await this.taskScheduler.cancelTaskJobs(taskId);

    if (task.dueAt) {
      await this.taskScheduler.scheduleDueReminder(taskId, task.dueAt);
      await this.taskScheduler.scheduleOverdueCheck(taskId, task.dueAt);
    }

    await this.taskScheduler.scheduleAutoClose(taskId); 
    
  }
}
