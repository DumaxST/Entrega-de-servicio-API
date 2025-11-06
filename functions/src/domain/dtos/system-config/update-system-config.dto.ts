export interface ServiceThresholds {
    excellent: number;
    good_range: [number, number];
    regular_range: [number, number];
    bad_range: [number, number];
    critical_range: [number, number];
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

            const { excellent, good_range, regular_range, bad_range, critical_range } = serviceThresholds;

            // Validate all required fields exist
            if (excellent === undefined) return ["excellent es requerido en serviceThresholds.", undefined];
            if (!good_range) return ["good_range es requerido en serviceThresholds.", undefined];
            if (!regular_range) return ["regular_range es requerido en serviceThresholds.", undefined];
            if (!bad_range) return ["bad_range es requerido en serviceThresholds.", undefined];
            if (!critical_range) return ["critical_range es requerido en serviceThresholds.", undefined];

            // Validate types
            if (typeof excellent !== "number") {
                return ["excellent debe ser un número.", undefined];
            }
            if (!Array.isArray(good_range) || good_range.length !== 2 ||
                typeof good_range[0] !== "number" || typeof good_range[1] !== "number") {
                return ["good_range debe ser un array de 2 números.", undefined];
            }
            if (!Array.isArray(regular_range) || regular_range.length !== 2 ||
                typeof regular_range[0] !== "number" || typeof regular_range[1] !== "number") {
                return ["regular_range debe ser un array de 2 números.", undefined];
            }
            if (!Array.isArray(bad_range) || bad_range.length !== 2 ||
                typeof bad_range[0] !== "number" || typeof bad_range[1] !== "number") {
                return ["bad_range debe ser un array de 2 números.", undefined];
            }
            if (!Array.isArray(critical_range) || critical_range.length !== 2 ||
                typeof critical_range[0] !== "number" || typeof critical_range[1] !== "number") {
                return ["critical_range debe ser un array de 2 números.", undefined];
            }

            // Validate ranges logic
            if (good_range[0] > good_range[1]) {
                return ["good_range: el primer valor debe ser menor o igual al segundo.", undefined];
            }
            if (regular_range[0] > regular_range[1]) {
                return ["regular_range: el primer valor debe ser menor o igual al segundo.", undefined];
            }
            if (bad_range[0] > bad_range[1]) {
                return ["bad_range: el primer valor debe ser menor o igual al segundo.", undefined];
            }
            if (critical_range[0] > critical_range[1]) {
                return ["critical_range: el primer valor debe ser menor o igual al segundo.", undefined];
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
