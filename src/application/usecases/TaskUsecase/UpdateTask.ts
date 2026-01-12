import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { TaskPriority } from "../../../domain/enums/enumTask.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import { TaskAlreadyCompletedError } from "../../../domain/errors/TaskAlreadyCompletedError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { Logger } from "../../../shared/logger/Logger.js";
import mongoose from "mongoose";

export class UpdateTask {
  constructor(
    private taskRepository: TaskRepository,
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(
    taskId: string,
    updates: {
      requestBy: string;
      title?: string;
      description?: string;
      priority?: TaskPriority;
    }
  ): Promise<void> {

    this.logger.info("Updating task", {
      taskId,
      changes: {
        title: updates.title !== undefined,
        description: updates.description !== undefined,
        priority: updates.priority !== undefined
      },
      requestBy: updates.requestBy
    });

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.warn("Task update failed - task not found", { taskId });
      throw new NotFoundError("Task not found");
    }

    try {
      task.updateDetails(
        updates.title,
        updates.description,
        updates.priority
      );
    } catch (err) {
      if (err instanceof TaskAlreadyCompletedError) {
        this.logger.warn(
          "Task update failed - task already completed",
          { taskId, requestBy: updates.requestBy }
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
        TaskAuditAction.TASK_UPDATED,
        updates.requestBy,
        new Date()
      ); 
      await this.auditRepository.save(taskAudit,session);
      await session.commitTransaction();
      
      this.logger.info("Task updated and audit committed", {
        taskId,
        requestBy: updates.requestBy
      });

    }catch(err){
      await session.abortTransaction();
      this.logger.error("UpdateTask failed, transaction rolled back", {
        taskId,
        requestBy: updates.requestBy,
        error: err
      });

      throw err;
    }finally{
      session.endSession();
    }
  }
}
