import * as admin from "firebase-admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { envs } from "./envs";

// Check if running in emulator mode
const isEmulator = process.env.FUNCTIONS_EMULATOR === "true" || process.env.FIRESTORE_EMULATOR_HOST;

if (isEmulator) {
  // Initialize without credentials for emulator
  admin.initializeApp({
    projectId: "service-delivery-development",
  });

  console.log("Firebase Admin initialized for EMULATOR mode");
} else {
  // Initialize with service account for production
  const serviceAccount = require("./../serviceAccount.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: envs.fbStorageBucket || "gs://service-delivery-development.firebasestorage.app",
  });

  console.log("Firebase Admin initialized for PRODUCTION mode");
}

export const db = admin.firestore();
export const auth = admin.auth();
export { FieldValue, Timestamp }; 