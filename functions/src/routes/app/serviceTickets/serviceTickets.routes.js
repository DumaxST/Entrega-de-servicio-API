const {Router} = require("express");
const router = Router();

const ServiceTicketController = require("../../../controllers/ServiceTicketController");

router.post("/serviceTickets", ServiceTicketController.createServiceTicket);
router.get("/serviceTickets", ServiceTicketController.getAllServiceTickets);
router.get("/serviceTickets/:id", ServiceTicketController.getServiceTicketById);
router.get("/serviceTickets/client/:clientId", ServiceTicketController.getServiceTicketsByClient);
router.get("/serviceTickets/status/:status", ServiceTicketController.getServiceTicketsByStatus);
router.get("/serviceTickets/priority/:priority", ServiceTicketController.getServiceTicketsByPriority);
router.get("/serviceTickets/assignee/:assignedTo", ServiceTicketController.getServiceTicketsByAssignee);
router.put("/serviceTickets/:id", ServiceTicketController.updateServiceTicket);
router.put("/serviceTickets/:id/comments", ServiceTicketController.addComment);
router.delete("/serviceTickets/:id", ServiceTicketController.deleteServiceTicket);

module.exports = router;