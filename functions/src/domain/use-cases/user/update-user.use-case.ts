import { UpdateUserDTO } from "../../dtos/users";
import { UserEntity } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user.repository";

export interface UpdateUserUseCase {
    execute(userId: string, dto: UpdateUserDTO): Promise<UserEntity>;
}

export class UpdateUser implements UpdateUserUseCase {
    constructor(private readonly repository: UserRepository) { }

    async execute(userId: string, dto: UpdateUserDTO): Promise<UserEntity> {
        return this.repository.updateUser(userId, dto);
    }
}
