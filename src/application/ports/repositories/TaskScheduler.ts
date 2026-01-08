export interface TaskScheduler {
  scheduleDueReminder(taskId: string, dueAt: Date): Promise<void>;
  scheduleOverdueCheck(taskId: string, dueAt: Date): Promise<void>;
  scheduleAutoClose(taskId: string): Promise<void>;
  cancelTaskJobs(taskId: string): Promise<void>;
}

