import { CreatePlatformDTO, UpdatePlatformDTO } from "../dtos/platforms";
import { PlatformEntity } from "../entities/platform.entity";

export abstract class PlatformRepository {
    abstract createPlatform(createPlatformDto: CreatePlatformDTO): Promise<PlatformEntity>;
    abstract getAll(): Promise<PlatformEntity[]>;
    abstract getById(id: string): Promise<PlatformEntity>;
    abstract getByName(name: string): Promise<PlatformEntity | null>;
    abstract updatePlatform(id: string, updatePlatformDto: UpdatePlatformDTO): Promise<PlatformEntity>;
    abstract deletePlatform(id: string): Promise<PlatformEntity>;
}
