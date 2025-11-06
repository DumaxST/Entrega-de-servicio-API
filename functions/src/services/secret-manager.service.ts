import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

export class SecretManagerService {
    private client: SecretManagerServiceClient;
    private projectId: string;

    constructor(projectId?: string) {
        this.client = new SecretManagerServiceClient();
        this.projectId = projectId || process.env.GCLOUD_PROJECT || "service-delivery-development";
    }

    /**
     * Retrieves a secret value from Google Secret Manager
     * @param secretName - The name of the secret (e.g., "WIALON_API_TOKEN")
     * @param version - The version of the secret (default: "latest")
     * @return The secret value as a string
     */
    async getSecret(secretName: string, version: string = "latest"): Promise<string> {
        try {
            const name = `projects/${this.projectId}/secrets/${secretName}/versions/${version}`;

            const [accessResponse] = await this.client.accessSecretVersion({
                name: name,
            });

            const secretValue = accessResponse.payload?.data?.toString();

            if (!secretValue) {
                throw new Error(`El secreto ${secretName} está vacío o no existe.`);
            }

            return secretValue;
        } catch (error: any) {
            if (error.code === 5) { // NOT_FOUND error code
                throw new Error(`El secreto ${secretName} no existe en Secret Manager.`);
            }
            if (error.code === 7) { // PERMISSION_DENIED error code
                throw new Error(`No tienes permisos para acceder al secreto ${secretName}.`);
            }
            throw new Error(`Error al obtener el secreto ${secretName}: ${error.message}`);
        }
    }

    /**
     * Creates a new secret in Google Secret Manager
     * @param secretName - The name of the secret
     * @param secretValue - The value to store
     * @return The created secret name
     */
    async createSecret(secretName: string, secretValue: string): Promise<string> {
        try {
            const parent = `projects/${this.projectId}`;

            // Create the secret
            const [secret] = await this.client.createSecret({
                parent: parent,
                secretId: secretName,
                secret: {
                    replication: {
                        automatic: {},
                    },
                },
            });

            // Add the secret version with the value
            await this.client.addSecretVersion({
                parent: secret.name,
                payload: {
                    data: Buffer.from(secretValue, "utf8"),
                },
            });

            return secretName;
        } catch (error: any) {
            if (error.code === 6) { // ALREADY_EXISTS error code
                throw new Error(`El secreto ${secretName} ya existe en Secret Manager.`);
            }
            if (error.code === 7) { // PERMISSION_DENIED error code
                throw new Error(`No tienes permisos para crear secretos en Secret Manager.`);
            }
            throw new Error(`Error al crear el secreto ${secretName}: ${error.message}`);
        }
    }

    /**
     * Updates a secret by adding a new version
     * @param secretName - The name of the secret
     * @param secretValue - The new value to store
     * @return The version name of the new secret version
     */
    async updateSecret(secretName: string, secretValue: string): Promise<string> {
        try {
            const parent = `projects/${this.projectId}/secrets/${secretName}`;

            const [version] = await this.client.addSecretVersion({
                parent: parent,
                payload: {
                    data: Buffer.from(secretValue, "utf8"),
                },
            });

            return version.name || "";
        } catch (error: any) {
            if (error.code === 5) { // NOT_FOUND error code
                throw new Error(`El secreto ${secretName} no existe. Usa createSecret para crearlo primero.`);
            }
            if (error.code === 7) { // PERMISSION_DENIED error code
                throw new Error(`No tienes permisos para actualizar el secreto ${secretName}.`);
            }
            throw new Error(`Error al actualizar el secreto ${secretName}: ${error.message}`);
        }
    }

    /**
     * Deletes a secret from Google Secret Manager
     * @param secretName - The name of the secret to delete
     */
    async deleteSecret(secretName: string): Promise<void> {
        try {
            const name = `projects/${this.projectId}/secrets/${secretName}`;

            await this.client.deleteSecret({
                name: name,
            });
        } catch (error: any) {
            if (error.code === 5) { // NOT_FOUND error code
                throw new Error(`El secreto ${secretName} no existe.`);
            }
            if (error.code === 7) { // PERMISSION_DENIED error code
                throw new Error(`No tienes permisos para eliminar el secreto ${secretName}.`);
            }
            throw new Error(`Error al eliminar el secreto ${secretName}: ${error.message}`);
        }
    }

    /**
     * Lists all secrets in the project
     * @return Array of secret names
     */
    async listSecrets(): Promise<string[]> {
        try {
            const parent = `projects/${this.projectId}`;
            const [secrets] = await this.client.listSecrets({
                parent: parent,
            });

            return secrets.map(secret => {
                const parts = secret.name?.split("/");
                return parts?.[parts.length - 1] || "";
            }).filter(name => name !== "");
        } catch (error: any) {
            if (error.code === 7) { // PERMISSION_DENIED error code
                throw new Error(`No tienes permisos para listar secretos en Secret Manager.`);
            }
            throw new Error(`Error al listar secretos: ${error.message}`);
        }
    }
}
