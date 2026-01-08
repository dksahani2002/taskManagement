import { TaskScheduler } from "../../application/ports/repositories/TaskScheduler.js";
import { agenda } from "./agenda.js";
import { AgendaJobs } from "./agendaJobs.js";
import { env } from "../../config/env.js";

export class AgendaTaskScheduler implements TaskScheduler {

  async scheduleDueReminder(taskId: string, dueAt: Date): Promise<void> {
    const offsetMs = env.task.reminderOffsetMinutes * 60 * 1000;
    const reminderAt = new Date(dueAt.getTime() - offsetMs);

    if (reminderAt <= new Date()) return;

    const job = agenda.create(AgendaJobs.TASK_DUE_REMINDER, { taskId });

    (job as any).attrs.attempts = 3;
    (job as any).attrs.backoff = { type: "fixed", delay: 300000 };

    await job.schedule(reminderAt);
    await job.save();
  }

  async scheduleOverdueCheck(taskId: string, dueAt: Date): Promise<void> {
    const job = agenda.create(AgendaJobs.TASK_OVERDUE_ESCALATION, { taskId });

    (job as any).attrs.attempts = 3;
    (job as any).attrs.backoff = { type: "fixed", delay: 300000 };

    await job.schedule(dueAt);
    await job.save();
  }

  async scheduleAutoClose(taskId: string): Promise<void> {
    const autoCloseAt = new Date(
      Date.now() + env.task.autoCloseDays * 24 * 60 * 60 * 1000
    );

    const job = agenda.create(AgendaJobs.TASK_AUTO_CLOSE, { taskId });

    (job as any).attrs.attempts = 3;
    (job as any).attrs.backoff = { type: "fixed", delay: 300000 };

    await job.schedule(autoCloseAt);
    await job.save();
  }

  async cancelTaskJobs(taskId: string): Promise<void> {
    await agenda.cancel({ "data.taskId": taskId });
  }
}
