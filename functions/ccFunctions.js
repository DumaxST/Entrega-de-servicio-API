const {default: axios} = require("axios");
const admin = require("firebase-admin");
const {FieldValue} = require("firebase-admin/firestore");
const db = admin.firestore();
const bucket = require("./index").bucket;
const urlOptions = {
  version: "v4",
  action: "read",
  expires: Date.now() + 1000 * 60 * (60 * 5), // 15 minutes
};

module.exports = {
  getDocument: async (ref, id) => {
    const query = db.collection(ref).doc(id);
    const item = await query.get();
    if (item.exists) {
      const itemToReturn = item.data();
      itemToReturn.id = id;
      const collections = await module.exports.getDocumentCollections(ref, id);
      itemToReturn.collections = collections;
      return itemToReturn;
    } else {
      return false;
    }
  },
  getDocuments: async (ref, qry, order) => {
    let query = db.collection(ref);

    if (qry != undefined) {
      query = query.where(qry[0], qry[1], qry[2]);
    }

    if (order != undefined) {
      query = query.orderBy(order.var, order.type ? "asc" : "desc");
    }

    const items = await query.get();
    const list = items.docs;
    const array = list.reduce(
      (acc, el) => acc.concat({...el.data(), id: el.id}),
      []
    );

    for (const element of array) {
      const collections = await module.exports.getDocumentCollections(
        ref,
        element.id
      );
      element.collections = collections;
    }

    return array;
  },
  getDocumentCollections: async (ref, id) => {
    const query = db.collection(ref).doc(id);
    const collections = await query.listCollections();
    return collections.map((collection) => collection.id);
  },
  getBucketItem: async (itemRef) => {
    return await bucket.file(itemRef).getSignedUrl(urlOptions);
  },
  createDocument: async (ref, obj, id) => {
    if (obj.test) {
      return {...obj, id: "TESTID-XKAhEeCFDm"};
    }

    if (id == undefined) {
      return await db.collection(ref).add({
        ...obj,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      return await db
        .collection(ref)
        .doc(id)
        .set({
          ...obj,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
    }
  },
  cloneDocument: async (from, to) => {
    const document = await module.exports.getDocument(from.ref, from.id);
    delete document.id;
    await module.exports.createDocument(
      to,
      {...document, createdAt: FieldValue.serverTimestamp()},
      from.id
    );
    return true;
  },
  updateDocument: async (ref, id, obj) => {
    if (obj.test) {
      return {...obj, id: "TESTID-XKAhEeCFDm"};
    }

    return await db
      .collection(ref)
      .doc(id)
      .update({...obj, updatedAt: FieldValue.serverTimestamp()})
      .then(async () => {
        return await module.exports.getDocument(ref, id);
      });
  },
  deleteDocument: async (ref, id, test) => {
    if (test) {
      // Regresar si return true es correcto
      return true;
    }

    await db.collection(ref).doc(id).delete();
    return;
  },
  uploadFile: async (ref, file, fileName) => {
    return {
      fileName: fileName,
      url: await bucket
        .upload(file, {
          gzip: true,
          destination: `${ref}/${fileName}`,
          metadata: {
            cacheControl: "public, max-age=31536000",
          },
        })
        .then(() => {
          const file = bucket.file(`${ref}/${fileName}`);
          return file.getSignedUrl({
            action: "read",
            expires: "03-09-2491",
          })[0];
        }),
    };
  },
  deleteDirectory: async (directoryRef) => {
    return await bucket.deleteFiles({prefix: directoryRef});
  },
  confirmDocOwner: async (ref, docID, ownerID) => {
    const doc = await module.exports.getDocument(ref, docID);
    if (doc.ownerID == ownerID) {
      return true;
    } else {
      return false;
    }
  },
  confirmAllowdUser: async (ref, docID, userID) => {
    return true;
    // const doc = await module.exports.getDocument(ref, docID);
    // if (doc.allowedUsers.includes(userID)) {
    //   return true;
    // } else {
    //   return false;
    // }
  },
  sendFirebaseEmail: async (emailData) => {
    await module.exports
      .createDocument(`mail`, {
        from: "notreply@mi-oasis.com",
        to: emailData.to,
        message: {
          subject: emailData.message.subject,
          html: emailData.message.html,
          attachments: emailData?.attachments,
        },
      })
      .then(() => {
        return true;
      });
  },
  reduceErrorMessages: (errors, param) => {
    return errors
      .filter((error) => error.param == param)
      .reduce((acc, el) => {
        return acc.concat(el.msg);
      }, []);
  },
  jestValidationForExpress: async (
    requestType, // GET, POST, PUT, DELETE
    ref, // "/CRUD/user"
    params, // {test: true, userID: "WhnYqXKAhEeCFDmLWlg5M3MYc1R2"}
    config, // { headers: { 'user-role': 'admin' } }
    correctDataType, // ["string", "number", "boolean", "object", "array", "undefined", "null"]
    atributeRoute // "user.name"
  ) => {
    const dataTypes = [
      "string",
      "number",
      "boolean",
      "object",
      "array",
      "undefined",
      "null",
    ];
    if (
      dataTypes.filter((el) => {
        return correctDataType.includes(el);
      }).length == 0
    ) {
      // THROW ERROR, THE DATA TYPES ARE NOT CORRECT
      return false;
    }

    function setNestedAttribute(params, atributeRoute, value) {
      const routeArray = atributeRoute.split(".");
      let result = params;

      for (let i = 0; i < routeArray.length - 1; i++) {
        const key = routeArray[i];

        if (result && typeof result === "object" && key in result) {
          result = result[key];
        }
      }

      const lastKey = routeArray[routeArray.length - 1];
      if (result && typeof result === "object" && lastKey in result) {
        result[lastKey] = value;
      }
    }

    for (const dataType of dataTypes.filter(
      (el) => !correctDataType.includes(el)
    )) {
      try {
        let response;
        switch (dataType) {
          case "string":
            setNestedAttribute(params, atributeRoute, "ABC");
            if (requestType == "GET" || requestType == "DELETE") {
              response = await axios.get(ref, {
                params: params,
                ...config,
              });
            }
            if (requestType == "POST" || requestType == "PUT") {
              response =
                requestType === "POST"
                  ? await axios.post(ref, params, config)
                  : await axios.put(ref, params, config);
            }
            if (response.data) {
              throw new Error(
                `${atributeRoute} should only accept ${correctDataType}, and it accepted string`
              );
            }
            break;

          case "number":
            setNestedAttribute(params, atributeRoute, 0);
            if (requestType == "GET" || requestType == "DELETE") {
              response = await axios.get(ref, {
                params: params,
                ...config,
              });
            }
            if (requestType == "POST" || requestType == "PUT") {
              response =
                requestType === "POST"
                  ? await axios.post(ref, params, config)
                  : await axios.put(ref, params, config);
            }
            if (response.data) {
              console.log(response.data);
              throw new Error(
                `${atributeRoute} should only accept ${correctDataType}, and it accepted numbers`
              );
            }
            break;

          case "boolean":
            setNestedAttribute(params, atributeRoute, true);
            if (requestType == "GET" || requestType == "DELETE") {
              response = await axios.get(ref, {
                params: params,
                ...config,
              });
            }
            if (requestType == "POST" || requestType == "PUT") {
              response =
                requestType === "POST"
                  ? await axios.post(ref, params, config)
                  : await axios.put(ref, params, config);
            }
            if (response.data) {
              throw new Error(
                `${atributeRoute} should only accept ${correctDataType}, and it accepted  a boolean`
              );
            }
            break;

          case "object":
            setNestedAttribute(params, atributeRoute, {});
            if (requestType == "GET" || requestType == "DELETE") {
              response = await axios.get(ref, {
                params: params,
                ...config,
              });
            }
            if (requestType == "POST" || requestType == "PUT") {
              response =
                requestType === "POST"
                  ? await axios.post(ref, params, config)
                  : await axios.put(ref, params, config);
            }
            if (response.data) {
              throw new Error(
                `${atributeRoute} should only accept ${correctDataType}, and it accepted a object`
              );
            }
            break;

          case "array":
            setNestedAttribute(params, atributeRoute, []);
            if (requestType == "GET" || requestType == "DELETE") {
              response = await axios.get(ref, {
                params: params,
                ...config,
              });
            }
            if (requestType == "POST" || requestType == "PUT") {
              response =
                requestType === "POST"
                  ? await axios.post(ref, params, config)
                  : await axios.put(ref, params, config);
            }
            if (response.data) {
              throw new Error(
                `${atributeRoute} should only accept ${correctDataType}, and it accepted an array`
              );
            }
            break;

          case "undefined":
            setNestedAttribute(params, atributeRoute, undefined);
            if (requestType == "GET" || requestType == "DELETE") {
              response = await axios.get(ref, {
                params: params,
                ...config,
              });
            }
            if (requestType == "POST" || requestType == "PUT") {
              response =
                requestType === "POST"
                  ? await axios.post(ref, params, config)
                  : await axios.put(ref, params, config);
            }
            if (response.data) {
              throw new Error(
                `${atributeRoute} should only accept ${correctDataType}, and it accepted an undefined`
              );
            }
            break;
          case "null":
            setNestedAttribute(params, atributeRoute, null);
            if (requestType == "GET" || requestType == "DELETE") {
              response = await axios.get(ref, {
                params: params,
                ...config,
              });
            }
            if (requestType == "POST" || requestType == "PUT") {
              response =
                requestType === "POST"
                  ? await axios.post(ref, params, config)
                  : await axios.put(ref, params, config);
            }
            if (response.data) {
              throw new Error(
                `${atributeRoute} should only accept ${correctDataType}, and it accepted an null`
              );
            }
            break;
        }
      } catch (error) {
        if (error?.response?.data?.errors) {
          return true;
        }
        return error;
      }
    }
  },

  // Numero total de elementos de una coleccion sin filtros
  getTotalDocuments: async (collectionPath) => {
    try {
      const snapshot = await db.collection(collectionPath).get();
      return snapshot.size;
    } catch (error) {
      console.error("Error getting document count: ", error);
      return 0;
    }
  },

  // Numero total de elementos de una coleccion con filtros
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
      console.error("Error getting filtered document count: ", error);
      return 0;
    }
  },

  // Paginado de colecciones sin filtros
  getPaginatedDocuments: async (
    collectionPath,
    itemsPerPageNumber,
    lastDocId,
    orderBy
  ) => {
    let query = db
      .collection(collectionPath)
      .orderBy(orderBy[0], orderBy[1])
      .limit(itemsPerPageNumber);

    if (lastDocId) {
      const lastDoc = await db.collection(collectionPath).doc(lastDocId).get();
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
  },

  // Paginado de colecciones con filtros
  getPaginatedFilteredDocuments: async (
    collectionPath,
    filters,
    excludeTypes,
    orderBy,
    itemsPerPageNumber,
    lastDocId
  ) => {
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

    // Ordenar
    if (orderBy) {
      query = query.orderBy(orderBy[0], orderBy[1]);
    } else {
      query = query.orderBy("updatedAt", "desc");
    }

    query = query.limit(itemsPerPageNumber);

    // Aplicar paginación
    if (lastDocId) {
      const lastDoc = await db.collection(collectionPath).doc(lastDocId).get();
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
  },
};
