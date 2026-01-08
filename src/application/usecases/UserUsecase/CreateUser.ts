import { UserRepository } from "../../ports/repositories/UserRepository.js";
import { User } from "../../../domain/entities/User.js";
import { createUserDTO } from "../../dto/userDto/CreateUserDTO.js";
import { RepositoryError } from "../../../shared/errors/RepositoryError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import { Logger } from "../../../shared/logger/Logger.js";

export class CreateUser {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async execute(input: createUserDTO): Promise<void> {
    this.logger.info("Creating user", {
      email: input.email
    });

    const user = new User(
      null,
      input.name,
      input.email
    );

    try {
      await this.userRepository.create(user);

      this.logger.info("User created successfully", {
        userId: user.id,
        email: input.email
      });

    } catch (err) {

      if (
        err instanceof RepositoryError &&
        err.message.includes("Duplicate key")
      ) {
        this.logger.warn("User creation failed - duplicate email", {
          email: input.email
        });

        throw new ConflictError("Email already exists");
      }

      
      throw err;
    }
  }
}
