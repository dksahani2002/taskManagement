import { UserAlreadyDeletedError } from "../../../domain/errors/UserAlreadyDeletedError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { NotFoundError } from "../../../shared/errors/NotFoundError.js";
import { UserRepository } from "../../ports/repositories/UserRepository.js";
import { Logger } from "../../../shared/logger/Logger.js";

export class DeleteUser {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.info("Deleting user", { userId: id });

    const user = await this.userRepository.findById(id);
    if (!user) {
      this.logger.warn("User delete failed - not found", { userId: id });
      throw new NotFoundError("User not found");
    }

    try {
      user.softDelete();
    } catch (err) {
      if (err instanceof UserAlreadyDeletedError) {
        this.logger.warn("User already deleted", { userId: id });
        throw new ConflictError(err.message);
      }
      throw err;
    }

    await this.userRepository.update(user);

    this.logger.info("User deleted successfully", { userId: id });
  }
}
