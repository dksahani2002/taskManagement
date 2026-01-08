import {Request,Response,NextFunction} from 'express';
import {ObjectSchema} from 'joi';

export const validate=(schema:ObjectSchema)=>
    (req:Request,res:Response,next:NextFunction)=>{
        const {error}=schema.validate({
                body:req.body,
                params:req.params,
                query:req.query
            }, { abortEarly: false }
        );
        if(error){
            return res.status(400).json({
                message:"validation error",
                errors:error.details.map((d)=>d.message)
            })
        }
        next();
    }
    
