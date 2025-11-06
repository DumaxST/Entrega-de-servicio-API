const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument
} = require("../../ccFunctions");

class UnitController {
    static async createUnit(req, res) {
        try {
            const unit = req.body;

            if (!unit.name || !unit.type) {
                return res.status(400).json({ 
                    error: "Missing required fields: name and type are required" 
                });
            }

            const sanitizedUnit = {
                name: unit.name.toLowerCase().trim(),
                type: unit.type.toLowerCase().trim(),
                status: unit.status ? unit.status.toLowerCase().trim() : "active",
                description: unit.description ? unit.description.toLowerCase().trim() : "",
                location: unit.location ? unit.location.trim() : "",
                clientId: unit.clientId ? unit.clientId.trim() : null,
                deviceId: unit.deviceId ? unit.deviceId.trim() : null,
                specifications: unit.specifications || {}
            };

            const newUnit = await createDocument("units", sanitizedUnit);

            res.status(201).json({ 
                success: true,
                message: "Unit created successfully",
                data: newUnit 
            });
        } catch (error) {
            console.error("Error creating unit:", error);
            res.status(500).json({ 
                success: false,
                error: "Error creating unit",
                details: error.message 
            });
        }
    }
    
    static async getAllUnits(req, res) {
        try {
            const units = await getDocuments("units");
            res.status(200).json({ 
                success: true,
                data: units 
            });
        } catch (error) {
            console.error("Error fetching units:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching units" 
            });
        }
    }
    
    static async getUnitById(req, res) {
        try {
            const { id } = req.params;
            const unit = await getDocument("units", id);

            if (!unit) {
                return res.status(404).json({ 
                    success: false,
                    error: "Unit not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: unit 
            });
        } catch (error) {
            console.error("Error fetching unit:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching unit" 
            });
        }
    }

    static async getUnitsByClient(req, res) {
        try {
            const { clientId } = req.params;
            const units = await getDocuments("units", ["clientId", "==", clientId]);
            res.status(200).json({ 
                success: true,
                data: units 
            });
        } catch (error) {
            console.error("Error fetching units for client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching units for client" 
            });
        }
    }
    
    static async updateUnit(req, res) {
        try {
            const { id } = req.params;
            const updatedUnit = req.body;
            
            const unit = await getDocument("units", id);
            if (!unit) {
                return res.status(404).json({ 
                    success: false,
                    error: "Unit not found" 
                });
            }

            const result = await updateDocument("units", id, updatedUnit);
            res.status(200).json({ 
                success: true,
                message: "Unit updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating unit:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating unit" 
            });
        }
    }

    static async deleteUnit(req, res) {
        try {
            const { id } = req.params;
            
            const unit = await getDocument("units", id);
            if (!unit) {
                return res.status(404).json({ 
                    success: false,
                    error: "Unit not found" 
                });
            }

            await deleteDocument("units", id);
            res.status(200).json({ 
                success: true,
                message: "Unit deleted successfully" 
            });
        } catch (error) {
            console.error("Error deleting unit:", error);
            res.status(500).json({ 
                success: false,
                error: "Error deleting unit" 
            });
        }
    }
}

module.exports = UnitController;