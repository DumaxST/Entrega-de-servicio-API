import { SystemConfigEntity } from "../../entities/system-config.entity";
import { SystemConfigRepository } from "../../repositories/system-config.repository";

export interface GetSystemConfigUseCase {
    execute(): Promise<SystemConfigEntity>;
}

export class GetSystemConfig implements GetSystemConfigUseCase {
    constructor(private readonly repository: SystemConfigRepository) { }

    async execute(): Promise<SystemConfigEntity> {
        return this.repository.getConfig();
    }
}
