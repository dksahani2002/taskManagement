import { makeAuditController } from "./modules/factory/audit.factory.js";
import { makeTaskController } from "./modules/factory/task.factory.js";
import { makeUserController } from "./modules/factory/user.factory.js";
import { logger } from "./shared/logger/index.js";
import { AuditController } from "./interfaceAdapters/controllers/AuditController.js";
import { TaskController } from "./interfaceAdapters/controllers/TaskController.js";
import { UserController } from "./interfaceAdapters/controllers/UserController.js";

export const auditController:AuditController=makeAuditController(logger);
export const taskController: TaskController = makeTaskController(logger);
export const userController: UserController = makeUserController(logger);

