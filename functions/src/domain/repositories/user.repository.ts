import { CreateUserDTO, UpdateUserDTO } from "../dtos/users";
import { UserEntity } from "../entities/user.entity";
import { UserFilters } from "../datasources/user.datasource";

export abstract class UserRepository {
    abstract createUser(dto: CreateUserDTO): Promise<UserEntity>;
    abstract getUserById(userId: string): Promise<UserEntity>;
    abstract getAllUsers(filters?: UserFilters): Promise<UserEntity[]>;
    abstract updateUser(userId: string, dto: UpdateUserDTO): Promise<UserEntity>;
    abstract deleteUser(userId: string): Promise<UserEntity>;
}
