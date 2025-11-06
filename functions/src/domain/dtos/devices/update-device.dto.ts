import { DeviceStatus, DevicePlatform } from "./create-device.dto";

export class UpdateDeviceDTO {
    private constructor(
        public readonly id: string,              // Device document ID
        public readonly name?: string,
        public readonly deviceType?: string,
        public readonly platform?: DevicePlatform,
        public readonly status?: DeviceStatus,
        public readonly lastReportDate?: Date | null,
        public readonly installationDate?: Date | null,
        public readonly lastMaintenanceDate?: Date | null,
        public readonly location?: string,
        public readonly notes?: string
    ) { }

    get values() {
        const returnObj: { [key: string]: any } = {};
        if (this.name) returnObj.name = this.name;
        if (this.deviceType) returnObj.deviceType = this.deviceType;
        if (this.platform) returnObj.platform = this.platform;
        if (this.status) returnObj.status = this.status;
        if (this.lastReportDate !== undefined) returnObj.lastReportDate = this.lastReportDate;
        if (this.installationDate !== undefined) returnObj.installationDate = this.installationDate;
        if (this.lastMaintenanceDate !== undefined) returnObj.lastMaintenanceDate = this.lastMaintenanceDate;
        if (this.location !== undefined) returnObj.location = this.location;
        if (this.notes !== undefined) returnObj.notes = this.notes;

        // Calculate daysWithoutReporting if lastReportDate is updated
        if (this.lastReportDate) {
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - this.lastReportDate.getTime());
            returnObj.daysWithoutReporting = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        return returnObj;
    }

    static create(props: { [key: string]: any }): [string?, UpdateDeviceDTO?] {
        const {
            id,
            name,
            deviceType,
            platform,
            status,
            lastReportDate,
            installationDate,
            lastMaintenanceDate,
            location,
            notes
        } = props;

        // Validate required fields
        if (typeof id !== "string" || id.trim() === "") {
            return ["ID del dispositivo es requerido.", undefined];
        }

        // Check at least one field to update
        const updateFields = Object.keys(props).filter(key =>
            key !== "id" && props[key] !== undefined
        );
        if (updateFields.length === 0) {
            return ["Debe proporcionar al menos un campo para actualizar.", undefined];
        }

        // Validate status if provided
        if (status) {
            const validStatuses: DeviceStatus[] = ["reporting", "not_reporting", "maintenance", "inactive"];
            if (!validStatuses.includes(status)) {
                return [`Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`, undefined];
            }
        }

        // Validate platform if provided
        if (platform) {
            const validPlatforms: DevicePlatform[] = ["wialon", "geotab", "other"];
            if (!validPlatforms.includes(platform.toLowerCase())) {
                return [`Plataforma inválida. Debe ser uno de: ${validPlatforms.join(", ")}`, undefined];
            }
        }

        // Date parsing helper
        const parseOptionalDate = (dateValue: any): Date | null | undefined => {
            if (dateValue === undefined) return undefined;
            if (dateValue === null) return null;
            const parsed = new Date(dateValue);
            if (isNaN(parsed.getTime())) {
                throw new Error("Formato de fecha inválido");
            }
            return parsed;
        };

        try {
            return [
                undefined,
                new UpdateDeviceDTO(
                    id.trim(),
                    name?.trim(),
                    deviceType?.trim(),
                    platform?.toLowerCase() as DevicePlatform,
                    status,
                    parseOptionalDate(lastReportDate),
                    parseOptionalDate(installationDate),
                    parseOptionalDate(lastMaintenanceDate),
                    location?.trim(),
                    notes?.trim()
                )
            ];
        } catch (error) {
            return [`Error al procesar fechas: ${error}`, undefined];
        }
    }
}
