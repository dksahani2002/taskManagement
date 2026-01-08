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

      // unexpected → let errorMiddleware log it
      throw err;
    }

    await this.taskRepository.update(task);
    await this.taskScheduler.cancelTaskJobs(taskId);

    this.logger.info("Task cancelled successfully", {
      taskId,
      requestBy
    });

    const taskAudit = new TaskAudit(
      null,
      taskId,
      TaskAuditAction.TASK_CANCELLED,
      requestBy,
      new Date()
    );

    try {
      await this.auditRepository.save(taskAudit);
    } catch {
      this.logger.error("Failed to record task cancellation audit", {
        taskId,
        requestBy
      });

      throw new ConflictError(
        "Failed to record audit for task cancellation"
      );
    }
  }
}
