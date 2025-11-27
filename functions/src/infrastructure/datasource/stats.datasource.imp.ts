/**
 * Implementación de StatsDataSource usando Firestore
 *
 * Gestiona el acceso de lectura al documento singleton systemStats/main
 * para consultas del frontend.
 */

import { db } from "../../config/firebaseAdmin";
import { StatsDataSource } from "../../domain/datasources/stats.datasource";
import { SystemStatsEntity } from "../../domain/entities/system-stats.entity";

export class StatsDataSourceImp implements StatsDataSource {
  private readonly collectionPath = "systemStats";
  private readonly docId = "main";

  constructor() {}

  /**
   * Obtiene las estadísticas globales del sistema
   *
   * Realiza una lectura única y simple del documento systemStats/main.
   * Esta es la implementación más eficiente para consultas del frontend.
   *
   * @returns Promesa con la entidad SystemStatsEntity
   * @throws Error si el documento no existe o no se puede leer
   */
  async getGlobalStats(): Promise<SystemStatsEntity> {
    // Lectura única y simple del documento
    const docRef = db.doc(`${this.collectionPath}/${this.docId}`);
    const doc = await docRef.get();

    // Verificar si el documento existe
    if (!doc.exists) {
      throw new Error(
        "El documento de estadísticas globales no existe. " +
        "Ejecuta: node functions/init-system-stats.js"
      );
    }

    // Obtener los datos del documento
    const data = doc.data();
    if (!data) {
      throw new Error("No se pudo leer el contenido del documento de estadísticas.");
    }

    // Convertir a entidad y retornar
    return SystemStatsEntity.fromObject(data);
  }
}
