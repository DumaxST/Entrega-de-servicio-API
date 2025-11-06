"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAccountDTO = void 0;
class CreateAccountDTO {
    constructor(email, companyName, status = "active", contactInfo) {
        this.email = email;
        this.companyName = companyName;
        this.status = status;
        this.contactInfo = contactInfo;
    }
    static create(props) {
        const { email, companyName, status, contactInfo } = props;
        if (!email)
            return ['El email es requerido.', undefined];
        if (!companyName)
            return ['El nombre de la compañía es requerido.', undefined];
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return ['El formato del email es inválido.', undefined];
        }
        const validStatuses = ["active", "inactive", "suspended"];
        if (!validStatuses.includes(status)) {
            return [`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`, undefined];
        }
        if (contactInfo && (typeof contactInfo !== 'object' || Array.isArray(contactInfo))) {
            return ['La información de contacto debe ser un objeto.', undefined];
        }
        const normalizedStatus = status === "inactive" ? "inactive" : "active";
        let normalizedContact = undefined;
        if (contactInfo && typeof contactInfo === "object") {
            const phone = contactInfo.phone ?? null;
            const city = contactInfo.city ?? null;
            const state = contactInfo.state ?? null;
            const allEmpty = (phone === null || phone === undefined) &&
                (city === null || city === undefined) &&
                (state === null || state === undefined);
            if (!allEmpty) {
                normalizedContact = { phone, city, state };
            }
        }
        return [
            undefined,
            new CreateAccountDTO(email.trim(), companyName.trim(), normalizedStatus, normalizedContact)
        ];
    }
}
exports.CreateAccountDTO = CreateAccountDTO;
//# sourceMappingURL=create-account.dto.js.map