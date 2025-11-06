import { db, FieldValue } from "./../../config/firebaseAdmin";
import { AccountDataSource } from "../../domain";
import { CreateAccountDTO, UpdateAccountDTO } from "../../domain/dtos";
import { AccountEntity } from "../../domain/entities/account.entity";

export class AccountDataSourceImp implements AccountDataSource {

    public collectionPath: string = 'accounts';
    constructor(collectionPath: string) {
        this.collectionPath = collectionPath;

    }

    async createAccount(createAccountDto: CreateAccountDTO): Promise<AccountEntity> {
        const accountsRef = db.collection('accounts');

        // Verificar que el clientCode sea único
        const snapshot = await accountsRef.where('clientCode', '==', createAccountDto!.clientCode)
            .limit(1)
            .get();
        if (!snapshot.empty) {
            throw new Error('El código de cliente ya está registrado.');
        }
        const newDocRef = accountsRef.doc();

        const newAccountData = {
            clientCode: createAccountDto!.clientCode,
            companyName: createAccountDto!.companyName,
            status: createAccountDto!.status,
            contactInfo: {
                phones: createAccountDto!.contactInfo.phones,
                city: createAccountDto!.contactInfo.city,
                state: createAccountDto!.contactInfo.state,
                notificationEmails: createAccountDto!.contactInfo.notificationEmails,
            },
            accountManagerId: createAccountDto!.accountManagerId || null,
            stats: createAccountDto!.stats || {
                totalUnits: 0,
                reportingUnits: 0,
                nonReportingUnits: 0,
                deliveryPercentage: 0,
                status: "bueno",
                instalacionesPendientes: 0,
                renovacionesPendientes: 0,
                reubicacionesPendientes: 0,
                ticketsEscalados: 0
            },
            createdAt: FieldValue.serverTimestamp(),

        }
        await newDocRef.set(newAccountData);
        return AccountEntity.fromObject({
            id: newDocRef.id,
            ...newAccountData,
            createdAt: new Date(),
        });
    }

    async getAll(): Promise<AccountEntity[]> {

        const accountsRef = db.collection('accounts');
        let query = accountsRef
            .orderBy('companyName', 'desc');

        const snapshot = await query.get();

        return snapshot.docs.map(doc => {

            return AccountEntity.fromObject({
                id: doc.id,
                ...doc.data()
            })

        });
    }

    async getById(id: string): Promise<AccountEntity> {
        // Implementación específica para obtener una cuenta por ID
        const docRef = db.collection('accounts').doc(id);

        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('La cuenta no existe.');
        }

        return AccountEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }


    async deleteAccount(id: string): Promise<AccountEntity> {
        const docRef = db.collection('accounts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('La cuenta no existe.');
        }

        await docRef.delete();

        return AccountEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }

    async updateAccount(id: string, updateAccountDto?: UpdateAccountDTO): Promise<AccountEntity> {
        const docRef = db.collection('accounts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('La cuenta no existe.');
        }

        const dataToUpdate = updateAccountDto!.values;

        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(dataToUpdate);

        const updatedDoc = await docRef.get();
        return AccountEntity.fromObject({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });
    }

}
