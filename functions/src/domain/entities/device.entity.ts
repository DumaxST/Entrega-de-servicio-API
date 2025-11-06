import { DeviceStatus } from "../dtos/devices";

export class DeviceEntity {
    constructor(
        public readonly id: string,              // Firestore document ID
        public readonly uid: string,             // IMEI or platform device ID
        public name: string,
        public deviceType: string,
        public platform: string,
        public status: DeviceStatus,
        public daysWithoutReporting: number,
        public lastReportDate?: Date | null,
        public installationDate?: Date | null,
        public lastMaintenanceDate?: Date | null,
        public location?: string,
        public notes?: string,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    // Business methods
    public markAsReporting(reportDate: Date) {
        this.status = "reporting";
        this.lastReportDate = reportDate;
        this.daysWithoutReporting = 0;
    }

    public markForMaintenance() {
        if (this.status === "maintenance") return;
        this.status = "maintenance";
    }

    public activate() {
        this.status = "reporting";
    }

    public deactivate() {
        this.status = "inactive";
    }

    public updateDaysWithoutReporting() {
        if (!this.lastReportDate) {
            this.daysWithoutReporting = 0;
            return;
        }
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - this.lastReportDate.getTime());
        this.daysWithoutReporting = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Auto-update status based on reporting
        if (this.daysWithoutReporting > 7 && this.status === "reporting") {
            this.status = "not_reporting";
        }
    }

    get isReporting(): boolean {
        return this.status === "reporting" && this.daysWithoutReporting < 7;
    }

    get isActive(): boolean {
        return this.status !== "inactive";
    }

    // Factory method with validation
    public static fromObject(object: { [key: string]: any }): DeviceEntity {
        const {
            id,
            uid,
            name,
            deviceType,
            platform,
            status,
            daysWithoutReporting,
            lastReportDate,
            installationDate,
            lastMaintenanceDate,
            location,
            notes,
            createdAt,
            updatedAt
        } = object;

        // Validate required fields
        if (!id) throw new Error("Device Entity: ID es requerido");
        if (!uid) throw new Error("Device Entity: UID (IMEI) es requerido");
        if (!name) throw new Error("Device Entity: Nombre es requerido");
        if (!deviceType) throw new Error("Device Entity: Tipo de dispositivo es requerido");
        if (!platform) throw new Error("Device Entity: Plataforma es requerida");
        if (!status) throw new Error("Device Entity: Estado es requerido");
        if (!createdAt) throw new Error("Device Entity: Created At es requerido");

        // Validate types
        if (typeof id !== "string") throw new Error("Device Entity: ID debe ser un string");
        if (typeof uid !== "string") throw new Error("Device Entity: UID debe ser un string");
        if (typeof name !== "string") throw new Error("Device Entity: Nombre debe ser un string");

        // Validate UID format (IMEI - 15 digits)
        const imeiRegex = /^\d{15}$/;
        if (!imeiRegex.test(uid)) {
            throw new Error("Device Entity: UID debe ser un IMEI válido (15 dígitos)");
        }

        // Validate status
        const validStatuses: DeviceStatus[] = ["reporting", "not_reporting", "maintenance", "inactive"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Device Entity: Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`);
        }

        // Validate platform
        const validPlatforms = ["wialon", "geotab", "other"];
        if (!validPlatforms.includes(platform.toLowerCase())) {
            throw new Error(`Device Entity: Plataforma inválida. Debe ser uno de: ${validPlatforms.join(", ")}`);
        }

        // Parse dates (handle Firestore Timestamps)
        const parseDate = (date: any): Date | null => {
            if (!date) return null;
            if (date instanceof Date) return date;
            if (date && typeof date.toDate === "function") return date.toDate();
            throw new Error("Device Entity: Formato de fecha inválido");
        };

        const parsedLastReportDate = parseDate(lastReportDate);
        const parsedInstallationDate = parseDate(installationDate);
        const parsedLastMaintenanceDate = parseDate(lastMaintenanceDate);

        let parsedCreatedAt: Date;
        if (createdAt instanceof Date) {
            parsedCreatedAt = createdAt;
        } else if (createdAt && typeof createdAt.toDate === "function") {
            parsedCreatedAt = createdAt.toDate();
        } else {
            throw new Error("Device Entity: Created At debe ser una fecha válida o Firestore Timestamp");
        }

        let parsedUpdatedAt: Date | undefined;
        if (updatedAt) {
            if (updatedAt instanceof Date) {
                parsedUpdatedAt = updatedAt;
            } else if (updatedAt && typeof updatedAt.toDate === "function") {
                parsedUpdatedAt = updatedAt.toDate();
            }
        }

        return new DeviceEntity(
            id,
            uid,
            name,
            deviceType,
            platform.toLowerCase(),
            status,
            daysWithoutReporting || 0,
            parsedLastReportDate,
            parsedInstallationDate,
            parsedLastMaintenanceDate,
            location || "",
            notes || "",
            parsedCreatedAt,
            parsedUpdatedAt
        );
    }
}
