"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAccountDTO = void 0;
const FIREBASE_UID_REGEX = /^[A-Za-z0-9_-]{6,128}$/;
class UpdateAccountDTO {
    constructor(id, email, companyName, status, contactInfo) {
        this.id = id;
        this.email = email;
        this.companyName = companyName;
        this.status = status;
        this.contactInfo = contactInfo;
    }
    get values() {
        const returnObj = {};
        if (this.email)
            returnObj.email = this.email;
        if (this.companyName)
            returnObj.companyName = this.companyName;
        if (this.status)
            returnObj.status = this.status;
        if (this.contactInfo)
            returnObj.contactInfo = this.contactInfo;
        return returnObj;
    }
    static create(props) {
        const { id, email, companyName, status, contactInfo } = props;
        if (typeof id !== "string" || id.trim() === "") {
            return ['ID de la cuenta es requerido.', undefined];
        }
        const normalizedId = id.trim();
        if (!FIREBASE_UID_REGEX.test(normalizedId)) {
            return ['ID de la cuenta inválido.', undefined];
        }
        if (Object.keys(props).length === 0) {
            return ['El cuerpo de la solicitud no puede estar vacío.', undefined];
        }
        if (status) {
            const validStatuses = ["active", "inactive", "suspended"];
            if (!validStatuses.includes(status)) {
                return [`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`, undefined];
            }
        }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            return ['Formato de email inválido.', undefined];
        }
        if (contactInfo && (typeof contactInfo !== 'object' || Array.isArray(contactInfo))) {
            return ['La información de contacto debe ser un objeto.', undefined];
        }
        return [
            undefined,
            new UpdateAccountDTO(normalizedId, email?.trim(), companyName?.trim(), status, contactInfo),
        ];
    }
}
exports.UpdateAccountDTO = UpdateAccountDTO;
//# sourceMappingURL=update-account.dto.js.map