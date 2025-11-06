// Dependencias Firebase
import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";
// Express
import express from 'express';
import compression from "compression";
// cors 
// import  cors from "cors";

//Firebase admin init
import "./src/config/firebaseAdmin";

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

//Crea la app de express 
const app = express();
// Aplica los middlewares
//app.use(cors({ origin: true }));
app.use(express.json());
app.use(compression());
// Configura las rutas
app.use(AppRoutes.routes);
// Exporta la app como una función de Firebase
export const api = functions.https.onRequest(app);