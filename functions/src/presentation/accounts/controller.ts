import { Request, Response } from "express";

export class AccountController{

    constructor() {
        // Initialize any dependencies here
    }
    public getAccounts = (req: Request, res: Response) =>{
        res.json({message: "Get all accounts"});
    }

    public getAccountById = (req: Request, res: Response) => {

    }

    public createAccount = (req: Request, res: Response) => {
    }

    public updateAccount = (req: Request, res: Response) => {
    }

    public deleteAccount = (req: Request, res: Response) => {
    }

   
}