import { db, FieldValue } from "../../config/firebaseAdmin";
import { SystemConfigDataSource } from "../../domain/datasources/system-config.datasource";
import { UpdateSystemConfigDTO } from "../../domain/dtos/system-config";
import { SystemConfigEntity } from "../../domain/entities/system-config.entity";

export class SystemConfigDataSourceImp implements SystemConfigDataSource {
    private readonly collectionPath = "systemConfig";
    private readonly docId = "main";

    constructor() {}

    async getConfig(): Promise<SystemConfigEntity> {
        const docRef = db.collection(this.collectionPath).doc(this.docId);
        const doc = await docRef.get();

        if (!doc.exists) {
            // If config doesn't exist, initialize with default values
            return this.initializeConfig();
        }

        const data = doc.data();
        if (!data) {
            throw new Error("No se pudo obtener la configuración del sistema.");
        }

        return SystemConfigEntity.fromObject(data);
    }

    async updateConfig(dto: UpdateSystemConfigDTO): Promise<SystemConfigEntity> {
        const docRef = db.collection(this.collectionPath).doc(this.docId);
        const doc = await docRef.get();

        if (!doc.exists) {
            // If config doesn't exist, create it with provided values
            const newConfigData = {
                ...dto.values,
                updatedAt: FieldValue.serverTimestamp(),
            };

            await docRef.set(newConfigData);

            return SystemConfigEntity.fromObject({
                ...newConfigData,
                updatedAt: new Date(),
            });
        }

        // Update existing config
        const dataToUpdate = dto.values;
        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(dataToUpdate);

        const updatedDoc = await docRef.get();
        const updatedData = updatedDoc.data();
        if (!updatedData) {
            throw new Error("No se pudo obtener la configuración actualizada.");
        }

        return SystemConfigEntity.fromObject(updatedData);
    }

    async initializeConfig(): Promise<SystemConfigEntity> {
        const defaultConfig = {
            serviceThresholds: {
                excellent: 100,
                goodRange: [95, 99],
                regularRange: [80, 94],
                badRange: [50, 79],
                criticalRange: [0, 49]
            },
            notificationTemplate: "<html><body><p>Hola [Cliente], su reporte está disponible.</p></body></html>",
            updatedAt: FieldValue.serverTimestamp(),
        };

        const docRef = db.collection(this.collectionPath).doc(this.docId);
        await docRef.set(defaultConfig);

        return SystemConfigEntity.fromObject({
            ...defaultConfig,
            updatedAt: new Date(),
        });
    }
}
