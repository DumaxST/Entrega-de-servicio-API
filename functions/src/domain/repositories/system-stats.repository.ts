/**
 * Interface SystemStatsRepository
 *
 * Define los métodos del repositorio para las estadísticas globales del sistema.
 * Actúa como abstracción entre el dominio y la infraestructura.
 */

import { SystemStatsEntity } from "../entities/system-stats.entity";

export abstract class SystemStatsRepository {
  /**
   * Obtiene el documento singleton de estadísticas globales
   *
   * @returns Promesa con la entidad SystemStatsEntity
   * @throws Error si el documento no existe
   */
  abstract getStats(): Promise<SystemStatsEntity>;

  /**
   * Actualiza las estadísticas globales
   *
   * @param stats - Entidad con los datos actualizados
   * @returns Promesa con la entidad actualizada
   */
  abstract updateStats(stats: SystemStatsEntity): Promise<SystemStatsEntity>;

  /**
   * Incrementa el contador de unidades globales (operación atómica)
   *
   * @param amount - Cantidad a incrementar (positivo o negativo)
   * @returns Promesa que se resuelve cuando la operación se completa
   */
  abstract incrementGlobalUnits(amount: number): Promise<void>;

  /**
   * Inicializa el documento singleton si no existe
   *
   * @returns Promesa con la entidad creada
   */
  abstract initializeStats(): Promise<SystemStatsEntity>;
}
