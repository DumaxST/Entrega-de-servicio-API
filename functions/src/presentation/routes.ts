import { Router } from "express";
import { AccountsRoutes } from "./accounts/routes";
export class AppRoutes{
    static get routes(): Router{
        const router = Router();

        router.use("api/accounts", AccountsRoutes.routes);
        
        return router;

    }
    
}