// Tipo para el estado de la cuenta
export type AccountStatus = "active" | "inactive" | "suspended";

// Tipo para el estado de stats
export type StatsStatus = "excelente" | "bueno" | "regular" | "pobre" | "critico";

// Stats del dashboard (administrados por Cloud Functions)
export interface IStats {
  totalUnits: number;
  reportingUnits: number;
  nonReportingUnits: number;
  deliveryPercentage: number;
  status: StatsStatus;
  instalacionesPendientes: number;
  renovacionesPendientes: number;
  reubicacionesPendientes: number;
  ticketsEscalados: number;
}

// Objeto anidado para la información de contacto
export interface IContactInfo {
  phones: string[];
  city: string | null;
  state: string | null;
  notificationEmails: string[];
}

// Interface principal para el documento en Firestore
export interface IAccount {
  id: string;                          // El ID automático de Firestore
  clientCode: string;                  // Código único del cliente (inmutable)
  companyName: string;
  status: AccountStatus;               // Estado de la cuenta
  contactInfo: IContactInfo;
  accountManagerId?: string | null;    // FK a la colección 'users'
  stats: IStats;                       // Stats del dashboard (solo lectura)
  createdAt: FirebaseFirestore.Timestamp; // Para rastrear cuándo se creó
}