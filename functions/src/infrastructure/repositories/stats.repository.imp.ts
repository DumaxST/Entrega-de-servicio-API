/**
 * Implementación del repositorio de Stats
 *
 * Actúa como adaptador entre el dominio y la infraestructura,
 * delegando las operaciones al datasource de Firestore.
 */

import { StatsDataSource } from "../../domain/datasources/stats.datasource";
import { StatsRepository } from "../../domain/repositories/stats.repository";
import { SystemStatsEntity } from "../../domain/entities/system-stats.entity";

export class StatsRepositoryImp implements StatsRepository {
  constructor(
    private readonly datasource: StatsDataSource
  ) {}

  async getGlobalStats(): Promise<SystemStatsEntity> {
    return this.datasource.getGlobalStats();
  }
}
