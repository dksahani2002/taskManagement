import { agenda } from "./agenda.js";
import { AgendaJobs } from "./agendaJobs.js";
import { TaskRepository } from "../../application/ports/repositories/TaskRepository.js";
import { AuditRepository } from "../../application/ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../domain/entities/TaskAudit.js";
import { TaskAuditAction } from "../../domain/enums/enumAudittask.js";
import { logger } from "../../shared/logger/index.js";
import type { Job } from "agenda";

type TaskJobData = {
  taskId: string;
};

export function registerTaskJobHandlers(
  taskRepository: TaskRepository,
  auditRepository: AuditRepository
) {

  agenda.define<TaskJobData>(
    AgendaJobs.TASK_DUE_REMINDER,
    async (job: Job<TaskJobData>) => {
      const { taskId } = job.attrs.data;

      logger.info("Job started", {
        job: AgendaJobs.TASK_DUE_REMINDER,
        taskId
      });

      try {
        const task = await taskRepository.findById(taskId);

        if (!task || task.isReminderSent()) {
          logger.info("Reminder skipped (idempotent)", { taskId });
          return;
        }

        task.markReminderSent();
        await taskRepository.update(task);

        const audit = new TaskAudit(
          null,
          taskId,
          TaskAuditAction.DUE_REMINDER_SENT,
          "SYSTEM",
          new Date()
        );

        await auditRepository.save(audit);

        logger.info("Due reminder sent successfully", { taskId });
      } catch (err) {
        logger.error("Due reminder job failed", {
          err,
          taskId,
          job: AgendaJobs.TASK_DUE_REMINDER
        });
        throw err;  
      }
    }
  );

  agenda.define<TaskJobData>(
    AgendaJobs.TASK_OVERDUE_ESCALATION,
    async (job: Job<TaskJobData>) => {
      const { taskId } = job.attrs.data;

      logger.info("Job started", {
        job: AgendaJobs.TASK_OVERDUE_ESCALATION,
        taskId
      });

      try {
        const task = await taskRepository.findById(taskId);

        if (!task || !task.isOverdue() || task.isOverdueEscalated()) {
          logger.info("Overdue escalation skipped", { taskId });
          return;
        }

        task.markOverdueEscalated();
        await taskRepository.update(task);

        const audit = new TaskAudit(
          null,
          taskId,
          TaskAuditAction.TASK_OVERDUE_ESCALATED,
          "SYSTEM",
          new Date()
        );

        await auditRepository.save(audit);

        logger.warn("Task overdue escalated", { taskId });
      } catch (err) {
        logger.error("Overdue escalation job failed", {
          err,
          taskId,
          job: AgendaJobs.TASK_OVERDUE_ESCALATION
        });
        throw err;
      }
    }
  );

  agenda.define<TaskJobData>(
    AgendaJobs.TASK_AUTO_CLOSE,
    async (job: Job<TaskJobData>) => {
      const { taskId } = job.attrs.data;

      logger.info("Job started", {
        job: AgendaJobs.TASK_AUTO_CLOSE,
        taskId
      });

      try {
        const task = await taskRepository.findById(taskId);

        if (!task || task.isCompleted()) {
          logger.info("Auto-close skipped", { taskId });
          return;
        }

        task.completeBySystem();
        await taskRepository.update(task);

        const audit = new TaskAudit(
          null,
          taskId,
          TaskAuditAction.TASK_AUTO_CLOSED,
          "SYSTEM",
          new Date()
        );

        await auditRepository.save(audit);

        logger.info("Task auto-closed successfully", { taskId });
      } catch (err) {
        logger.error("Auto-close job failed", {
          err,
          taskId,
          job: AgendaJobs.TASK_AUTO_CLOSE
        });
        throw err;
      }
    }
  );
}
