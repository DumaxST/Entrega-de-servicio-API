import { DeviceEntity, DeviceRepository } from "../..";

export interface GetDeviceUseCase {
    execute(accountId: string, deviceId: string): Promise<DeviceEntity>;
}

export class GetDevice implements GetDeviceUseCase {
    constructor(private readonly repository: DeviceRepository) { }

    execute(accountId: string, deviceId: string): Promise<DeviceEntity> {
        return this.repository.getById(accountId, deviceId);
    }
}
