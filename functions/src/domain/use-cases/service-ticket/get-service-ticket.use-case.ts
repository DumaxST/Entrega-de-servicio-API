import { ServiceTicketEntity } from "../../entities/service-ticket.entity";
import { ServiceTicketRepository } from "../../repositories/service-ticket.repository";

export interface GetServiceTicketUseCase {
    execute(accountId: string, ticketId: string): Promise<ServiceTicketEntity>;
}

export class GetServiceTicket implements GetServiceTicketUseCase {
    constructor(private readonly repository: ServiceTicketRepository) { }

    async execute(accountId: string, ticketId: string): Promise<ServiceTicketEntity> {
        return this.repository.getTicketById(accountId, ticketId);
    }
}
