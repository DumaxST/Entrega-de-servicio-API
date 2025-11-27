import * as functions from "firebase-functions/v1";
// import * as admin from "firebase-admin";
// Express
import express from "express";
import compression from "compression";
import cors from "cors";
// cors
// import  cors from "cors";

// Firebase admin init
import "./src/config/firebaseAdmin";
import { db, FieldValue } from "./src/config/firebaseAdmin";

// routes
import { AppRoutes } from "./src/presentation/routes";

// Dependencias de 18next
// import * as middleware from "i18next-http-middleware";
// import Backend from "i18next-fs-backend";
// import i18next from "i18next";


// Middlewares
// const ErrorHandler = require("./src/middlewares/errorHandler");
// const { languageTranslation } = require("./src/middlewares");



// Bucket de almacenemaiento
// const bucket = admin
//   .storage()
//   .bucket(process.env.FB_STORAGE_BUCKET || "gs://service-delivery-development.firebasestorage.app");
// exports.bucket = bucket;

// Inicializar i18next
// i18next
//   .use(Backend)
//   .use(middleware.LanguageDetector)
//   .init({
//     fallbackLng: "en",
//     backend: { loadPath: "./dictionary/{{lng}}.json" },
//   });

// Orígenes permitidos - with Firebase Functions config fallback
// const origins: string[] = [
//   process.env.ORIGIN1 || functions.config().origin?.one,
//   process.env.ORIGIN2 || "http://localhost:5173"
// ].filter(Boolean);

// Crea la app de express 
const app = express();
// Aplica los middlewares
// app.use(cors({ origin: true }));
app.use(express.json());
app.use(compression());
app.use(cors({ origin: true }));
// Configura las rutas
app.use(AppRoutes.routes);
// Exporta la app como una función de Firebase
export const api = functions.https.onRequest(app);

/**
 * Cloud Function que se dispara cuando se crea, actualiza o elimina un dispositivo
 * en la subcolección devices de una cuenta.
 *
 * Ruta: accounts/{accountId}/devices/{deviceId}
 *
 * Esta función:
 * 1. Detecta si es onCreate, onUpdate o onDelete
 * 2. Lee toda la subcolección devices del accountId afectado
 * 3. Calcula conteos totales para cada estado (reporting, not_reporting, maintenance, inactive)
 * 4. Guarda estos conteos en deviceStatusBreakdown dentro de stats
 * 5. Calcula porcentajes para cada estado y los guarda en deviceStatusPercentages
 * 6. Actualiza totalUnits con el conteo total de dispositivos
 * 7. Consulta la configuración del sistema para determinar el deliveryStatus
 * 8. Guarda deliveryPercentage y deliveryStatus en stats
 * 9. Actualiza el contador global totalGlobalUnits en systemStats/main
 * 10. Usa Write Batch para atomicidad entre actualización de cuenta y global
 */
