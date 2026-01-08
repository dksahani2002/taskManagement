import { TaskPriority, TaskStatus } from "../enums/enumTask.js";
import {
  TaskAlreadyCompletedError,
  TaskNotAssignedError,
  UnauthorizedTaskActionError,
  InvalidTaskStateError
} from "../errors/index.js";

export class Task {
  constructor(
    public id: string | null,
    public title: string,
    public description: string,
    public priority: TaskPriority = TaskPriority.LOW,
    public dueAt: Date | null = null,
    public assigneeId: string | null = null,
    public status: TaskStatus = TaskStatus.OPEN,

    private createdAt: Date = new Date(),
    private completedAt: Date | null = null,

    // Idempotency guards
    private reminderSentAt: Date | null = null,
    private overdueEscalatedAt: Date | null = null
  ) {}

 
  //Commands (user actions)
     

  assign(userId: string) {
    if (this.isCompleted()) {
      throw new TaskAlreadyCompletedError();
    }
    if (this.status !== TaskStatus.OPEN) {
      throw new InvalidTaskStateError("Only OPEN tasks can be assigned");
    }

    this.assigneeId = userId;
    this.status = TaskStatus.ASSIGNED;
  }

  complete(requestBy: string) {
    if (this.isCompleted()) {
      throw new TaskAlreadyCompletedError();
    }
    if (!this.assigneeId) {
      throw new TaskNotAssignedError();
    }
    if (this.assigneeId !== requestBy) {
      throw new UnauthorizedTaskActionError();
    }
    if (this.status !== TaskStatus.ASSIGNED) {
      throw new InvalidTaskStateError("Only ASSIGNED tasks can be completed");
    }

    this.status = TaskStatus.COMPLETED;
    this.completedAt = new Date();
  }

  updateDetails(
    title?: string,
    description?: string,
    priority?: TaskPriority
  ) {
    if (this.isCompleted()) {
      throw new TaskAlreadyCompletedError();
    }
    if (title !== undefined) this.title = title;
    if (description !== undefined) this.description = description;
    if (priority !== undefined) this.priority = priority;
  }

  updateDueDate(newDueAt: Date) {
    if (this.isCompleted()) {
      throw new TaskAlreadyCompletedError();
    }
    this.dueAt = newDueAt;
  }

  cancel() {
    if (this.isCompleted()) {
      throw new TaskAlreadyCompletedError();
    }
    this.status = TaskStatus.CANCELLED;
  }

  
  //System actions  
     
  completeBySystem() {
    if (this.isCompleted()) return;

    this.status = TaskStatus.COMPLETED;
    this.completedAt = new Date();
  }

  markReminderSent() {
    if (this.reminderSentAt) return;
    this.reminderSentAt = new Date();
  }

  markOverdueEscalated() {
    if (this.overdueEscalatedAt) return;
    this.overdueEscalatedAt = new Date();
  }

   
  // Identity
     

  setId(id: string) {
    if (this.id) {
      throw new InvalidTaskStateError("Task ID already set");
    }
    this.id = id;
  }

   
  // Queries  
      

  getId(): string {
    if (!this.id) {
      throw new InvalidTaskStateError("Task ID is not set");
    }
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  getStatus(): TaskStatus {
    return this.status;
  }

  getPriority(): TaskPriority {
    return this.priority;
  }

  getAssigneeId(): string | null {
    return this.assigneeId;
  }

  getDueAt(): Date | null {
    return this.dueAt;
  }

  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  isOverdue(now: Date = new Date()): boolean {
    if (!this.dueAt) return false;
    return now > this.dueAt && !this.isCompleted();
  }

  isReminderSent(): boolean {
    return this.reminderSentAt !== null;
  }

  isOverdueEscalated(): boolean {
    return this.overdueEscalatedAt !== null;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getCompletedAt(): Date | null {
    return this.completedAt;
  }

  getReminderSentAt(): Date | null {
    return this.reminderSentAt;
  }

  getOverdueEscalatedAt(): Date | null {
    return this.overdueEscalatedAt;
  }
}
