import { Request, Response } from "express";
export declare class AccountController {
    getAccounts: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAccountById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    updateAccount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteAccount: (req: Request, res: Response) => Response<any, Record<string, any>>;
}
//# sourceMappingURL=controller.d.ts.map