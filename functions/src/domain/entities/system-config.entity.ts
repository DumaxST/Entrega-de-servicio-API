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
        if (percentage >= this.serviceThresholds.goodRange[0] &&
            percentage <= this.serviceThresholds.goodRange[1]) {
            return "good";
        }
        if (percentage >= this.serviceThresholds.regularRange[0] &&
            percentage <= this.serviceThresholds.regularRange[1]) {
            return "regular";
        }
        if (percentage >= this.serviceThresholds.badRange[0] &&
            percentage <= this.serviceThresholds.badRange[1]) {
            return "bad";
        }
        return "critical";
    }

    public validateThresholds(): boolean {
        const { excellent, goodRange, regularRange, badRange, criticalRange } = this.serviceThresholds;

        // Validate ranges are properly ordered
        if (excellent < goodRange[1]) return false;
        if (goodRange[0] > goodRange[1]) return false;
        if (regularRange[0] > regularRange[1]) return false;
        if (badRange[0] > badRange[1]) return false;
        if (criticalRange[0] > criticalRange[1]) return false;

        return true;
    }

    public replaceTemplatePlaceholders(clientName: string, additionalData: { [key: string]: string } = {}): string {
        let template = this.notificationTemplate;

        // Replace [Cliente] placeholder
        template = template.replace(/\[Cliente\]/g, clientName);

        // Replace additional placeholders
        Object.keys(additionalData).forEach(key => {
            const placeholder = `[${key}]`;
            template = template.replace(new RegExp(placeholder, "g"), additionalData[key]);
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

        const { excellent, goodRange, regularRange, badRange, criticalRange } = serviceThresholds;

        if (typeof excellent !== "number") {
            throw new Error("SystemConfig Entity: excellent debe ser un número");
        }
        if (!Array.isArray(goodRange) || goodRange.length !== 2) {
            throw new Error("SystemConfig Entity: goodRange debe ser un array de 2 números");
        }
        if (!Array.isArray(regularRange) || regularRange.length !== 2) {
            throw new Error("SystemConfig Entity: regularRange debe ser un array de 2 números");
        }
        if (!Array.isArray(badRange) || badRange.length !== 2) {
            throw new Error("SystemConfig Entity: badRange debe ser un array de 2 números");
        }
        if (!Array.isArray(criticalRange) || criticalRange.length !== 2) {
            throw new Error("SystemConfig Entity: criticalRange debe ser un array de 2 números");
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
                goodRange: [goodRange[0], goodRange[1]],
                regularRange: [regularRange[0], regularRange[1]],
                badRange: [badRange[0], badRange[1]],
                criticalRange: [criticalRange[0], criticalRange[1]]
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
