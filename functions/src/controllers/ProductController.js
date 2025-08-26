const {
  createDocument,
  getDocument,
  getDocuments,
  updateDocument,
} = require("../../ccFunctions");
const {statusUtils} = require("../utils");

class ProductController {
  static async createProduct(req, res) {
    try {
      const product = req.body;

      if (!product.name || !product.price || product.noClients === undefined) {
        return res.status(400).json({
          error:
            "Missing required fields: name, price, and noClients are required",
        });
      }

      const normalizedStatus = statusUtils.normalizeStatus(product.status);

      const sanitizedProduct = {
        name: product.name.toLowerCase().trim(),
        noClients: parseInt(product.noClients),
        status: normalizedStatus,
        price: parseFloat(product.price),
        apiKey: product.apiKey ? product.apiKey.trim() : "",
        description: product.description
          ? product.description.toLowerCase().trim()
          : "",
        productImage: product.productImage ? product.productImage.trim() : "",
        version: product.version ? product.version.trim() : "1.0.0",
      };

      if (isNaN(sanitizedProduct.price)) {
        return res.status(400).json({
          error: "Price must be a valid number",
        });
      }

      if (isNaN(sanitizedProduct.noClients)) {
        return res.status(400).json({
          error: "noClients must be a valid number",
        });
      }

      const newProduct = await createDocument("products", sanitizedProduct);
      console.log("Product created:", newProduct);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({
        success: false,
        error: "Error creating product",
        details: error.message,
      });
    }
  }

  // READ
  static async getAllProducts(req, res) {
    try {
      const {noClients, operator = "==", orderBy} = req.query;

      let products;
      if (noClients !== undefined) {
        const clientsCount = parseInt(noClients);
        if (isNaN(clientsCount)) {
          return res.status(400).json({
            error: "noClients must be a valid number",
          });
        }

        // Validate operator
        const validOperators = ["==", "!=", ">", ">=", "<", "<="];
        if (!validOperators.includes(operator)) {
          return res.status(400).json({
            error: `Invalid operator. Must be one of: ${validOperators.join(", ")}`,
          });
        }

        // For filtered queries, use the orderBy parameter or default to noClients
        const orderField = orderBy === "price" ? "price" : "noClients";
        products = await getDocuments(
          "products",
          ["noClients", operator, clientsCount],
          {var: orderField, type: false}
        );
      } else {
        // For all products, use orderBy parameter or no ordering
        const orderConfig = orderBy
          ? {var: orderBy === "price" ? "price" : "noClients", type: false}
          : undefined;
        products = await getDocuments("products", undefined, orderConfig);
      }

      // Sort products based on orderBy parameter
      if (orderBy === "price") {
        products = products.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (orderBy === "numberClients") {
        products = products.sort(
          (a, b) => (b.noClients || 0) - (a.noClients || 0)
        );
      }
      // If no orderBy parameter, return products without additional sorting

      const translatedProducts = products.map((product) => ({
        ...product,
        statusTranslated: statusUtils.getTranslatedStatus(
          product.status,
          req.t
        ),
      }));

      res.status(200).json({
        products: translatedProducts,
        meta: {
          total: products.length,
          sortedBy: orderBy || null,
          sortOrder: orderBy ? "desc" : null,
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({error: "Error fetching products"});
    }
  }

  static async getProductById(req, res) {
    try {
      const {id} = req.params;
      const product = await getDocument("products", id);

      if (!product) {
        return res.status(404).json({error: "Product not found"});
      }

      const productWithTranslation = {
        ...product,
        statusTranslated: statusUtils.getTranslatedStatus(
          product.status,
          req.t
        ),
      };

      res.status(200).json({product: productWithTranslation});
    } catch (error) {
      res.status(500).json({error: "Error fetching product"});
    }
  }

  static async getProductByClient(req, res) {
    try {
      const {clientId} = req.params;
      const products = await getDocuments("products", {clientId});
      const translatedProducts = products.map((product) => ({
        ...product,
        statusTranslated: statusUtils.getTranslatedStatus(
          product.status,
          req.t
        ),
      }));

      res.status(200).json({clientId, products: translatedProducts});
    } catch (error) {
      res.status(500).json({error: "Error fetching products for client"});
    }
  }

  // UPDATE
  static async updateProduct(req, res) {
    try {
      const {id} = req.params;
      const updatedProduct = req.body;
      const product = await getDocument("products", id);
      if (!product) {
        return res.status(404).json({error: "Product not found"});
      }

      const productData = updatedProduct.product || updatedProduct;

      if (productData.status !== undefined) {
        productData.status = statusUtils.normalizeStatus(productData.status);
      }

      if (productData.price !== undefined) {
        const priceFloat = parseFloat(productData.price);
        if (isNaN(priceFloat)) {
          return res.status(400).json({error: "Price must be a valid number"});
        }
        productData.price = priceFloat;
      }

      const result = await updateDocument("products", id, productData);

      const resultWithTranslation = {
        ...result,
        statusTranslated: statusUtils.getTranslatedStatus(result.status, req.t),
      };

      res.status(200).json(resultWithTranslation);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({error: "Error updating product"});
    }
  }

  // STATS
  static async getProductStats(req, res) {
    try {
      const products = await getDocuments("products");
      
      if (!products || products.length === 0) {
        return res.status(200).json({
          success: true,
          stats: {
            totalProducts: 0,
            totalClients: 0,
            totalIncome: 0
          },
          generatedAt: new Date().toISOString()
        });
      }

      const totalProducts = products.length;
      const totalRevenue = products.reduce((sum, product) => sum + (product.price || 0), 0);
      const totalClients = products.reduce((sum, product) => sum + (product.noClients || 0), 0);

      const stats = {
        totalProducts,
        totalClients,
        totalIncome: Math.round(totalRevenue * 100) / 100
      };

      res.status(200).json({
        success: true,
        stats,
        generatedAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("Error fetching product stats:", error);
      res.status(500).json({ 
        success: false,
        error: "Error fetching product statistics" 
      });
    }
  }

}
module.exports = ProductController;
