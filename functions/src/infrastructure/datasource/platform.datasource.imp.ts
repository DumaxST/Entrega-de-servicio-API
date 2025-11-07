import { db, FieldValue } from "../../config/firebaseAdmin";
import { PlatformDataSource } from "../../domain/datasources/platform.datasource";
import { CreatePlatformDTO, UpdatePlatformDTO } from "../../domain/dtos/platforms";
import { PlatformEntity } from "../../domain/entities/platform.entity";

export class PlatformDataSourceImp implements PlatformDataSource {
    public collectionPath: string = "platforms";

    constructor(collectionPath: string) {
        this.collectionPath = collectionPath;
    }

    async createPlatform(createPlatformDto: CreatePlatformDTO): Promise<PlatformEntity> {
        const platformsRef = db.collection(this.collectionPath);

        // Check if platform name is unique
        const snapshot = await platformsRef
            .where("name", "==", createPlatformDto.name)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            throw new Error("Ya existe una plataforma con este nombre.");
        }

        const newDocRef = platformsRef.doc();

        const newPlatformData = {
            name: createPlatformDto.name,
            credentials: createPlatformDto.credentials,
            createdAt: FieldValue.serverTimestamp(),
        };

        await newDocRef.set(newPlatformData);

        return PlatformEntity.fromObject({
            id: newDocRef.id,
            ...newPlatformData,
            createdAt: new Date(),
        });
    }

    async getAll(): Promise<PlatformEntity[]> {
        const platformsRef = db.collection(this.collectionPath);
        const query = platformsRef.orderBy("name", "asc");

        const snapshot = await query.get();

        return snapshot.docs.map(doc => {
            return PlatformEntity.fromObject({
                id: doc.id,
                ...doc.data()
            });
        });
    }

    async getById(id: string): Promise<PlatformEntity> {
        const docRef = db.collection(this.collectionPath).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("La plataforma no existe.");
        }

        return PlatformEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }

    async getByName(name: string): Promise<PlatformEntity | null> {
        const platformsRef = db.collection(this.collectionPath);
        const snapshot = await platformsRef
            .where("name", "==", name)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return PlatformEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }

    async updatePlatform(id: string, updatePlatformDto: UpdatePlatformDTO): Promise<PlatformEntity> {
        const docRef = db.collection(this.collectionPath).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("La plataforma no existe.");
        }

        // If updating name, check uniqueness
        if (updatePlatformDto.name) {
            const snapshot = await db.collection(this.collectionPath)
                .where("name", "==", updatePlatformDto.name)
                .limit(1)
                .get();

            if (!snapshot.empty && snapshot.docs[0].id !== id) {
                throw new Error("Ya existe otra plataforma con este nombre.");
            }
        }

        const dataToUpdate = updatePlatformDto.values;
        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(dataToUpdate);

        const updatedDoc = await docRef.get();
        return PlatformEntity.fromObject({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });
    }

    async deletePlatform(id: string): Promise<PlatformEntity> {
        const docRef = db.collection(this.collectionPath).doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("La plataforma no existe.");
        }

        const platformData = PlatformEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });

        await docRef.delete();

        return platformData;
    }
}
