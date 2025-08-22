const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument
} = require("../../ccFunctions");

class ProductController {
    static async createProduct(req, res) {
        try {
            const {product} = req.body;
            const sanitizedProduct = {
                name: product.name.toLowerCase().trim(),
                noClients: product.noClients,
                status: product.status.toLowerCase().trim(),
                price: product.price,
                apiKey: product.apiKey.trim(),
                description: product.description.toLowerCase().trim(),
            };
            const  newProduct =  await createDocument("products", sanitizedProduct);

            res.status(201).json({ newProduct } 
);
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ error: "Error creating product" });
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