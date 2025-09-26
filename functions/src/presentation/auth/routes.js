const { Router } = require("express");
const AuthController = require("./controller");
const AuthService = require("../services/auth.service");

class AuthRoutes {
    static get routes(){
        const router = Router();
        const authService = new AuthService();
        const controller = new AuthController(authService);

        router.post("/login", controller.login);
        router.post("/register", controller.registerUser);
        router.get("/validate-email/:token", controller.validateEmail);

        return router;
    }

}

module.exports = AuthRoutes;