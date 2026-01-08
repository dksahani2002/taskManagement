import { DomainError } from "./DomainError.js";

export class UserAlreadyDeletedError extends DomainError {
  constructor() {
    super("User is already deleted");
  }
}
