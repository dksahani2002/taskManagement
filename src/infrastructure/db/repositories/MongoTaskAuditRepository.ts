import { ClientSession } from "mongoose";
import { AuditRepository } from "../../../application/ports/repositories/AuditRepository.js";
import { TaskAudit } from "../../../domain/entities/TaskAudit.js";
import { RepositoryError } from "../../../shared/errors/RepositoryError.js";
import { logger } from "../../../shared/logger/index.js";
import { TaskAuditModel } from "../model/AuditModel.js";
export class MongoTaskAuditRepository implements AuditRepository {

    async save(audit: TaskAudit,session?:ClientSession): Promise<void> {
      try{
          const doc =await TaskAuditModel.create([{
                    taskId: audit.taskId,
                    action: audit.action,
                    performedBy: audit.performedBy,
                    createdAt: audit.createdAt
               }],{session})
          audit.setId(doc[0]._id.toString());

      }catch(err){
        logger.error("Failed to save Audit task",{
          error:err.message,
          taskId:audit.taskId
        })
        throw new RepositoryError("Failed to save Audit task",err);
      }
       
    }

    async findByTaskId(taskId: string): Promise<TaskAudit[]> {
      try{
          const docs = await TaskAuditModel
          .find({ taskId })
          .sort({ createdAt: 1 });

        return docs.map(doc => {
          const audit = new TaskAudit(
              null,
              doc.taskId,
              doc.action,
              doc.performedBy,
              doc.createdAt
          );

          audit.setId(doc._id.toString());
          return audit;
        });
        
      }catch(err){
        logger.error("Failed to save Audit task",{
          error:err.message,
          taskId 
        })
        throw new RepositoryError("Failed to fetch Audit of task",err);
      }
       
    }
}