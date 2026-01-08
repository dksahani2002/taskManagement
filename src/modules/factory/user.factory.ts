import { MongoUserRepository } from '../../infrastructure/db/repositories/MongoUserRepository.js';
import { CreateUser } from '../../application/usecases/UserUsecase/CreateUser.js';
import { UpdateUser } from '../../application/usecases/UserUsecase/UpdateUser.js';
import { DeleteUser } from '../../application/usecases/UserUsecase/DeleteUser.js';
import { UserController } from '../../interfaceAdapters/controllers/UserController.js';
import { FetchUser } from '../../application/usecases/UserUsecase/FetchUser.js';
import { Logger } from '../../shared/logger/Logger.js';

export function makeUserController(logger:Logger): UserController {
    const userRepo = new MongoUserRepository();
    const fetchUser=new FetchUser(userRepo,logger);
    const createUser = new CreateUser(userRepo,logger);
    const updateUser = new UpdateUser(userRepo,logger);
    const deleteUser = new DeleteUser(userRepo,logger);
    return new UserController(fetchUser,createUser, updateUser, deleteUser);
}