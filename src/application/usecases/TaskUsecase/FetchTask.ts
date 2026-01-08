import { TaskRepository } from "../../ports/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { FetchTaskQuery } from "../../dto/taskDto/FetchTaskDTO.js";
import { TaskStatus } from "../../../domain/enums/enumTask.js";
import { Logger } from "../../../shared/logger/Logger.js";

export class FetchTask {
  constructor(
    private taskRepository: TaskRepository,
    private logger: Logger
  ) {}

  async execute(query: FetchTaskQuery): Promise<Task[]> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    this.logger.info("Fetching tasks", {
      filters: {
        assigneeId: query.assigneeId,
        status: query.status,
        overdue: query.overdue
      },
      pagination: { page, limit }
    });

    const tasks = await this.taskRepository.find({
      assigneeId: query.assigneeId,
      status: query.status as TaskStatus,
      overdue: query.overdue,
      page,
      limit
    });

    this.logger.info("Tasks fetched", {
      count: tasks.length,
      page,
      limit
    });

    return tasks;
  }
}
