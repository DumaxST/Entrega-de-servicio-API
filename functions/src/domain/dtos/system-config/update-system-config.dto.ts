export interface ServiceThresholds {
    excellent: number;
    goodRange: [number, number];
    regularRange: [number, number];
    badRange: [number, number];
    criticalRange: [number, number];
}

export class UpdateSystemConfigDTO {
    private constructor(
        public readonly serviceThresholds?: ServiceThresholds,
        public readonly notificationTemplate?: string
    ) { }

    get values() {
        const returnObj: { [key: string]: any } = {};
        if (this.serviceThresholds) returnObj.serviceThresholds = this.serviceThresholds;
        if (this.notificationTemplate) returnObj.notificationTemplate = this.notificationTemplate;

        return returnObj;
    }

    static create(props: { [key: string]: any }): [string?, UpdateSystemConfigDTO?] {
        const {
            serviceThresholds,
            notificationTemplate
        } = props;

        // Check at least one field to update
        const updateFields = Object.keys(props).filter(key => props[key] !== undefined);
        if (updateFields.length === 0) {
            return ["Debe proporcionar al menos un campo para actualizar.", undefined];
        }

        // Validate serviceThresholds if provided
        if (serviceThresholds !== undefined) {
            if (typeof serviceThresholds !== "object" || serviceThresholds === null) {
                return ["serviceThresholds debe ser un objeto.", undefined];
            }

            const { excellent, goodRange, regularRange, badRange, criticalRange } = serviceThresholds;

            // Validate all required fields exist
            if (excellent === undefined) return ["excellent es requerido en serviceThresholds.", undefined];
            if (!goodRange) return ["goodRange es requerido en serviceThresholds.", undefined];
            if (!regularRange) return ["regularRange es requerido en serviceThresholds.", undefined];
            if (!badRange) return ["badRange es requerido en serviceThresholds.", undefined];
            if (!criticalRange) return ["criticalRange es requerido en serviceThresholds.", undefined];

            // Validate types
            if (typeof excellent !== "number") {
                return ["excellent debe ser un número.", undefined];
            }
            if (!Array.isArray(goodRange) || goodRange.length !== 2 ||
                typeof goodRange[0] !== "number" || typeof goodRange[1] !== "number") {
                return ["goodRange debe ser un array de 2 números.", undefined];
            }
            if (!Array.isArray(regularRange) || regularRange.length !== 2 ||
                typeof regularRange[0] !== "number" || typeof regularRange[1] !== "number") {
                return ["regularRange debe ser un array de 2 números.", undefined];
            }
            if (!Array.isArray(badRange) || badRange.length !== 2 ||
                typeof badRange[0] !== "number" || typeof badRange[1] !== "number") {
                return ["badRange debe ser un array de 2 números.", undefined];
            }
            if (!Array.isArray(criticalRange) || criticalRange.length !== 2 ||
                typeof criticalRange[0] !== "number" || typeof criticalRange[1] !== "number") {
                return ["criticalRange debe ser un array de 2 números.", undefined];
            }

            // Validate ranges logic
            if (goodRange[0] > goodRange[1]) {
                return ["goodRange: el primer valor debe ser menor o igual al segundo.", undefined];
            }
            if (regularRange[0] > regularRange[1]) {
                return ["regularRange: el primer valor debe ser menor o igual al segundo.", undefined];
            }
            if (badRange[0] > badRange[1]) {
                return ["badRange: el primer valor debe ser menor o igual al segundo.", undefined];
            }
            if (criticalRange[0] > criticalRange[1]) {
                return ["criticalRange: el primer valor debe ser menor o igual al segundo.", undefined];
            }
        }

        // Validate notificationTemplate if provided
        if (notificationTemplate !== undefined) {
            if (typeof notificationTemplate !== "string" || notificationTemplate.trim() === "") {
                return ["notificationTemplate debe ser un string no vacío.", undefined];
            }
        }

        return [
            undefined,
            new UpdateSystemConfigDTO(
                serviceThresholds,
                notificationTemplate?.trim()
            )
        ];
    }
}
