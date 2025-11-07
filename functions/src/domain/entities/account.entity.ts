import { StatsStatus, AccountStatus } from "domain/dtos";

export interface ContactInfo {
    phones: string[];
    city: string | null;
    state: string | null;
    notificationEmails: string[];
}

export interface Stats {
    totalUnits: number;
    reportingUnits: number;
    nonReportingUnits: number;
    deliveryPercentage: number;
    status: StatsStatus;
    instalacionesPendientes: number;
    renovacionesPendientes: number;
    reubicacionesPendientes: number;
    ticketsEscalados: number;
}

export class AccountEntity {
    constructor(
        public readonly id: string,
        public readonly clientCode: string,
        public companyName: string,
        public status: AccountStatus,
        public contactInfo: ContactInfo,
        public accountManagerId: string | null,
        public stats: Stats,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }
    public static fromObject(object: { [key: string]: any }): AccountEntity {
      const { id, clientCode, companyName, status, contactInfo, accountManagerId, stats, createdAt, updatedAt } = object;

        // 1. Validar campos requeridos
        if (!id) throw new Error("Account Entity: ID es requerido");
        if (!clientCode) throw new Error("Account Entity: Client Code es requerido");
        if (!companyName) throw new Error("Account Entity: Company Name es requerido");
        if (!status) throw new Error("Account Entity: Status es requerido");
        if (!contactInfo) throw new Error("Account Entity: Contact Info es requerido");
        if (!stats) throw new Error("Account Entity: Stats es requerido");
        if (!createdAt) throw new Error("Account Entity: Created At es requerido");

        // 2. Validar tipos de datos y formato
        if (typeof id !== "string") throw new Error("Account Entity: ID debe ser un string");
        if (typeof clientCode !== "string") throw new Error("Account Entity: Client Code debe ser un string");
        if (typeof companyName !== "string") throw new Error("Account Entity: Company Name debe ser un string");

        // Validar status
        const validStatuses: AccountStatus[] = ["active", "inactive", "suspended"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Account Entity: Invalid status. Must be one of: ${validStatuses.join(", ")}`);
        }

        // Validar contactInfo
        if (!contactInfo || typeof contactInfo !== "object" || Array.isArray(contactInfo)) {
            throw new Error("Account Entity: Contact Info debe ser un objeto");
        }

        const { phones, city, state, notificationEmails } = contactInfo;
        if (!Array.isArray(phones) || phones.length === 0) {
            throw new Error("Account Entity: Phones debe ser un array no vacío");
        }
        if (!Array.isArray(notificationEmails) || notificationEmails.length === 0) {
            throw new Error("Account Entity: Notification Emails debe ser un array no vacío");
        }

        const parsedContactInfo: ContactInfo = {
            phones,
            city: city || null,
            state: state || null,
            notificationEmails
        };

        // Validar accountManagerId (puede ser null o string)
        const parsedAccountManagerId = accountManagerId || null;
        if (parsedAccountManagerId !== null && typeof parsedAccountManagerId !== "string") {
            throw new Error("Account Entity: Account Manager ID debe ser un string o null");
        }

        // Validar stats
        if (typeof stats !== "object" || Array.isArray(stats)) {
            throw new Error("Account Entity: Stats debe ser un objeto");
        }

        const validStatsStatuses: StatsStatus[] = ["excelente", "bueno", "regular", "pobre", "critico"];
        if (!validStatsStatuses.includes(stats.status)) {
            throw new Error(`Account Entity: Invalid stats status. Must be one of: ${validStatsStatuses.join(", ")}`);
        }

        const parsedStats: Stats = {
            totalUnits: stats.totalUnits || 0,
            reportingUnits: stats.reportingUnits || 0,
            nonReportingUnits: stats.nonReportingUnits || 0,
            deliveryPercentage: stats.deliveryPercentage || 0,
            status: stats.status,
            instalacionesPendientes: stats.instalacionesPendientes || 0,
            renovacionesPendientes: stats.renovacionesPendientes || 0,
            reubicacionesPendientes: stats.reubicacionesPendientes || 0,
            ticketsEscalados: stats.ticketsEscalados || 0
        };

        // Validar y parsear fechas
        let parsedCreatedAt: Date;
        if (createdAt instanceof Date) {
            parsedCreatedAt = createdAt;
        } else if (createdAt && typeof createdAt.toDate === "function") { // Si es un Firestore Timestamp
            parsedCreatedAt = createdAt.toDate();
        } else {
            throw new Error("Account Entity: Created At must be a valid date or Firestore Timestamp");
        }

        let parsedUpdatedAt: Date | undefined;
        if (updatedAt) {
            if (updatedAt instanceof Date) {
                parsedUpdatedAt = updatedAt;
            } else if (updatedAt && typeof updatedAt.toDate === "function") {
                parsedUpdatedAt = updatedAt.toDate();
            } else {
                throw new Error("Account Entity: Updated At must be a valid date or Firestore Timestamp");
            }
        }

        return new AccountEntity(
            id,
            clientCode,
            companyName,
            status,
            parsedContactInfo,
            parsedAccountManagerId,
            parsedStats,
            parsedCreatedAt,
            parsedUpdatedAt
        );
    }

}