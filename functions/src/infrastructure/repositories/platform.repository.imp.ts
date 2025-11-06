import { PlatformDataSource } from "../../domain/datasources/platform.datasource";
import { CreatePlatformDTO, UpdatePlatformDTO } from "../../domain/dtos/platforms";
import { PlatformEntity } from "../../domain/entities/platform.entity";
import { PlatformRepository } from "../../domain/repositories/platform.repository";

export class PlatformRepositoryImp implements PlatformRepository {
    constructor(
        private readonly dataSource: PlatformDataSource
    ) { }

    createPlatform(createPlatformDto: CreatePlatformDTO): Promise<PlatformEntity> {
        return this.dataSource.createPlatform(createPlatformDto);
    }

    getAll(): Promise<PlatformEntity[]> {
        return this.dataSource.getAll();
    }

    getById(id: string): Promise<PlatformEntity> {
        return this.dataSource.getById(id);
    }

    getByName(name: string): Promise<PlatformEntity | null> {
        return this.dataSource.getByName(name);
    }

    updatePlatform(id: string, updatePlatformDto: UpdatePlatformDTO): Promise<PlatformEntity> {
        return this.dataSource.updatePlatform(id, updatePlatformDto);
    }

    deletePlatform(id: string): Promise<PlatformEntity> {
        return this.dataSource.deletePlatform(id);
    }
}