export const updateAccountStatsOnDeviceChange = functions.firestore
  .document("accounts/{accountId}/devices/{deviceId}")
  .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const accountId = context.params.accountId as string;
    const deviceId = context.params.deviceId as string;

    try {
      // Detectar el tipo de operación
      const isCreate = !change.before.exists && change.after.exists;
      const isDelete = change.before.exists && !change.after.exists;

      let operationType = "update";
      if (isCreate) operationType = "create";
      if (isDelete) operationType = "delete";

      console.log(`📍 [DeviceChange] Operation: ${operationType} | Device: ${deviceId} | Account: ${accountId}`);

      // 1. Leer toda la subcolección devices del accountId
      const devicesSnapshot = await db
        .collection(`accounts/${accountId}/devices`)
        .get();

      // 2. Inicializar contadores
      const statusBreakdown = {
        reporting: 0,
        not_reporting: 0,
        maintenance: 0,
        inactive: 0,
      };

      // 3. Contar dispositivos por estado
      devicesSnapshot.forEach((doc) => {
        const device = doc.data();
        const status = device.status as keyof typeof statusBreakdown;

        if (status in statusBreakdown) {
          statusBreakdown[status]++;
        }
      });

      // 4. Calcular total de unidades
      const totalUnits = devicesSnapshot.size;

      // 5. Calcular porcentajes
      const statusPercentages = {
        reporting: totalUnits > 0 ? Math.round((statusBreakdown.reporting / totalUnits) * 100 * 100) / 100 : 0,
        not_reporting: totalUnits > 0 ? Math.round((statusBreakdown.not_reporting / totalUnits) * 100 * 100) / 100 : 0,
        maintenance: totalUnits > 0 ? Math.round((statusBreakdown.maintenance / totalUnits) * 100 * 100) / 100 : 0,
        inactive: totalUnits > 0 ? Math.round((statusBreakdown.inactive / totalUnits) * 100 * 100) / 100 : 0,
      };

      // 6. Calcular deliveryPercentage basado en reporting
      const deliveryPercentage = statusPercentages.reporting;

      // 7. Leer la configuración del sistema para determinar deliveryStatus
      let deliveryStatus: "excelente" | "bueno" | "regular" | "pobre" | "critico" = "bueno";

      try {
        const systemConfigDoc = await db.collection("systemConfig").doc("main").get();

        if (systemConfigDoc.exists) {
          const configData = systemConfigDoc.data();
          if (configData && configData.serviceThresholds) {
            const { serviceThresholds } = configData;

            // Determinar el nivel de servicio basado en deliveryPercentage
            if (deliveryPercentage >= serviceThresholds.excellent) {
              deliveryStatus = "excelente";
            } else if (deliveryPercentage >= serviceThresholds.goodRange[0] &&
                       deliveryPercentage <= serviceThresholds.goodRange[1]) {
              deliveryStatus = "bueno";
            } else if (deliveryPercentage >= serviceThresholds.regularRange[0] &&
                       deliveryPercentage <= serviceThresholds.regularRange[1]) {
              deliveryStatus = "regular";
            } else if (deliveryPercentage >= serviceThresholds.badRange[0] &&
                       deliveryPercentage <= serviceThresholds.badRange[1]) {
              deliveryStatus = "pobre";
            } else {
              deliveryStatus = "critico";
            }
          }
        }
      } catch (configError) {
        console.warn(`⚠️ No se pudo leer la configuración del sistema, usando valor por defecto:`, configError);
        // Si no se puede leer la config, usar lógica por defecto
        if (deliveryPercentage >= 95) deliveryStatus = "excelente";
        else if (deliveryPercentage >= 80) deliveryStatus = "bueno";
        else if (deliveryPercentage >= 60) deliveryStatus = "regular";
        else if (deliveryPercentage >= 40) deliveryStatus = "pobre";
        else deliveryStatus = "critico";
      }

      // 8. Crear Write Batch para atomicidad
      const batch = db.batch();

      // 9. Agregar actualización de stats de la cuenta al batch
      const accountRef = db.collection("accounts").doc(accountId);
      batch.update(accountRef, {
        "stats.totalUnits": totalUnits,
        "stats.reportingUnits": statusBreakdown.reporting,
        "stats.nonReportingUnits": statusBreakdown.not_reporting,
        "stats.deviceStatusBreakdown": statusBreakdown,
        "stats.deviceStatusPercentages": statusPercentages,
        "stats.deliveryPercentage": deliveryPercentage,
        "stats.status": deliveryStatus,
        updatedAt: new Date(),
      });

      // 10. Agregar actualización del contador global al batch
      const globalStatsRef = db.doc("systemStats/main");

      if (isCreate) {
        // Dispositivo creado: incrementar contador global
        batch.update(globalStatsRef, {
          totalGlobalUnits: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`✅ [GlobalStats] Device created | Global counter: +1`);
      } else if (isDelete) {
        // Dispositivo eliminado: decrementar contador global
        batch.update(globalStatsRef, {
          totalGlobalUnits: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        });
        console.log(`✅ [GlobalStats] Device deleted | Global counter: -1`);
      }
      // Si es update, no modificar el contador global

      // 11. Ejecutar batch de forma atómica
      await batch.commit();

      console.log(`✅ [AccountStats] Account ${accountId} stats updated successfully:`, {
        totalUnits,
        statusBreakdown,
        statusPercentages,
        deliveryPercentage,
        deliveryStatus,
        operationType,
      });

      return null;
    } catch (error) {
      console.error(`❌ Error updating account ${accountId} stats:`, error);
      // No lanzamos el error para evitar reintentos innecesarios
      return null;
    }
  });

/**
 * Cloud Function que actualiza las métricas históricas mensuales cuando un ticket se completa.
 *
 * Trigger: onWrite en accounts/{accountId}/serviceTickets/{ticketId}
 *
 * Características:
 * - Detecta cuando un ticket cambia a estado "completado"
 * - Extrae el mes de finalización (formato YYYY_MM)
 * - Determina el tipo de servicio (instalación, renovación, reubicación, soporte)
 * - Incrementa atómicamente el contador correspondiente en historicalStats
 * - Es idempotente: usa eventId para evitar conteos duplicados
 * - Usa FieldValue.increment() para evitar race conditions
 */
