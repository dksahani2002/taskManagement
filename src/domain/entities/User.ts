import {
  UserAlreadyDeletedError,
  UserDeletedError,
  UserIdAlreadySetError
} from "../errors/index.js";

export class User {
  constructor(
    public id: string | null,
    public name: string,
    public email: string,
    private createdAt: Date = new Date(),
    private deletedAt: Date | null = null
  ) {}

  update(name?: string, email?: string) {
    if (this.isDeleted()) {
      throw new UserDeletedError();
    }
    if (name !== undefined) this.name = name;
    if (email !== undefined) this.email = email;
  }

  softDelete() {
    if (this.isDeleted()) {
      throw new UserAlreadyDeletedError();
    }
    this.deletedAt = new Date();
  }

  setId(id: string) {
    if (this.id) {
      throw new UserIdAlreadySetError();
    }
    this.id = id;
  }

 
//Queries

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getEmail(): string {
    return this.email;
  }

  getDeletedAt(): Date | null {
    return this.deletedAt;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }
}
