import { CreateUserDTO, UpdateUserDTO, UserRole } from "../dtos/users";
import { UserEntity } from "../entities/user.entity";

export interface UserFilters {
    role?: UserRole;
}

export abstract class UserDataSource {
    abstract createUser(dto: CreateUserDTO): Promise<UserEntity>;
    abstract getUserById(userId: string): Promise<UserEntity>;
    abstract getAllUsers(filters?: UserFilters): Promise<UserEntity[]>;
    abstract updateUser(userId: string, dto: UpdateUserDTO): Promise<UserEntity>;
    abstract deleteUser(userId: string): Promise<UserEntity>;
}
