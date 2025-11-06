import { CreateDeviceDTO, UpdateDeviceDTO, DeviceStatus, DevicePlatform } from "../dtos/devices";
import { DeviceEntity } from "../entities/device.entity";

export interface DeviceFilters {
    status?: DeviceStatus;
    deviceType?: string;
    platform?: DevicePlatform;
}

export abstract class DeviceDataSource {
    abstract createDevice(accountId: string, dto: CreateDeviceDTO): Promise<DeviceEntity>;
    abstract getAllByAccount(accountId: string, filters?: DeviceFilters): Promise<DeviceEntity[]>;
    abstract getById(accountId: string, deviceId: string): Promise<DeviceEntity>;
    abstract updateDevice(accountId: string, deviceId: string, dto: UpdateDeviceDTO): Promise<DeviceEntity>;
    abstract deleteDevice(accountId: string, deviceId: string): Promise<DeviceEntity>;
}
