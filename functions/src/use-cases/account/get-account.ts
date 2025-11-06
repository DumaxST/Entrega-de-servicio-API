import { AccountEntity , AccountRepository} from "./../../domain";

export interface GetAccountUseCase {
    execute(id:string): Promise<AccountEntity>;
}
export class GetAccount implements GetAccountUseCase {
    constructor(
        private readonly repository: AccountRepository,
    ){}

    execute(id:string): Promise<AccountEntity> {
        return this.repository.getById(id)
    }
}