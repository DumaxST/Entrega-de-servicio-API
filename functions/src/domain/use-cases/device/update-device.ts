import { DeviceEntity, DeviceRepository, UpdateDeviceDTO } from "../..";

export interface UpdateDeviceUseCase {
    execute(accountId: string, deviceId: string, dto: UpdateDeviceDTO): Promise<DeviceEntity>;
}

export class UpdateDevice implements UpdateDeviceUseCase {
    constructor(private readonly repository: DeviceRepository) { }

    execute(accountId: string, deviceId: string, dto: UpdateDeviceDTO): Promise<DeviceEntity> {
        return this.repository.updateDevice(accountId, deviceId, dto);
    }
}
