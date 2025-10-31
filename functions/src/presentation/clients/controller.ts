import { Request, Response } from "express";

export class ClientController{
    public getClients = (req: Request, res: Response) => {
        res.json({message: "Get all clients"});
    }

    public getClientById = (req: Request, res: Response) => {
    }

    public createClient = (req: Request, res: Response) => {
    }

    public updateClient = (req: Request, res: Response) => {
    }

    public deleteClient = (req: Request, res: Response) => {
    }

}