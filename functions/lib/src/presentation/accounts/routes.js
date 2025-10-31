"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountsRoutes = void 0;
const express_1 = require("express");
const controller_1 = require("./controller");
class AccountsRoutes {
    static get routes() {
        const router = (0, express_1.Router)();
        const accountController = new controller_1.AccountController();
        router.get("/", accountController.getAccounts);
        router.post("/", accountController.createAccount);
        router.get("/:id", accountController.getAccountById);
        router.put("/:id", accountController.updateAccount);
        router.delete("/:id", accountController.deleteAccount);
        return router;
    }
}
exports.AccountsRoutes = AccountsRoutes;
//# sourceMappingURL=routes.js.map