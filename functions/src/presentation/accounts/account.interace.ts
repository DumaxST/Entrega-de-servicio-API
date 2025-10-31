// Objeto anidado para la información de contacto
export interface IContactInfo {
  phone: string | null;
  city: string | null;
  state: string | null;
}

// Interface principal para el documento en Firestore
export interface IAccount {
  id: string;                 // El ID automático de Firestore
  email: string;              // Email único para la cuenta
  companyName: string;
  contactInfo: IContactInfo;
  createdAt: FirebaseFirestore.Timestamp; // Para rastrear cuándo se creó
}