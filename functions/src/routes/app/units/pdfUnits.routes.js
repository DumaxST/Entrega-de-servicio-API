// Express
const {Router} = require("express");

const router = Router();

// Middlewares
// const { validateToken } = require("../../middlewares/auth");
const controller = require("./pdfUnitsController");
// const unitsSchema = require("./unitsSchema");

// ---------------------------------------- RUTAS ----------------------------------------

router.get("/units/pdf", controller.getPdfUnits);

module.exports = router;
