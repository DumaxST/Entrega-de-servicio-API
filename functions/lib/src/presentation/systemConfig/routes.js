"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
class SystemConfigRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const systemConfigController = new controller_1.SystemConfigController();
        router.post("/system-config", systemConfigController.createSystemConfig);
        router.get("/system-config", systemConfigController.getSystemConfig);
        router.put("/system-config", systemConfigController.updateSystemConfig);
        return router;
    }
}
exports.SystemConfigRoutes = SystemConfigRoutes;
//# sourceMappingURL=routes.js.map