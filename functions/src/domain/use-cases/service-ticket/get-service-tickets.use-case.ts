import { ServiceTicketFilters } from "../../datasources/service-ticket.datasource";
import { ServiceTicketEntity } from "../../entities/service-ticket.entity";
import { ServiceTicketRepository } from "../../repositories/service-ticket.repository";

export interface GetServiceTicketsUseCase {
    execute(accountId: string, filters?: ServiceTicketFilters): Promise<ServiceTicketEntity[]>;
}

export class GetServiceTickets implements GetServiceTicketsUseCase {
    constructor(private readonly repository: ServiceTicketRepository) { }

    async execute(accountId: string, filters?: ServiceTicketFilters): Promise<ServiceTicketEntity[]> {
        return this.repository.getAllByAccount(accountId, filters);
    }
}
