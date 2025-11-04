
type AccountStatus = "active" | "inactive" | "suspended";


export interface ContactInfoDTO {
    phone?: string | null;
    city?: string | null;
    state?: string | null;
}
export class CreateAccountDTO {
    private constructor(
        public readonly email: string,
        public readonly companyName: string,
        public readonly status: AccountStatus = "active",
        public readonly contactInfo?: ContactInfoDTO

    ) { }

    static create(props: { [key: string]: any }): [string?, CreateAccountDTO?] {
        const { email, companyName, status, contactInfo } = props;

        if (typeof email !== "string" || email.trim() === "") {
            return ["Email es requerido", undefined];
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return ["Email format es inválido", undefined];
        }

        if (typeof companyName !== "string" || companyName.trim() === "") {
            return ["Company Name es requerido", undefined];
        }
        const normalizedStatus: AccountStatus = status === "inactive" ? "inactive" : "active";
        let normalizedContact: ContactInfoDTO | undefined = undefined;

        if (contactInfo && typeof contactInfo === "object") {
            const phone = contactInfo.phone ?? null;
            const city = contactInfo.city ?? null;
            const state = contactInfo.state ?? null;

            const allEmpty =
                (phone === null || phone === undefined) &&
                (city === null || city === undefined) &&
                (state === null || state === undefined);

            if (!allEmpty) {
                normalizedContact = { phone, city, state };
            }
        }

        return [
            undefined, 
            new CreateAccountDTO(
                email.trim(),
                companyName.trim(),
                normalizedStatus,
                normalizedContact
            )];
    }
}