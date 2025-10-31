import { Request, Response, } from "express";
import { db, FieldValue, Timestamp } from "./../../config/firebaseAdmin";


export class AccountController {

    public getAccounts = async (req: Request, res: Response) => {
        try {

            const accountsRef = db.collection('accounts');

            let query = accountsRef
                .orderBy('companyName', 'desc');

            const snapshot = await query.get();

            const data = snapshot.docs.map(doc => {

                const docData = doc.data();
                return {
                    id: doc.id,
                    email: docData.email,
                    companyName: docData.companyName,
                    contactInfo: docData.contactInfo,
                    createdAt: docData.createdAt,
                }
            });

            return res.status(200).json({ data });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }

    }

    public getAccountById = async(req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Error: Se requiere el ID de la cuenta.' });
        }
        const docRef = db.collection('accounts').doc(id);

        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('ACCOUNT_NOT_FOUND');
        }

        const data = doc.data();
            return res.status(200).json({  id: doc.id,
            ...data,});

}

    public createAccount = async (req: Request, res: Response) => {
    try {

        const { email, companyName, contactInfo } = req.body;

        if (!email || !companyName) {
            return res.status(400).json({
                message: 'Error: email y companyName son requeridos.'
            });
        }
        const accountsRef = db.collection('accounts');

        const snapshot = await accountsRef.where('email', '==', email)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            throw new Error('EMAIL_EXISTS');
        }
        const newDocRef = accountsRef.doc();
        const newAccountData = {
            email: email,
            companyName: companyName,
            status:'active',
            contactInfo: {
                phone: contactInfo?.phone || null,
                city: contactInfo?.city || null,
                state: contactInfo?.state || null,
            },
            createdAt: FieldValue.serverTimestamp(),

        }
        await newDocRef.set(newAccountData);
        return res.status(201).json({
            id: newDocRef.id,
            ...newAccountData,
            createdAt: Timestamp.now(),
        });


    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'EMAIL_EXISTS') {
                return res.status(409).json({
                    message: `Error: Ya existe una cuenta con el email '${req.body.email}'`
                });
            }
            return res.status(500).json({ message: 'Error interno del servidor.' });

        }
        return res.status(500).json({ message: 'Error interno del servidor.' });
    }
}

    public updateAccount = (req: Request, res: Response) => {
    res.json({ message: "Update account", id: req.params.id, data: req.body });
}

    public deleteAccount = (req: Request, res: Response) => {
    res.json({ message: "Delete account", id: req.params.id });
}


}