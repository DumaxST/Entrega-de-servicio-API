export type AccountStatus = "active" | "inactive" | "suspended";

export type StatsStatus = "excelente" | "bueno" | "regular" | "pobre" | "critico";

export interface StatsDTO {
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

export interface ContactInfoDTO {
    phones: string[];
    city: string | null;
    state: string | null;
    notificationEmails: string[];
}

const FIREBASE_UID_REGEX = /^[A-Za-z0-9_-]{6,128}$/;
const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const CLIENT_CODE_REGEX = /^[A-Z0-9_-]{3,20}$/;

export class CreateAccountDTO {
    private constructor(
        public readonly clientCode: string,
        public readonly companyName: string,
        public readonly status: AccountStatus,
        public readonly contactInfo: ContactInfoDTO,
        public readonly accountManagerId?: string | null,
        public readonly stats?: StatsDTO
    ) { }

    static create(props: { [key: string]: any }): [string?, CreateAccountDTO?] {
        const { clientCode, companyName, status, contactInfo, accountManagerId, stats } = props;

        // Validación de clientCode (requerido)
        if (!clientCode) return ["El código de cliente es requerido.", undefined];
        if (typeof clientCode !== "string") return ["El código de cliente debe ser un string.", undefined];

        const normalizedClientCode = clientCode.trim().toUpperCase();
        if (!CLIENT_CODE_REGEX.test(normalizedClientCode)) {
            return ["El código de cliente debe tener entre 3-20 caracteres (letras mayúsculas, números, guiones y guiones bajos).", undefined];
        }

        // Validación de companyName (requerido)
        if (!companyName) return ["El nombre de la compañía es requerido.", undefined];
        if (typeof companyName !== "string") return ["El nombre de la compañía debe ser un string.", undefined];

        // Validación de status (opcional, por defecto "active")
        const validStatuses: AccountStatus[] = ["active", "inactive", "suspended"];
        const normalizedStatus: AccountStatus = status && validStatuses.includes(status) ? status : "active";

        // Validación de contactInfo (requerido)
        if (!contactInfo) return ["La información de contacto es requerida.", undefined];
        if (typeof contactInfo !== "object" || Array.isArray(contactInfo)) {
            return ["La información de contacto debe ser un objeto.", undefined];
        }

        // Validación de phones
        const { phones, city, state, notificationEmails } = contactInfo;
        if (!phones || !Array.isArray(phones) || phones.length === 0) {
            return ["Se requiere al menos un teléfono en el array de phones.", undefined];
        }
        for (const phone of phones) {
            if (typeof phone !== "string" || !PHONE_REGEX.test(phone.trim())) {
                return ["Todos los teléfonos deben tener 10 dígitos numéricos.", undefined];
            }
        }

        // Validación de notificationEmails
        if (!notificationEmails || !Array.isArray(notificationEmails) || notificationEmails.length === 0) {
            return ["Se requiere al menos un email en el array de notificationEmails.", undefined];
        }
        for (const email of notificationEmails) {
            if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
                return ["Todos los emails de notificación deben tener un formato válido.", undefined];
            }
        }

        // Validación de accountManagerId (opcional)
        if (accountManagerId !== undefined && accountManagerId !== null) {
            if (typeof accountManagerId !== "string") {
                return ["El accountManagerId debe ser un string.", undefined];
            }
            if (!FIREBASE_UID_REGEX.test(accountManagerId.trim())) {
                return ["El formato del accountManagerId es inválido (debe ser un Firebase UID).", undefined];
            }
        }

        // Validación de stats (opcional, con valores por defecto)
        let normalizedStats: StatsDTO;
        if (stats && typeof stats === "object") {
            const validStatsStatuses: StatsStatus[] = ["excelente", "bueno", "regular", "pobre", "critico"];
            if (!validStatsStatuses.includes(stats.status)) {
                return [`Estado de stats inválido. Debe ser uno de: ${validStatsStatuses.join(", ")}`, undefined];
            }

            // Validar que todos los números sean >= 0
            const numericFields = [
                "totalUnits", "reportingUnits", "nonReportingUnits",
                "deliveryPercentage", "instalacionesPendientes",
                "renovacionesPendientes", "reubicacionesPendientes", "ticketsEscalados"
            ];
            for (const field of numericFields) {
                if (stats[field] !== undefined && (typeof stats[field] !== "number" || stats[field] < 0)) {
                    return [`El campo ${field} debe ser un número mayor o igual a 0.`, undefined];
                }
            }
            normalizedStats = stats;
        } else {
            // Valores por defecto
            normalizedStats = {
                totalUnits: 0,
                reportingUnits: 0,
                nonReportingUnits: 0,
                deliveryPercentage: 0,
                status: "bueno",
                instalacionesPendientes: 0,
                renovacionesPendientes: 0,
                reubicacionesPendientes: 0,
                ticketsEscalados: 0
            };
        }

        const normalizedContactInfo: ContactInfoDTO = {
            phones: phones.map((p: string) => p.trim()),
            city: city?.trim() || null,
            state: state?.trim() || null,
            notificationEmails: notificationEmails.map((e: string) => e.trim().toLowerCase())
        };

        return [
            undefined,
            new CreateAccountDTO(
                normalizedClientCode,
                companyName.trim(),
                normalizedStatus,
                normalizedContactInfo,
                accountManagerId?.trim() || null,
                normalizedStats
            )];
    }
}