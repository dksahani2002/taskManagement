import mongoose from "mongoose";
import { TaskPriority, TaskStatus } from "../../../domain/enums/enumTask.js";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    priority: {
      type: String,
      enum: Object.values(TaskPriority),
    },

    dueAt: { type: Date, default: null },

    assigneeId: { type: String, default: null },

    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.OPEN
    },

    createdAt: { type: Date, required: true, immutable: true },
    completedAt: { type: Date, default: null },

    reminderSentAt: { type: Date, default: null },
    overdueEscalatedAt: { type: Date, default: null }
  },
  { versionKey: false }
);

// Indexes
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueAt: 1 });
TaskSchema.index({ status: 1, dueAt: 1 }); 

export const TaskModel = mongoose.model("Task", TaskSchema);
