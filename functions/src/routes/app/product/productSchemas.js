const {check} = require("express-validator");
const {statusUtils} = require("../../../utils");

const schemas = {
  name: [
    check("product.name", "SintaxError").custom((value, {req}) => {
      // POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("Product name is required");
      }
      // POST Y PUT
      if (value && typeof value !== "string") {
        throw new Error("Product name must be a string");
      }
      return true;
    }),
  ],
  noClients: [
    check("product.noClients", "SintaxError").custom((value, {req}) => {
      // POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("Product noClients is required");
      }
      // POST Y PUT
      if (value && typeof value !== "number") {
        throw new Error("Product noClients must be a number");
      }
      return true;
    }),
  ],
  status: [
    check("product.status", "SintaxError").custom((value, {req}) => {
      // POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("Product status is required");
      }
      // POST Y PUT
      if (value && typeof value !== "string") {
        throw new Error("Product status must be a string");
      }
      // Validate status value using statusUtils
      if (value) {
        const validation = statusUtils.validateStatus(value);
        if (!validation.isValid) {
          throw new Error(validation.error);
        }
      }
      return true;
    }),
  ],
  price: [
    check("product.price", "SintaxError").custom((value, {req}) => {
      // POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("Product price is required");
      }
      // POST Y PUT
      if (value && typeof value !== "number") {
        throw new Error("Product price must be a number");
      }
      return true;
    }),
  ],
  apiKey: [
    check("product.apiKey", "SintaxError").custom((value, {req}) => {
      // POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("Product apiKey is required");
      }
      // POST Y PUT
      if (value && typeof value !== "string") {
        throw new Error("Product apiKey must be a string");
      }
      return true;
    }),
  ],
  description: [
    check("product.description", "SintaxError").custom((value, {req}) => {
      // POST
      if (["POST"].includes(req.method) && !value) {
        throw new Error("Product description is required");
      }
      // POST Y PUT
      if (value && typeof value !== "string") {
        throw new Error("Product description must be a string");
      }
      return true;
    }),
  ],
  productImage: [
    check("product.productImage", "SintaxError").custom((value, {req}) => {
      // Optional field for both POST and PUT
      if (value && typeof value !== "string") {
        throw new Error("Product image must be a string");
      }
      return true;
    }),
  ],
  version: [
    check("product.version", "SintaxError").custom((value, {req}) => {
      // Optional field for both POST and PUT, defaults to "1.0.0"
      if (value && typeof value !== "string") {
        throw new Error("Product version must be a string");
      }
      return true;
    }),
  ],
  // Query parameter validations
  queryNoClients: [
    check("noClients", "SintaxError")
      .optional()
      .custom((value) => {
        if (value && isNaN(parseInt(value))) {
          throw new Error("Query parameter noClients must be a valid number");
        }
        return true;
      }),
  ],
  queryOperator: [
    check("operator", "SintaxError")
      .optional()
      .custom((value) => {
        const validOperators = ["==", "!=", ">", ">=", "<", "<="];
        if (value && !validOperators.includes(value)) {
          throw new Error(
            `Query parameter operator must be one of: ${validOperators.join(", ")}`
          );
        }
        return true;
      }),
  ],
};
module.exports = {
  get: [].concat(schemas.queryNoClients, schemas.queryOperator),
  post: [].concat(
    schemas.name,
    schemas.noClients,
    schemas.status,
    schemas.price,
    schemas.apiKey,
    schemas.description,
    schemas.productImage,
    schemas.version
  ),
  put: [].concat(
    schemas.name,
    schemas.noClients,
    schemas.status,
    schemas.price,
    schemas.apiKey,
    schemas.description,
    schemas.productImage,
    schemas.version
  ),
  delete: [].concat(
    schemas.name,
    schemas.noClients,
    schemas.status,
    schemas.price,
    schemas.apiKey,
    schemas.description,
    schemas.productImage,
    schemas.version
  ),
};
