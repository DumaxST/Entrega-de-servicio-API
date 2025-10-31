import express, { Router }  from 'express';

interface Options {
    port: number;
    routes: Router;
}
export class Server {
    private app = express();
    private readonly port: number;
    private readonly routes: Router;

    constructor(options: Options) {
        const { port, routes } = options;
        this.port = port;
        this.routes = routes;
    }

    async start() {

        // Routes
        this.app.use(this.routes);
        
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

}