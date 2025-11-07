import { PlatformEntity } from "../../entities/platform.entity";
import { PlatformRepository } from "../../repositories/platform.repository";
import { UpdatePlatformDTO } from "../../dtos/platforms";

export interface UpdatePlatformUseCase {
    execute(id: string, dto: UpdatePlatformDTO): Promise<PlatformEntity>;
}

export class UpdatePlatform implements UpdatePlatformUseCase {
    constructor(
        private readonly repository: PlatformRepository
    ) { }

    execute(id: string, dto: UpdatePlatformDTO): Promise<PlatformEntity> {
        return this.repository.updatePlatform(id, dto);
    }
}
