import { CreateServiceTicketDTO, UpdateServiceTicketDTO } from "../dtos/service-tickets";
import { ServiceTicketEntity } from "../entities/service-ticket.entity";
import { ServiceTicketFilters } from "../datasources/service-ticket.datasource";

export abstract class ServiceTicketRepository {
    abstract createTicket(accountId: string, dto: CreateServiceTicketDTO): Promise<ServiceTicketEntity>;
    abstract getTicketById(accountId: string, ticketId: string): Promise<ServiceTicketEntity>;
    abstract getAllByAccount(accountId: string, filters?: ServiceTicketFilters): Promise<ServiceTicketEntity[]>;
    abstract updateTicket(accountId: string, ticketId: string, dto: UpdateServiceTicketDTO): Promise<ServiceTicketEntity>;
    abstract deleteTicket(accountId: string, ticketId: string): Promise<ServiceTicketEntity>;
}
