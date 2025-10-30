import { Request, Response } from "express";

export class DeviceController {
    public getDevices = (req: Request, res: Response) => {
        res.json({message: "Get all devices"});
    }

    public getDeviceById = (req: Request, res: Response) => {
    }

    public createDevice = (req: Request, res: Response) => {
    }

    public updateDevice = (req: Request, res: Response) => {
    }

    public deleteDevice = (req: Request, res: Response) => {
    }

}