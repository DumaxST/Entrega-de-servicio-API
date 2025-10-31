import { Router } from "express";
import { AccountController } from "./controller";

export class AccountsRoutes {
    static get routes(): Router{
        const router = Router();
        const accountController = new AccountController();

        router.get("/", accountController.getAccounts);
        router.post("/", accountController.createAccount);
        
        router.get("/:id", accountController.getAccountById);
        router.put("/:id", accountController.updateAccount);
        router.delete("/:id", accountController.deleteAccount);
        return router;

    }
}
