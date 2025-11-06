import { ServiceTicketType, ServiceTicketStatus } from "./create-service-ticket.dto";

export class UpdateServiceTicketDTO {
    private constructor(
        public readonly id: string,              // Ticket document ID
        public readonly type?: ServiceTicketType,
        public readonly status?: ServiceTicketStatus,
        public readonly description?: string,
        public readonly deviceId?: string,
        public readonly platformID?: string
    ) { }

    get values() {
        const returnObj: { [key: string]: any } = {};
        if (this.type) returnObj.type = this.type;
        if (this.status) returnObj.status = this.status;
        if (this.description) returnObj.description = this.description;
        if (this.deviceId !== undefined) returnObj.deviceId = this.deviceId;
        if (this.platformID !== undefined) returnObj.platformID = this.platformID;

        return returnObj;
    }

    static create(props: { [key: string]: any }): [string?, UpdateServiceTicketDTO?] {
        const {
            id,
            type,
            status,
            description,
            deviceId,
            platformID
        } = props;

        // Validate required ID
        if (typeof id !== "string" || id.trim() === "") {
            return ["ID del ticket es requerido.", undefined];
        }

        // Check at least one field to update
        const updateFields = Object.keys(props).filter(key =>
            key !== "id" && props[key] !== undefined
        );
        if (updateFields.length === 0) {
            return ["Debe proporcionar al menos un campo para actualizar.", undefined];
        }

        // Validate type if provided
        if (type !== undefined) {
            if (typeof type !== "string" || type.trim() === "") {
                return ["El tipo debe ser un string válido.", undefined];
            }
            const validTypes: ServiceTicketType[] = ["reubicacion", "instalacion", "renovacion", "soporte"];
            const normalizedType = type.toLowerCase() as ServiceTicketType;
            if (!validTypes.includes(normalizedType)) {
                return [`Tipo inválido. Debe ser uno de: ${validTypes.join(", ")}`, undefined];
            }
        }

        // Validate status if provided
        if (status !== undefined) {
            if (typeof status !== "string" || status.trim() === "") {
                return ["El estado debe ser un string válido.", undefined];
            }
            const validStatuses: ServiceTicketStatus[] = ["pendiente", "en_progreso", "completado", "cancelado"];
            const normalizedStatus = status.toLowerCase() as ServiceTicketStatus;
            if (!validStatuses.includes(normalizedStatus)) {
                return [`Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`, undefined];
            }
        }

        // Validate description if provided
        if (description !== undefined) {
            if (typeof description !== "string" || description.trim() === "") {
                return ["La descripción debe ser un string válido.", undefined];
            }
            if (description.trim().length < 10) {
                return ["La descripción debe tener al menos 10 caracteres.", undefined];
            }
        }

        // Validate deviceId if provided
        if (deviceId !== undefined && deviceId !== null) {
            if (typeof deviceId !== "string" || deviceId.trim() === "") {
                return ["Device ID debe ser un string válido si se proporciona.", undefined];
            }
        }

        // Validate platformID if provided
        if (platformID !== undefined && platformID !== null) {
            if (typeof platformID !== "string" || platformID.trim() === "") {
                return ["Platform ID debe ser un string válido si se proporciona.", undefined];
            }
        }

        return [
            undefined,
            new UpdateServiceTicketDTO(
                id.trim(),
                type?.toLowerCase() as ServiceTicketType,
                status?.toLowerCase() as ServiceTicketStatus,
                description?.trim(),
                deviceId?.trim() || undefined,
                platformID?.trim() || undefined
            )
        ];
    }
}
