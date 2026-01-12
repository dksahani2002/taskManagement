import { Task } from "../../../domain/entities/Task.js";
import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { TaskScheduler } from "../../ports/repositories/TaskScheduler.js";
import { CreateTaskDTO } from "../../dto/taskDto/CreateTaskDTO.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { Logger } from "../../../shared/logger/Logger.js";
import mongoose from "mongoose";
export class CreateTask {
  constructor(
    private taskRepository: TaskRepository,
    private taskScheduler: TaskScheduler,
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(input: CreateTaskDTO, requestBy: string): Promise<void> {
    const session=await mongoose.startSession();
    session.startTransaction();
    try{
        this.logger.info("Creating task", {
          title: input.title,
          assigneeId: input.assigneeId,
          hasDueDate: Boolean(input.dueAt),
          requestBy
        });
        const task = new Task(
          null,
          input.title,
          input.description,
          input.priority,
          input.dueAt,
          input.assigneeId
        ); 

        await this.taskRepository.create(task,session);
        const taskId = task.getId();

        
        const taskAudit = new TaskAudit(
          null,
          taskId,
          TaskAuditAction.TASK_CREATED,
          requestBy,
          new Date()
        );


        await this.auditRepository.save(taskAudit,session);
        session.commitTransaction();
        

        this.logger.info("Task and audit committed successfully", {
          taskId,
          requestBy
        });

        if (task.dueAt) {
          await this.taskScheduler.scheduleDueReminder(taskId, task.dueAt);
          await this.taskScheduler.scheduleOverdueCheck(taskId, task.dueAt);
        }

        await this.taskScheduler.scheduleAutoClose(taskId);
    } catch(err) {
        await session.abortTransaction();
        this.logger.error("CreateTask failed, transaction rolled back", {
        error:err,
        requestBy
      });

        throw err;
    }finally{
         session.endSession();
    }
  }
}
