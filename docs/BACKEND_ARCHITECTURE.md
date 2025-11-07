# Entrega de Servicio - Backend Architecture Exploration Report

## Executive Summary
This is a **Firebase Functions + Express.js** backend deployed as serverless Cloud Functions with **Firestore** as the database. The codebase follows Clean Architecture principles with clear separation of concerns through Controllers, Services, Repositories, and DTOs.

---

## 1. Backend Framework & Stack

### Primary Technology: Firebase Functions + Express.js
- **Framework**: Express.js 5.1.0 running on Firebase Cloud Functions
- **Runtime**: Node.js 20
- **Database**: Google Cloud Firestore (NoSQL)
- **Authentication**: Firebase Auth (JWT tokens + Firebase ID tokens)
- **Deployment**: Google Cloud Platform (Firebase)

### Key Dependencies:
```json
{
  "express": "^5.1.0",
  "firebase-admin": "^12.6.0",
  "firebase-functions": "^6.0.1",
  "express-validator": "^7.2.1",
  "cors": "^2.8.5",
  "compression": "^1.8.1",
  "jsonwebtoken": "^9.0.2",
  "axios": "^1.11.0",
  "pdfkit": "^0.17.1"
}
```

### Initialization (index.ts):
```typescript
// Express app setup with compression middleware
const app = express();
app.use(express.json());
app.use(compression());
app.use(AppRoutes.routes);

// Exported as Firebase Cloud Function
export const api = functions.https.onRequest(app);
```

---

## 2. Folder Structure & Organization

### Backend Path:
```
/home/erika/Documents/dumaxst/api/Dumax_Backend-API/functions/
```

### Directory Structure:
```
functions/src/
├── config/                 # Configuration files
│   ├── firebaseAdmin.ts   # Firebase initialization (emulator & production)
│   ├── envs.ts            # Environment variables
│   └── serviceAccount.json # Firebase credentials
│
├── presentation/          # Express routes & controllers (API layer)
│   ├── accounts/
│   │   ├── routes.ts      # Route definitions
│   │   ├── controller.ts  # Request handlers
│   │   └── account.interface.ts  # TypeScript interfaces
│   ├── device/
│   │   ├── routes.ts
│   │   └── controller.ts
│   ├── serviceTickets/
│   │   ├── routes.ts
│   │   └── controller.ts
│   ├── systemConfig/
│   ├── platforms/
│   ├── user/
│   ├── routes.ts          # Main app router (aggregates all routes)
│   └── server.ts          # Express app setup
│
├── domain/                # Business logic & entities (core layer)
│   ├── dtos/              # Data Transfer Objects (validation)
│   │   ├── accounts/
│   │   │   ├── create-account.dto.ts
│   │   │   └── update-account.dto.ts
│   │   ├── devices/
│   │   ├── service-tickets/
│   │   ├── users/
│   │   └── system-config/
│   ├── entities/          # Business entities
│   │   ├── account.entity.ts
│   │   ├── device.entity.ts
│   │   ├── service-ticket.entity.ts
│   │   └── user.entity.ts
│   ├── repositories/      # Abstract repository interfaces
│   │   ├── account.repository.ts
│   │   ├── device.repository.ts
│   │   └── service-ticket.repository.ts
│   └── use-cases/         # Business logic (interactors)
│       ├── account/
│       │   ├── create-account.ts
│       │   ├── get-accounts.ts
│       │   ├── get-account.ts
│       │   ├── update-account.ts
│       │   └── delete-account.ts
│       ├── device/
│       ├── service-ticket/
│       └── user/
│
├── infrastructure/        # Data access & external integrations
│   ├── datasource/        # Firestore operations (concrete implementations)
│   │   ├── account.datasource.imp.ts
│   │   ├── device.datasource.imp.ts
│   │   ├── service-ticket.datasource.imp.ts
│   │   └── user.datasource.imp.ts
│   └── repositories/      # Repository implementations (adapters)
│       ├── account.repository.imp.ts
│       ├── device.repository.imp.ts
│       └── service-ticket.repository.imp.ts
│
├── middlewares/           # Express middlewares
│   └── auth.js            # JWT & Firebase token validation
│
├── services/              # Additional services
├── types/                 # TypeScript type definitions
└── index.ts              # Main entry point
```

