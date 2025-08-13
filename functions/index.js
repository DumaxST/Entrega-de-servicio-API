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

// Middlewares
const ErrorHandler = require("./src/middlewares/errorHandler");
const { languageTranslation } = require("./src/middlewares");

// Configuración de serviceAccount
const serviceAccount = require("./serviceAccount.json");
const cookieParser = require("cookie-parser");

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://service-delivery-development.firebasestorage.app",
});

//Bucket de almacenemaiento
const bucket = admin
  .storage()
  .bucket("gs://service-delivery-development.firebasestorage.app");
exports.bucket = bucket;

// Inicializar i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: { loadPath: "./dictionary/{{lng}}.json" },
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
  require("./src/routes/general/auth/authUser.routes")
];

// const serviceDeliveryRoutes = []
// const torreDeControlRoutes = []

// Crear instancias para app, serviceDelivery y torreDeControl
const App = createApp(appRoutes);
// const ServiceDelivery = createApp(serviceDeliveryRoutes);
// const TorreDeControl = createApp(torreDeControlRoutes);

// Exportar para Firebase Functions
exports.app = functions.https.onRequest(App);
// exports.serviceDelivery = functions.https.onRequest(ServiceDelivery);
// exports.torreDeControl = functions.https.onRequest(TorreDeControl);

// Exportar para Supertest
if (process.env.NODE_ENV === "test") {
  module.exports = {
    App,
    // , ServiceDelivery, TorreDeControl
  };
}
