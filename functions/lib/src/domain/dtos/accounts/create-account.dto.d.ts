type AccountStatus = "active" | "inactive" | "suspended";
export interface ContactInfoDTO {
    phone?: string | null;
    city?: string | null;
    state?: string | null;
}
export declare class CreateAccountDTO {
    readonly email: string;
    readonly companyName: string;
    readonly status: AccountStatus;
    readonly contactInfo?: ContactInfoDTO | undefined;
    private constructor();
    static create(props: {
        [key: string]: any;
    }): [string?, CreateAccountDTO?];
}
export {};
//# sourceMappingURL=create-account.dto.d.ts.map