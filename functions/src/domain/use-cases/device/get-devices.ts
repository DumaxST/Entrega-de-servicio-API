import { DeviceEntity, DeviceRepository } from "../..";
import { DeviceFilters } from "../../datasources/device.datasource";

export interface GetDevicesUseCase {
    execute(accountId: string, filters?: DeviceFilters): Promise<DeviceEntity[]>;
}

export class GetDevices implements GetDevicesUseCase {
    constructor(private readonly repository: DeviceRepository) { }

    execute(accountId: string, filters?: DeviceFilters): Promise<DeviceEntity[]> {
        return this.repository.getAllByAccount(accountId, filters);
    }
}
