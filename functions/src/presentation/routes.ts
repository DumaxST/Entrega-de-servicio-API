import { Router } from "express";
import { AccountsRoutes } from "./accounts/routes";
import { DeviceRoutes } from "./device/routes";
import { PlatformRoutes } from "./platforms/routes";
import { SystemConfigRoutes } from "./systemConfig/routes";
import { UserRoutes } from "./user/routes";
import { ServiceTicketRoutes } from "./serviceTickets/routes";

export class AppRoutes{
    static get routes(): Router{
        const router = Router();

        router.use("/accounts", AccountsRoutes.routes);
        router.use("/accounts/:accountId/devices", DeviceRoutes.routes);
        router.use("/accounts/:accountId/service-tickets", ServiceTicketRoutes.routes);
        router.use("/platform", PlatformRoutes.routes);
        router.use("/system-config", SystemConfigRoutes.routes);
        router.use("/users", UserRoutes.routes);

        return router;
    }
}
        
