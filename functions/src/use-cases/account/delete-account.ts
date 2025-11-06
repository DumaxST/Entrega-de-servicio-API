import { AccountEntity , AccountRepository} from "./../../domain";

export interface DeleteAccountUseCase {
    execute(id:string): Promise<AccountEntity>;
}
export class DeleteAccount implements DeleteAccountUseCase {
    constructor(
        private readonly repository: AccountRepository,
    ){}

    execute(id:string): Promise<AccountEntity> {
        return this.repository.deleteAccount(id)
    }
}