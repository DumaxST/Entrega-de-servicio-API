
export type AccountStatus = "active" | "inactive" | "suspended";


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

        if (!email) return ['El email es requerido.', undefined];
        if (!companyName) return ['El nombre de la compañía es requerido.', undefined];

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return ['El formato del email es inválido.', undefined];
        }

        const validStatuses: AccountStatus[] = ["active", "inactive", "suspended"];
        if (!validStatuses.includes(status)) {
            return [`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`, undefined];
        }

        if (contactInfo && (typeof contactInfo !== 'object' || Array.isArray(contactInfo))) {
            return ['La información de contacto debe ser un objeto.', undefined];
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