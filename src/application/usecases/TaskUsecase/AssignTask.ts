import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import {
  NotFoundError,
  BadRequestError,
  ConflictError
} from "../../../shared/errors/index.js";
import {
  TaskAlreadyCompletedError,
  InvalidTaskStateError
} from "../../../domain/errors/index.js";
import { Logger } from "../../../shared/logger/Logger.js";
import mongoose from "mongoose";

export class AssignTask {
  constructor(
    private taskRepository: TaskRepository,
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(taskId: string, assigneeId: string): Promise<void> {
    this.logger.info("Assigning task", { taskId, assigneeId });

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.warn("Task assignment failed - task not found", { taskId });
      throw new NotFoundError("Task not found");
    }

    try {
      task.assign(assigneeId);
    } catch (err) {
      if (err instanceof TaskAlreadyCompletedError) {
        this.logger.warn("Task assignment failed - already completed", {
          taskId,
          assigneeId
        });
        throw new ConflictError(err.message);
      }

      if (err instanceof InvalidTaskStateError) {
        this.logger.warn("Task assignment failed - invalid state", {
          taskId,
          assigneeId
        });
        throw new BadRequestError(err.message);
      }

      throw err;  
    }
    const session =await mongoose.startSession();
    session.startTransaction();
    try{
        await this.taskRepository.update(task,session);

        const audit = new TaskAudit(
          null,
          taskId,
          TaskAuditAction.TASK_ASSIGNED,
          assigneeId,
          new Date()
        );
        await this.auditRepository.save(audit,session);
        await session.commitTransaction();
        this.logger.info("Task assigned and audit committed", {
          taskId,
          assigneeId
        });
      }catch(err) {
        await session.abortTransaction();
        this.logger.error("AssignTask failed, transaction rolled back", {
          taskId,
          assigneeId,
          error:err
        });
      throw err;
    }finally{
      session.endSession();
    }
  }
}
