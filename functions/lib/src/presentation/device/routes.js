"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
class DeviceRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const deviceController = new controller_1.DeviceController();
        router.get("/devices", deviceController.getDevices);
        router.post("/devices", deviceController.createDevice);
        router.get("/devices/:id", deviceController.getDeviceById);
        router.put("/devices/:id", deviceController.updateDevice);
        router.delete("/devices/:id", deviceController.deleteDevice);
        return router;
    }
}
exports.DeviceRoutes = DeviceRoutes;
//# sourceMappingURL=routes.js.map