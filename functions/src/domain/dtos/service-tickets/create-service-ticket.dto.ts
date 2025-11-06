export type ServiceTicketType = "reubicacion" | "instalacion" | "renovacion" | "soporte";
export type ServiceTicketStatus = "pendiente" | "en_progreso" | "completado" | "cancelado";

export class CreateServiceTicketDTO {
    private constructor(
        public readonly type: ServiceTicketType,
        public readonly description: string,
        public readonly status: ServiceTicketStatus = "pendiente",
        public readonly deviceId?: string,
        public readonly platformID?: string
    ) { }

    static create(props: { [key: string]: any }): [string?, CreateServiceTicketDTO?] {
        const {
            type,
            description,
            status,
            deviceId,
            platformID
        } = props;

        // Required field validation
        if (!type) return ["El tipo de ticket es requerido.", undefined];
        if (!description) return ["La descripción es requerida.", undefined];

        // Type validation
        if (typeof type !== "string" || type.trim() === "") {
            return ["El tipo debe ser un string válido.", undefined];
        }
        if (typeof description !== "string" || description.trim() === "") {
            return ["La descripción debe ser un string válido.", undefined];
        }

        // Description length validation
        if (description.trim().length < 10) {
            return ["La descripción debe tener al menos 10 caracteres.", undefined];
        }

        // Type validation
        const validTypes: ServiceTicketType[] = ["reubicacion", "instalacion", "renovacion", "soporte"];
        const normalizedType = type.toLowerCase() as ServiceTicketType;
        if (!validTypes.includes(normalizedType)) {
            return [`Tipo inválido. Debe ser uno de: ${validTypes.join(", ")}`, undefined];
        }

        // Status validation (if provided)
        const normalizedStatus: ServiceTicketStatus = (status ? status.toLowerCase() : "pendiente") as ServiceTicketStatus;
        if (status) {
            const validStatuses: ServiceTicketStatus[] = ["pendiente", "en_progreso", "completado", "cancelado"];
            if (!validStatuses.includes(normalizedStatus)) {
                return [`Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`, undefined];
            }
        }

        // Validate optional deviceId
        if (deviceId !== undefined) {
            if (typeof deviceId !== "string" || deviceId.trim() === "") {
                return ["Device ID debe ser un string válido si se proporciona.", undefined];
            }
        }

        // Validate optional platformID
        if (platformID !== undefined) {
            if (typeof platformID !== "string" || platformID.trim() === "") {
                return ["Platform ID debe ser un string válido si se proporciona.", undefined];
            }
        }

        return [
            undefined,
            new CreateServiceTicketDTO(
                normalizedType,
                description.trim(),
                normalizedStatus,
                deviceId?.trim() || undefined,
                platformID?.trim() || undefined
            )
        ];
    }
}
