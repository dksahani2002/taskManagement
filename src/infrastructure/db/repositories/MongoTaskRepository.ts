import { TaskRepository } from "../../../application/ports/repositories/TaskRepository.js";
import { Task } from "../../../domain/entities/Task.js";
import { TaskModel } from "../model/TaskModel.js";
import { TaskPriority, TaskStatus } from "../../../domain/enums/enumTask.js";
import { RepositoryError } from "../../../shared/errors/RepositoryError.js";
import { logger } from "../../../shared/logger/index.js";

export class MongoTaskRepository implements TaskRepository {
    // Implementation details...
    async find(filters:{
        assigneeId?: string;
        status?: TaskStatus;
        overdue?: boolean;
        page: number;
        limit: number;
    }):Promise<Task[]>{
        try{
            const {assigneeId,status,overdue,page,limit}=filters;
            const query:any={};
            if(assigneeId){
                query.assigneeId=assigneeId;
            }
            if(status){
                query.status=status;
            }
            if(overdue===true){
                query.status={$ne:TaskStatus.COMPLETED};
                query.dueAt={$lt: new Date()}
            }
            const docs=await TaskModel.find(query).skip((page-1)*limit).limit(limit).sort({createdAt:-1});
            return docs.map(doc =>
                new Task(
                    doc._id.toString(),
                    doc.title,
                    doc.description,
                    doc.priority as TaskPriority,
                    doc.dueAt,
                    doc.assigneeId,
                    doc.status as TaskStatus,
                    doc.createdAt,
                    doc.completedAt,
                    doc.reminderSentAt,
                    doc.overdueEscalatedAt
                )
            );
        }catch(err){
            logger.error("Failed to fetch task",{
                error:err
            })
            throw new RepositoryError("Failed to fetch task",err);
        }
       
    }
    async create(task:Task): Promise<void> {
        try{
            const doc =await TaskModel.create({
                title: task.title,
                    description: task.description,
                
                    priority:  task.priority,

                    dueAt: task.dueAt,

                    assigneeId: task.assigneeId,
                    status:  task.status || TaskStatus.OPEN,
                
                    createdAt: task.getCreatedAt(),
                    completedAt: task.getCompletedAt(),
                    reminderSentAt: task.getReminderSentAt(),
                    overdueEscalatedAt: task.getOverdueEscalatedAt()
            })
            task.setId(doc._id.toString());
        }catch(err){
            logger.error("Failed to create task",{
                error:err
            })
            throw new RepositoryError("Failed to create task",err);
        }
       
        
    }
    async findById(id: string): Promise<Task | null> {
        try{
            // MongoDB findById logic here
            const taskDoc=await TaskModel.findById(id);
            if(!taskDoc){
                return null;
            }
        
            return new Task(
                taskDoc._id.toString(),
                taskDoc.title,
                taskDoc.description,
                taskDoc.priority as TaskPriority,
                taskDoc.dueAt,
                taskDoc.assigneeId,
                taskDoc.status as TaskStatus,
                taskDoc.createdAt,
                taskDoc.completedAt,
                taskDoc.reminderSentAt,
                taskDoc.overdueEscalatedAt
            );   
        }catch(err){
            logger.error("Failed to fetch find task by ID",{
                error:err
            })
            throw new RepositoryError("Failed to find task by ID",err);
        }
        
    }
    async update(task: Task): Promise<void> {
        try{    
             const taskId = task.getId();  

            await TaskModel.updateOne(
                { _id: taskId },
                {
                $set: {
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    dueAt: task.dueAt,
                    assigneeId: task.assigneeId,
                    status: task.status,
                    completedAt: task.getCompletedAt(),
                    reminderSentAt: task.getReminderSentAt(),
                    overdueEscalatedAt: task.getOverdueEscalatedAt(),
                },
                }
            );

        }catch(err){
            logger.error("Failed to update task",{
                error:err
            })
            throw new RepositoryError("Failed to udpate Task",err);
        }
       
    }
}