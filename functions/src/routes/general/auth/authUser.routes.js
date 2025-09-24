
const { Router } = require("express");
const AuthController = require("../../../presentation/auth/controller");
const router = Router();

router.post("/login", AuthController.login);
router.post("/register", AuthController.registerUser);
router.get("/validate-email/:token", AuthController.validateEmail);

module.exports = router;