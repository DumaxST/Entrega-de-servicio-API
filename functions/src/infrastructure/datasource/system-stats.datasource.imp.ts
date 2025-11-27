/**
 * Implementación de SystemStatsDataSource usando Firestore
 *
 * Gestiona el acceso al documento singleton systemStats/main
 * que almacena estadísticas globales de la plataforma.
 */

import { db, FieldValue } from "../../config/firebaseAdmin";
import { SystemStatsDataSource } from "../../domain/datasources/system-stats.datasource";
import { SystemStatsEntity } from "../../domain/entities/system-stats.entity";

export class SystemStatsDataSourceImp implements SystemStatsDataSource {
  private readonly collectionPath = "systemStats";
  private readonly docId = "main";

  constructor() {}

  /**
   * Obtiene el documento singleton de estadísticas globales
   */
  async getStats(): Promise<SystemStatsEntity> {
    const docRef = db.collection(this.collectionPath).doc(this.docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      // Si no existe, inicializar con valores por defecto
      return this.initializeStats();
    }

    const data = doc.data();
    if (!data) {
      throw new Error("No se pudo obtener las estadísticas del sistema.");
    }

    return SystemStatsEntity.fromObject(data);
  }

  /**
   * Actualiza las estadísticas globales
   */
  async updateStats(stats: SystemStatsEntity): Promise<SystemStatsEntity> {
    const docRef = db.collection(this.collectionPath).doc(this.docId);

    const dataToUpdate = {
      ...stats.toObject(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(dataToUpdate, { merge: true });

    // Obtener el documento actualizado
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    if (!updatedData) {
      throw new Error("No se pudo obtener las estadísticas actualizadas.");
    }

    return SystemStatsEntity.fromObject(updatedData);
  }

  /**
   * Incrementa el contador de unidades globales (operación atómica)
   *
   * Esta operación es atómica y no requiere leer el documento primero,
   * lo que previene condiciones de carrera en actualizaciones concurrentes.
   */
  async incrementGlobalUnits(amount: number): Promise<void> {
    const docRef = db.collection(this.collectionPath).doc(this.docId);

    // Verificar si el documento existe, si no, inicializarlo
    const doc = await docRef.get();
    if (!doc.exists) {
      await this.initializeStats();
    }

    // Incremento atómico usando FieldValue.increment()
    await docRef.update({
      totalGlobalUnits: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  /**
   * Inicializa el documento singleton si no existe
   */
  async initializeStats(): Promise<SystemStatsEntity> {
    const defaultStats = {
      totalGlobalUnits: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = db.collection(this.collectionPath).doc(this.docId);

    // Usar set con merge:false para asegurar que creamos el documento
    await docRef.set(defaultStats);

    // Retornar la entidad creada
    return SystemStatsEntity.fromObject({
      totalGlobalUnits: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}
