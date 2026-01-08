import { Request, Response } from "express";
import { FetchUser } from "../../application/usecases/UserUsecase/FetchUser.js";
import { CreateUser } from "../../application/usecases/UserUsecase/CreateUser.js";
import { UpdateUser } from "../../application/usecases/UserUsecase/UpdateUser.js";
import { DeleteUser } from "../../application/usecases/UserUsecase/DeleteUser.js";
import { createUserDTO } from "../../application/dto/userDto/CreateUserDTO.js";
import { logger } from "../../shared/logger/index.js";

export class UserController {
  constructor(
    private fetchUser: FetchUser,
    private createUser: CreateUser,
    private updateUser: UpdateUser,
    private deleteUser: DeleteUser
  ) {}

  // FETCH USERS
  fetch = async (req: Request, res: Response): Promise<Response> => {

    logger.info("Fetch users request recieved",{});

    const users = await this.fetchUser.execute();

    logger.info("Fetch users request completed",{})
    return res.status(200).json(
      users.map(user => ({
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        active: user.getDeletedAt()===null
      }))
    );
  };

  // CREATE USER
  create = async (req: Request, res: Response): Promise<Response> => {
    const { name, email } = req.body;
    logger.info("Create user request recieved",{
        name,
        email
    })
    const input: createUserDTO = {
      name,
      email
    };

    await this.createUser.execute(input);
    logger.info("User created successfully", { name,email });
    return res.status(201).json({ message: "User created successfully" });
  };

  // UPDATE USER
  update = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, email } = req.body;
    logger.info("Update user request recieved",{id,name,email});
    await this.updateUser.execute(id, name, email);
    logger.info("Update user request completed",{id,name,email});

    return res.status(200).json({ message: "User updated successfully" });
  };

  // DELETE USER (SOFT DELETE)
  delete = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    logger.info("Delete user request recieved",{id});

    await this.deleteUser.execute(id);

    logger.info("Delete user request completed",{id});

    return res.status(200).json({ message: "User deleted successfully" });
  };
}