---

## 3. Routes Structure & API Endpoints

### Main Routes Aggregator (routes.ts):
```typescript
export class AppRoutes {
    static get routes(): Router {
        const router = Router();
        
        router.use("/accounts", AccountsRoutes.routes);
        router.use("/accounts/:accountId/devices", DeviceRoutes.routes);
        router.use("/accounts/:accountId/service-tickets", ServiceTicketRoutes.routes);
        router.use("/platform", PlatformRoutes.routes);
        router.use("/system-config", SystemConfigRoutes.routes);
        router.use("/users", UserRoutes.routes);
        
        return router;
    }
}
```

### API Endpoints Pattern:

#### Accounts Resource:
```
GET    /accounts              # List all accounts
POST   /accounts              # Create new account
GET    /accounts/:id          # Get account by ID
PUT    /accounts/:id          # Update account
DELETE /accounts/:id          # Delete account
```

#### Nested Devices Resource:
```
GET    /accounts/:accountId/devices              # List devices for account
POST   /accounts/:accountId/devices              # Create device
GET    /accounts/:accountId/devices/:deviceId    # Get device details
PUT    /accounts/:accountId/devices/:deviceId    # Update device
DELETE /accounts/:accountId/devices/:deviceId    # Delete device
```

#### Nested Service Tickets Resource:
```
GET    /accounts/:accountId/service-tickets              # List tickets
POST   /accounts/:accountId/service-tickets              # Create ticket
GET    /accounts/:accountId/service-tickets/:ticketId    # Get ticket
PUT    /accounts/:accountId/service-tickets/:ticketId    # Update ticket
DELETE /accounts/:accountId/service-tickets/:ticketId    # Delete ticket
```

---

## 4. Controllers & Request Handling

### Controller Pattern (Example: AccountController):

**File**: `src/presentation/accounts/controller.ts`

```typescript
export class AccountController {
    constructor(private readonly accountRepository: AccountRepository) {}

    public getAccounts = (req: Request, res: Response) => {
        new GetAccounts(this.accountRepository)
            .execute()
            .then((accounts) => res.status(200).json({ accounts }))
            .catch((error) => res.status(500).json({ message: `Error: ${error}` }));
    }

    public createAccount = (req: Request, res: Response) => {
        const [error, createAccountDto] = CreateAccountDTO.create(req.body);
        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        new CreateAccount(this.accountRepository)
            .execute(createAccountDto!)
            .then((newAccount) => res.status(201).json({ newAccount }))
            .catch((error) => res.status(500).json({ message: `Error: ${error}` }));
    }

    public getAccountById = (req: Request, res: Response) => {
        const { id } = req.params;
        // Validation & error handling...
        new GetAccount(this.accountRepository)
            .execute(id)
            .then((account) => res.status(200).json({ account }))
            .catch((error) => res.status(404).json({ message: `Error: ${error}` }));
    }

    public updateAccount = (req: Request, res: Response) => {
        const { id } = req.params;
        const [error, updateAccountDto] = UpdateAccountDTO.create({ id, ...req.body });
        // ...
    }

    public deleteAccount = (req: Request, res: Response) => {
        // ...
    }
}
```

### Route Setup Pattern:

```typescript
export class AccountsRoutes {
    static get routes(): Router {
        const router = Router();
        const dataSource = new AccountDataSourceImp("accounts");
        const accountRepository = new AccountRepositoryImp(dataSource);
        const accountController = new AccountController(accountRepository);

        router.get("/", accountController.getAccounts);
        router.post("/", accountController.createAccount);
        router.get("/:id", accountController.getAccountById);
        router.put("/:id", accountController.updateAccount);
        router.delete("/:id", accountController.deleteAccount);
        
        return router;
    }
}
```

### Key Points:
- **Single Responsibility**: Each controller method handles one operation
- **DTO Validation**: Input validation at controller level using static `create()` method
- **Error Handling**: Try-catch with Promise.catch() for async operations
- **HTTP Status Codes**: Proper use of 200, 201, 400, 404, 500
- **Response Format**: Consistent JSON response structure

---

## 5. DTOs - Data Transfer Objects & Validation

### DTO Structure Pattern:

**File**: `src/domain/dtos/accounts/create-account.dto.ts`

