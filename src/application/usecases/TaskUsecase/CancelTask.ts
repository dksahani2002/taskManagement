import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { TaskScheduler } from "../../ports/repositories/TaskScheduler.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError
} from "../../../shared/errors/index.js";
import {
  TaskAlreadyCompletedError,
  InvalidTaskStateError
} from "../../../domain/errors/index.js";
import { Logger } from "../../../shared/logger/Logger.js";
import mongoose from "mongoose";

export class CancelTask {
  constructor(
    private taskRepository: TaskRepository,
    private taskScheduler: TaskScheduler,
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(taskId: string, requestBy: string): Promise<void> {
    this.logger.info("Cancelling task", {
      taskId,
      requestBy
    });

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.warn("Task cancellation failed - task not found", { taskId });
      throw new NotFoundError("Task not found");
    }

    try {
      task.cancel();
    } catch (err) {
      if (err instanceof TaskAlreadyCompletedError) {
        this.logger.warn("Task cancellation failed - already completed", {
          taskId,
          requestBy
        });
        throw new ConflictError(err.message);
      }

      if (err instanceof InvalidTaskStateError) {
        this.logger.warn("Task cancellation failed - invalid state", {
          taskId,
          requestBy
        });
        throw new BadRequestError(err.message);
      }

      
      throw err;
    }
    const session =await mongoose.startSession();
    session.startTransaction();
    try {
        await this.taskRepository.update(task,session);

        const taskAudit = new TaskAudit(
          null,
          taskId,
          TaskAuditAction.TASK_CANCELLED,
          requestBy,
          new Date()
        );

      
        await this.auditRepository.save(taskAudit,session);
        await session.commitTransaction();
        this.logger.info("Task cancelled and audit committed", {
          taskId,
          requestBy
        });
    } catch(err) {
          await session.abortTransaction();
          this.logger.error("CancelTask failed, transaction rolled back", {
            taskId,
            requestBy,
            error :err
          });

          throw err;
    }finally{
      session.endSession();
    }
     await this.taskScheduler.cancelTaskJobs(taskId);
  }
}
