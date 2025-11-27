/**
 * Interface StatsRepository
 *
 * Define los métodos del repositorio para las estadísticas globales.
 * Actúa como abstracción entre el dominio y la infraestructura.
 */

import { SystemStatsEntity } from "../entities/system-stats.entity";

export abstract class StatsRepository {
  /**
   * Obtiene las estadísticas globales del sistema
   *
   * @returns Promesa con la entidad SystemStatsEntity
   * @throws Error si el documento no existe o no se puede leer
   */
  abstract getGlobalStats(): Promise<SystemStatsEntity>;
}
