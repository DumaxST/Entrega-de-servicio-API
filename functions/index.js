// Dependencias Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
require("dotenv").config();

// Dependencias de 18next
const middleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const i18next = require("i18next");

// Otras dependencias
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Middlewares
const ErrorHandler = require("./src/middlewares/errorHandler");
const {languageTranslation} = require("./src/middlewares");

// Configuración de serviceAccount
const serviceAccount ={
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
};

//  rutas
const {producRouter} = require("./src/routes");
// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// Bucket de almacenemaiento
const bucket = admin
  .storage()
  .bucket(process.env.FIREBASE_STORAGE_BUCKET);
exports.bucket = bucket;

// Inicializar i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {loadPath: "./dictionary/{{lng}}.json"},
  });

// Orígenes permitidos
const origins = [process.env.ORIGIN1, process.env.ORIGIN2];

// Crear aplicación Express configurada
const createApp = (routes) => {
  const app = express();

  // Middleware de CORS
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || origins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With", "role"],
      preflightContinue: false,
      optionsSuccessStatus: 200
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  // Obtener IP del request
  app.use((req, res, next) => {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ??
      req.connection.remoteAddress?.split(":").pop() ??
      req.connection.remoteAddress ??
      req.socket.remoteAddress ??
      req.connection.socket?.remoteAddress ??
      "0.0.0.0";

    req.clientIp = ip;
    next();
  });

  // Middleware de i18next
  app.use(middleware.handle(i18next));
  app.use(languageTranslation);

  // Rutas específicas
  app.use(routes);

  // Middleware de errores
  app.use(ErrorHandler);

  return app;
};

// Rutas de la aplicación
const appRoutes = [
  require("./src/routes/app/companies/companies.routes"),
  require("./src/routes/app/groups/groups.routes"),
  require("./src/routes/app/units/units.routes"),
  require("./src/routes/app/users/users.routes"),
  require("./src/routes/general/auth/authUser.routes"),
  require("./src/routes/app/units/pdfUnits.routes"),
  producRouter
];


// Crear instancias para app, serviceDelivery
const App = createApp(appRoutes);

// Exportar para Firebase Functions
exports.app = functions.https.onRequest(App);

// Exportar para Supertest
if (process.env.NODE_ENV === "test") {
  module.exports = {
    App,
  };
}
