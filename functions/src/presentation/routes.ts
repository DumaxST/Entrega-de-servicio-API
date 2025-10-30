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

        router.use("api/accounts", AccountsRoutes.routes);
        router.use("api/devices", DeviceRoutes.routes);
        router.use("api/clients", ClientRoutes.routes);
        router.use("api/platforms", PlatformRoutes.routes);
        router.use("api/system-config", SystemConfigRoutes.routes);
        router.use("api/users", UserRoutes.routes);
        
        return router;
    }
}
        
        return router;

    }
    
}