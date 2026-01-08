import { Task } from "../../../domain/entities/Task.js";
import { TaskStatus } from "../../../domain/enums/enumTask.js";
export interface TaskRepository {
    // findAll():Promise<Task[]>;
    find(filters: {
        assigneeId?: string;
        status?: TaskStatus;
        overdue?: boolean;
        page: number;
        limit: number;
    }): Promise<Task[]>;
    create(task: Task): Promise<void>;
    findById(id: string): Promise<Task | null>;
    update(task: Task): Promise<void>;
}