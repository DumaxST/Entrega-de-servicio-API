const {Router} = require("express");
const router = Router();

const ClientController = require("../../../controllers/ClientController");

router.post("/clients", ClientController.createClient);
router.get("/clients", ClientController.getAllClients);
router.get("/clients/:id", ClientController.getClientById);
router.get("/clients/status/:status", ClientController.getClientsByStatus);
router.put("/clients/:id", ClientController.updateClient);
router.delete("/clients/:id", ClientController.deleteClient);

module.exports = router;