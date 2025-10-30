import { Router } from "express";
import { AccountController } from "./controller";

export class AccountsRoutes {
    static get routes(): Router{
        const router = Router();
        const accountController = new AccountController();

        router.get("/accounts", accountController.getAccounts);
        router.post("/accounts", accountController.createAccount);
        router.get("/accounts/:id", accountController.getAccountById);
        router.put("/accounts/:id", accountController.updateAccount);
        router.delete("/accounts/:id", accountController.deleteAccount);
        return router;

    }
}
