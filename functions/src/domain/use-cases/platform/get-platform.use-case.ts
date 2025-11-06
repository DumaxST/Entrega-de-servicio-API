import { PlatformEntity } from "../../entities/platform.entity";
import { PlatformRepository } from "../../repositories/platform.repository";

export interface GetPlatformUseCase {
    execute(id: string): Promise<PlatformEntity>;
}

export class GetPlatform implements GetPlatformUseCase {
    constructor(
        private readonly repository: PlatformRepository
    ) { }

    execute(id: string): Promise<PlatformEntity> {
        return this.repository.getById(id);
    }
}
