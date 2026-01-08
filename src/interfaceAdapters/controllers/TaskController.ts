import { Request, Response } from "express";
import { AssignTask } from "../../application/usecases/TaskUsecase/AssignTask.js";
import { CreateTask } from "../../application/usecases/TaskUsecase/CreateTask.js";
import { CreateTaskDTO } from "../../application/dto/taskDto/CreateTaskDTO.js";
import { CompleteTask } from "../../application/usecases/TaskUsecase/CompleteTask.js";
import { UpdateDueDateTask } from "../../application/usecases/TaskUsecase/UpdateDueDateTask.js";
import { UpdateTask } from "../../application/usecases/TaskUsecase/UpdateTask.js";
import { CancelTask } from "../../application/usecases/TaskUsecase/CancelTask.js";
import { FetchTask } from "../../application/usecases/TaskUsecase/FetchTask.js";
import { TaskStatus } from "../../domain/enums/enumTask.js";
import { logger } from "../../shared/logger/index.js";
export class TaskController {
  constructor(
    private fetchTask: FetchTask,
    private createTask: CreateTask,
    private assignTask: AssignTask,
    private completeTask: CompleteTask,
    private updateTask: UpdateTask,
    private cancelTask: CancelTask,
    private updateDueDateTask: UpdateDueDateTask
  ) {}

  // FETCH TASKS (FILTER + PAGINATION)
  fetch = async (req: Request, res: Response): Promise<Response> => {

    logger.info("Fetch task request recieved",{
        query:req.query
    });

    const tasks = await this.fetchTask.execute({
      assigneeId: req.query.assigneeId as string | undefined,
      status: req.query.status as TaskStatus | undefined,
      overdue: req.query.overdue === "true",
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10
    });

    const response = tasks.map(task => ({
      id: task.getId(),
      title: task.getTitle(),
      status: task.getStatus(),
      priority: task.getPriority(),
      assigneeId: task.getAssigneeId(),
      dueAt: task.getDueAt(),
      createdAt: task.getCreatedAt()
    }));

    logger.info("Fetch task completed",{
        count: response.length
    });

    return res.status(200).json(response);
  };

  // CREATE TASK
  create = async (req: Request, res: Response): Promise<Response> => {
    const { userId, title, description, priority, dueAt } = req.body;

    logger.info("Create task request received", { userId });

    const parsedDueAt = dueAt ? new Date(dueAt) : null;

    const taskInput: CreateTaskDTO = {
      title,
      description,
      priority,
      dueAt: parsedDueAt
    };

    await this.createTask.execute(taskInput, userId);

    logger.info("Task created successfully", { userId });

    return res.status(201).json({ message: "Task created successfully" });
  };

  // ASSIGN TASK
  assign = async (req: Request, res: Response): Promise<Response> => {
    const { taskId } = req.params;
    const { assigneeId } = req.body;

    logger.info("Assign task request received", { taskId, assigneeId });

    await this.assignTask.execute(taskId, assigneeId);

    logger.info("Task assigned successfully", { taskId, assigneeId });

    return res.status(200).json({ message: "Task assigned successfully" });
  };

  // COMPLETE TASK
  complete = async (req: Request, res: Response): Promise<Response> => {
    const { taskId } = req.params;
    const { requestBy } = req.body;

    logger.info("Complete task request received", { taskId, requestBy });

    await this.completeTask.execute(taskId, requestBy);

    logger.info("Task completed successfully", { taskId });

    return res.status(200).json({ message: "Task completed successfully" });
  };

  // UPDATE TASK
  update = async (req: Request, res: Response): Promise<Response> => {
    const { taskId } = req.params;
    const { requestBy, title, description, priority } = req.body;

    logger.info("Update task request received", { taskId, requestBy });

    await this.updateTask.execute(taskId, {
      requestBy,
      title,
      description,
      priority
    });

    logger.info("Task updated successfully", { taskId });

    return res.status(200).json({ message: "Task updated successfully" });
  };

  // UPDATE DUE DATE
  updateDueDate = async (req: Request, res: Response): Promise<Response> => {
    const { taskId } = req.params;
    const { requestBy, newDueAt } = req.body;

    logger.info("Update due date request received", {
      taskId,
      newDueAt
    });

    const parsedDueAt = new Date(newDueAt);

    await this.updateDueDateTask.execute(taskId, parsedDueAt, requestBy);

    logger.info("Task due date updated successfully", { taskId });

    return res.status(200).json({ message: "Task due date updated successfully" });
  };

  // CANCEL TASK
  cancel = async (req: Request, res: Response): Promise<Response> => {
    const { taskId } = req.params;
    const { requestBy } = req.body;

    logger.info("Cancel task request received", { taskId, requestBy });

    await this.cancelTask.execute(taskId, requestBy);

    logger.info("Task canceled successfully", { taskId });
    
    return res.status(200).json({ message: "Task canceled successfully" });
  };
}
