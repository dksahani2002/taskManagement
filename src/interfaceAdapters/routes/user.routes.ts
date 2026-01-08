import { Router } from "express";

import { validate } from "../middlewares/validators/validatorsMiddleware.js";
import { createUserSchema, deleteUserSchema, updateUserSchema } from "../middlewares/validators/userValidators.js";
import { asyncHandler } from "../../modules/asyncHandler/asyncHandler.js";
import { userController } from "../../container.js";


const router = Router();

router.get("/", asyncHandler(userController.fetch));
router.post("/", validate(createUserSchema),asyncHandler(userController.create));
router.put("/:id",validate(updateUserSchema), asyncHandler(userController.update));
router.delete("/:id",validate(deleteUserSchema), asyncHandler(userController.delete));

export default router;