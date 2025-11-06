import { Router } from "express";
import { SystemConfigController } from "./controller";
import { SystemConfigDataSourceImp } from "../../infrastructure/datasource/system-config.datasource.imp";
import { SystemConfigRepositoryImp } from "../../infrastructure/repositories/system-config.repository.imp";

export class SystemConfigRoutes {

    static get routes(): Router {
        const router = Router();

        const dataSource = new SystemConfigDataSourceImp();
        const systemConfigRepository = new SystemConfigRepositoryImp(dataSource);
        const systemConfigController = new SystemConfigController(systemConfigRepository);

        // Singleton config routes - no ID needed
        router.get("/", systemConfigController.getSystemConfig);
        router.put("/", systemConfigController.updateSystemConfig);

        return router;
    }
}
