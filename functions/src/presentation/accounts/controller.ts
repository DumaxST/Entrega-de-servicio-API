import { Request, Response,  } from "express";
import { db,  FieldValue,Timestamp} from "./../../config/firebaseAdmin";
export class AccountController {


    public getAccounts = (req: Request, res: Response) => {
        res.json({ message: "Get all accounts" });
    }

    public getAccountById = (req: Request, res: Response) => {
        res.json({ message: "Get account by ID", id: req.params.id });
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