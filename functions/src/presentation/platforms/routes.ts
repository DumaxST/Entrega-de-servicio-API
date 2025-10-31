import { Router } from "express";
import { PlatformController } from "./controller";

export class PlatformRoutes {
    static get routes(): Router {
        const router = Router();
        const platformController = new PlatformController();

        router.get("/platforms", platformController.getPlatforms);
        router.post("/platforms", platformController.createPlatform);
        router.get("/platforms/:id", platformController.getPlatformById);
        router.put("/platforms/:id", platformController.updatePlatform);
        router.delete("/platforms/:id", platformController.deletePlatform);
        return router;
    }
}