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

    await this.taskRepository.update(task);

     
    await this.taskScheduler.cancelTaskJobs(taskId);

    if (task.dueAt) {
      await this.taskScheduler.scheduleDueReminder(taskId, task.dueAt);
      await this.taskScheduler.scheduleOverdueCheck(taskId, task.dueAt);
    }

    await this.taskScheduler.scheduleAutoClose(taskId);

    this.logger.info("Task due date updated successfully", {
      taskId,
      newDueAt,
      requestBy
    });

    const taskAudit = new TaskAudit(
      null,
      taskId,
      TaskAuditAction.TASK_DUEDATE_UPDATED,
      requestBy,
      new Date()
    );

    try {
      await this.auditRepository.save(taskAudit);
    } catch {
      this.logger.error(
        "Failed to record task due date update audit",
        { taskId, requestBy }
      );

      throw new ConflictError(
        "Failed to record audit for due date update"
      );
    }
  }
}
