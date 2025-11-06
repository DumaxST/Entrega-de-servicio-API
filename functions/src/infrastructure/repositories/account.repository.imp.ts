import { AccountDataSource, AccountEntity, AccountRepository, CreateAccountDTO } from "./../../domain";

export class AccountRepositoryImp implements AccountRepository {
    constructor(
        private readonly dataSource: AccountDataSource,
    ){}

    createAccount(createAccountDto: CreateAccountDTO): Promise<AccountEntity> {
       return this.dataSource.createAccount(createAccountDto);

    }
    getAll(): Promise<AccountEntity[]> {
        return this.dataSource.getAll();
    }
    getById(id: string): Promise<AccountEntity | null> {
        return this.dataSource.getById(id);
    }
    updateAccount(id: string): Promise<AccountEntity | null> {
        return this.dataSource.updateAccount(id);
    }


}