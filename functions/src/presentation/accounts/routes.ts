import { Router } from "express";
import { AccountController } from "./controller";
import { AccountDataSourceImp, AccountRepositoryImp } from "./../../infrastructure";

export class AccountsRoutes {
    static get routes(): Router{
        const router = Router();
        const dataSource = new AccountDataSourceImp("accounts");
        const accountRepository = new AccountRepositoryImp(dataSource);

        const accountController = new AccountController(accountRepository);

        router.get("/", accountController.getAccounts);
        router.post("/", accountController.createAccount);
        
        router.get("/:id", accountController.getAccountById);
        router.put("/:id", accountController.updateAccount);
        router.delete("/:id", accountController.deleteAccount);
        return router;

    }
}
