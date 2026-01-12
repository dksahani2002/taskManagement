import { ClientSession } from "mongoose";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";

export interface AuditRepository {
    save(audit: TaskAudit,session?:ClientSession): Promise<void>;
    findByTaskId(taskId: string): Promise<TaskAudit[]>;
}