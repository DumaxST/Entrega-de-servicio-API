import { ServiceTicketType, ServiceTicketStatus } from "../dtos/service-tickets";

export class ServiceTicketEntity {
    constructor(
        public readonly id: string,              // Firestore document ID
        public type: ServiceTicketType,
        public status: ServiceTicketStatus,
        public description: string,
        public deviceId?: string,                // Optional reference to device
        public platformID?: string,              // Optional platform ID
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    // Business methods
    public canBeUpdated(): boolean {
        return this.status !== "completado" && this.status !== "cancelado";
    }

    public markAsInProgress(): void {
        if (this.status === "pendiente") {
            this.status = "en_progreso";
        }
    }

    public markAsCompleted(): void {
        if (this.status === "en_progreso") {
            this.status = "completado";
        }
    }

    public markAsCanceled(): void {
        if (this.status !== "completado") {
            this.status = "cancelado";
        }
    }

    get isActive(): boolean {
        return this.status === "pendiente" || this.status === "en_progreso";
    }

    get isClosed(): boolean {
        return this.status === "completado" || this.status === "cancelado";
    }

    // Factory method with validation
    public static fromObject(object: { [key: string]: any }): ServiceTicketEntity {
        const {
            id,
            type,
            status,
            description,
            deviceId,
            platformID,
            createdAt,
            updatedAt
        } = object;

        // Validate required fields
        if (!id) throw new Error("ServiceTicket Entity: ID es requerido");
        if (!type) throw new Error("ServiceTicket Entity: Tipo es requerido");
        if (!status) throw new Error("ServiceTicket Entity: Estado es requerido");
        if (!description) throw new Error("ServiceTicket Entity: Descripción es requerida");
        if (!createdAt) throw new Error("ServiceTicket Entity: Created At es requerido");

        // Validate types
        if (typeof id !== "string") throw new Error("ServiceTicket Entity: ID debe ser un string");
        if (typeof type !== "string") throw new Error("ServiceTicket Entity: Tipo debe ser un string");
        if (typeof status !== "string") throw new Error("ServiceTicket Entity: Estado debe ser un string");
        if (typeof description !== "string") throw new Error("ServiceTicket Entity: Descripción debe ser un string");

        // Validate type
        const validTypes: ServiceTicketType[] = ["reubicacion", "instalacion", "renovacion", "soporte"];
        const normalizedType = type as ServiceTicketType;
        if (!validTypes.includes(normalizedType)) {
            throw new Error(`ServiceTicket Entity: Tipo inválido. Debe ser uno de: ${validTypes.join(", ")}`);
        }

        // Validate status
        const validStatuses: ServiceTicketStatus[] = ["pendiente", "en_progreso", "completado", "cancelado"];
        const normalizedStatus = status as ServiceTicketStatus;
        if (!validStatuses.includes(normalizedStatus)) {
            throw new Error(`ServiceTicket Entity: Estado inválido. Debe ser uno de: ${validStatuses.join(", ")}`);
        }

        // Validate optional deviceId
        if (deviceId !== undefined && typeof deviceId !== "string") {
            throw new Error("ServiceTicket Entity: Device ID debe ser un string");
        }

        // Validate optional platformID
        if (platformID !== undefined && typeof platformID !== "string") {
            throw new Error("ServiceTicket Entity: Platform ID debe ser un string");
        }

        // Parse dates (handle Firestore Timestamps)
        const parseDate = (date: any): Date | undefined => {
            if (!date) return undefined;
            if (date instanceof Date) return date;
            if (date && typeof date.toDate === "function") return date.toDate();
            throw new Error("ServiceTicket Entity: Formato de fecha inválido");
        };

        let parsedCreatedAt: Date;
        if (createdAt instanceof Date) {
            parsedCreatedAt = createdAt;
        } else if (createdAt && typeof createdAt.toDate === "function") {
            parsedCreatedAt = createdAt.toDate();
        } else {
            throw new Error("ServiceTicket Entity: Created At debe ser una fecha válida o Firestore Timestamp");
        }

        const parsedUpdatedAt = parseDate(updatedAt);

        return new ServiceTicketEntity(
            id,
            normalizedType,
            normalizedStatus,
            description.trim(),
            deviceId?.trim() || undefined,
            platformID?.trim() || undefined,
            parsedCreatedAt,
            parsedUpdatedAt
        );
    }
}
