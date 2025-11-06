// Helper type for contact info (pure data structure)
export interface ContactInfo {
    phone?: string | null;
    city?: string | null;
    state?: string | null;
}
export class AccountEntity {
    constructor(
        public readonly id: string,
        public email: string,
        public companyName: string,
        public status: "active" | "inactive" | "suspended",
        public contactInfo?: ContactInfo,
        public createdAt?: FirebaseFirestore.Timestamp,
        public updatedAt?: FirebaseFirestore.Timestamp,
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
    

}