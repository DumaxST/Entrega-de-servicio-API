export type UserRole = "tracker" | "admin" | "support";

export class CreateUserDTO {
    private constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly role: UserRole
    ) { }

    static create(props: { [key: string]: any }): [string?, CreateUserDTO?] {
        const {
            name,
            email,
            role
        } = props;

        // Required field validation
        if (!name) return ["El nombre es requerido.", undefined];
        if (!email) return ["El email es requerido.", undefined];
        if (!role) return ["El rol es requerido.", undefined];

        // Type validation
        if (typeof name !== "string" || name.trim() === "") {
            return ["El nombre debe ser un string válido.", undefined];
        }
        if (typeof email !== "string" || email.trim() === "") {
            return ["El email debe ser un string válido.", undefined];
        }

        // Name length validation
        if (name.trim().length < 2) {
            return ["El nombre debe tener al menos 2 caracteres.", undefined];
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return ["El email debe tener un formato válido.", undefined];
        }

        // Role validation
        const validRoles: UserRole[] = ["tracker", "admin", "support"];
        const normalizedRole = role.toLowerCase();
        if (!validRoles.includes(normalizedRole)) {
            return [`Rol inválido. Debe ser uno de: ${validRoles.join(", ")}`, undefined];
        }

        return [
            undefined,
            new CreateUserDTO(
                name.trim(),
                email.toLowerCase().trim(),
                normalizedRole as UserRole
            )
        ];
    }
}
