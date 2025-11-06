import { Request, Response } from "express";
import { CreatePlatformDTO, UpdatePlatformDTO } from "../../domain/dtos/platforms";
import { PlatformRepository } from "../../domain/repositories/platform.repository";
import {
    GetPlatforms,
    GetPlatform,
    CreatePlatform,
    UpdatePlatform,
    DeletePlatform
} from "../../domain/use-cases/platform";

export class PlatformController {
    constructor(
        private readonly platformRepository: PlatformRepository
    ) { }

    public getPlatforms = (req: Request, res: Response) => {
        new GetPlatforms(this.platformRepository)
            .execute()
            .then((platforms) => {
                return res.status(200).json({ platforms });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    }

    public getPlatformById = (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Error: Se requiere el ID de la plataforma.' });
        }

        return new GetPlatform(this.platformRepository)
            .execute(id)
            .then((platform) => {
                return res.status(200).json({ platform });
            })
            .catch((error) => {
                return res.status(404).json({ message: `Error: ${error}` });
            });
    }

    public createPlatform = (req: Request, res: Response) => {
        const [error, createPlatformDto] = CreatePlatformDTO.create(req.body);

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new CreatePlatform(this.platformRepository)
            .execute(createPlatformDto!)
            .then((newPlatform) => {
                return res.status(201).json({ newPlatform });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    }

    public updatePlatform = (req: Request, res: Response) => {
        const { id } = req.params;
        const [error, updatePlatformDto] = UpdatePlatformDTO.create({ id, ...req.body });

        if (error) {
            return res.status(400).json({ message: `Error: ${error}` });
        }

        return new UpdatePlatform(this.platformRepository)
            .execute(id, updatePlatformDto!)
            .then((updatedPlatform) => {
                return res.status(200).json({ updatedPlatform });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    }

    public deletePlatform = (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Error: Se requiere el ID de la plataforma.' });
        }

        return new DeletePlatform(this.platformRepository)
            .execute(id)
            .then(() => {
                return res.status(200).json({ message: "Plataforma eliminada correctamente.", id });
            })
            .catch((error) => {
                return res.status(500).json({ message: `Error: ${error}` });
            });
    }
}
