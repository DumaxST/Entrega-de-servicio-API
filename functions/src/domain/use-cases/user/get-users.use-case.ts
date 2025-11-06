import { UserFilters } from "../../datasources/user.datasource";
import { UserEntity } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user.repository";

export interface GetUsersUseCase {
    execute(filters?: UserFilters): Promise<UserEntity[]>;
}

export class GetUsers implements GetUsersUseCase {
    constructor(private readonly repository: UserRepository) { }

    async execute(filters?: UserFilters): Promise<UserEntity[]> {
        return this.repository.getAllUsers(filters);
    }
}
