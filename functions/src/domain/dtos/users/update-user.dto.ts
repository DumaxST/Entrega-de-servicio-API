import { UserRole } from "./create-user.dto";

export class UpdateUserDTO {
    private constructor(
        public readonly id: string,              // Firestore document ID
        public readonly name?: string,
        public readonly email?: string,
        public readonly role?: UserRole
    ) { }

    get values() {
        const returnObj: { [key: string]: any } = {};
        if (this.name) returnObj.name = this.name;
        if (this.email) returnObj.email = this.email;
        if (this.role) returnObj.role = this.role;

        return returnObj;
    }

    static create(props: { [key: string]: any }): [string?, UpdateUserDTO?] {
        const {
            id,
            name,
            email,
            role
        } = props;

        // Validate required ID
        if (typeof id !== "string" || id.trim() === "") {
            return ["ID del usuario es requerido.", undefined];
        }

        // Check at least one field to update
        const updateFields = Object.keys(props).filter(key =>
            key !== "id" && props[key] !== undefined
        );
        if (updateFields.length === 0) {
            return ["Debe proporcionar al menos un campo para actualizar.", undefined];
        }

        // Validate name if provided
        if (name !== undefined) {
            if (typeof name !== "string" || name.trim() === "") {
                return ["El nombre debe ser un string válido.", undefined];
            }
            if (name.trim().length < 2) {
                return ["El nombre debe tener al menos 2 caracteres.", undefined];
            }
        }

        // Validate email if provided
        if (email !== undefined) {
            if (typeof email !== "string" || email.trim() === "") {
                return ["El email debe ser un string válido.", undefined];
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return ["El email debe tener un formato válido.", undefined];
            }
        }

        // Validate role if provided
        if (role !== undefined) {
            const validRoles: UserRole[] = ["tracker", "admin", "support"];
            const normalizedRole = role.toLowerCase();
            if (!validRoles.includes(normalizedRole)) {
                return [`Rol inválido. Debe ser uno de: ${validRoles.join(", ")}`, undefined];
            }
        }

        return [
            undefined,
            new UpdateUserDTO(
                id.trim(),
                name?.trim(),
                email?.toLowerCase().trim(),
                role?.toLowerCase() as UserRole
            )
        ];
    }
}
