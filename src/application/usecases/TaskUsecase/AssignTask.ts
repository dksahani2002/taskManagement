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

    await this.taskRepository.update(task);

    this.logger.info("Task assigned successfully", {
      taskId,
      assigneeId
    });

    const audit = new TaskAudit(
      null,
      taskId,
      TaskAuditAction.TASK_ASSIGNED,
      assigneeId,
      new Date()
    );

    try {
      await this.auditRepository.save(audit);
    } catch {
      this.logger.error("Failed to record task assignment audit", {
        taskId,
        assigneeId
      });

      throw new ConflictError(
        "Failed to record audit for task assignment"
      );
    }
  }
}
