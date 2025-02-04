// Express
const { Router } = require("express");
const router = Router();

// Middlewares
// const { validateToken } = require("../../middlewares/auth");
const controller = require("./companiesController");
// const companiesSchema = require("./companiesSchema");

// ---------------------------------------- RUTAS ---------------------------------------- 

router.get("/companies", controller.get);

module.exports = router;