import {Request,Response}from 'express'
import { GetTaskAuditService } from "../../application/usecases/TaskAuditUsecase/GetTaskAuditService.js";
import { logger } from '../../shared/logger/index.js';
export class AuditController{
    constructor(private getTaskAuditService:GetTaskAuditService){}
    fetch=async (req:Request,res:Response):Promise<void>=>{
        const {taskId}=req.params;
        logger.info("Fetch task audit request recieved",{taskId})
        const audits= await this.getTaskAuditService.execute(taskId);
        logger.info("Fetch task audit request completed",{taskId})
        res.status(200).json(audits);
            
    }
} 
