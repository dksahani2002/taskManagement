import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import {
  NotFoundError,
  ConflictError,
  BadRequestError,
  ForbiddenError
} from "../../../shared/errors/index.js";
import {
  TaskAlreadyCompletedError,
  TaskNotAssignedError,
  UnauthorizedTaskActionError,
  InvalidTaskStateError
} from "../../../domain/errors/index.js";
import { Logger } from "../../../shared/logger/Logger.js";

export class CompleteTask {
  constructor(
    private taskRepository: TaskRepository,
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(taskId: string, requestBy: string): Promise<void> {
    this.logger.info("Completing task", {
      taskId,
      requestBy
    });

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      this.logger.warn("Task completion failed - task not found", { taskId });
      throw new NotFoundError("Task not found");
    }

    try {
      task.complete(requestBy);
    } catch (err) {
      if (err instanceof TaskAlreadyCompletedError) {
        this.logger.warn("Task completion failed - already completed", {
          taskId,
          requestBy
        });
        throw new ConflictError(err.message);
      }

      if (err instanceof TaskNotAssignedError) {
        this.logger.warn("Task completion failed - task not assigned", {
          taskId,
          requestBy
        });
        throw new BadRequestError(err.message);
      }

      if (err instanceof UnauthorizedTaskActionError) {
        this.logger.warn("Task completion failed - unauthorized", {
          taskId,
          requestBy
        });
        throw new ForbiddenError(err.message);
      }

      if (err instanceof InvalidTaskStateError) {
        this.logger.warn("Task completion failed - invalid state", {
          taskId,
          requestBy
        });
        throw new BadRequestError(err.message);
      }

      throw err;
    }

    await this.taskRepository.update(task);

    this.logger.info("Task completed successfully", {
      taskId,
      requestBy
    });

    const taskAudit = new TaskAudit(
      null,
      taskId,
      TaskAuditAction.TASK_COMPLETED,
      requestBy,
      new Date()
    );

    try {
      await this.auditRepository.save(taskAudit);
    } catch {
      this.logger.error("Failed to record task completion audit", {
        taskId,
        requestBy
      });

      throw new ConflictError(
        "Failed to record audit for task completion"
      );
    }
  }
}
