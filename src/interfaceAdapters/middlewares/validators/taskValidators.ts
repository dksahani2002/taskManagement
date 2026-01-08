import Joi from 'joi';
import { TaskPriority } from '../../../domain/enums/enumTask.js';
const priorities = Object.values(TaskPriority) as TaskPriority[];
export const createTaskSchema=Joi.object({
    body:Joi.object({
        userId:Joi.string().required(),
        title:Joi.string().required(),
        description:Joi.string().optional(),
        priority: Joi.string().valid(...priorities).optional(),
        dueAt:Joi.string().isoDate().optional()
    }),
    query:Joi.object().optional(),
    params:Joi.object().optional()

}) 
export const fetchTaskSchema=Joi.object({
    body:Joi.object().optional(),
    query:Joi.object({
        assigneeId:Joi.string().optional(),
        status:Joi.string().optional(),
        overdue:Joi.boolean().optional(),
        page:Joi.number().integer().min(1).optional(),
        limit:Joi.number().integer().min(1).optional(),

    }).optional(),
    params:Joi.object().optional()
})

export const assignTaskSchema=Joi.object({
    params:Joi.object({
        taskId:Joi.string().required()
    }).required(),
    body:Joi.object({
        assigneeId:Joi.string().required(),
    }),
    query: Joi.object().optional()
})
export const completeTaskSchema=Joi.object({
    params:Joi.object({
        taskId:Joi.string().required()
    }).required(),
    body:Joi.object({
        requestBy:Joi.string().required(),
    }),
    query: Joi.object().optional()
})
export const updateTaskSchema=Joi.object({
    params: Joi.object({
        taskId: Joi.string().required()
    }).required(),

    body: Joi.object({
        requestBy: Joi.string().required(),
        title: Joi.string().optional(),
        description: Joi.string().optional(),
        priority: Joi.string().valid(...priorities).optional(),

    }).required(),

    query: Joi.object().optional()
})
export const updateDueDateSchema=Joi.object({
    params: Joi.object({
        taskId: Joi.string().required()
    }).required(),

    body: Joi.object({
        requestBy: Joi.string().required(),
        newDueAt: Joi.string().isoDate().required()
    }).required(),

    query: Joi.object().optional()
})

export const cancelTaskSchema=Joi.object({
    params: Joi.object({
        taskId: Joi.string().required()
    }).required(),

    body: Joi.object().optional(),

    query: Joi.object().optional()
})