import mongoose from "mongoose";
import {TaskAuditAction} from "../../../domain/enums/enumAudittask.js"
const taskAuditSchema = new mongoose.Schema(
  {
    taskId: { type: String, required: true },
    action: {
      type: String,
      enum: Object.values(TaskAuditAction),
      required: true,
    },
    performedBy: { type: String, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
);

export const TaskAuditModel = mongoose.model("TaskAudit", taskAuditSchema);