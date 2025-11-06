import { db, FieldValue } from "../../config/firebaseAdmin";
import { UserDataSource, UserFilters } from "../../domain/datasources/user.datasource";
import { CreateUserDTO, UpdateUserDTO } from "../../domain/dtos/users";
import { UserEntity } from "../../domain/entities/user.entity";

export class UserDataSourceImp implements UserDataSource {
    private readonly collectionPath = "users";

    constructor() {}

    async createUser(dto: CreateUserDTO): Promise<UserEntity> {
        // Check if email already exists
        const existingUserByEmail = await db.collection(this.collectionPath)
            .where("email", "==", dto.email)
            .limit(1)
            .get();

        if (!existingUserByEmail.empty) {
            throw new Error("Ya existe un usuario con este email.");
        }

        const newUserData = {
            name: dto.name,
            email: dto.email,
            role: dto.role,
            createdAt: FieldValue.serverTimestamp(),
        };

        // Let Firebase auto-generate the document ID
        const docRef = await db.collection(this.collectionPath).add(newUserData);

        return UserEntity.fromObject({
            id: docRef.id,
            ...newUserData,
            createdAt: new Date(),
        });
    }

    async getUserById(userId: string): Promise<UserEntity> {
        const docRef = db.collection(this.collectionPath).doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El usuario no existe.");
        }

        return UserEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }

    async getAllUsers(filters?: UserFilters): Promise<UserEntity[]> {
        let query: FirebaseFirestore.Query = db.collection(this.collectionPath);

        // Apply filters
        if (filters?.role) {
            query = query.where("role", "==", filters.role);
        }

        query = query.orderBy("createdAt", "desc");

        const snapshot = await query.get();

        return snapshot.docs.map(doc =>
            UserEntity.fromObject({
                id: doc.id,
                ...doc.data()
            })
        );
    }

    async updateUser(userId: string, dto: UpdateUserDTO): Promise<UserEntity> {
        const docRef = db.collection(this.collectionPath).doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El usuario no existe.");
        }

        // If email is being updated, check for uniqueness
        if (dto.email) {
            const existingUserByEmail = await db.collection(this.collectionPath)
                .where("email", "==", dto.email)
                .limit(1)
                .get();

            if (!existingUserByEmail.empty && existingUserByEmail.docs[0].id !== userId) {
                throw new Error("Ya existe un usuario con este email.");
            }
        }

        const dataToUpdate = dto.values;
        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(dataToUpdate);

        const updatedDoc = await docRef.get();
        return UserEntity.fromObject({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });
    }

    async deleteUser(userId: string): Promise<UserEntity> {
        const docRef = db.collection(this.collectionPath).doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error("El usuario no existe.");
        }

        const userData = doc.data();

        await docRef.delete();

        return UserEntity.fromObject({
            id: doc.id,
            ...userData
        });
    }
}
