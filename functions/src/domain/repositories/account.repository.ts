import { CreateAccountDTO , UpdateAccountDTO} from "domain/dtos";
import { AccountEntity } from "domain/entities/account.entity";

export abstract class AccountRepository {
   abstract createAccount(createAccountDto: CreateAccountDTO):Promise<AccountEntity>;
   //TODO: agregar páginación y filtros
   abstract getAll():Promise<AccountEntity[]>;

   abstract getById(id:string):Promise<AccountEntity | null>
   abstract updateAccount(id:string, updateAccountDto: UpdateAccountDTO):Promise<AccountEntity | null>
   abstract deleteAccount(id:string):Promise<void>;
   
}