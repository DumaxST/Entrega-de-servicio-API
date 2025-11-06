import { AccountEntity , AccountRepository, UpdateAccountDTO} from "../..";

export interface UpdateAccountUseCase {
    execute(id:string, dto: UpdateAccountDTO): Promise<AccountEntity>;
}
export class UpdateAccount implements UpdateAccountUseCase {
    constructor(
        private readonly repository: AccountRepository,
    ){}

    execute(id:string, dto: UpdateAccountDTO): Promise<AccountEntity> {
        return this.repository.updateAccount(id, dto)
    }
}