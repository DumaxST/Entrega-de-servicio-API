"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// Dependencias Firebase
const functions = __importStar(require("firebase-functions"));
// import * as admin from "firebase-admin";
// Express
const express_1 = __importDefault(require("express"));
// cors 
// import  cors from "cors";
//Firebase admin init
require("./src/config/firebaseAdmin");
// routes
const routes_1 = require("./src/presentation/routes");
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
const app = (0, express_1.default)();
// Aplica los middlewares
//app.use(cors({ origin: true }));
app.use(express_1.default.json());
// Configura las rutas
app.use(routes_1.AppRoutes.routes);
// Exporta la app como una función de Firebase
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map