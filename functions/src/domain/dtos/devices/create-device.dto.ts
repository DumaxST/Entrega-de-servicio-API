export type DeviceStatus = "reporting" | "not_reporting" | "maintenance" | "inactive";
export type DevicePlatform = "wialon" | "geotab" | "other";

export class CreateDeviceDTO {
    private constructor(
        public readonly uid: string,                 // IMEI or platform device ID
        public readonly name: string,
        public readonly deviceType: string,
        public readonly platform: DevicePlatform,
        public readonly status: DeviceStatus = "reporting",
        public readonly lastReportDate?: Date | null,
        public readonly installationDate?: Date | null,
        public readonly lastMaintenanceDate?: Date | null,
        public readonly location?: string,
        public readonly notes?: string
    ) { }

    static create(props: { [key: string]: any }): [string?, CreateDeviceDTO?] {
        const {
            uid,
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

        // Required field validation
        if (!uid) return ["El UID (IMEI) es requerido.", undefined];
        if (!name) return ["El nombre del dispositivo es requerido.", undefined];
        if (!deviceType) return ["El tipo de dispositivo es requerido.", undefined];
        if (!platform) return ["La plataforma es requerida.", undefined];

        // IMEI validation (15 digits)
        const imeiRegex = /^\d{15}$/;
        if (!imeiRegex.test(uid.trim())) {
            return ["El UID debe ser un IMEI válido (15 dígitos numéricos).", undefined];
        }

        // Status validation
        const validStatuses: DeviceStatus[] = ["reporting", "not_reporting", "maintenance", "inactive"];
        const normalizedStatus: DeviceStatus = status || "reporting";
        if (!validStatuses.includes(normalizedStatus)) {
            return [`Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`, undefined];
        }

        // Platform validation
        const validPlatforms: DevicePlatform[] = ["wialon", "geotab", "other"];
        const normalizedPlatform = platform.toLowerCase();
        if (!validPlatforms.includes(normalizedPlatform)) {
            return [`Plataforma inválida. Debe ser uno de: ${validPlatforms.join(", ")}`, undefined];
        }

        // Date parsing helper
        const parseOptionalDate = (dateValue: any): Date | null => {
            if (!dateValue) return null;
            const parsed = new Date(dateValue);
            if (isNaN(parsed.getTime())) {
                throw new Error("Formato de fecha inválido");
            }
            return parsed;
        };

        try {
            return [
                undefined,
                new CreateDeviceDTO(
                    uid.trim(),
                    name.trim(),
                    deviceType.trim(),
                    normalizedPlatform as DevicePlatform,
                    normalizedStatus,
                    parseOptionalDate(lastReportDate),
                    parseOptionalDate(installationDate),
                    parseOptionalDate(lastMaintenanceDate),
                    location?.trim() || "",
                    notes?.trim() || ""
                )
            ];
        } catch (error) {
            return [`Error al procesar fechas: ${error}`, undefined];
        }
    }
}
