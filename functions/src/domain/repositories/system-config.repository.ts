import { UpdateSystemConfigDTO } from "../dtos/system-config";
import { SystemConfigEntity } from "../entities/system-config.entity";

export abstract class SystemConfigRepository {
    abstract getConfig(): Promise<SystemConfigEntity>;
    abstract updateConfig(dto: UpdateSystemConfigDTO): Promise<SystemConfigEntity>;
}