```typescript
export type AccountStatus = "active" | "inactive" | "suspended";
export type StatsStatus = "excelente" | "bueno" | "regular" | "pobre" | "critico";

export interface StatsDTO {
    totalUnits: number;
    reportingUnits: number;
    nonReportingUnits: number;
    deliveryPercentage: number;
    status: StatsStatus;
    instalacionesPendientes: number;
    renovacionesPendientes: number;
    reubicacionesPendientes: number;
    ticketsEscalados: number;
}

export interface ContactInfoDTO {
    phones: string[];
    city: string | null;
    state: string | null;
    notificationEmails: string[];
}

export class CreateAccountDTO {
    private constructor(
        public readonly clientCode: string,
        public readonly companyName: string,
        public readonly status: AccountStatus,
        public readonly contactInfo: ContactInfoDTO,
        public readonly accountManagerId?: string | null,
        public readonly stats?: StatsDTO
    ) { }

    static create(props: { [key: string]: any }): [string?, CreateAccountDTO?] {
        // Comprehensive validation logic
        const { clientCode, companyName, status, contactInfo, accountManagerId, stats } = props;

        // Validation pattern: return [error, undefined] or [undefined, dto]
        if (!clientCode) return ['El código de cliente es requerido.', undefined];
        if (typeof clientCode !== 'string') return ['...', undefined];
        
        // Regex validations
        const CLIENT_CODE_REGEX = /^[A-Z0-9_-]{3,20}$/;
        const PHONE_REGEX = /^\d{10}$/;
        const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
        
        // ... extensive validation ...

        return [
            undefined,
            new CreateAccountDTO(
                normalizedClientCode,
                companyName.trim(),
                normalizedStatus,
                normalizedContactInfo,
                accountManagerId?.trim() || null,
                normalizedStats
            )
        ];
    }
}
```

### Update DTO Pattern:

**File**: `src/domain/dtos/accounts/update-account.dto.ts`

```typescript
export class UpdateAccountDTO {
    private constructor(
        public readonly id: string,
        public readonly companyName?: string,
        public readonly status?: AccountStatus,
        public readonly contactInfo?: ContactInfoDTO,
        public readonly accountManagerId?: string | null,
    ) {}

    get values() {
        const returnObj: { [key: string]: any } = {};
        if(this.companyName) returnObj.companyName = this.companyName;
        if(this.status) returnObj.status = this.status;
        if(this.contactInfo) returnObj.contactInfo = this.contactInfo;
        if(this.accountManagerId !== undefined) returnObj.accountManagerId = this.accountManagerId;
        return returnObj;
    }

    static create(props: { [key: string]: any }): [string?, UpdateAccountDTO?] {
        // Similar validation but for updates
        // Prevents mutation of immutable fields (clientCode, stats)
        // Allows partial updates
    }
}
```

### DTO Key Features:
- **Validation at Construction**: Static `create()` method returns tuple [error, dto]
- **Immutability**: Private constructor, read-only properties
- **Type Safety**: Full TypeScript typing for all fields
- **Normalization**: Trimming, uppercase conversion, null handling
- **Field-level Validation**: Regex patterns for phones, emails, IDs
- **Error Messages**: Spanish error messages for user feedback
- **Immutable Fields**: Prevention of updates to clientCode and stats
- **Nested Validation**: ContactInfo and Stats are validated recursively

### DTO Location Convention:
```
src/domain/dtos/
├── accounts/
│   ├── create-account.dto.ts
│   └── update-account.dto.ts
├── devices/
├── service-tickets/
├── users/
└── index.ts (exports all DTOs)
```

---

## 6. Database Operations - Firestore Patterns

### Firebase Admin Configuration:

**File**: `src/config/firebaseAdmin.ts`

```typescript
import * as admin from "firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

// Emulator Mode Detection
const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" || 
                   process.env.FIRESTORE_EMULATOR_HOST;

if (isEmulator) {
    admin.initializeApp({
        projectId: "service-delivery-development",
    });
} else {
    const serviceAccount = require("./../serviceAccount.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "gs://service-delivery-development.firebasestorage.app",
    });
}

export const db = admin.firestore();
export const auth = admin.auth();
export { FieldValue, Timestamp };
```

### Firestore DataSource Pattern:

**File**: `src/infrastructure/datasource/account.datasource.imp.ts`

