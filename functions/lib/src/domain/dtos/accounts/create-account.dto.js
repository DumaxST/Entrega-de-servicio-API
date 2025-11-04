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
        if (typeof email !== "string" || email.trim() === "") {
            return ["Email es requerido", undefined];
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return ["Email format es inválido", undefined];
        }
        if (typeof companyName !== "string" || companyName.trim() === "") {
            return ["Company Name es requerido", undefined];
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