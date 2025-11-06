import { Router } from "express";
import { ServiceTicketController } from "./controller";
import { ServiceTicketDataSourceImp } from "../../infrastructure/datasource/service-ticket.datasource.imp";
import { ServiceTicketRepositoryImp } from "../../infrastructure/repositories/service-ticket.repository.imp";

export class ServiceTicketRoutes {
    static get routes(): Router {
        const router = Router({ mergeParams: true }); // Important for nested routes!

        const dataSource = new ServiceTicketDataSourceImp();
        const serviceTicketRepository = new ServiceTicketRepositoryImp(dataSource);
        const serviceTicketController = new ServiceTicketController(serviceTicketRepository);

        // All routes are relative to /accounts/:accountId/service-tickets
        router.get("/", serviceTicketController.getTickets);
        router.post("/", serviceTicketController.createTicket);
        router.get("/:ticketId", serviceTicketController.getTicketById);
        router.put("/:ticketId", serviceTicketController.updateTicket);
        router.delete("/:ticketId", serviceTicketController.deleteTicket);

        return router;
    }
}
