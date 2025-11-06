import { UpdateServiceTicketDTO } from "../../dtos/service-tickets";
import { ServiceTicketEntity } from "../../entities/service-ticket.entity";
import { ServiceTicketRepository } from "../../repositories/service-ticket.repository";

export interface UpdateServiceTicketUseCase {
    execute(accountId: string, ticketId: string, dto: UpdateServiceTicketDTO): Promise<ServiceTicketEntity>;
}

export class UpdateServiceTicket implements UpdateServiceTicketUseCase {
    constructor(private readonly repository: ServiceTicketRepository) { }

    async execute(accountId: string, ticketId: string, dto: UpdateServiceTicketDTO): Promise<ServiceTicketEntity> {
        return this.repository.updateTicket(accountId, ticketId, dto);
    }
}
