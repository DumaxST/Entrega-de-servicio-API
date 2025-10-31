"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
class UserRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const userController = new controller_1.UserController();
        router.post("/users", userController.createUser);
        router.get("/users/:id", userController.getUser);
        router.put("/users/:id", userController.updateUser);
        router.delete("/users/:id", userController.deleteUser);
        return router;
    }
}
exports.UserRoutes = UserRoutes;
//# sourceMappingURL=routes.js.map