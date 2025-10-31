export interface IContactInfo {
    phone: string | null;
    city: string | null;
    state: string | null;
}
export interface IAccount {
    id: string;
    email: string;
    companyName: string;
    contactInfo: IContactInfo;
    createdAt: FirebaseFirestore.Timestamp;
}
//# sourceMappingURL=account.interace.d.ts.map