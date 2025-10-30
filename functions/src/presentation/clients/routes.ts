import { Router } from "express";
import { ClientController } from "./controller";

export class AccountsRoutes {
    static get routes(): Router{
        const router = Router();
        const clientController = new ClientController();

        router.get("/clients", clientController.getClients);
        router.post("/clients", clientController.createClient);
        router.get("/clients/:id", clientController.getClientById);
        router.put("/clients/:id", clientController.updateClient);
        router.delete("/clients/:id", clientController.deleteClient);

        return router;

    }
}
