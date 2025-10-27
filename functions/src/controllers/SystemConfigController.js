const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument
} = require("../../ccFunctions");

class SystemConfigController {
    static async createSystemConfig(req, res) {
        try {
            const config = req.body;

            if (!config.key || !config.category) {
                return res.status(400).json({ 
                    error: "Missing required fields: key and category are required" 
                });
            }

            const sanitizedConfig = {
                key: config.key.toLowerCase().trim(),
                value: config.value || "",
                category: config.category.toLowerCase().trim(),
                description: config.description ? config.description.trim() : "",
                dataType: config.dataType ? config.dataType.toLowerCase().trim() : "string",
                isEncrypted: config.isEncrypted || false,
                isPublic: config.isPublic || false,
                isRequired: config.isRequired || false,
                defaultValue: config.defaultValue || null,
                validationRules: config.validationRules || {},
                tags: config.tags || [],
                lastModifiedBy: config.lastModifiedBy ? config.lastModifiedBy.trim() : null,
                environment: config.environment ? config.environment.toLowerCase().trim() : "production"
            };

            const newConfig = await createDocument("systemConfig", sanitizedConfig);

            res.status(201).json({ 
                success: true,
                message: "System configuration created successfully",
                data: newConfig 
            });
        } catch (error) {
            console.error("Error creating system configuration:", error);
            res.status(500).json({ 
                success: false,
                error: "Error creating system configuration",
                details: error.message 
            });
        }
    }
    
    static async getAllSystemConfigs(req, res) {
        try {
            const configs = await getDocuments("systemConfig");
            res.status(200).json({ 
                success: true,
                data: configs 
            });
        } catch (error) {
            console.error("Error fetching system configurations:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching system configurations" 
            });
        }
    }

    static async getPublicSystemConfigs(req, res) {
        try {
            const configs = await getDocuments("systemConfig", ["isPublic", "==", true]);
            res.status(200).json({ 
                success: true,
                data: configs 
            });
        } catch (error) {
            console.error("Error fetching public system configurations:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching public system configurations" 
            });
        }
    }
    
    static async getSystemConfigById(req, res) {
        try {
            const { id } = req.params;
            const config = await getDocument("systemConfig", id);

            if (!config) {
                return res.status(404).json({ 
                    success: false,
                    error: "System configuration not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: config 
            });
        } catch (error) {
            console.error("Error fetching system configuration:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching system configuration" 
            });
        }
    }

    static async getSystemConfigByKey(req, res) {
        try {
            const { key } = req.params;
            const configs = await getDocuments("systemConfig", ["key", "==", key.toLowerCase()]);
            
            if (configs.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: "System configuration not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: configs[0] 
            });
        } catch (error) {
            console.error("Error fetching system configuration by key:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching system configuration by key" 
            });
        }
    }

    static async getSystemConfigsByCategory(req, res) {
        try {
            const { category } = req.params;
            const configs = await getDocuments("systemConfig", ["category", "==", category.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: configs 
            });
        } catch (error) {
            console.error("Error fetching system configurations by category:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching system configurations by category" 
            });
        }
    }

    static async getSystemConfigsByEnvironment(req, res) {
        try {
            const { environment } = req.params;
            const configs = await getDocuments("systemConfig", ["environment", "==", environment.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: configs 
            });
        } catch (error) {
            console.error("Error fetching system configurations by environment:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching system configurations by environment" 
            });
        }
    }

    static async getRequiredSystemConfigs(req, res) {
        try {
            const configs = await getDocuments("systemConfig", ["isRequired", "==", true]);
            res.status(200).json({ 
                success: true,
                data: configs 
            });
        } catch (error) {
            console.error("Error fetching required system configurations:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching required system configurations" 
            });
        }
    }
    
    static async updateSystemConfig(req, res) {
        try {
            const { id } = req.params;
            const updatedConfig = req.body;
            
            const config = await getDocument("systemConfig", id);
            if (!config) {
                return res.status(404).json({ 
                    success: false,
                    error: "System configuration not found" 
                });
            }

            if (updatedConfig.lastModifiedBy) {
                updatedConfig.lastModifiedBy = updatedConfig.lastModifiedBy.trim();
            }

            const result = await updateDocument("systemConfig", id, updatedConfig);
            res.status(200).json({ 
                success: true,
                message: "System configuration updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating system configuration:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating system configuration" 
            });
        }
    }

    static async updateSystemConfigValue(req, res) {
        try {
            const { id } = req.params;
            const { value, lastModifiedBy } = req.body;
            
            const config = await getDocument("systemConfig", id);
            if (!config) {
                return res.status(404).json({ 
                    success: false,
                    error: "System configuration not found" 
                });
            }

            const updateData = { value };
            if (lastModifiedBy) {
                updateData.lastModifiedBy = lastModifiedBy.trim();
            }

            const result = await updateDocument("systemConfig", id, updateData);
            res.status(200).json({ 
                success: true,
                message: "System configuration value updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating system configuration value:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating system configuration value" 
            });
        }
    }

    static async deleteSystemConfig(req, res) {
        try {
            const { id } = req.params;
            
            const config = await getDocument("systemConfig", id);
            if (!config) {
                return res.status(404).json({ 
                    success: false,
                    error: "System configuration not found" 
                });
            }

            if (config.isRequired) {
                return res.status(400).json({ 
                    success: false,
                    error: "Cannot delete required system configuration" 
                });
            }

            await deleteDocument("systemConfig", id);
            res.status(200).json({ 
                success: true,
                message: "System configuration deleted successfully" 
            });
        } catch (error) {
            console.error("Error deleting system configuration:", error);
            res.status(500).json({ 
                success: false,
                error: "Error deleting system configuration" 
            });
        }
    }

    static async bulkUpdateSystemConfigs(req, res) {
        try {
            const { configs, lastModifiedBy } = req.body;
            
            if (!Array.isArray(configs) || configs.length === 0) {
                return res.status(400).json({ 
                    error: "configs must be a non-empty array" 
                });
            }

            const results = [];
            const errors = [];

            for (const configUpdate of configs) {
                try {
                    const { id, ...updateData } = configUpdate;
                    
                    if (lastModifiedBy) {
                        updateData.lastModifiedBy = lastModifiedBy.trim();
                    }

                    const config = await getDocument("systemConfig", id);
                    if (!config) {
                        errors.push({ id, error: "Configuration not found" });
                        continue;
                    }

                    const result = await updateDocument("systemConfig", id, updateData);
                    results.push({ id, data: result });
                } catch (error) {
                    errors.push({ id: configUpdate.id, error: error.message });
                }
            }

            res.status(200).json({ 
                success: true,
                message: "Bulk update completed",
                results,
                errors
            });
        } catch (error) {
            console.error("Error in bulk update:", error);
            res.status(500).json({ 
                success: false,
                error: "Error in bulk update" 
            });
        }
    }
}

module.exports = SystemConfigController;