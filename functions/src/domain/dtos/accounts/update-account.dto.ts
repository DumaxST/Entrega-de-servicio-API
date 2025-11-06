import { ContactInfoDTO, AccountStatus } from "./create-account.dto";

const FIREBASE_UID_REGEX = /^[A-Za-z0-9_-]{6,128}$/;
const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

export class UpdateAccountDTO {
  private constructor(
    public readonly id: string,
    public readonly companyName?: string,
    public readonly status?: AccountStatus,
    public readonly contactInfo?: ContactInfoDTO,
    public readonly accountManagerId?: string | null,
  ) {}

  get values(){
    const returnObj : { [key: string]: any } = {};
    if(this.companyName) returnObj.companyName = this.companyName;
    if(this.status) returnObj.status = this.status;
    if(this.contactInfo) returnObj.contactInfo = this.contactInfo;
    if(this.accountManagerId !== undefined) returnObj.accountManagerId = this.accountManagerId;
    return returnObj;
  }

static create(props: { [key: string]: any }): [string?, UpdateAccountDTO?] {
    const { id, companyName, status, contactInfo, accountManagerId, clientCode, stats } = props;

    // Validación de id (requerido)
    if (typeof id !== "string" || id.trim() === "") {
        return ['ID de la cuenta es requerido.', undefined];
    }
    const normalizedId = id.trim();

    if (!FIREBASE_UID_REGEX.test(normalizedId)) {
        return ['ID de la cuenta inválido.', undefined];
    }

    // Verificar que haya al menos un campo para actualizar (excluyendo id)
    const updateFields = { ...props };
    delete updateFields.id;

    if (Object.keys(updateFields).length === 0) {
        return ['El cuerpo de la solicitud debe contener al menos un campo para actualizar.', undefined];
    }

    // Prevenir actualización de campos inmutables
    if (clientCode !== undefined) {
        return ['El campo clientCode es inmutable y no puede ser actualizado.', undefined];
    }

    // Prevenir actualización de stats (solo Cloud Functions pueden actualizarlo)
    if (stats !== undefined) {
        return ['El campo stats es de solo lectura y no puede ser actualizado directamente.', undefined];
    }

    // Validación de companyName (opcional)
    if (companyName !== undefined) {
        if (typeof companyName !== 'string' || companyName.trim() === '') {
            return ['El nombre de la compañía debe ser un string no vacío.', undefined];
        }
    }

    // Validación de status (opcional)
    if (status !== undefined) {
        const validStatuses: AccountStatus[] = ["active", "inactive", "suspended"];
        if (!validStatuses.includes(status)) {
            return [`Estado inválido. Debe ser uno de: ${validStatuses.join(', ')}`, undefined];
        }
    }

    // Validación de contactInfo (opcional)
    let normalizedContactInfo: ContactInfoDTO | undefined;
    if (contactInfo !== undefined) {
        if (typeof contactInfo !== 'object' || Array.isArray(contactInfo)) {
            return ['La información de contacto debe ser un objeto.', undefined];
        }

        const { phones, city, state, notificationEmails } = contactInfo;

        // Validación de phones
        if (phones !== undefined) {
            if (!Array.isArray(phones) || phones.length === 0) {
                return ['Se requiere al menos un teléfono en el array de phones.', undefined];
            }
            for (const phone of phones) {
                if (typeof phone !== 'string' || !PHONE_REGEX.test(phone.trim())) {
                    return ['Todos los teléfonos deben tener 10 dígitos numéricos.', undefined];
                }
            }
        }

        // Validación de notificationEmails
        if (notificationEmails !== undefined) {
            if (!Array.isArray(notificationEmails) || notificationEmails.length === 0) {
                return ['Se requiere al menos un email en el array de notificationEmails.', undefined];
            }
            for (const email of notificationEmails) {
                if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
                    return ['Todos los emails de notificación deben tener un formato válido.', undefined];
                }
            }
        }

        normalizedContactInfo = {
            phones: phones ? phones.map((p: string) => p.trim()) : [],
            city: city?.trim() || null,
            state: state?.trim() || null,
            notificationEmails: notificationEmails ? notificationEmails.map((e: string) => e.trim().toLowerCase()) : []
        };
    }

    // Validación de accountManagerId (opcional)
    let normalizedAccountManagerId: string | null | undefined;
    if (accountManagerId !== undefined) {
        if (accountManagerId === null) {
            normalizedAccountManagerId = null;
        } else if (typeof accountManagerId === 'string') {
            const trimmedManagerId = accountManagerId.trim();
            if (!FIREBASE_UID_REGEX.test(trimmedManagerId)) {
                return ['El formato del accountManagerId es inválido (debe ser un Firebase UID).', undefined];
            }
            normalizedAccountManagerId = trimmedManagerId;
        } else {
            return ['El accountManagerId debe ser un string o null.', undefined];
        }
    }

    return [
      undefined,
      new UpdateAccountDTO(
        normalizedId,
        companyName?.trim(),
        status,
        normalizedContactInfo,
        normalizedAccountManagerId
      ),
    ];
  }
}
