import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { TaskPriority } from "../../../domain/enums/enumTask.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import { TaskAlreadyCompletedError } from "../../../domain/errors/TaskAlreadyCompletedError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { Logger } from "../../../shared/logger/Logger.js";

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

    await this.taskRepository.update(task);

    this.logger.info("Task updated successfully", {
      taskId,
      requestBy: updates.requestBy
    });

    const taskAudit = new TaskAudit(
      null,
      taskId,
      TaskAuditAction.TASK_UPDATED,
      updates.requestBy,
      new Date()
    );

    try {
      await this.auditRepository.save(taskAudit);
    } catch {
      this.logger.error(
        "Failed to record task update audit",
        { taskId, requestBy: updates.requestBy }
      );
      throw new ConflictError("Failed to record audit for update");
    }
  }
}
