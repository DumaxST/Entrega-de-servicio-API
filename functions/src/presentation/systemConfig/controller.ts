import { Request, Response } from "express";
import { UpdateSystemConfigDTO } from "../../domain/dtos/system-config";
import { SystemConfigRepository } from "../../domain/repositories/system-config.repository";
import {
    GetSystemConfig,
    UpdateSystemConfig
} from "../../domain/use-cases/system-config";

export class SystemConfigController {
    constructor(private readonly systemConfigRepository: SystemConfigRepository) { }

    public getSystemConfig = (req: Request, res: Response) => {
        return new GetSystemConfig(this.systemConfigRepository)
            .execute()
            .then((config) => {
                return res.status(200).json({ config });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };

    public updateSystemConfig = (req: Request, res: Response) => {
        const [error, updateSystemConfigDto] = UpdateSystemConfigDTO.create(req.body);

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new UpdateSystemConfig(this.systemConfigRepository)
            .execute(updateSystemConfigDto!)
            .then((updatedConfig) => {
                return res.status(200).json({ updatedConfig });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    };
}
