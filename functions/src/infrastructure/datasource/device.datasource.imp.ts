import { db, FieldValue } from "../../config/firebaseAdmin";
import { DeviceDataSource, DeviceFilters } from "../../domain/datasources/device.datasource";
import { CreateDeviceDTO, UpdateDeviceDTO } from "../../domain/dtos/devices";
import { DeviceEntity } from "../../domain/entities/device.entity";

export class DeviceDataSourceImp implements DeviceDataSource {

    constructor() {}

    // Helper method to get the correct subcollection path
    private getDevicesCollectionPath(accountId: string): string {
        return `accounts/${accountId}/devices`;
    }

    async createDevice(accountId: string, dto: CreateDeviceDTO): Promise<DeviceEntity> {
        const devicesPath = this.getDevicesCollectionPath(accountId);

        // Verify account exists
        const accountDoc = await db.collection("accounts").doc(accountId).get();
        if (!accountDoc.exists) {
            throw new Error("La cuenta especificada no existe.");
        }

        // Check if device with this UID (IMEI) already exists for this account
        const existingDeviceQuery = await db.collection(devicesPath)
            .where("uid", "==", dto.uid)
            .limit(1)
            .get();

        if (!existingDeviceQuery.empty) {
            throw new Error("Ya existe un dispositivo con este IMEI en esta cuenta.");
        }

        // Calculate daysWithoutReporting
        let daysWithoutReporting = 0;
        if (dto.lastReportDate) {
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - dto.lastReportDate.getTime());
            daysWithoutReporting = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }

        const newDeviceData = {
            uid: dto.uid,
            name: dto.name,
            deviceType: dto.deviceType,
            platform: dto.platform,
            status: dto.status,
            lastReportDate: dto.lastReportDate || null,
            installationDate: dto.installationDate || null,
            lastMaintenanceDate: dto.lastMaintenanceDate || null,
            location: dto.location || "",
            notes: dto.notes || "",
            daysWithoutReporting,
            createdAt: FieldValue.serverTimestamp(),
        };

        // Let Firebase auto-generate the document ID in the subcollection
        const docRef = await db.collection(devicesPath).add(newDeviceData);

        return DeviceEntity.fromObject({
            id: docRef.id,
            ...newDeviceData,
            createdAt: new Date(),
        });
    }

    async getAllByAccount(accountId: string, filters?: DeviceFilters): Promise<DeviceEntity[]> {
        const devicesPath = this.getDevicesCollectionPath(accountId);
        let query: FirebaseFirestore.Query = db.collection(devicesPath);

        // Apply filters
        if (filters?.status) {
            query = query.where("status", "==", filters.status);
        }
        if (filters?.deviceType) {
            query = query.where("deviceType", "==", filters.deviceType);
        }
        if (filters?.platform) {
            query = query.where("platform", "==", filters.platform);
        }

        query = query.orderBy("createdAt", "desc");

        const snapshot = await query.get();

        return snapshot.docs.map(doc =>
            DeviceEntity.fromObject({
                id: doc.id,
                ...doc.data()
            })
        );
    }

    async getById(accountId: string, deviceId: string): Promise<DeviceEntity> {
        const devicesPath = this.getDevicesCollectionPath(accountId);
        const docRef = db.collection(devicesPath).doc(deviceId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El dispositivo no existe.");
        }

        return DeviceEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }

    async updateDevice(accountId: string, deviceId: string, dto: UpdateDeviceDTO): Promise<DeviceEntity> {
        const devicesPath = this.getDevicesCollectionPath(accountId);
        const docRef = db.collection(devicesPath).doc(deviceId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El dispositivo no existe.");
        }

        const dataToUpdate = dto.values;
        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(dataToUpdate);

        const updatedDoc = await docRef.get();
        return DeviceEntity.fromObject({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });
    }

    async deleteDevice(accountId: string, deviceId: string): Promise<DeviceEntity> {
        const devicesPath = this.getDevicesCollectionPath(accountId);
        const docRef = db.collection(devicesPath).doc(deviceId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El dispositivo no existe.");
        }

        const deviceData = doc.data();

        await docRef.delete();

        return DeviceEntity.fromObject({
            id: doc.id,
            ...deviceData
        });
    }
}
