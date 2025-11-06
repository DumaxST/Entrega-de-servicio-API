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

        const snapshot = await accountsRef.where('email', '==', createAccountDto!.email)
            .limit(1)
            .get();
        if (!snapshot.empty) {
            throw new Error('El email ya esta registrado.');
        }
        const newDocRef = accountsRef.doc();

        const newAccountData = {
            email: createAccountDto!.email,
            companyName: createAccountDto!.companyName,
            status: createAccountDto!.status,
            contactInfo: {
                phone: createAccountDto!.contactInfo?.phone || null,
                city: createAccountDto!.contactInfo?.city || null,
                state: createAccountDto!.contactInfo?.state || null,
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

    async getById(id: string): Promise<AccountEntity | null> {
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


    async deleteAccount(id: string) {
        const docRef = db.collection('accounts').doc(id);
        await docRef.delete();
        
    }

    async updateAccount(id: string, updateAccountDto?: UpdateAccountDTO): Promise<AccountEntity | null> {
        const docRef = db.collection('accounts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('La cuenta no existe.');
        }
        if (updateAccountDto!.email) {
            const snapshot = await db.collection('accounts')
                .where('email', '==', updateAccountDto!.email)
                .limit(1).get();
            if (!snapshot.empty && snapshot.docs[0].id !== id) {
                throw new Error('EMAIL_EXISTS');
            }
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
