import { ServiceThresholds } from "../dtos/system-config";

export class SystemConfigEntity {
    constructor(
        public serviceThresholds: ServiceThresholds,
        public notificationTemplate: string,
        public updatedAt?: Date
    ) { }

    // Business methods
    public getServiceLevel(percentage: number): string {
        if (percentage >= this.serviceThresholds.excellent) {
            return "excellent";
        }
        if (percentage >= this.serviceThresholds.good_range[0] &&
            percentage <= this.serviceThresholds.good_range[1]) {
            return "good";
        }
        if (percentage >= this.serviceThresholds.regular_range[0] &&
            percentage <= this.serviceThresholds.regular_range[1]) {
            return "regular";
        }
        if (percentage >= this.serviceThresholds.bad_range[0] &&
            percentage <= this.serviceThresholds.bad_range[1]) {
            return "bad";
        }
        return "critical";
    }

    public validateThresholds(): boolean {
        const { excellent, good_range, regular_range, bad_range, critical_range } = this.serviceThresholds;

        // Validate ranges are properly ordered
        if (excellent < good_range[1]) return false;
        if (good_range[0] > good_range[1]) return false;
        if (regular_range[0] > regular_range[1]) return false;
        if (bad_range[0] > bad_range[1]) return false;
        if (critical_range[0] > critical_range[1]) return false;

        return true;
    }

    public replaceTemplatePlaceholders(clientName: string, additionalData: { [key: string]: string } = {}): string {
        let template = this.notificationTemplate;

        // Replace [Cliente] placeholder
        template = template.replace(/\[Cliente\]/g, clientName);

        // Replace additional placeholders
        Object.keys(additionalData).forEach(key => {
            const placeholder = `[${key}]`;
            template = template.replace(new RegExp(placeholder, 'g'), additionalData[key]);
        });

        return template;
    }

    // Factory method with validation
    public static fromObject(object: { [key: string]: any }): SystemConfigEntity {
        const {
            serviceThresholds,
            notificationTemplate,
            updatedAt
        } = object;

        // Validate required fields
        if (!serviceThresholds) throw new Error("SystemConfig Entity: serviceThresholds es requerido");
        if (!notificationTemplate) throw new Error("SystemConfig Entity: notificationTemplate es requerido");

        // Validate serviceThresholds structure
        if (typeof serviceThresholds !== "object") {
            throw new Error("SystemConfig Entity: serviceThresholds debe ser un objeto");
        }

        const { excellent, good_range, regular_range, bad_range, critical_range } = serviceThresholds;

        if (typeof excellent !== "number") {
            throw new Error("SystemConfig Entity: excellent debe ser un número");
        }
        if (!Array.isArray(good_range) || good_range.length !== 2) {
            throw new Error("SystemConfig Entity: good_range debe ser un array de 2 números");
        }
        if (!Array.isArray(regular_range) || regular_range.length !== 2) {
            throw new Error("SystemConfig Entity: regular_range debe ser un array de 2 números");
        }
        if (!Array.isArray(bad_range) || bad_range.length !== 2) {
            throw new Error("SystemConfig Entity: bad_range debe ser un array de 2 números");
        }
        if (!Array.isArray(critical_range) || critical_range.length !== 2) {
            throw new Error("SystemConfig Entity: critical_range debe ser un array de 2 números");
        }

        // Validate notificationTemplate
        if (typeof notificationTemplate !== "string" || notificationTemplate.trim() === "") {
            throw new Error("SystemConfig Entity: notificationTemplate debe ser un string no vacío");
        }

        // Parse dates (handle Firestore Timestamps)
        const parseDate = (date: any): Date | undefined => {
            if (!date) return undefined;
            if (date instanceof Date) return date;
            if (date && typeof date.toDate === "function") return date.toDate();
            throw new Error("SystemConfig Entity: Formato de fecha inválido");
        };

        const parsedUpdatedAt = parseDate(updatedAt);

        const entity = new SystemConfigEntity(
            {
                excellent,
                good_range: [good_range[0], good_range[1]],
                regular_range: [regular_range[0], regular_range[1]],
                bad_range: [bad_range[0], bad_range[1]],
                critical_range: [critical_range[0], critical_range[1]]
            },
            notificationTemplate.trim(),
            parsedUpdatedAt
        );

        // Validate thresholds logic
        if (!entity.validateThresholds()) {
            throw new Error("SystemConfig Entity: Los rangos de thresholds no son válidos");
        }

        return entity;
    }
}