```typescript
export class AccountDataSourceImp implements AccountDataSource {
    public collectionPath: string = 'accounts';
    
    constructor(collectionPath: string) {
        this.collectionPath = collectionPath;
    }

    async createAccount(createAccountDto: CreateAccountDTO): Promise<AccountEntity> {
        const accountsRef = db.collection('accounts');

        // Unique constraint: Check clientCode doesn't exist
        const snapshot = await accountsRef
            .where('clientCode', '==', createAccountDto.clientCode)
            .limit(1)
            .get();
        
        if (!snapshot.empty) {
            throw new Error('El código de cliente ya está registrado.');
        }

        const newDocRef = accountsRef.doc();
        const newAccountData = {
            clientCode: createAccountDto.clientCode,
            companyName: createAccountDto.companyName,
            status: createAccountDto.status,
            contactInfo: { ... },
            accountManagerId: createAccountDto.accountManagerId || null,
            stats: createAccountDto.stats || { /* defaults */ },
            createdAt: FieldValue.serverTimestamp(),
        };

        await newDocRef.set(newAccountData);
        return AccountEntity.fromObject({
            id: newDocRef.id,
            ...newAccountData,
            createdAt: new Date(),
        });
    }

    async getAll(): Promise<AccountEntity[]> {
        const accountsRef = db.collection('accounts');
        let query = accountsRef.orderBy('companyName', 'desc');
        
        const snapshot = await query.get();
        return snapshot.docs.map(doc => 
            AccountEntity.fromObject({
                id: doc.id,
                ...doc.data()
            })
        );
    }

    async getById(id: string): Promise<AccountEntity> {
        const docRef = db.collection('accounts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('La cuenta no existe.');
        }

        return AccountEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }

    async updateAccount(id: string, updateAccountDto: UpdateAccountDTO): Promise<AccountEntity> {
        const docRef = db.collection('accounts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('La cuenta no existe.');
        }

        const dataToUpdate = updateAccountDto.values;
        dataToUpdate.updatedAt = FieldValue.serverTimestamp();

        await docRef.update(dataToUpdate);

        const updatedDoc = await docRef.get();
        return AccountEntity.fromObject({
            id: updatedDoc.id,
            ...updatedDoc.data()
        });
    }

    async deleteAccount(id: string): Promise<AccountEntity> {
        const docRef = db.collection('accounts').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            throw new Error('La cuenta no existe.');
        }

        await docRef.delete();

        return AccountEntity.fromObject({
            id: doc.id,
            ...doc.data()
        });
    }
}
```

### Firestore Key Patterns:

1. **Collection References**: `db.collection('collectionName')`
2. **Document Operations**:
   - Create: `docRef.set(data)`
   - Read: `docRef.get()`, `collection.where(...).get()`
   - Update: `docRef.update(data)`
   - Delete: `docRef.delete()`

3. **Timestamps**: `FieldValue.serverTimestamp()` for automatic server-side timestamps

4. **Queries**:
   - Filtering: `.where(field, operator, value)`
   - Ordering: `.orderBy(field, direction)`
   - Limiting: `.limit(n)`

5. **Error Handling**: Check `doc.exists` before operations

6. **Type Conversion**: Use `doc.data()` and map to Entities

### Firestore Collections:
```
firestore/
├── accounts/          # Main accounts collection
├── devices/           # Device collection (nested under accounts)
├── service-tickets/   # Service tickets collection
├── users/             # User collection
├── platforms/         # Platform configuration
└── system-config/     # System configuration
```

---

## 7. Authentication & Security Patterns

### Authentication Middleware:

**File**: `src/middlewares/auth.js`

```typescript
const validateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    try {
        if (!token) {
            throw new ClientError(req.t("TokenNotFound"), 401);
        }
        jwt.verify(token, secretKeyJWT, (err, decoded) => {
            if (err) {
                throw new ClientError(req.t("InvalidOrExpiredToken"), 401);
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        next(err);
    }
};

const validateAuthTokenFirebase = async (req, res, next) => {
    try {
        const tokenAuth = req.body.tokenAuth;
        const decodedToken = await admin.auth().verifyIdToken(tokenAuth);

        if (!decodedToken) {
            throw new ClientError(req.t("InvalidTokenOrPwdEmail"), 401);
        }

        const user = await admin.auth().getUser(decodedToken.uid);
        if (!user) {
            throw new ClientError(req.t("UserNotFound"), 404);
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
};

const validateRefreshToken = (req, res, next) => {
    const refreshTokenCookie = req.cookies?.refreshToken;
    // Similar JWT validation logic...
};
```

