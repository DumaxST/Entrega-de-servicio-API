"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
class ClientRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const clientController = new controller_1.ClientController();
        router.get("/clients", clientController.getClients);
        router.post("/clients", clientController.createClient);
        router.get("/clients/:id", clientController.getClientById);
        router.put("/clients/:id", clientController.updateClient);
        router.delete("/clients/:id", clientController.deleteClient);
        return router;
    }
}
exports.ClientRoutes = ClientRoutes;
//# sourceMappingURL=routes.js.map