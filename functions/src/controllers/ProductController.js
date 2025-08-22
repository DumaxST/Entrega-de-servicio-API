const { createDocument } = require("../../ccFunctions");

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
    static getAllProducts(req, res) {
        res.json([
            { id: 1, name: "Wialon" },
            { id: 2, name: "Mapon" },
        ]);
    }
    
    static getProductById(req, res) {
        const { id } = req.params;
        res.json({ id, name: `Product ${id}` });
    }
    
    static getProductByClient(req, res) {
        const { clientId } = req.params;
        res.json({ 
            clientId, 
            products: [`Product 1 for Client ${clientId}`, `Product 2 for Client ${clientId}`] 
        });
    }

    // UPDATE
    static updateProduct(req, res) {
        const { id } = req.params;
        const updatedProduct = req.body;
        res.json({ id, ...updatedProduct });
    }
}
module.exports = ProductController;