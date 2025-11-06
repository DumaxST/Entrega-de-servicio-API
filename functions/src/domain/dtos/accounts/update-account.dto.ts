import { AccountStatus, ContactInfoDTO } from "./create-account.dto";

const FIREBASE_UID_REGEX = /^[A-Za-z0-9_-]{6,128}$/;

export class UpdateAccountDTO {
  private constructor(
    public readonly id:string,
    public readonly email?: string,
    public readonly companyName?: string,
    public readonly status?: AccountStatus,
    public readonly contactInfo?: ContactInfoDTO,
  ) {}

  get values(){
    const returnObj : { [key: string]: any } = {};
    if(this.email) returnObj.email = this.email;
    if(this.companyName) returnObj.companyName = this.companyName;
    if(this.status) returnObj.status = this.status;
    if(this.contactInfo) returnObj.contactInfo = this.contactInfo;
    return returnObj;
  }
  
static create(props: { [key: string]: any }): [string?, UpdateAccountDTO?] {
    const {id, email, companyName, status, contactInfo } = props;
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
            const validStatuses: AccountStatus[] = ["active", "inactive", "suspended"];
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
      new UpdateAccountDTO(
        normalizedId,
        email?.trim(),
        companyName?.trim(),
        status,
        contactInfo,
      
      ),
    ];
  }
}
