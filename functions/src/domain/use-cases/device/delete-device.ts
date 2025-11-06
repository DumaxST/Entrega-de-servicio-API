import { DeviceEntity, DeviceRepository } from "../..";

export interface DeleteDeviceUseCase {
    execute(accountId: string, deviceId: string): Promise<DeviceEntity>;
}

export class DeleteDevice implements DeleteDeviceUseCase {
    constructor(private readonly repository: DeviceRepository) { }

    execute(accountId: string, deviceId: string): Promise<DeviceEntity> {
        return this.repository.deleteDevice(accountId, deviceId);
    }
}
