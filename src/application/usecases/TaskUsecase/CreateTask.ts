import { Task } from "../../../domain/entities/Task.js";
import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { TaskScheduler } from "../../ports/repositories/TaskScheduler.js";
import { CreateTaskDTO } from "../../dto/taskDto/CreateTaskDTO.js";
import { AuditRepository } from "../../ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../../domain/enums/enumAudittask.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { Logger } from "../../../shared/logger/Logger.js";

export class CreateTask {
  constructor(
    private taskRepository: TaskRepository,
    private taskScheduler: TaskScheduler,
    private auditRepository: AuditRepository,
    private logger: Logger
  ) {}

  async execute(input: CreateTaskDTO, requestBy: string): Promise<void> {
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

    await this.taskRepository.create(task);
    const taskId = task.getId();

    if (task.dueAt) {
      await this.taskScheduler.scheduleDueReminder(taskId, task.dueAt);
      await this.taskScheduler.scheduleOverdueCheck(taskId, task.dueAt);
    }

    await this.taskScheduler.scheduleAutoClose(taskId);

    this.logger.info("Task created successfully", {
      taskId,
      requestBy
    });

    const taskAudit = new TaskAudit(
      null,
      taskId,
      TaskAuditAction.TASK_CREATED,
      requestBy,
      new Date()
    );

    try {
      await this.auditRepository.save(taskAudit);
    } catch {
      this.logger.error("Failed to record task creation audit", {
        taskId,
        requestBy
      });

      throw new ConflictError("Failed to record audit for task creation");
    }
  }
}
