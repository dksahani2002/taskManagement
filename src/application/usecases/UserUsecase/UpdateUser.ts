import { UserDeletedError } from "../../../domain/errors/UserDeletedError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { UserRepository } from "../../ports/repositories/UserRepository.js";
import { Logger } from "../../../shared/logger/Logger.js";

export class UpdateUser {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async execute(id: string, name?: string, email?: string): Promise<void> {
    this.logger.info("Updating user", {
      userId: id,
      fields: {
        nameProvided: name !== undefined,
        emailProvided: email !== undefined
      }
    });

    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn("User update failed - not found", { userId: id });
      throw new NotFoundError("User not found");
    }

    if (user.email === email && user.name === name) {
      this.logger.warn("User update skipped - no changes", { userId: id });
      throw new ConflictError("Already updated. Change either field");
    }

    try {
      user.update(name, email);
    } catch (err) {
      if (err instanceof UserDeletedError) {
        this.logger.warn("User update failed - user already deleted", {
          userId: id
        });
        throw new ConflictError(err.message);
      }
      throw err;
    }

    await this.userRepository.update(user);

    this.logger.info("User updated successfully", { userId: id });
  }
}
