export interface PlatformCredentials {
    tokenSecretName: string;
    [key: string]: any; // Allow additional credential references
}

export class PlatformEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly credentials: PlatformCredentials,
        public readonly createdAt?: Date,
        public readonly updatedAt?: Date
    ) { }

    public static fromObject(object: { [key: string]: any }): PlatformEntity {
        const { id, name, credentials, createdAt, updatedAt } = object;

        // Validate required fields
        if (!id) throw new Error('Platform Entity: ID es requerido');
        if (!name) throw new Error('Platform Entity: Name es requerido');
        if (!credentials) throw new Error('Platform Entity: Credentials es requerido');
        if (!createdAt) throw new Error('Platform Entity: Created At es requerido');

        // Validate data types
        if (typeof id !== 'string') throw new Error('Platform Entity: ID debe ser un string');
        if (typeof name !== 'string') throw new Error('Platform Entity: Name debe ser un string');

        // Validate credentials
        if (typeof credentials !== 'object' || Array.isArray(credentials)) {
            throw new Error('Platform Entity: Credentials debe ser un objeto');
        }

        if (!credentials.tokenSecretName || typeof credentials.tokenSecretName !== 'string') {
            throw new Error('Platform Entity: tokenSecretName es requerido y debe ser un string');
        }

        const parsedCredentials: PlatformCredentials = {
            tokenSecretName: credentials.tokenSecretName,
            ...credentials
        };

        // Parse dates
        let parsedCreatedAt: Date;
        if (createdAt instanceof Date) {
            parsedCreatedAt = createdAt;
        } else if (createdAt && typeof createdAt.toDate === 'function') {
            parsedCreatedAt = createdAt.toDate();
        } else {
            throw new Error('Platform Entity: Created At must be a valid date or Firestore Timestamp');
        }

        let parsedUpdatedAt: Date | undefined;
        if (updatedAt) {
            if (updatedAt instanceof Date) {
                parsedUpdatedAt = updatedAt;
            } else if (updatedAt && typeof updatedAt.toDate === 'function') {
                parsedUpdatedAt = updatedAt.toDate();
            } else {
                throw new Error('Platform Entity: Updated At must be a valid date or Firestore Timestamp');
            }
        }

        return new PlatformEntity(
            id,
            name,
            parsedCredentials,
            parsedCreatedAt,
            parsedUpdatedAt
        );
    }
}
