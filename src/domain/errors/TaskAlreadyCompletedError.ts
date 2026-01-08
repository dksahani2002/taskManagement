import { DomainError } from "./DomainError.js";

export class TaskAlreadyCompletedError extends DomainError{
    constructor(){
        super("Task is already completed")
    }
}