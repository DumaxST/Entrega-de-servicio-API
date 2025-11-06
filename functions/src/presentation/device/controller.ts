import { Request, Response } from "express";
import { CreateDeviceDTO, UpdateDeviceDTO } from "../../domain/dtos/devices";
import { DeviceRepository } from "../../domain/repositories/device.repository";
import {
    CreateDevice,
    GetDevices,
    GetDevice,
    UpdateDevice,
    DeleteDevice
} from "../../domain/use-cases/device";

export class DeviceController {
    constructor(private readonly deviceRepository: DeviceRepository) { }

    public getDevices = (req: Request, res: Response) => {
        const { accountId } = req.params;
        const { status, deviceType, platform } = req.query;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }

        const filters: any = {};
        if (status) filters.status = status;
        if (deviceType) filters.deviceType = deviceType;
        if (platform) filters.platform = platform;

        return new GetDevices(this.deviceRepository)
            .execute(accountId, filters)
            .then((devices) => {
                return res.status(200).json({ devices });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public getDeviceById = (req: Request, res: Response) => {
        const { accountId, deviceId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }
        if (!deviceId) {
            return res.status(400).json({ message: "Error: Se requiere el Device ID (IMEI)." });
        }

        return new GetDevice(this.deviceRepository)
            .execute(accountId, deviceId)
            .then((device) => {
                return res.status(200).json({ device });
            })
            .catch((error) => {
                return res.status(404).json({ message: `Error: ${error}` });
            });
    };

    public createDevice = (req: Request, res: Response) => {
        const { accountId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }

        // Add accountId to body for DTO validation
        const deviceData = { ...req.body, accountId: accountId };
        const [error, createDeviceDto] = CreateDeviceDTO.create(deviceData);

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new CreateDevice(this.deviceRepository)
            .execute(accountId, createDeviceDto!)
            .then((newDevice) => {
                return res.status(201).json({ newDevice });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public updateDevice = (req: Request, res: Response) => {
        const { accountId, deviceId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }
        if (!deviceId) {
            return res.status(400).json({ message: "Error: Se requiere el Device ID (IMEI)." });
        }

        const [error, updateDeviceDto] = UpdateDeviceDTO.create({
            id: deviceId,
            ...req.body
        });

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new UpdateDevice(this.deviceRepository)
            .execute(accountId, deviceId, updateDeviceDto!)
            .then((updatedDevice) => {
                return res.status(200).json({ updatedDevice });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public deleteDevice = (req: Request, res: Response) => {
        const { accountId, deviceId } = req.params;

        if (!accountId) {
            return res.status(400).json({ message: "Error: Se requiere el Account ID." });
        }
        if (!deviceId) {
            return res.status(400).json({ message: "Error: Se requiere el Device ID (IMEI)." });
        }

        return new DeleteDevice(this.deviceRepository)
            .execute(accountId, deviceId)
            .then(() => {
                return res.status(200).json({
                    message: "Dispositivo eliminado correctamente.",
                    deviceId
                });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };
}
