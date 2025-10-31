import { Router } from "express";
import { SystemConfigController } from "./controller";

export class SystemConfigRoutes {

    static get routes(): Router {
        const router = Router();
        const systemConfigController = new SystemConfigController();

        router.post("/system-config", systemConfigController.createSystemConfig);
        router.get("/system-config", systemConfigController.getSystemConfig);
        router.put("/system-config", systemConfigController.updateSystemConfig);

        return router;
    }
}