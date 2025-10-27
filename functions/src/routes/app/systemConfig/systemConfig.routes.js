const {Router} = require("express");
const router = Router();

const SystemConfigController = require("../../../controllers/SystemConfigController");

router.post("/systemConfig", SystemConfigController.createSystemConfig);
router.get("/systemConfig", SystemConfigController.getAllSystemConfigs);
router.get("/systemConfig/public", SystemConfigController.getPublicSystemConfigs);
router.get("/systemConfig/required", SystemConfigController.getRequiredSystemConfigs);
router.get("/systemConfig/:id", SystemConfigController.getSystemConfigById);
router.get("/systemConfig/key/:key", SystemConfigController.getSystemConfigByKey);
router.get("/systemConfig/category/:category", SystemConfigController.getSystemConfigsByCategory);
router.get("/systemConfig/environment/:environment", SystemConfigController.getSystemConfigsByEnvironment);
router.put("/systemConfig/:id", SystemConfigController.updateSystemConfig);
router.put("/systemConfig/:id/value", SystemConfigController.updateSystemConfigValue);
router.put("/systemConfig/bulk", SystemConfigController.bulkUpdateSystemConfigs);
router.delete("/systemConfig/:id", SystemConfigController.deleteSystemConfig);

module.exports = router;