export const updateHistoricalStatsOnTicketComplete = functions.firestore
  .document("accounts/{accountId}/serviceTickets/{ticketId}")
  .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const accountId = context.params.accountId as string;
    const ticketId = context.params.ticketId as string;
    const eventId = context.eventId;

    try {
      // 1. Verificar si es una actualización (no creación ni eliminación)
      if (!change.before.exists || !change.after.exists) {
        console.log(`ℹ️ Ticket ${ticketId} fue creado o eliminado, no hay cambio de estado a procesar.`);
        return null;
      }

      const beforeData = change.before.data();
      const afterData = change.after.data();

      if (!beforeData || !afterData) {
        console.log(`⚠️ No se pudo leer los datos del ticket ${ticketId}`);
        return null;
      }

      // 2. Verificar si el status cambió a "completado"
      const beforeStatus = beforeData.status as string;
      const afterStatus = afterData.status as string;

      // Solo procesar si el ticket acaba de completarse
      if (beforeStatus === "completado" || afterStatus !== "completado") {
        // Si ya estaba completado antes, o no está completado ahora, no hacer nada
        return null;
      }

      console.log(`✅ Ticket ${ticketId} cambió de estado "${beforeStatus}" a "completado"`);

      // 3. IDEMPOTENCIA: Verificar si este evento ya fue procesado
      // Guardamos el eventId en una subcolección de eventos procesados
      const accountRef = db.collection("accounts").doc(accountId);
      const eventRef = accountRef.collection("_processedEvents").doc(eventId);

      const eventDoc = await eventRef.get();
      if (eventDoc.exists) {
        console.log(`⚠️ Evento ${eventId} ya fue procesado anteriormente. Skipping...`);
        return null;
      }

      // Marcar evento como procesado
      await eventRef.set({
        ticketId,
        processedAt: new Date(),
        eventType: "ticket_completed",
      });

      // 4. Obtener la fecha de finalización (usar updatedAt del ticket)
      let completionDate: Date;
      if (afterData.updatedAt) {
        if (afterData.updatedAt instanceof Date) {
          completionDate = afterData.updatedAt;
        } else if (typeof afterData.updatedAt.toDate === "function") {
          completionDate = afterData.updatedAt.toDate();
        } else {
          completionDate = new Date();
        }
      } else {
        // Fallback a la fecha actual si no hay updatedAt
        completionDate = new Date();
      }

      // 5. Generar la clave del mes (formato YYYY_MM)
      const year = completionDate.getFullYear();
      const month = String(completionDate.getMonth() + 1).padStart(2, "0");
      const monthKey = `${year}_${month}`;

      console.log(`📅 Mes de finalización: ${monthKey}`);

      // 6. Determinar el tipo de servicio y el campo a incrementar
      const ticketType = afterData.type as string;
      let fieldToIncrement: string;

      switch (ticketType) {
        case "instalacion":
          fieldToIncrement = `historicalStats.${monthKey}.instalacionesCompletadas`;
          break;
        case "renovacion":
          fieldToIncrement = `historicalStats.${monthKey}.renovacionesCompletadas`;
          break;
        case "reubicacion":
          fieldToIncrement = `historicalStats.${monthKey}.reubicacionesCompletadas`;
          break;
        case "soporte":
          fieldToIncrement = `historicalStats.${monthKey}.ticketsSoporteCerrados`;
          break;
        default:
          console.warn(`⚠️ Tipo de ticket desconocido: ${ticketType}`);
          return null;
      }

      // 7. Actualizar el contador atómicamente usando FieldValue.increment()
      // Esto evita race conditions y no requiere leer el documento primero
      const updateData: { [key: string]: any } = {
        [fieldToIncrement]: FieldValue.increment(1),
        updatedAt: new Date(),
      };

      await accountRef.update(updateData);

      console.log(`✅ Métricas históricas actualizadas para cuenta ${accountId}:`, {
        monthKey,
        ticketType,
        fieldIncremented: fieldToIncrement,
      });

      return null;
    } catch (error) {
      console.error(`❌ Error actualizando métricas históricas para cuenta ${accountId}, ticket ${ticketId}:`, error);
      // No lanzar el error para evitar reintentos innecesarios
      return null;
    }
  });