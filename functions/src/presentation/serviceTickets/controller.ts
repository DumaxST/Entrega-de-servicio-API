import { Request, Response } from "express";
import { CreateServiceTicketDTO, UpdateServiceTicketDTO } from "../../domain/dtos/service-tickets";
import { ServiceTicketRepository } from "../../domain/repositories/service-ticket.repository";
import {
    CreateServiceTicket,
    GetServiceTicket,
    GetServiceTickets,
    UpdateServiceTicket,
    DeleteServiceTicket
} from "../../domain/use-cases/service-ticket";

export class ServiceTicketController {
    constructor(private readonly serviceTicketRepository: ServiceTicketRepository) { }

    public getTickets = (req: Request, res: Response) => {
        const { accountId } = req.params;
        const { type, status, deviceId } = req.query;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }

        const filters: any = {};
        if (type) filters.type = type;
        if (status) filters.status = status;
        if (deviceId) filters.deviceId = deviceId;

        return new GetServiceTickets(this.serviceTicketRepository)
            .execute(accountId, filters)
            .then((tickets) => {
                return res.status(200).json({ tickets });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public getTicketById = (req: Request, res: Response) => {
        const { accountId, ticketId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }
        if (!ticketId) {
            return res.status(400).json({ message: "Error: Se requiere el Ticket ID." });
        }

        return new GetServiceTicket(this.serviceTicketRepository)
            .execute(accountId, ticketId)
            .then((ticket) => {
                return res.status(200).json({ ticket });
            })
            .catch((error) => {
                return res.status(404).json({ message: `Error: ${error}` });
            });
    };

    public createTicket = (req: Request, res: Response) => {
        const { accountId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }

        const [error, createTicketDto] = CreateServiceTicketDTO.create(req.body);

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new CreateServiceTicket(this.serviceTicketRepository)
            .execute(accountId, createTicketDto!)
            .then((newTicket) => {
                return res.status(201).json({ newTicket });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public updateTicket = (req: Request, res: Response) => {
        const { accountId, ticketId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }
        if (!ticketId) {
            return res.status(400).json({ message: "Error: Se requiere el Ticket ID." });
        }

        const [error, updateTicketDto] = UpdateServiceTicketDTO.create({
            id: ticketId,
            ...req.body
        });

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new UpdateServiceTicket(this.serviceTicketRepository)
            .execute(accountId, ticketId, updateTicketDto!)
            .then((updatedTicket) => {
                return res.status(200).json({ updatedTicket });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public deleteTicket = (req: Request, res: Response) => {
        const { accountId, ticketId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }
        if (!ticketId) {
            return res.status(400).json({ message: "Error: Se requiere el Ticket ID." });
        }

        return new DeleteServiceTicket(this.serviceTicketRepository)
            .execute(accountId, ticketId)
            .then(() => {
                return res.status(200).json({
                    message: "Ticket de servicio eliminado correctamente.",
                    ticketId
                });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };
}
