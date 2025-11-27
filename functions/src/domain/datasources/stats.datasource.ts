/**
 * Interface StatsDataSource
 *
 * Define los métodos de acceso a datos para las estadísticas globales.
 * Este datasource se enfoca en consultas de lectura para el frontend.
 */

import { SystemStatsEntity } from "../entities/system-stats.entity";

export abstract class StatsDataSource {
  /**
   * Obtiene las estadísticas globales del sistema
   *
   * @returns Promesa con la entidad SystemStatsEntity
   * @throws Error si el documento no existe o no se puede leer
   */
  abstract getGlobalStats(): Promise<SystemStatsEntity>;
}
