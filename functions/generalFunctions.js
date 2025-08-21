const admin = require("firebase-admin");
const db = admin.firestore();
const {FieldValue} = require("firebase-admin/firestore");
const {checkSchema, validationResult} = require("express-validator");

require("dotenv").config();
const secretKeyJWT = process.env.JWT_SECRET;
const secretKeyRefresh = process.env.JWT_REFRESH_SECRET;
const accessToken = process.env.WIALON_ACCESS_TOKEN;
const wialonURL = process.env.WIALON_URL;
const modo = process.env.MODO;
const jwt = require("jsonwebtoken");
const axios = require("axios");

module.exports = {
  getDocument: async (ref, id) => {
    try {
      const query = db.collection(ref).doc(id);
      const item = await query.get();

      if (!item.exists) {
        return null;
      }

      const itemToReturn = item.data();
      itemToReturn.id = id;
      itemToReturn.collections = await module.exports.getDocumentCollections(
        ref,
        id
      );

      return itemToReturn;
    } catch (error) {
      console.error(`Error getting document: ${error}`);
      throw new Error("Error getting document");
    }
  },
  getDocuments: async (ref, qry, order) => {
    try {
      let query = db.collection(ref);

      if (qry) {
        query = query.where(qry[0], qry[1], qry[2]);
      }

      if (order) {
        query = query.orderBy(order.var, order.type ? "asc" : "desc");
      }

      const items = await query.get();
      const list = items.docs;
      const array = list.map((el) => ({...el.data(), id: el.id}));

      const promises = array.map(async (element) => {
        const collections = await module.exports.getDocumentCollections(
          ref,
          element.id
        );
        return {...element, collections};
      });

      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error("Error en getDocuments:", error);
      throw new Error("Error getting documents");
    }
  },
  getDocumentCollections: async (ref, id) => {
    try {
      const query = db.collection(ref).doc(id);
      const collections = await query.listCollections();
      return collections.map((collection) => collection.id);
    } catch (error) {
      console.error(
        `Error getting document collections for ${ref}/${id}:`,
        error
      );
      throw new Error("Error getting document collections");
    }
  },
  getUserByEmail: async (email) => {
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      return userRecord;
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // El usuario no existe
        return null;
      }
      // Otro error ocurrió
      throw error;
    }
  },
  createDocument: async (ref, obj, id) => {
    try {
      if (obj.test) {
        return {...obj, id: "TESTID-XKAhEeCFDm"};
      }

      const data = {
        ...obj,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };

      if (id === undefined) {
        const docRef = await db.collection(ref).add(data);
        return {...data, id: docRef.id};
      } else {
        await db.collection(ref).doc(id).set(data);
        return {...data, id};
      }
    } catch (error) {
      console.error("Error creating document:", error);
      throw new Error("Error creating document");
    }
  },
  updateDocument: async (ref, id, obj) => {
    try {
      if (obj.test) {
        return {...obj, id: "TESTID-XKAhEeCFDm"};
      }

      await db
        .collection(ref)
        .doc(id)
        .update({
          ...obj,
          updatedAt: FieldValue.serverTimestamp(),
        });

      return await module.exports.getDocument(ref, id);
    } catch (error) {
      console.error(`Error updating document ${id} in ${ref}:`, error);
      throw new Error("Error updating document");
    }
  },
  deleteDocument: async (ref, id) => {
    try {
      await db.collection(ref).doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document ${id} in ${ref}:`, error);
      throw new Error("Error deleting document");
    }
  },
  sendFirebaseEmail: async (emailData) => {
    try {
      await module.exports.createDocument(`mail`, {
        from: "notreply@mi-oasis.com",
        to: emailData.to,
        message: {
          subject: emailData.message.subject,
          html: emailData.message.html,
          attachments: emailData?.attachments,
        },
      });
      return true;
    } catch (error) {
      console.error("Error sending Firebase email:", error);
      throw new Error("Error sending Firebase email");
    }
  },
  validationErrorsExpress: (req, res) => {
    const validation = validationResult(req);
    let err = false;
    if (!validation.isEmpty()) {
      const error = validation.errors[0];
      const status = 422;

      // if (errorMessages.includes(error.msg)) {
      //   status = 404;
      // }

      err = true;

      return res.status(status).json({
        errors: validation.errors.map((el) => ({
          ...el,
          msg:
            status !== 404
              ? module.exports.expressDictionary(req.query.lang, el.msg)
              : module.exports.generalDictionary(req.query.lang, el.msg),
        })),
      });
    }
    return err;
  },

  // --------------------------------------------------Funciones de paginado--------------------------------------------------
  // Numero total de elementos de una coleccion sin filtros (Se utiliza para saber el numero total de paginas)
  getTotalDocuments: async (collectionPath) => {
    try {
      const snapshot = await db.collection(collectionPath).get();
      return snapshot.size;
    } catch (error) {
      console.error(
        `Error getting document count for ${collectionPath}:`,
        error
      );
      throw new Error("Error getting document count");
    }
  },

  // Numero total de elementos de una coleccion con filtros (Se utiliza para saber el numero total de paginas)
  getTotalDocumentsWithFilters: async (
    collectionPath,
    filters,
    excludeTypes
  ) => {
    try {
      let query = db.collection(collectionPath);

      // Aplicar filtros
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          query = query.where(filter[0], filter[1], filter[2]);
        });
      }

      // Excluir tipos específicos
      if (excludeTypes && excludeTypes.length > 0) {
        query = query.where("type", "not-in", excludeTypes);
      }

      const snapshot = await query.get();
      return snapshot.size;
    } catch (error) {
      console.error(
        `Error getting filtered document count for ${collectionPath}:`,
        error
      );
      throw new Error("Error getting filtered document count");
    }
  },

  // Paginado de colecciones sin filtros
  getPaginatedDocuments: async (
    collectionPath,
    itemsPerPageNumber,
    lastDocId,
    orderBy
  ) => {
    try {
      let query = db
        .collection(collectionPath)
        .orderBy(orderBy[0], orderBy[1])
        .limit(itemsPerPageNumber);

      if (lastDocId) {
        const lastDoc = await db
          .collection(collectionPath)
          .doc(lastDocId)
          .get();
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      const documents = [];
      let newLastDocId = null;

      snapshot.forEach((doc) => {
        const docData = doc.data();
        documents.push({...docData, id: doc.id}); // Agregando la propiedad "id"
        newLastDocId = doc.id;
      });

      return {documents, newLastDocId};
    } catch (error) {
      console.error(
        `Error getting paginated documents for ${collectionPath}:`,
        error
      );
      throw new Error("Error getting paginated documents");
    }
  },

  // Paginado de colecciones con filtros
  getPaginatedFilteredDocuments: async (
    collectionPath,
    filters,
    excludeFilters,
    orderBy,
    itemsPerPageNumber,
    lastDocId
  ) => {
    try {
      let query = db.collection(collectionPath);

      // Aplicar filtros
      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          query = query.where(filter[0], filter[1], filter[2]);
        });
      }

      // Excluir filtros específicos
      if (excludeFilters && excludeFilters.length > 0) {
        excludeFilters.forEach((excludeFilter) => {
          query = query.where(excludeFilter[0], "not-in", excludeFilter[1]);
        });
      }

      // Ordenar
      if (orderBy) {
        query = query.orderBy(orderBy[0], orderBy[1]);
      } else {
        query = query.orderBy("updatedAt", "desc");
      }

      query = query.limit(itemsPerPageNumber);

      // Aplicar paginación
      if (lastDocId) {
        const lastDoc = await db
          .collection(collectionPath)
          .doc(lastDocId)
          .get();
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();
      const documents = [];
      let newLastDocId = null;

      snapshot.forEach((doc) => {
        const docData = doc.data();
        documents.push({...docData, id: doc.id}); // Agregando la propiedad "id"
        newLastDocId = doc.id;
      });

      return {documents, newLastDocId};
    } catch (error) {
      console.error(
        `Error getting paginated filtered documents for ${collectionPath}:`,
        error
      );
      throw new Error("Error getting paginated filtered documents", error);
    }
  },


  //--------------------------------------------------Autenticación--------------------------------------------------
  generateToken: async (data) => {
    const expiresIn = 60 * 20; // 20 minutos
    const token = jwt.sign(data, secretKeyJWT, {expiresIn});
    const expirationDate = new Date(Date.now() + expiresIn * 1000);
    return {expirationDate, token};
  },
  generateRefreshToken: async (data, res, ref, indefiniteTime = false) => {
    if (!indefiniteTime) {
      const expiresIn = 60 * 60 * 24 * 30; // 30 días
      const refreshToken = jwt.sign(data, secretKeyRefresh, {expiresIn});
      const expirationDate = new Date(Date.now() + expiresIn * 1000);
      const dataWithExpiration = {...data, expirationDate, refreshToken};
      delete dataWithExpiration.id;
      delete dataWithExpiration.role;
      await db.collection(ref).add(dataWithExpiration);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: modo === "production" || modo === "development" ? true : false,
        sameSite: "None",
        maxAge: expiresIn * 1000, // 30 días
      });

      return {refreshToken, expirationDate};
    }

    const refreshToken = jwt.sign(data, secretKeyRefresh);
    const dataNormal = {...data, refreshToken, expirationDate: "indefinite"};
    delete dataNormal.id;
    delete dataNormal.role;
    await db.collection(ref).add(dataNormal);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: modo === "production" || modo === "development" ? true : false,
      sameSite: "None",
    });

    return {refreshToken, expirationDate: "indefinite"};
  },
  destroyToken: async (ref, id, res) => {
    res.clearCookie("refreshToken");
    await db.collection(ref).doc(id).delete();
    return true;
  },

  // --------------------------------------------------Reporte Wialon--------------------------------------------------
  getSidFromToken: async () => {
    const params = {
      svc: "token/login",
      params: JSON.stringify({token: accessToken}),
    };
    const response = await axios.get(wialonURL, {params});

    return response.data.eid;
  },
  fetchAllUnitsWialon: async (sid) => {
    const params = {
      svc: "core/search_items",
      params: JSON.stringify({
        spec: {
          itemsType: "avl_unit",
          propName: "sys_name,rel_last_msg_date",
          propValueMask: "*",
          sortType: "sys_name",
          propType: "property,property",
          or_logic: 0,
        },
        force: 1,
        flags: 1025, // Incluye datos de posición y último mensaje
        from: 0,
        to: 10,
      }),
      sid: sid,
    };
    const response = await axios.get(wialonURL, {params});
    return response.data.items;
  },
  isUnitReportingWialon: (unitData, allowedInterval = 3600) => {
    // 1 hora

    const currentTime = Math.floor(Date.now() / 1000);

    const lastMsgTime = unitData?.lmsg?.t || 0; // Tiempo del último mensaje
    const posTime = unitData?.pos?.t || 0; // Tiempo de la última posición
    const lat = unitData?.pos?.y || 0; // Latitud
    const lon = unitData?.pos?.x || 0; // Longitud
    const gsmSignal = unitData?.lmsg?.p?.gsm_signal || null; // Señal GSM
    const fValue = unitData?.pos?.f || 0; // Flag de la posición
    const batteryLevel = unitData?.lmsg?.p?.battery_level || null; // Nivel de batería

    // Validaciones adicionales
    const hasValidCoordinates = !(lat === 0 && lon === 0); // Coordenadas no deben ser 0
    const isRecent = currentTime - lastMsgTime <= allowedInterval;
    const isTimeAligned = Math.abs(lastMsgTime - posTime) <= 3600; // Diferencia de tiempo entre pos y lmsg
    const hasValidSignal = gsmSignal === null || gsmSignal > 0; // GSM puede ser null y aún reportar.
    const isFlagValid = fValue > 0;
    const hasValidBattery = batteryLevel === null || batteryLevel > 10; // Batería válida si es null o mayor a 10%.

    // Considerar reportando si cumple los criterios relajados
    return (
      hasValidCoordinates &&
      isRecent &&
      isTimeAligned &&
      hasValidBattery &&
      (hasValidSignal || isFlagValid)
    );
  },

  // --------------------------------------------------Dictionary Functions--------------------------------------------------
  generalDictionary: (lang, key) => {
    try {
      const language = lang === "es" ? "es" : "en";
      const dictionary = require(`./dictionary/${language}.json`);
      return dictionary[key] || key;
    } catch (error) {
      console.error(`Error loading dictionary for language ${lang}:`, error);
      return key;
    }
  },

  expressDictionary: (lang, key) => {
    try {
      const language = lang === "es" ? "es" : "en";
      const dictionary = require(`./dictionary/${language}.json`);
      return dictionary[key] || key;
    } catch (error) {
      console.error(`Error loading dictionary for language ${lang}:`, error);
      return key;
    }
  },

};