### Security Features:

1. **JWT Token Validation**: Bearer token in Authorization header
2. **Firebase ID Token Verification**: Using Firebase Admin SDK
3. **Refresh Token Support**: Via HTTP-only cookies
4. **User Context**: Attached to request object (`req.user`)
5. **Error Messages**: i18n translations for user errors

### Environment Variables (envs.ts):
```typescript
export const envs = {
    fbStorageBucket: "gs://service-delivery-development.firebasestorage.app",
    jwtSecret: process.env.JWT_SECRET || "development_jwt_secret",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "development_refresh_secret",
    wialonAccessToken: process.env.WIALON_ACCESS_TOKEN || "",
    wialonUrl: process.env.WIALON_URL || "",
    modo: process.env.MODO || "development"
};
```

### Current Status:
- **Authentication**: Implemented in middleware (not yet integrated into all routes)
- **CORS**: Currently permissive (`cors({ origin: true })` commented out in index.ts)
- **Production Ready**: Would need proper CORS configuration and environment-based settings

---

## 8. Clean Architecture Layers

### Layer Separation:

```
┌─────────────────────────────────────────────┐
│   PRESENTATION LAYER (presentation/)        │
│   Controllers, Routes, HTTP handling        │
└────────────────┬──────────────────────────┘
                 │ Uses
┌────────────────▼──────────────────────────┐
│   DOMAIN LAYER (domain/)                   │
│   DTOs, Entities, Interfaces, UseCases     │
│   Business logic & validation              │
└────────────────┬──────────────────────────┘
                 │ Implements
┌────────────────▼──────────────────────────┐
│   INFRASTRUCTURE LAYER (infrastructure/)   │
│   DataSources, Repositories, DB adapter    │
│   External service integrations            │
└─────────────────────────────────────────────┘
```

### Communication Flow:

```
HTTP Request
    ↓
Routes (presentation/routes.ts)
    ↓
Controller (presentation/*/controller.ts)
    ├─ Validate input with DTO.create()
    ├─ Use UseCase(Repository)
    └─ Return HTTP Response
    ↓
UseCase (domain/use-cases/*/*.ts)
    ├─ Execute business logic
    └─ Call Repository methods
    ↓
Repository (infrastructure/repositories/*.ts)
    ├─ Implement repository interface
    └─ Call DataSource
    ↓
DataSource (infrastructure/datasource/*.ts)
    ├─ Execute Firestore operations
    └─ Return Entity
    ↓
Entity (domain/entities/*.ts)
    ├─ Map Firestore data
    └─ Business logic validation
    ↓
HTTP Response
```

---

## 9. Frontend Integration

### Frontend Location:
```
/home/erika/Documents/dumaxst/serviceDelivery/entregaDeServicioWeb/
```

### Frontend Tech Stack:
- **Framework**: React 19.1.1 + TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **UI Components**: Radix UI
- **Styling**: Tailwind CSS

### Frontend API Configuration:

**File**: `src/services/accountsService.ts`

```typescript
const API_BASE_URL = 'http://localhost:5000/service-delivery-development/us-central1/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export class AccountsService {
    static async getAccounts(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
    }): Promise<AccountsResponse> {
        const response = await api.get('/accounts');
        return response.data;
    }

    static async getAccountById(id: string): Promise<IAccount> {
        const response = await api.get(`/accounts/${id}`);
        return response.data;
    }

    static async createAccount(data: CreateAccountRequest): Promise<IAccount> {
        const response = await api.post('/accounts', data);
        return response.data;
    }

    // ... update, delete, search, filter ...
}
```

### Frontend Types:

**File**: `src/lib/types/Account.ts`

