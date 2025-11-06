import { CreateUserDTO } from "../../dtos/users";
import { UserEntity } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user.repository";

export interface CreateUserUseCase {
    execute(dto: CreateUserDTO): Promise<UserEntity>;
}

export class CreateUser implements CreateUserUseCase {
    constructor(private readonly repository: UserRepository) { }

    async execute(dto: CreateUserDTO): Promise<UserEntity> {
        return this.repository.createUser(dto);
    }
}
