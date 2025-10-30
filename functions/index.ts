// Dependencias Firebase
// import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// Load environment variables with fallback for Firebase Functions
// if (process.env.NODE_ENV !== 'production') {
//   require("dotenv").config();
// }

// Dependencias de 18next
// import * as middleware from "i18next-http-middleware";
// import Backend from "i18next-fs-backend";
// import i18next from "i18next";

// // Otras dependencias
// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// Middlewares
// const ErrorHandler = require("./src/middlewares/errorHandler");
// const { languageTranslation } = require("./src/middlewares");

// Types
// interface ServiceAccount {
//   type: string;
//   project_id: string;
//   private_key_id?: string;
//   private_key?: string;
//   client_email?: string;
//   client_id?: string;
//   auth_uri: string;
//   token_uri: string;
//   auth_provider_x509_cert_url: string;
//   client_x509_cert_url?: string;
//   universe_domain: string;
// }

// Configuración de serviceAccount con fallbacks para Firebase Functions
// const serviceAccount: ServiceAccount = {
//   type: process.env.FB_TYPE || "service_account",
//   project_id: process.env.FB_PROJECT_ID || "service-delivery-development",
//   private_key_id: process.env.FB_PRIVATE_KEY_ID,
//   private_key: process.env.FB_PRIVATE_KEY?.replace(/\\n/g, "\n"),
//   client_email: process.env.FB_CLIENT_EMAIL,
//   client_id: process.env.FB_CLIENT_ID,
//   auth_uri: process.env.FB_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
//   token_uri: process.env.FB_TOKEN_URI || "https://oauth2.googleapis.com/token",
//   auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
//   client_x509_cert_url: process.env.FB_CLIENT_X509_CERT_URL,
//   universe_domain: process.env.FB_UNIVERSE_DOMAIN || "googleapis.com"
// };

// Inicializar Firebase Admin SDK FIRST
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
//   storageBucket: process.env.FB_STORAGE_BUCKET || "gs://service-delivery-development.firebasestorage.app",
// });

// Import routes AFTER Firebase initialization
//const { producRouter } = require("./src/routes");

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

// Crear aplicación Express configurada
// const createApp = (routes: express.Router[]): express.Application => {
//   const app = express();

//   // Middleware de CORS
//   app.use(
//     cors({
//       origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
//         if (!origin || origins.includes(origin)) {
//           callback(null, true);
//         } else {
//           callback(new Error("Not allowed by CORS"));
//         }
//       },
//       credentials: true,
//       methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//       allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "role"],
//       preflightContinue: false,
//       optionsSuccessStatus: 200
//     })
//   );

//   app.use(express.json());
//   app.use(cookieParser());

//   // Obtener IP del request
//   app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
//     const ip =
//       (req.headers["x-forwarded-for"] as string)?.split(",")[0] ??
//       (req.connection.remoteAddress as string)?.split(":").pop() ??
//       req.connection.remoteAddress ??
//       (req.socket as any)?.remoteAddress ??
//       (req.connection as any)?.socket?.remoteAddress ??
//       "0.0.0.0";

//     (req as any).clientIp = ip;
//     next();
//   });

//   // Middleware de i18next
//   app.use(middleware.handle(i18next));
//   app.use(languageTranslation);

//   // Rutas específicas
//   routes.forEach(route => app.use(route));

//   // Middleware de errores
//   app.use(ErrorHandler);

//   return app;
// };

// Rutas de la aplicación
// const appRoutes: express.Router[] = [
//   require("./src/routes/app/companies/companies.routes"),
//   require("./src/routes/app/groups/groups.routes"),
//   require("./src/routes/app/units/units.routes"),
//   require("./src/routes/app/users/users.routes"),
//   require("./src/routes/general/auth/authUser.routes"),
//   require("./src/routes/app/units/pdfUnits.routes"),
//   producRouter
// ];

// Crear instancias para app, serviceDelivery
// const App = createApp(appRoutes);

// Exportar para Firebase Functions
// exports.app = functions.https.onRequest(App);

// Exportar para Supertest
// if (process.env.NODE_ENV === "test") {
//   module.exports = {
//     App,
//   };
// }
(async()=>{
  main()
})()

function main(){
  console.log("Hello World")
}