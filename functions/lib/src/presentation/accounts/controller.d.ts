import { Request, Response } from "express";
export declare class AccountController {
    getAccounts: (req: Request, res: Response) => void;
    getAccountById: (req: Request, res: Response) => void;
    createAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateAccount: (req: Request, res: Response) => void;
    deleteAccount: (req: Request, res: Response) => void;
}
//# sourceMappingURL=controller.d.ts.map