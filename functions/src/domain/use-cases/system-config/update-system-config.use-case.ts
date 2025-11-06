import { UpdateSystemConfigDTO } from "../../dtos/system-config";
import { SystemConfigEntity } from "../../entities/system-config.entity";
import { SystemConfigRepository } from "../../repositories/system-config.repository";

export interface UpdateSystemConfigUseCase {
    execute(dto: UpdateSystemConfigDTO): Promise<SystemConfigEntity>;
}

export class UpdateSystemConfig implements UpdateSystemConfigUseCase {
    constructor(private readonly repository: SystemConfigRepository) { }

    async execute(dto: UpdateSystemConfigDTO): Promise<SystemConfigEntity> {
        return this.repository.updateConfig(dto);
    }
}
