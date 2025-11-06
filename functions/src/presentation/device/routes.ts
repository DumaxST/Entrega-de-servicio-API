import { Router } from "express";
import { DeviceController } from "./controller";
import { DeviceDataSourceImp, DeviceRepositoryImp } from "../../infrastructure";

export class DeviceRoutes {
    static get routes(): Router {
        const router = Router({ mergeParams: true }); // Important for nested routes!

        const dataSource = new DeviceDataSourceImp();
        const deviceRepository = new DeviceRepositoryImp(dataSource);
        const deviceController = new DeviceController(deviceRepository);

        // All routes are relative to /accounts/:accountId/devices
        router.get("/", deviceController.getDevices);
        router.post("/", deviceController.createDevice);
        router.get("/:deviceId", deviceController.getDeviceById);
        router.put("/:deviceId", deviceController.updateDevice);
        router.delete("/:deviceId", deviceController.deleteDevice);

        return router;

    }
}
