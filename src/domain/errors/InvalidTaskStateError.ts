import { DomainError } from "./DomainError.js";

export class InvalidTaskStateError extends DomainError {
  constructor(message = "Invalid task state for this operation") {
    super(message);
  }
}
