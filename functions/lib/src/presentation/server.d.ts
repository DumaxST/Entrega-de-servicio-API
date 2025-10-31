import { Router } from 'express';
interface Options {
    port: number;
    routes: Router;
}
export declare class Server {
    private app;
    private readonly port;
    private readonly routes;
    constructor(options: Options);
    start(): Promise<void>;
}
export {};
//# sourceMappingURL=server.d.ts.map