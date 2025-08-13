const { Router } = require("express");
const router = Router();

//const bucket = require("../../../index").bucket;
//const variables = require("../../../envConfig.js");

//const { FieldValue } = require("firebase-admin/firestore");
const { checkSchema, validationResult } = require("express-validator");
const userSchema = require("./usersSchemas.js");

const {
  getDocument,
  createDocument,
  getDocuments,
  updateDocument,
  sendFirebaseEmail,
} = require("../../../../ccFunctions.js");

const {
  generalDictionary,
  expressDictionary,
  validationErrorsExpress,
  deleteAdmins,
  userPermissions,
} = require("../../../../generalFunctions.js");
const admin = require("firebase-admin");

router.post("/user", userSchema.post, async (req, res) => {
    console.log("1")
  if (validationErrorsExpress(req, res)) return;

  const language = req?.query?.lang;

  const { email, password , lastName, firstName } = req?.body;

  try {

      const newUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: `${firstName} ${lastName}`,
      });

      const TIMEOUT_MS = 15000;

      // const timeoutPromise = new Promise((_, reject) =>
      //   setTimeout(() => reject({ error: "Timeout", message: "La solicitud tardó demasiado" }), TIMEOUT_MS)
      // );

      //Si en algun momento pensamos mandar un email de bienvenida

    //   const passwordResetLink = await admin
    //     .auth()
    //     .generatePasswordResetLink(user.email);

    //   const emailDataTemp = {
    //     to: [user.email],
    //     message: {
    //       subject: "Bienvenido a la comunidad de vecinos",
    //       html: welcomeMail(
    //         user.firstName,
    //         user.lastName,
    //         residentialID,
    //         passwordResetLink
    //       ),
    //     },
    //     attachments: [],
    //   };

      return res.status(200).json({  
        id: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
      });
    // } else {
    //   const userTest = await createDocument(
    //     `residentials/${residentialID}/users`,
    //     user
    //   );
    //   return res.status(200).json({ ...user, id: userTest.id });
    // }
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});

module.exports = router;