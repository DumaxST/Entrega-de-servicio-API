import { PlatformEntity } from "../../entities/platform.entity";
import { PlatformRepository } from "../../repositories/platform.repository";
import { CreatePlatformDTO } from "../../dtos/platforms";

export interface CreatePlatformUseCase {
    execute(dto: CreatePlatformDTO): Promise<PlatformEntity>;
}

export class CreatePlatform implements CreatePlatformUseCase {
    constructor(
        private readonly repository: PlatformRepository
    ) { }

    execute(dto: CreatePlatformDTO): Promise<PlatformEntity> {
        return this.repository.createPlatform(dto);
    }
}
