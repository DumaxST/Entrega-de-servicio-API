const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument
} = require("../../ccFunctions");

class ClientController {
    static async createClient(req, res) {
        try {
            const client = req.body;

            if (!client.name || !client.email) {
                return res.status(400).json({ 
                    error: "Missing required fields: name and email are required" 
                });
            }

            const sanitizedClient = {
                name: client.name.toLowerCase().trim(),
                email: client.email.toLowerCase().trim(),
                phone: client.phone ? client.phone.trim() : "",
                address: client.address ? client.address.trim() : "",
                status: client.status ? client.status.toLowerCase().trim() : "active",
                contactPerson: client.contactPerson ? client.contactPerson.trim() : "",
                businessType: client.businessType ? client.businessType.toLowerCase().trim() : "",
                taxId: client.taxId ? client.taxId.trim() : "",
                notes: client.notes ? client.notes.trim() : ""
            };

            const newClient = await createDocument("clients", sanitizedClient);

            res.status(201).json({ 
                success: true,
                message: "Client created successfully",
                data: newClient 
            });
        } catch (error) {
            console.error("Error creating client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error creating client",
                details: error.message 
            });
        }
    }
    
    static async getAllClients(req, res) {
        try {
            const clients = await getDocuments("clients");
            res.status(200).json({ 
                success: true,
                data: clients 
            });
        } catch (error) {
            console.error("Error fetching clients:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching clients" 
            });
        }
    }
    
    static async getClientById(req, res) {
        try {
            const { id } = req.params;
            const client = await getDocument("clients", id);

            if (!client) {
                return res.status(404).json({ 
                    success: false,
                    error: "Client not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: client 
            });
        } catch (error) {
            console.error("Error fetching client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching client" 
            });
        }
    }

    static async getClientsByStatus(req, res) {
        try {
            const { status } = req.params;
            const clients = await getDocuments("clients", ["status", "==", status.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: clients 
            });
        } catch (error) {
            console.error("Error fetching clients by status:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching clients by status" 
            });
        }
    }
    
    static async updateClient(req, res) {
        try {
            const { id } = req.params;
            const updatedClient = req.body;
            
            const client = await getDocument("clients", id);
            if (!client) {
                return res.status(404).json({ 
                    success: false,
                    error: "Client not found" 
                });
            }

            const result = await updateDocument("clients", id, updatedClient);
            res.status(200).json({ 
                success: true,
                message: "Client updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating client" 
            });
        }
    }

    static async deleteClient(req, res) {
        try {
            const { id } = req.params;
            
            const client = await getDocument("clients", id);
            if (!client) {
                return res.status(404).json({ 
                    success: false,
                    error: "Client not found" 
                });
            }

            await deleteDocument("clients", id);
            res.status(200).json({ 
                success: true,
                message: "Client deleted successfully" 
            });
        } catch (error) {
            console.error("Error deleting client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error deleting client" 
            });
        }
    }
}

module.exports = ClientController;