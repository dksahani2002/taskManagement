import { Router } from "express";

import { createTaskSchema, fetchTaskSchema,assignTaskSchema,updateDueDateSchema,cancelTaskSchema,completeTaskSchema,updateTaskSchema} from "../middlewares/validators/taskValidators.js";
import { validate } from "../middlewares/validators/validatorsMiddleware.js";
import { asyncHandler } from "../../modules/asyncHandler/asyncHandler.js";
import { taskController } from "../../container.js";

const router = Router();

router.get("/", validate(fetchTaskSchema), asyncHandler(taskController.fetch)); 
router.post("/", validate(createTaskSchema),asyncHandler(taskController.create)); 
router.post("/assign/:taskId", validate(assignTaskSchema),asyncHandler(taskController.assign)); 
router.post("/complete/:taskId",validate(completeTaskSchema), asyncHandler(taskController.complete));
router.put("/update/:taskId", validate(updateTaskSchema),asyncHandler(taskController.update));
router.put("/update-due-date/:taskId",validate(updateDueDateSchema), asyncHandler(taskController.updateDueDate));
router.delete("/cancel/:taskId",validate(cancelTaskSchema), asyncHandler(taskController.cancel));    

export default router;