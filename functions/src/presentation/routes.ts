import { Router } from "express";
import { AccountsRoutes } from "./accounts/routes";
import { DeviceRoutes } from "./device/routes";
import { ClientRoutes } from "./clients/routes";
import { PlatformRoutes } from "./platforms/routes";
import { SystemConfigRoutes } from "./systemConfig/routes";
import { UserRoutes } from "./user/routes";

export class AppRoutes{
    static get routes(): Router{
        const router = Router();

        router.use("/account", AccountsRoutes.routes);
        router.use("/device", DeviceRoutes.routes);
        router.use("/client", ClientRoutes.routes);
        router.use("/platform", PlatformRoutes.routes);
        router.use("/system-config", SystemConfigRoutes.routes);
        router.use("/user", UserRoutes.routes);
       
        return router;
    }
}
        
