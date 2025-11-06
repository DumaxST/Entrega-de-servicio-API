import { DeviceEntity, DeviceRepository, CreateDeviceDTO } from "../..";

export interface CreateDeviceUseCase {
    execute(accountId: string, dto: CreateDeviceDTO): Promise<DeviceEntity>;
}

export class CreateDevice implements CreateDeviceUseCase {
    constructor(private readonly repository: DeviceRepository) { }

    execute(accountId: string, dto: CreateDeviceDTO): Promise<DeviceEntity> {
        return this.repository.createDevice(accountId, dto);
    }
}
