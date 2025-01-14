// Dependencias Firebase
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

// Configuración de serviceAccount
const serviceAccount = require("./serviceAccount.json");

// Inicializar Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Intancia de Express (users)
const app = express();
app.use(cors({ origin: true }));

// Exporta las funciones de Firebase
exports.app = functions.https.onRequest(app);