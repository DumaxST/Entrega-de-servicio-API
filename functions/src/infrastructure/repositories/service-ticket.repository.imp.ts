import { ServiceTicketDataSource, ServiceTicketFilters } from "../../domain/datasources/service-ticket.datasource";
import { CreateServiceTicketDTO, UpdateServiceTicketDTO } from "../../domain/dtos/service-tickets";
import { ServiceTicketEntity } from "../../domain/entities/service-ticket.entity";
import { ServiceTicketRepository } from "../../domain/repositories/service-ticket.repository";

export class ServiceTicketRepositoryImp implements ServiceTicketRepository {
    constructor(private readonly dataSource: ServiceTicketDataSource) { }

    async createTicket(accountId: string, dto: CreateServiceTicketDTO): Promise<ServiceTicketEntity> {
        return this.dataSource.createTicket(accountId, dto);
    }

    async getTicketById(accountId: string, ticketId: string): Promise<ServiceTicketEntity> {
        return this.dataSource.getTicketById(accountId, ticketId);
    }

    async getAllByAccount(accountId: string, filters?: ServiceTicketFilters): Promise<ServiceTicketEntity[]> {
        return this.dataSource.getAllByAccount(accountId, filters);
    }

    async updateTicket(accountId: string, ticketId: string, dto: UpdateServiceTicketDTO): Promise<ServiceTicketEntity> {
        return this.dataSource.updateTicket(accountId, ticketId, dto);
    }

    async deleteTicket(accountId: string, ticketId: string): Promise<ServiceTicketEntity> {
        return this.dataSource.deleteTicket(accountId, ticketId);
    }
}
