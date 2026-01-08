import { UserRepository } from "../../ports/repositories/UserRepository.js";
import { User } from "../../../domain/entities/User.js";
import { Logger } from "../../../shared/logger/Logger.js";

export class FetchUser {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger
  ) {}

  async execute(): Promise<User[]> {
    this.logger.info("Fetching users");

    const users = await this.userRepository.findAll();

    this.logger.info("Users fetched", {
      count: users.length
    });

    return users;
  }
}
