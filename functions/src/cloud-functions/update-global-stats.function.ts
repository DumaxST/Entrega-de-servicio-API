/**
 * Cloud Function: updateGlobalStatsOnDeviceChange
 *
 * Mantiene actualizado el contador totalGlobalUnits en el documento
 * singleton systemStats/main cada vez que se crea o elimina un dispositivo.
 *
 * Trigger: Firestore onWrite
 * Path: accounts/{accountId}/devices/{deviceId}
 *
 * @author Erika F.
 * @date 2025-11-14
 */

import * as functions from "firebase-functions/v1";
import { SystemStatsDataSourceImp } from "../infrastructure/datasource/system-stats.datasource.imp";
import { SystemStatsRepositoryImp } from "../infrastructure/repositories/system-stats.repository.imp";

/**
 * Actualiza las estadísticas globales cuando un dispositivo cambia
 *
 * Casos manejados:
 * - Creación: Incrementa totalGlobalUnits en +1
 * - Eliminación: Decrementa totalGlobalUnits en -1
 * - Actualización: No modifica el contador
 *
 * NOTA: Esta función es un ejemplo. La funcionalidad ya está integrada
 * en updateAccountStatsOnDeviceChange usando Write Batch.
 */
export const updateGlobalStatsOnDeviceChange = functions.firestore
  .document("accounts/{accountId}/devices/{deviceId}")
  .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const accountId = context.params.accountId;
    const deviceId = context.params.deviceId;

    // Inicializar repositorio
    const datasource = new SystemStatsDataSourceImp();
    const repository = new SystemStatsRepositoryImp(datasource);

    try {
      const before = change.before.exists;
      const after = change.after.exists;

      // Caso 1: Dispositivo creado
      if (!before && after) {
        await repository.incrementGlobalUnits(1);
        console.log(
          `✅ [GlobalStats] Device created: ${deviceId} | Account: ${accountId} | Counter: +1`
        );
        return null;
      }

      // Caso 2: Dispositivo eliminado
      if (before && !after) {
        await repository.incrementGlobalUnits(-1);
        console.log(
          `✅ [GlobalStats] Device deleted: ${deviceId} | Account: ${accountId} | Counter: -1`
        );
        return null;
      }

      // Caso 3: Dispositivo actualizado - no cambiar contador
      if (before && after) {
        console.log(
          `ℹ️  [GlobalStats] Device updated: ${deviceId} | Counter unchanged`
        );
        return null;
      }

      console.log(`⚠️  [GlobalStats] Unexpected state for device: ${deviceId}`);
      return null;
    } catch (error) {
      console.error(
        `❌ [GlobalStats] Error updating stats for device ${deviceId}:`,
        error
      );
      // No lanzar el error para evitar reintentos infinitos
      return null;
    }
  });

/**
 * Función auxiliar para recalcular estadísticas globales
 *
 * Esta función se puede llamar manualmente desde la consola de Firebase
 * o como tarea programada si se detectan inconsistencias.
 *
 * Uso:
 *   firebase functions:call recalculateGlobalStats
 */
export const recalculateGlobalStats = functions.https.onCall(
  async (data, context) => {
    // Importar dependencias
    const { db, FieldValue } = await import("../config/firebaseAdmin");

    // Verificar autenticación (solo admins)
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Debes estar autenticado para ejecutar esta función."
      );
    }

    // TODO: Verificar que el usuario sea admin
    // const userDoc = await db.collection('users').doc(context.auth.uid).get();
    // if (!userDoc.data()?.role === 'admin') {
    //   throw new functions.https.HttpsError('permission-denied', 'Solo admins pueden recalcular stats.');
    // }

    try {
      console.log("🔄 [GlobalStats] Starting recalculation...");

      // Contar todos los dispositivos en todas las cuentas
      let totalDevices = 0;
      const accountsSnapshot = await db.collection("accounts").get();

      for (const accountDoc of accountsSnapshot.docs) {
        const devicesSnapshot = await db
          .collection(`accounts/${accountDoc.id}/devices`)
          .get();

        totalDevices += devicesSnapshot.size;
        console.log(
          `📊 [GlobalStats] Account ${accountDoc.id}: ${devicesSnapshot.size} devices`
        );
      }

      // Actualizar el documento singleton
      await db
        .collection("systemStats")
        .doc("main")
        .update({
          totalGlobalUnits: totalDevices,
          updatedAt: FieldValue.serverTimestamp(),
        });

      console.log(
        `✅ [GlobalStats] Recalculation complete: ${totalDevices} total units`
      );

      return {
        success: true,
        totalGlobalUnits: totalDevices,
        message: `Estadísticas recalculadas exitosamente: ${totalDevices} unidades.`,
      };
    } catch (error) {
      console.error("❌ [GlobalStats] Error during recalculation:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error al recalcular estadísticas.",
        error
      );
    }
  }
);
