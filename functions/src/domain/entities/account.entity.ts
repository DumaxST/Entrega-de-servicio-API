export interface ContactInfo {
    phone?: string | null;
    city?: string | null;
    state?: string | null;
}

export type AccountStatus = "active" | "inactive" | "suspended";
export class AccountEntity {
    constructor(
        public readonly id: string,
        public email: string,
        public companyName: string,
        public status: AccountStatus,
        public contactInfo?: ContactInfo,
        public createdAt?: Date,
        public updatedAt?: Date
    ) { }

    public suspend() {

        if (this.status === 'suspended') {
            
            return;
        }
        this.status = 'suspended';
    }
    public deactivate() {
        if (this.status === 'inactive') {
            return;
        }
        this.status = 'inactive';
    }
    public activate() {
        this.status = 'active';
    }
 
   get isActive(){
        return !!this.status && this.status === 'active';
    }
    public static fromObject(object: { [key: string]: any }): AccountEntity {
      const { id, email, companyName, status, contactInfo, createdAt, updatedAt } = object;

        // 1. Validar campos requeridos
        if (!id) throw new Error('Account Entity: ID es requerido');
        if (!email) throw new Error('Account Entity: Email es requerido');
        if (!companyName) throw new Error('Account Entity: Company Name es requerido');
        if (!status) throw new Error('Account Entity: Status es requerido');
        if (!createdAt) throw new Error('Account Entity: Created At es requerido');

        // 2. Validar tipos de datos y formato
        if (typeof id !== 'string') throw new Error('Account Entity: ID debe ser un string');
        if (typeof email !== 'string') throw new Error('Account Entity: Email debe ser un string');
        if (typeof companyName !== 'string') throw new Error('Account Entity: Company Name debe ser un string');

        const validStatuses: AccountStatus[] = ["active", "inactive", "suspended"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Account Entity: Invalid status. Must be one of: ${validStatuses.join(', ')}`);
        }

        let parsedContactInfo: ContactInfo = {};
        if (contactInfo) {
            if (typeof contactInfo !== 'object' || Array.isArray(contactInfo)) {
                throw new Error('Account Entity: Contact Info debe de ser un objeto');
            }
            // Puedes añadir validaciones más detalladas para contactInfo.phone, .city, .state aquí si es crítico
            parsedContactInfo = { ...contactInfo }; 
        }

        let parsedCreatedAt: Date;
        if (createdAt instanceof Date) { 
            parsedCreatedAt = createdAt;
        } else if (createdAt && typeof createdAt.toDate === 'function') { // Si es un Firestore Timestamp
            parsedCreatedAt = createdAt.toDate();
        } else {
            throw new Error('Account Entity: Created At must be a valid date or Firestore Timestamp');
        }

        let parsedUpdatedAt: Date | undefined;
        if (updatedAt) {
            if (updatedAt instanceof Date) {
                parsedUpdatedAt = updatedAt;
            } else if (updatedAt && typeof updatedAt.toDate === 'function') {
                parsedUpdatedAt = updatedAt.toDate();
            } else {
                throw new Error('Account Entity: Updated At must be a valid date or Firestore Timestamp');
            }
        }

        return new AccountEntity(
            id,
            email,
            companyName,
            status,
            parsedContactInfo,
            parsedCreatedAt,
            parsedUpdatedAt
        );
    }
    
}