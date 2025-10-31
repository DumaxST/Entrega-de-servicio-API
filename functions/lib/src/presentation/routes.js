"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppRoutes = void 0;
const express_1 = require("express");
const routes_1 = require("./accounts/routes");
const routes_2 = require("./device/routes");
const routes_3 = require("./clients/routes");
const routes_4 = require("./platforms/routes");
const routes_5 = require("./systemConfig/routes");
const routes_6 = require("./user/routes");
class AppRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        router.use("/account", routes_1.AccountsRoutes.routes);
        router.use("/device", routes_2.DeviceRoutes.routes);
        router.use("/client", routes_3.ClientRoutes.routes);
        router.use("/platform", routes_4.PlatformRoutes.routes);
        router.use("/system-config", routes_5.SystemConfigRoutes.routes);
        router.use("/user", routes_6.UserRoutes.routes);
        return router;
    }
}
exports.AppRoutes = AppRoutes;
//# sourceMappingURL=routes.js.map