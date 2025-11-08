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
import { db } from "./src/config/firebaseAdmin";

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
 * 1. Lee toda la subcolección devices del accountId afectado
 * 2. Calcula conteos totales para cada estado (reporting, not_reporting, maintenance, inactive)
 * 3. Guarda estos conteos en deviceStatusBreakdown dentro de stats
 * 4. Calcula porcentajes para cada estado y los guarda en deviceStatusPercentages
 * 5. Actualiza totalUnits con el conteo total de dispositivos
 * 6. Consulta la configuración del sistema para determinar el deliveryStatus
 * 7. Guarda deliveryPercentage y deliveryStatus en stats
 */
export const updateAccountStatsOnDeviceChange = functions.firestore
  .document("accounts/{accountId}/devices/{deviceId}")
  .onWrite(async (change: functions.Change<functions.firestore.DocumentSnapshot>, context: functions.EventContext) => {
    const accountId = context.params.accountId as string;

    try {
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

      // 8. Actualizar el documento de la cuenta
      const accountRef = db.collection("accounts").doc(accountId);

      await accountRef.update({
        "stats.totalUnits": totalUnits,
        "stats.reportingUnits": statusBreakdown.reporting,
        "stats.nonReportingUnits": statusBreakdown.not_reporting,
        "stats.deviceStatusBreakdown": statusBreakdown,
        "stats.deviceStatusPercentages": statusPercentages,
        "stats.deliveryPercentage": deliveryPercentage,
        "stats.status": deliveryStatus,
        updatedAt: new Date(),
      });

      console.log(`✅ Account ${accountId} stats updated successfully:`, {
        totalUnits,
        statusBreakdown,
        statusPercentages,
        deliveryPercentage,
        deliveryStatus,
      });

      return null;
    } catch (error) {
      console.error(`❌ Error updating account ${accountId} stats:`, error);
      // No lanzamos el error para evitar reintentos innecesarios
      return null;
    }
  });