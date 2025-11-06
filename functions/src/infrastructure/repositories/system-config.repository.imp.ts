import { SystemConfigDataSource } from "../../domain/datasources/system-config.datasource";
import { UpdateSystemConfigDTO } from "../../domain/dtos/system-config";
import { SystemConfigEntity } from "../../domain/entities/system-config.entity";
import { SystemConfigRepository } from "../../domain/repositories/system-config.repository";

export class SystemConfigRepositoryImp implements SystemConfigRepository {
    constructor(private readonly dataSource: SystemConfigDataSource) { }

    async getConfig(): Promise<SystemConfigEntity> {
        return this.dataSource.getConfig();
    }

    async updateConfig(dto: UpdateSystemConfigDTO): Promise<SystemConfigEntity> {
        return this.dataSource.updateConfig(dto);
    }
}
