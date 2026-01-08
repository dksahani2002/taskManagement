import { AppError } from "./AppError.js";

export class NotFoundError extends AppError{
    constructor(message="Resource Not found "){
        super(message,404)
    }
}