import { ServiceTicketEntity } from "../../entities/service-ticket.entity";
import { ServiceTicketRepository } from "../../repositories/service-ticket.repository";

export interface DeleteServiceTicketUseCase {
    execute(accountId: string, ticketId: string): Promise<ServiceTicketEntity>;
}

export class DeleteServiceTicket implements DeleteServiceTicketUseCase {
    constructor(private readonly repository: ServiceTicketRepository) { }

    async execute(accountId: string, ticketId: string): Promise<ServiceTicketEntity> {
        return this.repository.deleteTicket(accountId, ticketId);
    }
}
