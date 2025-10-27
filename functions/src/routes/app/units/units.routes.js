const {Router} = require("express");
const router = Router();

const unitsController = require("./unitsController");
const UnitController = require("../../../controllers/UnitController");

router.post("/units", UnitController.createUnit);
router.get("/units", UnitController.getAllUnits);
router.get("/units/report", unitsController.getReport);
router.get("/units/:id", UnitController.getUnitById);
router.get("/units/client/:clientId", UnitController.getUnitsByClient);
router.put("/units/:id", UnitController.updateUnit);
router.delete("/units/:id", UnitController.deleteUnit);

module.exports = router;

