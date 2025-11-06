import { PlatformEntity } from "../../entities/platform.entity";
import { PlatformRepository } from "../../repositories/platform.repository";

export interface DeletePlatformUseCase {
    execute(id: string): Promise<PlatformEntity>;
}

export class DeletePlatform implements DeletePlatformUseCase {
    constructor(
        private readonly repository: PlatformRepository
    ) { }

    execute(id: string): Promise<PlatformEntity> {
        return this.repository.deletePlatform(id);
    }
}
