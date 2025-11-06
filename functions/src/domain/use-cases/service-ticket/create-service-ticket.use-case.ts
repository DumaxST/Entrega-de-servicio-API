import { CreateServiceTicketDTO } from "../../dtos/service-tickets";
import { ServiceTicketEntity } from "../../entities/service-ticket.entity";
import { ServiceTicketRepository } from "../../repositories/service-ticket.repository";

export interface CreateServiceTicketUseCase {
    execute(accountId: string, dto: CreateServiceTicketDTO): Promise<ServiceTicketEntity>;
}

export class CreateServiceTicket implements CreateServiceTicketUseCase {
    constructor(private readonly repository: ServiceTicketRepository) { }

    async execute(accountId: string, dto: CreateServiceTicketDTO): Promise<ServiceTicketEntity> {
        return this.repository.createTicket(accountId, dto);
    }
}
