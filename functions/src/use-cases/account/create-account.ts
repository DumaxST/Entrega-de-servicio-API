import { AccountEntity , AccountRepository, CreateAccountDTO} from "./../../domain";

export interface CreateAccountUseCase {
    execute(dto: CreateAccountDTO): Promise<AccountEntity>;
}
export class CreateAccount implements CreateAccountUseCase {
    constructor(
        private readonly repository: AccountRepository,
    ){}

    execute(dto: CreateAccountDTO): Promise<AccountEntity> {
        return this.repository.createAccount(dto)
      
    }
}