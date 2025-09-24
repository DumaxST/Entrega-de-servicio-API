const { Router } = require("express");
const AuthController = require("./controller");

class AuthRoutes {
    static get routes(){
        const router = Router();

        router.post("/login", AuthController.login);
        router.post("/register", AuthController.registerUser);
        router.get("/validate-email/:token", AuthController.validateEmail);

        return router;
    }

}

module.exports = AuthRoutes;