import { CreateDeviceDTO, UpdateDeviceDTO } from "../dtos/devices";
import { DeviceEntity } from "../entities/device.entity";
import { DeviceFilters } from "../datasources/device.datasource";

export abstract class DeviceRepository {
    abstract createDevice(accountId: string, dto: CreateDeviceDTO): Promise<DeviceEntity>;
    abstract getAllByAccount(accountId: string, filters?: DeviceFilters): Promise<DeviceEntity[]>;
    abstract getById(accountId: string, deviceId: string): Promise<DeviceEntity>;
    abstract updateDevice(accountId: string, deviceId: string, dto: UpdateDeviceDTO): Promise<DeviceEntity>;
    abstract deleteDevice(accountId: string, deviceId: string): Promise<DeviceEntity>;
}
