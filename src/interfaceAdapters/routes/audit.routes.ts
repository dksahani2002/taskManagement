import { Router } from "express";
import { asyncHandler } from "../../modules/asyncHandler/asyncHandler.js";
import { auditController } from "../../container.js";


const router=Router();

router.post("/:taskId",asyncHandler(auditController.fetch));

export default router;