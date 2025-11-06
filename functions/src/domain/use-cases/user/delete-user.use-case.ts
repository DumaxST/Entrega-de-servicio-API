import { UserEntity } from "../../entities/user.entity";
import { UserRepository } from "../../repositories/user.repository";

export interface DeleteUserUseCase {
    execute(userId: string): Promise<UserEntity>;
}

export class DeleteUser implements DeleteUserUseCase {
    constructor(private readonly repository: UserRepository) { }

    async execute(userId: string): Promise<UserEntity> {
        return this.repository.deleteUser(userId);
    }
}
