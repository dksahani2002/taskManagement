import { MongoTaskAuditRepository } from "../../infrastructure/db/repositories/MongoTaskAuditRepository.js";
import { AuditController } from "../../interfaceAdapters/controllers/AuditController.js";
import {GetTaskAuditService} from "../../application/usecases/TaskAuditUsecase/GetTaskAuditService.js"
import { Logger } from "../../shared/logger/Logger.js";
 
export function makeAuditController(logger:Logger): AuditController {
    const auditRepo=new MongoTaskAuditRepository();
    const fetchAudit=new GetTaskAuditService(auditRepo,logger);
    return new AuditController(fetchAudit);
}