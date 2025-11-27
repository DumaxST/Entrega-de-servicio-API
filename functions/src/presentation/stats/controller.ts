import { Request, Response } from "express";
import { StatsRepository } from "../../domain/repositories/stats.repository";
import { GetGlobalStats } from "../../domain/use-cases/stats/get-global-stats.use-case";

export class StatsController {
  constructor(private readonly statsRepository: StatsRepository) {}

  public getGlobalStats = (req: Request, res: Response) => {
    return new GetGlobalStats(this.statsRepository)
      .execute()
      .then((stats) => {
        // Retornar el objeto plano con los datos de la entidad
        return res.status(200).json({
          totalGlobalUnits: stats.totalGlobalUnits,
          createdAt: stats.createdAt,
          updatedAt: stats.updatedAt,
        });
      })
      .catch((error) => {
        // Log del error para debugging
        console.error("❌ [StatsController] Error fetching global stats:", error);

        // Retornar error al cliente
        return res.status(500).json({
          message: `Error: ${error instanceof Error ? error.message : error}`,
        });
      });
  };
}
