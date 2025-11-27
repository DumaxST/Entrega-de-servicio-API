/**
 * Use Case: GetGlobalStats
 *
 * Obtiene las estadísticas globales del sistema desde el documento singleton.
 * Este caso de uso maneja errores y validaciones de negocio.
 */

import { SystemStatsEntity } from "../../entities/system-stats.entity";
import { StatsRepository } from "../../repositories/stats.repository";

export interface GetGlobalStatsUseCase {
  execute(): Promise<SystemStatsEntity>;
}

export class GetGlobalStats implements GetGlobalStatsUseCase {
  constructor(private readonly repository: StatsRepository) {}

  /**
   * Ejecuta el caso de uso para obtener estadísticas globales
   *
   * @returns Promesa con la entidad SystemStatsEntity
   * @throws Error si el documento no existe o hay un error de lectura
   */
  async execute(): Promise<SystemStatsEntity> {
    try {
      // Delegar al repositorio
      const stats = await this.repository.getGlobalStats();

      // Validación adicional (opcional)
      if (!stats) {
        throw new Error("No se pudieron obtener las estadísticas globales.");
      }

      return stats;
    } catch (error) {
      // Manejar caso específico cuando el documento no existe
      if (error instanceof Error && error.message.includes("no existe")) {
        throw new Error(
          "Las estadísticas globales no han sido inicializadas. " +
          "Contacta al administrador del sistema."
        );
      }

      // Re-lanzar otros errores
      throw error;
    }
  }
}
