import { UserDataSource, UserFilters } from "../../domain/datasources/user.datasource";
import { CreateUserDTO, UpdateUserDTO } from "../../domain/dtos/users";
import { UserEntity } from "../../domain/entities/user.entity";
import { UserRepository } from "../../domain/repositories/user.repository";

export class UserRepositoryImp implements UserRepository {
    constructor(private readonly dataSource: UserDataSource) { }

    async createUser(dto: CreateUserDTO): Promise<UserEntity> {
        return this.dataSource.createUser(dto);
    }

    async getUserById(userId: string): Promise<UserEntity> {
        return this.dataSource.getUserById(userId);
    }

    async getAllUsers(filters?: UserFilters): Promise<UserEntity[]> {
        return this.dataSource.getAllUsers(filters);
    }

    async updateUser(userId: string, dto: UpdateUserDTO): Promise<UserEntity> {
        return this.dataSource.updateUser(userId, dto);
    }

    async deleteUser(userId: string): Promise<UserEntity> {
        return this.dataSource.deleteUser(userId);
    }
}
