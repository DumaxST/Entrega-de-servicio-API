import { AccountStatus, ContactInfoDTO } from "./create-account.dto";
export declare class UpdateAccountDTO {
    readonly id: string;
    readonly email?: string | undefined;
    readonly companyName?: string | undefined;
    readonly status?: AccountStatus | undefined;
    readonly contactInfo?: ContactInfoDTO | undefined;
    private constructor();
    get values(): {
        [key: string]: any;
    };
    static create(props: {
        [key: string]: any;
    }): [string?, UpdateAccountDTO?];
}
//# sourceMappingURL=update-account.dto.d.ts.map