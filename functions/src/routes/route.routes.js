// Express
const { Router } = require("express");
const router = Router();

// Middlewares
// const { validateToken } = require("../../middlewares/auth");
const controller = require("./controller");
// const userSchema = require("./userSchema");

// ---------------------------------------- RUTAS ---------------------------------------- 

router.get("/get", controller.get);

module.exports = router;
