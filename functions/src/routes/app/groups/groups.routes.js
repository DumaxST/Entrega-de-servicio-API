// Express
const { Router } = require("express");
const router = Router();

// Middlewares
// const { validateToken } = require("../../middlewares/auth");
const controller = require("./groupsController");
// const groupsSchema = require("./groupsSchema");

// ---------------------------------------- RUTAS ---------------------------------------- 

router.get("/groups", controller.get);

module.exports = router;