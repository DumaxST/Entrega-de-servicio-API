const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument
} = require("../../ccFunctions");

class ProductController {
    static async createProduct(req, res) {
        try {
            const product = req.body;

            if (!product.name || !product.price || product.noClients === undefined) {
                return res.status(400).json({ 
                    error: "Missing required fields: name, price, and noClients are required" 
                });
            }

            const sanitizedProduct = {
                name: product.name.toLowerCase().trim(),
                noClients: parseInt(product.noClients),
                status: product.status ? product.status.toLowerCase().trim() : "active",
                price: parseFloat(product.price),
                apiKey: product.apiKey ? product.apiKey.trim() : "",
                description: product.description ? product.description.toLowerCase().trim() : "",
            };

            // Validate price and noClients are valid numbers
            if (isNaN(sanitizedProduct.price)) {
                return res.status(400).json({ 
                    error: "Price must be a valid number" 
                });
            }

            if (isNaN(sanitizedProduct.noClients)) {
                return res.status(400).json({ 
                    error: "noClients must be a valid number" 
                });
            }

            const newProduct = await createDocument("products", sanitizedProduct);
            console.log("Product created:", newProduct);

            res.status(201).json({ 
                success: true,
                message: "Product created successfully",
                data: newProduct 
            });
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ 
                success: false,
                error: "Error creating product",
                details: error.message 
            });
        }
    }
    
    // READ
    static async getAllProducts(req, res) {
        try {
            const products = await getDocuments("products");
            console.log(products)
            res.status(200).json({ products });
        } catch (error) {
            res.status(500).json({ error: "Error fetching products" });
        }
    }
    
    static async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await getDocument("products", id);

            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }

            res.status(200).json({ product });

        } catch (error) {

            res.status(500).json({ error: "Error fetching product" });

        }
    }

    static async getProductByClient(req, res) {
        try {
            const { clientId } = req.params;
            const products = await getDocuments("products", { clientId });
            res.status(200).json({ clientId, products });
        } catch (error) {
            res.status(500).json({ error: "Error fetching products for client" });
        }
    }
    
    // UPDATE
    static async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const updatedProduct = req.body;
            const product = await getDocument("products", id);
            if (!product) {
                return res.status(404).json({ error: "Product not found" });
            }
            const result = await updateDocument("products", id, updatedProduct);
            res.status(200).json({ id, ...result });
        } catch (error) {
            res.status(500).json({ error: "Error updating product" });
        }
    }
}
module.exports = ProductController;