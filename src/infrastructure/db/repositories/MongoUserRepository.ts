import { UserModel } from "../model/UserModel.js";
import { User } from "../../../domain/entities/User.js";
import { UserRepository } from "../../../application/ports/repositories/UserRepository.js";
import { RepositoryError } from "../../../shared/errors/RepositoryError.js";
import { logger } from "../../../shared/logger/index.js";

export class MongoUserRepository implements UserRepository {
        async findAll():Promise<User[]>{
            try{    
                const docs = await UserModel.find();
                return docs.map(
                doc =>
                    new User(
                    doc._id.toString(),
                    doc.name,
                    doc.email,
                    doc.createdAt,
                    doc.deletedAt 
                    )
                );

            }catch(err){
                logger.error("Failed to find Users",{
                    error : err
                })
                throw new RepositoryError("Failed to find Users",err);
            }
                
    }
    async create(user: User): Promise<void> {
        try{
            const doc = await UserModel.create({
                name: user.name,
                email: user.email,
                createdAt: user.getCreatedAt(),
                deletedAt: user.getDeletedAt()
            });
            user.setId(doc._id.toString());
        }catch(err){
            if(err.code===11000){
                logger.error("Failed to create Users",{
                    error : err
                })
                throw new RepositoryError("Duplicate key violation", err);
            }
            logger.error("Failed to create Users",{
                error : err
            })
            throw new RepositoryError("Failed to create User",err);
        }
       
    }

    async findById(id: string): Promise<User | null> {
        try{    
            const userDoc = await UserModel.findOne({ _id: id }).exec();
            if (!userDoc) {
                return null;
            }
            return new User(userDoc.id, userDoc.name, userDoc.email, userDoc.createdAt, userDoc.deletedAt);

        }catch(err){
            logger.error("Failed to find user by Id",{
                error : err
            })
            throw new RepositoryError("Failed to find user by Id",err);
        }
        
    }

    async update(user: User): Promise<void> {
        try{
            await UserModel.updateOne(
                { _id: user.id },
                { name: user.name, email: user.email, createdAt: user.getCreatedAt(), deletedAt: user.getDeletedAt() }
            );
        }catch(err){
            logger.error("Failed to update user",{
                error : err
            })
            throw new RepositoryError("Failed to update user",err);
        }
        
    }
}