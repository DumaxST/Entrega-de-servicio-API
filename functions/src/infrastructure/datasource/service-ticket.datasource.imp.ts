import { db, FieldValue } from "../../config/firebaseAdmin";
import { ServiceTicketDataSource, ServiceTicketFilters } from "../../domain/datasources/service-ticket.datasource";
import { CreateServiceTicketDTO, UpdateServiceTicketDTO } from "../../domain/dtos/service-tickets";
import { ServiceTicketEntity } from "../../domain/entities/service-ticket.entity";

export class ServiceTicketDataSourceImp implements ServiceTicketDataSource {

    constructor() {}

    // Helper method to get the correct subcollection path
    private getTicketsCollectionPath(accountId: string): string {
        return `accounts/${accountId}/serviceTickets`;
    }

    async createTicket(accountId: string, dto: CreateServiceTicketDTO): Promise<ServiceTicketEntity> {
        const ticketsPath = this.getTicketsCollectionPath(accountId);

        // Verify account exists
        const accountDoc = await db.collection("accounts").doc(accountId).get();
        if (!accountDoc.exists) {
            throw new Error("La cuenta especificada no existe.");
        }

        // If deviceId is provided, verify device exists in this account
        if (dto.deviceId) {
            const deviceDoc = await db.collection(`accounts/${accountId}/devices`).doc(dto.deviceId).get();
            if (!deviceDoc.exists) {
                throw new Error("El dispositivo especificado no existe en esta cuenta.");
            }
        }

        const newTicketData = {
            type: dto.type,
            status: dto.status,
            description: dto.description,
            deviceId: dto.deviceId || null,
            platformID: dto.platformID || null,
            createdAt: FieldValue.serverTimestamp(),
        };

        // Let Firebase auto-generate the document ID in the subcollection
        const docRef = await db.collection(ticketsPath).add(newTicketData);

        return ServiceTicketEntity.fromObject({
            id: docRef.id,
            ...newTicketData,
            createdAt: new Date(),
        });
    }

    async getTicketById(accountId: string, ticketId: string): Promise<ServiceTicketEntity> {
        const ticketsPath = this.getTicketsCollectionPath(accountId);
        const docRef = db.collection(ticketsPath).doc(ticketId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El ticket de servicio no existe.");
        }

        return ServiceTicketEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }

    async getAllByAccount(accountId: string, filters?: ServiceTicketFilters): Promise<ServiceTicketEntity[]> {
        const ticketsPath = this.getTicketsCollectionPath(accountId);
        let query: FirebaseFirestore.Query = db.collection(ticketsPath);

        // Apply filters
        if (filters?.type) {
            query = query.where("type", "==", filters.type);
        }
        if (filters?.status) {
            query = query.where("status", "==", filters.status);
        }
        if (filters?.deviceId) {
            query = query.where("deviceId", "==", filters.deviceId);
        }

        query = query.orderBy("createdAt", "desc");

        const snapshot = await query.get();

        return snapshot.docs.map(doc =>
            ServiceTicketEntity.fromObject({
                id: doc.id,
                ...doc.data()
            })
        );
    }

    async updateTicket(accountId: string, ticketId: string, dto: UpdateServiceTicketDTO): Promise<ServiceTicketEntity> {
        const ticketsPath = this.getTicketsCollectionPath(accountId);
        const docRef = db.collection(ticketsPath).doc(ticketId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El ticket de servicio no existe.");
        }

        // If deviceId is being updated and provided, verify device exists
        if (dto.deviceId) {
            const deviceDoc = await db.collection(`accounts/${accountId}/devices`).doc(dto.deviceId).get();
            if (!deviceDoc.exists) {
                throw new Error("El dispositivo especificado no existe en esta cuenta.");
            }
        }

        const dataToUpdate = dto.values;
        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(dataToUpdate);

        const updatedDoc = await docRef.get();
        return ServiceTicketEntity.fromObject({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });
    }

    async deleteTicket(accountId: string, ticketId: string): Promise<ServiceTicketEntity> {
        const ticketsPath = this.getTicketsCollectionPath(accountId);
        const docRef = db.collection(ticketsPath).doc(ticketId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El ticket de servicio no existe.");
        }

        const ticketData = doc.data();

        await docRef.delete();

        return ServiceTicketEntity.fromObject({
            id: doc.id,
            ...ticketData
        });
    }
}
