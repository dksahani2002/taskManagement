import { DomainError } from "./DomainError.js";

export class TaskNotAssignedError extends DomainError {
  constructor() {
    super("Task must be assigned before completion");
  }
}
