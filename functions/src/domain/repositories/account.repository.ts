import { CreateAccountDTO , UpdateAccountDTO} from "domain/dtos";
import { AccountEntity } from "domain/entities/account.entity";

export abstract class AccountRepository {
   abstract createAccount(createAccountDto: CreateAccountDTO):Promise<AccountEntity>;
   //TODO: agregar páginación y filtros
   abstract getAll():Promise<AccountEntity[]>;

   abstract getById(id:string):Promise<AccountEntity>
   abstract updateAccount(id:string, updateAccountDto: UpdateAccountDTO):Promise<AccountEntity>
   abstract deleteAccount(id:string):Promise<AccountEntity>;
   
}