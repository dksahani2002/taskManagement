import { DomainError } from "./DomainError.js";

export class UnauthorizedTaskActionError extends DomainError {
  constructor() {
    super("Only the assignee can perform this action");
  }
}
