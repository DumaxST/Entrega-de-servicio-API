// Express
const { Router } = require("express");
const router = Router();

// Middlewares
// const { validateToken } = require("../../middlewares/auth");
const controller = require("./unitsController");
// const unitsSchema = require("./unitsSchema");

// ---------------------------------------- RUTAS ---------------------------------------- 

router.get("/units/report", controller.getReport);

module.exports = router;