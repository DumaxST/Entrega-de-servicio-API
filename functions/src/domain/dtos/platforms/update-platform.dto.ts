import { PlatformCredentials } from "../../entities/platform.entity";

export class UpdatePlatformDTO {
    private constructor(
        public readonly id: string,
        public readonly name?: string,
        public readonly credentials?: PlatformCredentials
    ) { }

    get values() {
        const returnObj: { [key: string]: any } = {};
        if (this.name) returnObj.name = this.name;
        if (this.credentials) returnObj.credentials = this.credentials;
        return returnObj;
    }

    static create(props: { [key: string]: any }): [string?, UpdatePlatformDTO?] {
        const { id, name, credentials } = props;

        // Validate id
        if (!id) return ["El ID de la plataforma es requerido.", undefined];
        if (typeof id !== "string") return ["El ID debe ser un string.", undefined];
        if (id.trim().length === 0) return ["El ID no puede estar vacío.", undefined];

        // At least one field must be provided for update
        if (!name && !credentials) {
            return ["Debe proporcionar al menos un campo para actualizar (name o credentials).", undefined];
        }

        // Validate name if provided
        let normalizedName: string | undefined;
        if (name !== undefined) {
            if (typeof name !== "string") return ["El nombre debe ser un string.", undefined];
            if (name.trim().length === 0) return ["El nombre no puede estar vacío.", undefined];
            if (name.trim().length < 2) return ["El nombre debe tener al menos 2 caracteres.", undefined];
            if (name.trim().length > 50) return ["El nombre no puede exceder 50 caracteres.", undefined];
            normalizedName = name.trim();
        }

        // Validate credentials if provided
        let normalizedCredentials: PlatformCredentials | undefined;
        if (credentials !== undefined) {
            if (typeof credentials !== "object" || Array.isArray(credentials)) {
                return ["Las credenciales deben ser un objeto.", undefined];
            }

            // Validate tokenSecretName if credentials are being updated
            if (!credentials.tokenSecretName) {
                return ["tokenSecretName es requerido en las credenciales.", undefined];
            }
            if (typeof credentials.tokenSecretName !== "string") {
                return ["tokenSecretName debe ser un string.", undefined];
            }
            if (credentials.tokenSecretName.trim().length === 0) {
                return ["tokenSecretName no puede estar vacío.", undefined];
            }

            // Validate tokenSecretName format
            const SECRET_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
            if (!SECRET_NAME_REGEX.test(credentials.tokenSecretName)) {
                return ["tokenSecretName debe contener solo letras, números, guiones y guiones bajos.", undefined];
            }

            normalizedCredentials = {
                tokenSecretName: credentials.tokenSecretName.trim(),
                ...credentials
            };
        }

        return [
            undefined,
            new UpdatePlatformDTO(
                id.trim(),
                normalizedName,
                normalizedCredentials
            )
        ];
    }
}
