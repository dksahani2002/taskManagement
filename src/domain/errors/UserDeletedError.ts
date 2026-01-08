import { DomainError } from "./DomainError.js";

export class UserDeletedError extends DomainError {
  constructor() {
    super("Cannot update a deleted user");
  }
}
