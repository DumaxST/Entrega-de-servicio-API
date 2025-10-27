const {Router} = require("express");
const router = Router();

const DeviceController = require("../../../controllers/DeviceController");

router.post("/devices", DeviceController.createDevice);
router.get("/devices", DeviceController.getAllDevices);
router.get("/devices/:id", DeviceController.getDeviceById);
router.get("/devices/client/:clientId", DeviceController.getDevicesByClient);
router.get("/devices/type/:type", DeviceController.getDevicesByType);
router.get("/devices/status/:status", DeviceController.getDevicesByStatus);
router.put("/devices/:id", DeviceController.updateDevice);
router.delete("/devices/:id", DeviceController.deleteDevice);

module.exports = router;