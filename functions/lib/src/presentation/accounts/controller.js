"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountController = void 0;
const firebaseAdmin_1 = require("./../../config/firebaseAdmin");
class AccountController {
    constructor() {
        this.getAccounts = (req, res) => {
            res.json({ message: "Get all accounts" });
        };
        this.getAccountById = (req, res) => {
            res.json({ message: "Get account by ID", id: req.params.id });
        };
        this.createAccount = async (req, res) => {
            try {
                const { email, companyName, contactInfo } = req.body;
                if (!email || !companyName) {
                    return res.status(400).json({
                        message: 'Error: email y companyName son requeridos.'
                    });
                }
                const accountsRef = firebaseAdmin_1.db.collection('accounts');
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
                    }
                };
                await newDocRef.set(newAccountData);
                return res.status(201).json({ id: newDocRef.id, ...newAccountData });
            }
            catch (error) {
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
        };
        this.updateAccount = (req, res) => {
            res.json({ message: "Update account", id: req.params.id, data: req.body });
        };
        this.deleteAccount = (req, res) => {
            res.json({ message: "Delete account", id: req.params.id });
        };
    }
}
exports.AccountController = AccountController;
//# sourceMappingURL=controller.js.map