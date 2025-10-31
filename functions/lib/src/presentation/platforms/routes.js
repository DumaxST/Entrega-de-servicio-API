"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
class PlatformRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const platformController = new controller_1.PlatformController();
        router.get("/platforms", platformController.getPlatforms);
        router.post("/platforms", platformController.createPlatform);
        router.get("/platforms/:id", platformController.getPlatformById);
        router.put("/platforms/:id", platformController.updatePlatform);
        router.delete("/platforms/:id", platformController.deletePlatform);
        return router;
    }
}
exports.PlatformRoutes = PlatformRoutes;
//# sourceMappingURL=routes.js.map