import * as admin from "firebase-admin";
import { envs } from "./envs";
import serviceAccount from "./../serviceAccount.json";

admin.initializeApp({
   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
   storageBucket: envs.fbStorageBucket || "gs://service-delivery-development.firebasestorage.app",
 });

export const db = admin.firestore();
export const auth = admin.auth();
export const FieldValue = admin.firestore.FieldValue;
export const Timestamp = admin.firestore.Timestamp; 