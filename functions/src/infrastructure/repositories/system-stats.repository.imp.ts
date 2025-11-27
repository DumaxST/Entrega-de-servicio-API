/**
 * Implementación del repositorio de SystemStats
 *
 * Actúa como adaptador entre el dominio y la infraestructura,
 * delegando las operaciones al datasource de Firestore.
 */

import { SystemStatsDataSource } from "../../domain/datasources/system-stats.datasource";
import { SystemStatsRepository } from "../../domain/repositories/system-stats.repository";
import { SystemStatsEntity } from "../../domain/entities/system-stats.entity";

export class SystemStatsRepositoryImp implements SystemStatsRepository {
  constructor(
    private readonly datasource: SystemStatsDataSource
  ) {}

  async getStats(): Promise<SystemStatsEntity> {
    return this.datasource.getStats();
  }

  async updateStats(stats: SystemStatsEntity): Promise<SystemStatsEntity> {
    return this.datasource.updateStats(stats);
  }

  async incrementGlobalUnits(amount: number): Promise<void> {
    return this.datasource.incrementGlobalUnits(amount);
  }

  async initializeStats(): Promise<SystemStatsEntity> {
    return this.datasource.initializeStats();
  }
}
