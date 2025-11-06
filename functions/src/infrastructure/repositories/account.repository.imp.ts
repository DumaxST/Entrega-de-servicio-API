import { AccountDataSource, AccountEntity, AccountRepository, CreateAccountDTO, UpdateAccountDTO } from "./../../domain";

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
    getById(id: string): Promise<AccountEntity> {
        return this.dataSource.getById(id);
    }
    updateAccount(id: string,dto: UpdateAccountDTO): Promise<AccountEntity> {
        return this.dataSource.updateAccount(id,dto);
    }
    deleteAccount(id: string): Promise<AccountEntity> {
        return this.dataSource.deleteAccount(id);
    }


}