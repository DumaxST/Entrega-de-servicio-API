import { PlatformEntity } from "../../entities/platform.entity";
import { PlatformRepository } from "../../repositories/platform.repository";

export interface GetPlatformsUseCase {
    execute(): Promise<PlatformEntity[]>;
}

export class GetPlatforms implements GetPlatformsUseCase {
    constructor(
        private readonly repository: PlatformRepository
    ) { }

    execute(): Promise<PlatformEntity[]> {
        return this.repository.getAll();
    }
}
