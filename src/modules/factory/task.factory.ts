import { MongoTaskRepository } from "../../infrastructure/db/repositories/MongoTaskRepository.js";
import { TaskController } from "../../interfaceAdapters/controllers/TaskController.js";
import { CreateTask } from "../../application/usecases/TaskUsecase/CreateTask.js";
import { AgendaTaskScheduler } from "../../infrastructure/scheduler/AgendaTaskSchedulerRepository.js";
import { AssignTask } from "../../application/usecases/TaskUsecase/AssignTask.js";
import { CompleteTask } from "../../application/usecases/TaskUsecase/CompleteTask.js";
import { UpdateTask } from "../../application/usecases/TaskUsecase/UpdateTask.js";
import { UpdateDueDateTask } from "../../application/usecases/TaskUsecase/UpdateDueDateTask.js";
import { CancelTask } from "../../application/usecases/TaskUsecase/CancelTask.js";
import { MongoTaskAuditRepository } from "../../infrastructure/db/repositories/MongoTaskAuditRepository.js";
import { FetchTask } from "../../application/usecases/TaskUsecase/FetchTask.js";
import { Logger } from "../../shared/logger/Logger.js";

export function makeTaskController(logger:Logger): TaskController {
    const taskRepo=new MongoTaskRepository();
    const schedulerRepo=new AgendaTaskScheduler();
    const auditRepo=new MongoTaskAuditRepository();
    const fetchTask=new FetchTask(taskRepo,logger);
    const assignTask=new AssignTask(taskRepo,auditRepo,logger);
    const cancelTask=new CancelTask(taskRepo, schedulerRepo,auditRepo,logger);
    const completeTask= new CompleteTask(taskRepo,auditRepo,logger);
    const createTask= new CreateTask(taskRepo, schedulerRepo,auditRepo,logger);
    const updateDueDateTask=new UpdateDueDateTask(taskRepo, schedulerRepo,auditRepo,logger);
    const updateTask=new UpdateTask(taskRepo,auditRepo,logger);
    return new TaskController(fetchTask,createTask, assignTask, completeTask, updateTask, cancelTask, updateDueDateTask);
}