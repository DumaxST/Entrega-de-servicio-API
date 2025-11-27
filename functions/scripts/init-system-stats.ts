/**
 * Script de inicialización para el documento singleton de estadísticas globales
 *
 * Este script crea el documento systemStats/main con la estructura inicial
 * para almacenar métricas agregadas de toda la plataforma.
 *
 * Uso:
 *   ts-node scripts/init-system-stats.ts
 *
 * @author Erika F.
 * @date 2025-11-14
 */

import * as admin from "firebase-admin";
import * as dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "service-delivery-development",
  });
}

const db = admin.firestore();

/**
 * Estructura inicial del documento de estadísticas globales
 */
interface SystemStatsInitialData {
  totalGlobalUnits: number;
  createdAt: admin.firestore.FieldValue;
  updatedAt: admin.firestore.FieldValue;
}

/**
 * Inicializa el documento singleton systemStats/main
 */
async function initializeSystemStats(): Promise<void> {
  const systemStatsRef = db.collection("systemStats").doc("main");

  try {
    // Verificar si ya existe
    const doc = await systemStatsRef.get();

    if (doc.exists) {
      console.log("⚠️  El documento systemStats/main ya existe.");
      console.log("📊 Datos actuales:", doc.data());

      const response = await promptUser(
        "¿Deseas sobrescribir el documento existente? (y/n): "
      );

      if (response.toLowerCase() !== "y") {
        console.log("❌ Operación cancelada.");
        return;
      }
    }

    // Crear la estructura inicial
    const initialData: SystemStatsInitialData = {
      totalGlobalUnits: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Guardar el documento
    await systemStatsRef.set(initialData, { merge: false });

    console.log("✅ Documento systemStats/main creado exitosamente!");
    console.log("📊 Estructura inicial:", {
      totalGlobalUnits: 0,
      createdAt: "timestamp",
      updatedAt: "timestamp",
    });
    console.log("\n📍 Ruta: systemStats/main");
    console.log("🔗 Colección raíz: systemStats");
  } catch (error) {
    console.error("❌ Error al crear el documento systemStats:", error);
    throw error;
  }
}

/**
 * Función auxiliar para obtener input del usuario (para Node.js)
 */
function promptUser(question: string): Promise<string> {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(question, (answer: string) => {
      readline.close();
      resolve(answer);
    });
  });
}

/**
 * Función principal
 */
async function main() {
  console.log("🚀 Iniciando creación del documento singleton systemStats...\n");

  try {
    await initializeSystemStats();
    console.log("\n✨ Proceso completado exitosamente!");
    process.exit(0);
  } catch (error) {
    console.error("\n💥 Error en el proceso:", error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

export { initializeSystemStats };
