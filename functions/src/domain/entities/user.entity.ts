import { UserRole } from "../dtos/users";

export class UserEntity {
    constructor(
        public readonly id: string,              // Firestore document ID
        public name: string,
        public email: string,
        public role: UserRole,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    // Business methods
    public isAdmin(): boolean {
        return this.role === "admin";
    }

    public canManageAccounts(): boolean {
        return this.role === "admin";
    }

    public canViewReports(): boolean {
        return ["admin", "tracker"].includes(this.role);
    }

    get isSupport(): boolean {
        return this.role === "support";
    }

    // Factory method with validation
    public static fromObject(object: { [key: string]: any }): UserEntity {
        const {
            id,
            name,
            email,
            role,
            createdAt,
            updatedAt
        } = object;

        // Validate required fields
        if (!id) throw new Error("User Entity: ID es requerido");
        if (!name) throw new Error("User Entity: Nombre es requerido");
        if (!email) throw new Error("User Entity: Email es requerido");
        if (!role) throw new Error("User Entity: Rol es requerido");

        // Validate types
        if (typeof id !== "string") throw new Error("User Entity: ID debe ser un string");
        if (typeof name !== "string") throw new Error("User Entity: Nombre debe ser un string");
        if (typeof email !== "string") throw new Error("User Entity: Email debe ser un string");

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("User Entity: Email debe tener un formato válido");
        }

        // Validate role
        const validRoles: UserRole[] = ["tracker", "admin", "support"];
        if (!validRoles.includes(role)) {
            throw new Error(`User Entity: Rol inválido. Debe ser uno de: ${validRoles.join(", ")}`);
        }

        // Parse dates (handle Firestore Timestamps)
        const parseDate = (date: any): Date | undefined => {
            if (!date) return undefined;
            if (date instanceof Date) return date;
            if (date && typeof date.toDate === "function") return date.toDate();
            throw new Error("User Entity: Formato de fecha inválido");
        };

        const parsedCreatedAt = parseDate(createdAt);
        const parsedUpdatedAt = parseDate(updatedAt);

        return new UserEntity(
            id,
            name.trim(),
            email.toLowerCase().trim(),
            role,
            parsedCreatedAt,
            parsedUpdatedAt
        );
    }
}
