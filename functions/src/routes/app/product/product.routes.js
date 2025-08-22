// Router
const {Router} = require("express");
const producRouter = Router();

// Controllers
const {ProductController} = require("../../../controllers");

// Schemas
const productsSchemas = require("./productSchemas");

producRouter.post("/product", productsSchemas.post, ProductController.createProduct);
producRouter.get("/products", productsSchemas.get, ProductController.getAllProducts);
producRouter.get("/product/:id", productsSchemas.get, ProductController.getProductById);
producRouter.put("/product/:id", productsSchemas.put, ProductController.updateProduct);

module.exports = {producRouter};