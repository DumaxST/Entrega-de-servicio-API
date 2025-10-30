import { Router } from "express";
import { DeviceController } from "./controller";

export class DeviceRoutes {
    static get routes(): Router {
        const router = Router();
        const deviceController = new DeviceController();

        router.get("/devices", deviceController.getDevices);
        router.post("/devices", deviceController.createDevice);
        router.get("/devices/:id", deviceController.getDeviceById);
        router.put("/devices/:id", deviceController.updateDevice);
        router.delete("/devices/:id", deviceController.deleteDevice);

        return router;

    }
}