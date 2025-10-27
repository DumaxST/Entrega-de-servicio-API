const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument
} = require("../../ccFunctions");

class DeviceController {
    static async createDevice(req, res) {
        try {
            const device = req.body;

            if (!device.name || !device.type || !device.serialNumber) {
                return res.status(400).json({ 
                    error: "Missing required fields: name, type, and serialNumber are required" 
                });
            }

            const sanitizedDevice = {
                name: device.name.toLowerCase().trim(),
                type: device.type.toLowerCase().trim(),
                serialNumber: device.serialNumber.toUpperCase().trim(),
                model: device.model ? device.model.trim() : "",
                manufacturer: device.manufacturer ? device.manufacturer.toLowerCase().trim() : "",
                status: device.status ? device.status.toLowerCase().trim() : "active",
                firmwareVersion: device.firmwareVersion ? device.firmwareVersion.trim() : "",
                installationDate: device.installationDate || null,
                lastMaintenanceDate: device.lastMaintenanceDate || null,
                clientId: device.clientId ? device.clientId.trim() : null,
                unitId: device.unitId ? device.unitId.trim() : null,
                specifications: device.specifications || {},
                location: device.location ? device.location.trim() : "",
                notes: device.notes ? device.notes.trim() : ""
            };

            const newDevice = await createDocument("devices", sanitizedDevice);

            res.status(201).json({ 
                success: true,
                message: "Device created successfully",
                data: newDevice 
            });
        } catch (error) {
            console.error("Error creating device:", error);
            res.status(500).json({ 
                success: false,
                error: "Error creating device",
                details: error.message 
            });
        }
    }
    
    static async getAllDevices(req, res) {
        try {
            const devices = await getDocuments("devices");
            res.status(200).json({ 
                success: true,
                data: devices 
            });
        } catch (error) {
            console.error("Error fetching devices:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching devices" 
            });
        }
    }
    
    static async getDeviceById(req, res) {
        try {
            const { id } = req.params;
            const device = await getDocument("devices", id);

            if (!device) {
                return res.status(404).json({ 
                    success: false,
                    error: "Device not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: device 
            });
        } catch (error) {
            console.error("Error fetching device:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching device" 
            });
        }
    }

    static async getDevicesByClient(req, res) {
        try {
            const { clientId } = req.params;
            const devices = await getDocuments("devices", ["clientId", "==", clientId]);
            res.status(200).json({ 
                success: true,
                data: devices 
            });
        } catch (error) {
            console.error("Error fetching devices for client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching devices for client" 
            });
        }
    }

    static async getDevicesByType(req, res) {
        try {
            const { type } = req.params;
            const devices = await getDocuments("devices", ["type", "==", type.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: devices 
            });
        } catch (error) {
            console.error("Error fetching devices by type:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching devices by type" 
            });
        }
    }

    static async getDevicesByStatus(req, res) {
        try {
            const { status } = req.params;
            const devices = await getDocuments("devices", ["status", "==", status.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: devices 
            });
        } catch (error) {
            console.error("Error fetching devices by status:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching devices by status" 
            });
        }
    }
    
    static async updateDevice(req, res) {
        try {
            const { id } = req.params;
            const updatedDevice = req.body;
            
            const device = await getDocument("devices", id);
            if (!device) {
                return res.status(404).json({ 
                    success: false,
                    error: "Device not found" 
                });
            }

            const result = await updateDocument("devices", id, updatedDevice);
            res.status(200).json({ 
                success: true,
                message: "Device updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating device:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating device" 
            });
        }
    }

    static async deleteDevice(req, res) {
        try {
            const { id } = req.params;
            
            const device = await getDocument("devices", id);
            if (!device) {
                return res.status(404).json({ 
                    success: false,
                    error: "Device not found" 
                });
            }

            await deleteDocument("devices", id);
            res.status(200).json({ 
                success: true,
                message: "Device deleted successfully" 
            });
        } catch (error) {
            console.error("Error deleting device:", error);
            res.status(500).json({ 
                success: false,
                error: "Error deleting device" 
            });
        }
    }
}

module.exports = DeviceController;