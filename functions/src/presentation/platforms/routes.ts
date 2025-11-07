import { Router } from "express";
import { PlatformController } from "./controller";
import { PlatformDataSourceImp } from "../../infrastructure/datasource/platform.datasource.imp";
import { PlatformRepositoryImp } from "../../infrastructure/repositories/platform.repository.imp";

export class PlatformRoutes {
    static get routes(): Router {
        const router = Router();
        const dataSource = new PlatformDataSourceImp("platforms");
        const platformRepository = new PlatformRepositoryImp(dataSource);
        const platformController = new PlatformController(platformRepository);

        router.get("/", platformController.getPlatforms);
        router.post("/", platformController.createPlatform);
        router.get("/:id", platformController.getPlatformById);
        router.put("/:id", platformController.updatePlatform);
        router.delete("/:id", platformController.deletePlatform);

        return router;
    }
}