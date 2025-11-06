import { PlatformCredentials } from "../../entities/platform.entity";

export class CreatePlatformDTO {
    private constructor(
        public readonly name: string,
        public readonly credentials: PlatformCredentials
    ) { }

    static create(props: { [key: string]: any }): [string?, CreatePlatformDTO?] {
        const { name, credentials } = props;

        // Validate name
        if (!name) return ['El nombre de la plataforma es requerido.', undefined];
        if (typeof name !== 'string') return ['El nombre debe ser un string.', undefined];
        if (name.trim().length === 0) return ['El nombre no puede estar vacío.', undefined];
        if (name.trim().length < 2) return ['El nombre debe tener al menos 2 caracteres.', undefined];
        if (name.trim().length > 50) return ['El nombre no puede exceder 50 caracteres.', undefined];

        // Validate credentials
        if (!credentials) return ['Las credenciales son requeridas.', undefined];
        if (typeof credentials !== 'object' || Array.isArray(credentials)) {
            return ['Las credenciales deben ser un objeto.', undefined];
        }

        // Validate tokenSecretName
        if (!credentials.tokenSecretName) {
            return ['tokenSecretName es requerido en las credenciales.', undefined];
        }
        if (typeof credentials.tokenSecretName !== 'string') {
            return ['tokenSecretName debe ser un string.', undefined];
        }
        if (credentials.tokenSecretName.trim().length === 0) {
            return ['tokenSecretName no puede estar vacío.', undefined];
        }

        // Validate tokenSecretName format (Google Secret Manager naming convention)
        const SECRET_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
        if (!SECRET_NAME_REGEX.test(credentials.tokenSecretName)) {
            return ['tokenSecretName debe contener solo letras, números, guiones y guiones bajos.', undefined];
        }

        // Normalize data
        const normalizedName = name.trim();
        const normalizedCredentials: PlatformCredentials = {
            tokenSecretName: credentials.tokenSecretName.trim(),
            ...credentials
        };

        return [
            undefined,
            new CreatePlatformDTO(
                normalizedName,
                normalizedCredentials
            )
        ];
    }
}
