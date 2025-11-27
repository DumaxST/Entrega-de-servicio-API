/**
 * StatsRoutes
 *
 * Define las rutas del endpoint de estadísticas globales.
 * Sigue el patrón de Clean Architecture del proyecto.
 */

import { Router } from "express";
import { StatsController } from "./controller";
import { StatsDataSourceImp } from "../../infrastructure/datasource/stats.datasource.imp";
import { StatsRepositoryImp } from "../../infrastructure/repositories/stats.repository.imp";

export class StatsRoutes {
  static get routes(): Router {
    const router = Router();

    // Dependency Injection manual
    const dataSource = new StatsDataSourceImp();
    const statsRepository = new StatsRepositoryImp(dataSource);
    const statsController = new StatsController(statsRepository);

    // Rutas
    // GET /api/v1/stats - Obtener estadísticas globales
    router.get("/", statsController.getGlobalStats);

    return router;
  }
}
