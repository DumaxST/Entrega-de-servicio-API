const {Router} = require("express");
const producRouter = Router();
const {ProductController} = require("../../../controllers");

producRouter.post("/product", ProductController.createProduct);
producRouter.get("/products", ProductController.getAllProducts);       
producRouter.get("/product/:id", ProductController.getProductById);   
producRouter.put("/product/:id", ProductController.updateProduct);     

module.exports = {producRouter};