const { check, validationResult } = require("express-validator");
const { getDocument, getDocuments } = require("../../../../ccFunctions");

const {
  checkIfEmailIsRegistered,
  expressDictionary,
  generalDictionary,
  getUserByEmail,
} = require("../../../../generalFunctions");

const schemas = {
  auth: [
    check("auth", "SintaxError").custom((value, { req }) => {
      //Para POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("MustNotBeEmpty");
      }
      //Para POST y PUT
      if (value && typeof value !== "string") {
        throw new Error("MustBeAString");
      }
      return true;
    }),
  ],
  user: [
    check("user", "SintaxError")
      .custom((value) => Object.keys(value).length > 0)
      .withMessage("MustNotBeEmpty")
      .bail()
      .custom(
        (value) =>
          typeof value === "object" && value !== null && !Array.isArray(value)
      )
      .withMessage("MustBeAnObject"),
  ],
    firstName: [
    check("firstName", "SintaxError").custom((value, { req }) => {
      //Para POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("MustNotBeEmpty");
      }
      //Para POST y PUT
      if (value && typeof value !== "string") {
        throw new Error("MustBeAString");
      }
      return true;
    }),
  ],
  lastName: [
    check("lastName", "SintaxError").custom((value, { req }) => {
      //Para POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("MustNotBeEmpty");
      }
      //Para POST y PUT
      if (value && typeof value !== "string") {
        throw new Error("MustBeAString");
      }
      return true;
    }),
  ],
  email: [
    check("email", "SintaxError")
      .custom((value, { req }) => {
        //Para POST
        if (["POST"].includes(req.method) && !value) {
          throw new Error("MustNotBeEmpty");
        }
        //Para POST y PUT
        if (value && typeof value !== "string") {
          throw new Error("MustBeAString");
        }
        const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
        if (value && !emailRegex.test(value)) {
          throw new Error("MustBeAValidEmail");
        }
        return true;
      })
      .bail()
      .custom(async (value, { req }) => {
        if (value) {
          const existingUser = await getUserByEmail(value);
          // Si es una solicitud PUT y el único usuario existente es el que se está editando, no lanzar un error
          if (
            req.method === "PUT" &&
            existingUser &&
            existingUser.uid === req.body.user.id
          ) {
            return true;
          }
          if (existingUser) {
            throw new Error("UserAlreadyRegistered");
          }
        }
      }),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const error = errors.array()[0];
        let status = 404;

        if (
          ["MustBeAString", "MustNotBeEmpty", "MustBeAValidEmail"].includes(
            error.msg
          )
        ) {
          status = 422;
        }

        return res.status(status).json({
          errors: errors.array().map((el) => ({
            ...el,
            msg:
              status !== 404
                ? expressDictionary(req.query.lang, el.msg)
                : generalDictionary(req.query.lang, el.msg),
          })),
        });
      }
      next();
    },
  ],
  phone: [
    check("phone", "SintaxError").custom(async (value, { req }) => {
      //Para POST y PUT
      if (value && typeof value !== "string") {
        throw new Error("MustBeAString");
      }
      if (value) {
        const existingUser = await getDocuments(
          `users`,
          ["phone", "==", value]
        );
        // Si es una solicitud PUT y el único usuario existente es el que se está editando, no lanzar un error
        if (
          req.method === "PUT" &&
          existingUser.length === 1 &&
          existingUser[0].id === req.body.user.id
        ) {
          return true;
        }
        if (existingUser.length > 0) {
          throw new Error("PhoneAlreadyInUse");
        }
      }
      return true;
    }),
  ],
  role: [
    check("role", "SintaxError")
      .notEmpty()
      .withMessage("MustNotBeEmpty")
      .bail()
      .isString()
      .withMessage("MustBeAString"),
  ],
  password: [
    check("password", "SintaxError").custom((value, { req }) => {
      //Para POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("MustNotBeEmpty");
      }
      //Para POST y PUT
      if (value && typeof value !== "string") {
        throw new Error("MustBeAString");
      }
      //Validar longitud mínima de contraseña
      if (value && value.length < 6) {
        throw new Error("PasswordTooShort");
      }
      return true;
    }),
  ],
  profilePicture: [
    check("profilePicture", "SintaxError")
      .optional()
      .custom((value, { req }) => {
        const language = req?.query?.lang;
        if (typeof value !== "object") {
          throw new Error("MustBeAnObject");
        }

        const { url, fileName, ...rest } = value;

        if (Object.keys(rest).length > 0) {
          throw new Error(
            `${generalDictionary(language, "InvalidProperties")}: ${Object.keys(
              rest
            ).join(", ")}`
          );
        }

        if (url === "" && fileName === "") {
          return true;
        }

        if (url && url !== "" && fileName && fileName !== "") {
          if (typeof url !== "string") {
            throw new Error(
              "'url'" + " " + expressDictionary(language, "MustBeAString")
            );
          }

          if (!url.startsWith("https://firebasestorage.googleapis.com")) {
            throw new Error("InvalidUrl");
          }

          if (typeof fileName !== "string") {
            throw new Error(
              "'fileName'" + " " + expressDictionary(language, "MustBeAString")
            );
          }
        } else if (url || fileName) {
          if (!url) {
            throw new Error(
              "'url'" + " " + expressDictionary(language, "MustNotBeEmpty")
            );
          }
          if (!fileName) {
            throw new Error(
              "'fileName'" + " " + expressDictionary(language, "MustNotBeEmpty")
            );
          }
        }

        return true;
      }),
  ],
};

module.exports = {
  post:[].concat(
    schemas.firstName,
    schemas.lastName,
    schemas.email,
    schemas.password,
    schemas.phone,
    schemas.role,
    schemas.profilePicture
  ),
  put: [
    check("id", "SintaxError")
      .notEmpty()
      .withMessage("MustNotBeEmpty")
      .bail()
      .isString()
      .withMessage("MustBeAString")
  ].concat(
    schemas.firstName,
    schemas.lastName,
    schemas.email,
    schemas.phone,
    schemas.role,
    schemas.profilePicture
  ),
  delete: [
    check("id", "SintaxError")
      .notEmpty()
      .withMessage("MustNotBeEmpty")
      .bail()
      .isString()
      .withMessage("MustBeAString")
  ]
}