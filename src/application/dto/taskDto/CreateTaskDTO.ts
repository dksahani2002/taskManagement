import { TaskPriority } from "../../../domain/enums/enumTask.js";

export interface CreateTaskDTO {
    title: string;
    description: string;
    priority?: TaskPriority;
    dueAt?: Date;
    assigneeId?: string | null;
}