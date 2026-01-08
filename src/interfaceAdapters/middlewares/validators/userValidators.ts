import Joi from "joi";

 
export const createUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).required(),
    email: Joi.string().email().required()
  }).required(),

  params: Joi.object().optional(),
  query: Joi.object().optional()
});
 
export const updateUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required()
  }).required(),

  body: Joi.object({
    name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional()
  })
    .min(1)  
    .required(),

  query: Joi.object().optional()
});
 
export const deleteUserSchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required()
  }).required(),

  body: Joi.object().optional(),
  query: Joi.object().optional()
});
