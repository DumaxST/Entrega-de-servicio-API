import { AccountEntity , AccountRepository} from "../..";

export interface GetAccountsUseCase {
    execute(): Promise<AccountEntity[]>;
}
export class GetAccounts implements GetAccountsUseCase {
    constructor(
        private readonly repository: AccountRepository,
    ){}

    execute(): Promise<AccountEntity[]> {
        return this.repository.getAll()
    }
}