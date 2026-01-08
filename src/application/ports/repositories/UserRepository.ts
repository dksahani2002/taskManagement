import { User } from "../../../domain/entities/User.js";

export interface UserRepository {
    findAll():Promise<User[]>;
    create(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    update( user: User): Promise<void>;
}