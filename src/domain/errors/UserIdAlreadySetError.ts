import { DomainError } from "./DomainError.js";

export class UserIdAlreadySetError extends DomainError {
  constructor() {
    super("User ID already set");
  }
}