```typescript
export interface IContactInfo {
    phones: string[];
    city: string | null;
    state: string | null;
    notificationEmails: string[];
}

export interface IAccount {
    id: string;
    clientCode: string;
    companyName: string;
    contactInfo: IContactInfo;
    status?: string;
}

export interface CreateAccountRequest {
    clientCode: string;
    companyName: string;
    contactInfo: IContactInfo;
    status?: string;
}

export interface UpdateAccountRequest {
    companyName?: string;
    contactInfo?: Partial<IContactInfo>;
    status?: string;
}

export interface AccountsResponse {
    accounts: IAccount[];
    // Optional pagination
}
```

### API Call Pattern in Frontend:
```typescript
// In React components with React Query
const { data, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => AccountsService.getAccounts()
});
```

---

## 10. Development Setup & Configuration

### Environment Variables (.env):
Located in: `src/presentation/.env`

```
PROYECTO_FIREBASE=service-delivery-development
BUCKET_ALMACENAMIENTO=service-delivery-development.firebasestorage.app
```

### Firebase Configuration (firebase.json):
```json
{
    "functions": { "source": "functions" },
    "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
    "storage": { "rules": "storage.rules" }
}
```

### Development Commands:
```bash
npm run build      # TypeScript compilation
npm run build:watch # Watch mode compilation
npm run serve      # Local Firebase emulator
npm run deploy     # Deploy to Firebase
npm run lint       # ESLint
npm run format     # Prettier formatting
```

### Running Locally:
```bash
# Start Firebase emulator
firebase serve

# Or use npm script
npm run serve

# Access at: http://localhost:5000/service-delivery-development/us-central1/api
```

---

## 11. Existing Endpoint Patterns to Maintain

### Response Format Standard:
```typescript
// Success - List
{ accounts: AccountEntity[] }

// Success - Single
{ account: AccountEntity }

// Success - Create
{ newAccount: AccountEntity }

// Success - Update
{ updatedAccount: AccountEntity }

// Success - Delete
{ message: "Cuenta eliminada correctamente.", id: string }

// Error
{ message: "Error: [error description]" }
```

### HTTP Status Code Standards:
- **200**: GET success, DELETE success
- **201**: POST (create) success
- **400**: Invalid input (validation error)
- **404**: Resource not found
- **500**: Server error

### Validation Pattern:
1. Extract params from request
2. Call DTO.create() for validation
3. If error, return 400 with error message
4. Proceed with UseCase execution
5. Return appropriate status code

### Error Handling Pattern:
```typescript
return new UseCase(repository)
    .execute(params)
    .then((result) => res.status(200).json({ result }))
    .catch((error) => res.status(500).json({ message: `Error: ${error}` }));
```

### Nested Resource Pattern:
```typescript
// Routes with mergeParams: true for nested routes
export class DeviceRoutes {
    static get routes(): Router {
        const router = Router({ mergeParams: true });
        // Access accountId via req.params.accountId
        router.get("/", (req) => {
            const { accountId } = req.params;
        });
    }
}
```

---

## 12. Summary - Key Architectural Decisions

1. **Clean Architecture**: Clear separation of concerns across 4 layers (presentation, domain, infrastructure, config)

2. **DTO Pattern**: Two-step validation using static factory methods returning tuples

3. **Dependency Injection**: Controllers receive repositories in constructor, repositories receive dataSources

4. **Entity Validation**: Domain entities validate and transform data from Firestore

5. **Use Case Pattern**: Business logic encapsulated in simple, testable classes

6. **Async/Await + Promise**: Consistent promise-based async operations

7. **Spanish Error Messages**: User-facing errors in Spanish with i18n support

8. **Firestore Native**: Direct use of Firestore SDK without ORM

9. **Firebase Functions**: Serverless architecture for cost-efficiency and auto-scaling

10. **Comprehensive Input Validation**: Multiple validation layers (DTO, Entity, Repository)

---

## Next Steps for Development

When creating new endpoints:

1. Create DTO with static `create()` method in `domain/dtos/resource/`
2. Create Entity in `domain/entities/resource.entity.ts`
3. Create repository interface in `domain/repositories/resource.repository.ts`
4. Implement datasource in `infrastructure/datasource/resource.datasource.imp.ts`
5. Implement repository in `infrastructure/repositories/resource.repository.imp.ts`
6. Create use cases in `domain/use-cases/resource/`
7. Create controller in `presentation/resource/controller.ts`
8. Create routes in `presentation/resource/routes.ts`
9. Register routes in `presentation/routes.ts`

Follow the existing patterns for consistency!
