const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument
} = require("../../ccFunctions");

class UserController {
    static async createUser(req, res) {
        try {
            const user = req.body;

            if (!user.email || !user.firstName || !user.lastName || !user.role) {
                return res.status(400).json({ 
                    error: "Missing required fields: email, firstName, lastName, and role are required" 
                });
            }

            const sanitizedUser = {
                email: user.email.toLowerCase().trim(),
                firstName: user.firstName.trim(),
                lastName: user.lastName.trim(),
                role: user.role.toLowerCase().trim(),
                status: user.status ? user.status.toLowerCase().trim() : "active",
                phone: user.phone ? user.phone.trim() : "",
                department: user.department ? user.department.toLowerCase().trim() : "",
                position: user.position ? user.position.trim() : "",
                permissions: user.permissions || [],
                lastLogin: user.lastLogin || null,
                profilePicture: user.profilePicture ? user.profilePicture.trim() : "",
                preferences: user.preferences || {},
                clientId: user.clientId ? user.clientId.trim() : null,
                isEmailVerified: user.isEmailVerified || false,
                notes: user.notes ? user.notes.trim() : ""
            };

            const newUser = await createDocument("users", sanitizedUser);

            res.status(201).json({ 
                success: true,
                message: "User created successfully",
                data: newUser 
            });
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ 
                success: false,
                error: "Error creating user",
                details: error.message 
            });
        }
    }
    
    static async getAllUsers(req, res) {
        try {
            const users = await getDocuments("users");
            res.status(200).json({ 
                success: true,
                data: users 
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching users" 
            });
        }
    }
    
    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await getDocument("users", id);

            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    error: "User not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: user 
            });
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching user" 
            });
        }
    }

    static async getUserByEmail(req, res) {
        try {
            const { email } = req.params;
            const users = await getDocuments("users", ["email", "==", email.toLowerCase()]);
            
            if (users.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: "User not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: users[0] 
            });
        } catch (error) {
            console.error("Error fetching user by email:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching user by email" 
            });
        }
    }

    static async getUsersByRole(req, res) {
        try {
            const { role } = req.params;
            const users = await getDocuments("users", ["role", "==", role.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: users 
            });
        } catch (error) {
            console.error("Error fetching users by role:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching users by role" 
            });
        }
    }

    static async getUsersByStatus(req, res) {
        try {
            const { status } = req.params;
            const users = await getDocuments("users", ["status", "==", status.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: users 
            });
        } catch (error) {
            console.error("Error fetching users by status:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching users by status" 
            });
        }
    }

    static async getUsersByClient(req, res) {
        try {
            const { clientId } = req.params;
            const users = await getDocuments("users", ["clientId", "==", clientId]);
            res.status(200).json({ 
                success: true,
                data: users 
            });
        } catch (error) {
            console.error("Error fetching users by client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching users by client" 
            });
        }
    }

    static async getUsersByDepartment(req, res) {
        try {
            const { department } = req.params;
            const users = await getDocuments("users", ["department", "==", department.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: users 
            });
        } catch (error) {
            console.error("Error fetching users by department:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching users by department" 
            });
        }
    }
    
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updatedUser = req.body;
            
            const user = await getDocument("users", id);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    error: "User not found" 
                });
            }

            const result = await updateDocument("users", id, updatedUser);
            res.status(200).json({ 
                success: true,
                message: "User updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating user" 
            });
        }
    }

    static async updateUserPermissions(req, res) {
        try {
            const { id } = req.params;
            const { permissions } = req.body;
            
            if (!Array.isArray(permissions)) {
                return res.status(400).json({ 
                    error: "Permissions must be an array" 
                });
            }

            const user = await getDocument("users", id);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    error: "User not found" 
                });
            }

            const result = await updateDocument("users", id, { permissions });
            res.status(200).json({ 
                success: true,
                message: "User permissions updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating user permissions:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating user permissions" 
            });
        }
    }

    static async updateLastLogin(req, res) {
        try {
            const { id } = req.params;
            
            const user = await getDocument("users", id);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    error: "User not found" 
                });
            }

            const result = await updateDocument("users", id, { 
                lastLogin: new Date().toISOString() 
            });
            res.status(200).json({ 
                success: true,
                message: "Last login updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating last login:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating last login" 
            });
        }
    }

    static async deleteUser(req, res) {
        try {
            const { id } = req.params;
            
            const user = await getDocument("users", id);
            if (!user) {
                return res.status(404).json({ 
                    success: false,
                    error: "User not found" 
                });
            }

            await deleteDocument("users", id);
            res.status(200).json({ 
                success: true,
                message: "User deleted successfully" 
            });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ 
                success: false,
                error: "Error deleting user" 
            });
        }
    }
}

module.exports = UserController;