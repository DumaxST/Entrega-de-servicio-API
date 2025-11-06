import { Request, Response, } from "express";
import { CreateAccountDTO, UpdateAccountDTO } from "./../../domain/dtos";
import { AccountRepository } from '../../domain/repositories/account.repository';



export class AccountController {
    constructor(
        private readonly accountRepository: AccountRepository
    ) { }

    public getAccounts = async (req: Request, res: Response) => {

        try {
            const accounts = await this.accountRepository.getAll();
            return res.status(200).json({ accounts });
        } catch (error) {
            return res.status(500).json({ message: `Error: ${error}` });
        }

    }

    public getAccountById = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Error: Se requiere el ID de la cuenta.' });
        }
        try {
            const account = await this.accountRepository.getById(id);
            return res.status(200).json({ account });
        } catch (error) {
            return res.status(404).json({ message: `Error: ${error}` });
        }

    }

    public createAccount = async (req: Request, res: Response) => {

        const [error, createAccountDto] = CreateAccountDTO.create(req.body);

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }
        try {
            const newAccount = await this.accountRepository.createAccount(createAccountDto!);
            return res.status(201).json({  newAccount });
        } catch (error) {
            return res.status(500).json({ message: `Error: ${error}` });
        }
    }




    public updateAccount = async (req: Request, res: Response) => {
        const { id } = req.params;
        const [error, updateAccountDto] = UpdateAccountDTO.create({ id, ...req.body });

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }
        try {
            const updatedAccount = await this.accountRepository.updateAccount(id, updateAccountDto!);
            return res.status(200).json({ updatedAccount });

        } catch (error) {
            return res.status(500).json({ message: `Error: ${error}` });
        }

    }

    public deleteAccount = async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Error: Se requiere el ID de la cuenta.' });
        }
        try {
            await this.accountRepository.deleteAccount(id);
            return res.status(200).json({ message: "Cuenta eliminada correctamente.", id });
        } catch (error) {
            return res.status(500).json({ message: `Error: ${error}` });
        }
    }

}