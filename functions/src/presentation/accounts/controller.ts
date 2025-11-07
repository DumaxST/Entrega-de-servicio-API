import { Request, Response, } from "express";
import { CreateAccountDTO, UpdateAccountDTO } from "./../../domain/dtos";
import { AccountRepository } from "../../domain/repositories/account.repository";
import { GetAccounts, GetAccount, CreateAccount, UpdateAccount, DeleteAccount } from "../../domain/use-cases";

export class AccountController {
    constructor(
        private readonly accountRepository: AccountRepository
    ) { }

    public getAccounts = (req: Request, res: Response) => {

        new GetAccounts(this.accountRepository)
            .execute()
            .then((accounts) => {
                return res.status(200).json({ accounts });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });

    }

    public getAccountById = (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Error: Se requiere el ID de la cuenta." });
        }

        return new GetAccount(this.accountRepository)
            .execute(id)
            .then((account) => {
                return res.status(200).json({ account });
            })
            .catch((error) => {
                return res.status(404).json({ message: `Error: ${error}` });
            });
    }

    public createAccount = (req: Request, res: Response) => {

        const [error, createAccountDto] = CreateAccountDTO.create(req.body);

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new CreateAccount(this.accountRepository)
            .execute(createAccountDto!)
            .then((newAccount) => {
                return res.status(201).json({ newAccount });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    }

    public updateAccount = (req: Request, res: Response) => {
        const { id } = req.params;
        const [error, updateAccountDto] = UpdateAccountDTO.create({ id, ...req.body });

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new UpdateAccount(this.accountRepository)
            .execute(id, updateAccountDto!)
            .then((updatedAccount) => {
                return res.status(200).json({ updatedAccount });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    }

    public deleteAccount = (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Error: Se requiere el ID de la cuenta." });
        }
        return new DeleteAccount(this.accountRepository)
            .execute(id)
            .then(() => {
                return res.status(200).json({ message: "Cuenta eliminada correctamente.", id });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    }

}