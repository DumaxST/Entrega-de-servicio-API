import { DeviceDataSource, DeviceFilters } from "../../domain/datasources/device.datasource";
import { DeviceEntity } from "../../domain/entities/device.entity";
import { DeviceRepository } from "../../domain/repositories/device.repository";
import { CreateDeviceDTO, UpdateDeviceDTO } from "../../domain/dtos/devices";

export class DeviceRepositoryImp implements DeviceRepository {
    constructor(private readonly dataSource: DeviceDataSource) { }

    createDevice(accountId: string, dto: CreateDeviceDTO): Promise<DeviceEntity> {
        return this.dataSource.createDevice(accountId, dto);
    }

    getAllByAccount(accountId: string, filters?: DeviceFilters): Promise<DeviceEntity[]> {
        return this.dataSource.getAllByAccount(accountId, filters);
    }

    getById(accountId: string, deviceId: string): Promise<DeviceEntity> {
        return this.dataSource.getById(accountId, deviceId);
    }

    updateDevice(accountId: string, deviceId: string, dto: UpdateDeviceDTO): Promise<DeviceEntity> {
        return this.dataSource.updateDevice(accountId, deviceId, dto);
    }

    deleteDevice(accountId: string, deviceId: string): Promise<DeviceEntity> {
        return this.dataSource.deleteDevice(accountId, deviceId);
    }
}
