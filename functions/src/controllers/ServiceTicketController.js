const { 
    createDocument, 
    getDocument,
    getDocuments,
    updateDocument,
    deleteDocument
} = require("../../ccFunctions");

class ServiceTicketController {
    static async createServiceTicket(req, res) {
        try {
            const ticket = req.body;

            if (!ticket.title || !ticket.description || !ticket.priority || !ticket.clientId) {
                return res.status(400).json({ 
                    error: "Missing required fields: title, description, priority, and clientId are required" 
                });
            }

            const sanitizedTicket = {
                title: ticket.title.trim(),
                description: ticket.description.trim(),
                priority: ticket.priority.toLowerCase().trim(),
                status: ticket.status ? ticket.status.toLowerCase().trim() : "open",
                type: ticket.type ? ticket.type.toLowerCase().trim() : "general",
                clientId: ticket.clientId.trim(),
                deviceId: ticket.deviceId ? ticket.deviceId.trim() : null,
                unitId: ticket.unitId ? ticket.unitId.trim() : null,
                assignedTo: ticket.assignedTo ? ticket.assignedTo.trim() : null,
                createdBy: ticket.createdBy ? ticket.createdBy.trim() : null,
                dueDate: ticket.dueDate || null,
                resolvedDate: ticket.resolvedDate || null,
                estimatedHours: ticket.estimatedHours ? parseFloat(ticket.estimatedHours) : 0,
                actualHours: ticket.actualHours ? parseFloat(ticket.actualHours) : 0,
                tags: ticket.tags || [],
                attachments: ticket.attachments || [],
                comments: ticket.comments || [],
                resolution: ticket.resolution ? ticket.resolution.trim() : ""
            };

            if (isNaN(sanitizedTicket.estimatedHours) || isNaN(sanitizedTicket.actualHours)) {
                return res.status(400).json({ 
                    error: "estimatedHours and actualHours must be valid numbers" 
                });
            }

            const newTicket = await createDocument("serviceTickets", sanitizedTicket);

            res.status(201).json({ 
                success: true,
                message: "Service ticket created successfully",
                data: newTicket 
            });
        } catch (error) {
            console.error("Error creating service ticket:", error);
            res.status(500).json({ 
                success: false,
                error: "Error creating service ticket",
                details: error.message 
            });
        }
    }
    
    static async getAllServiceTickets(req, res) {
        try {
            const tickets = await getDocuments("serviceTickets");
            res.status(200).json({ 
                success: true,
                data: tickets 
            });
        } catch (error) {
            console.error("Error fetching service tickets:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching service tickets" 
            });
        }
    }
    
    static async getServiceTicketById(req, res) {
        try {
            const { id } = req.params;
            const ticket = await getDocument("serviceTickets", id);

            if (!ticket) {
                return res.status(404).json({ 
                    success: false,
                    error: "Service ticket not found" 
                });
            }

            res.status(200).json({ 
                success: true,
                data: ticket 
            });
        } catch (error) {
            console.error("Error fetching service ticket:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching service ticket" 
            });
        }
    }

    static async getServiceTicketsByClient(req, res) {
        try {
            const { clientId } = req.params;
            const tickets = await getDocuments("serviceTickets", ["clientId", "==", clientId]);
            res.status(200).json({ 
                success: true,
                data: tickets 
            });
        } catch (error) {
            console.error("Error fetching service tickets for client:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching service tickets for client" 
            });
        }
    }

    static async getServiceTicketsByStatus(req, res) {
        try {
            const { status } = req.params;
            const tickets = await getDocuments("serviceTickets", ["status", "==", status.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: tickets 
            });
        } catch (error) {
            console.error("Error fetching service tickets by status:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching service tickets by status" 
            });
        }
    }

    static async getServiceTicketsByPriority(req, res) {
        try {
            const { priority } = req.params;
            const tickets = await getDocuments("serviceTickets", ["priority", "==", priority.toLowerCase()]);
            res.status(200).json({ 
                success: true,
                data: tickets 
            });
        } catch (error) {
            console.error("Error fetching service tickets by priority:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching service tickets by priority" 
            });
        }
    }

    static async getServiceTicketsByAssignee(req, res) {
        try {
            const { assignedTo } = req.params;
            const tickets = await getDocuments("serviceTickets", ["assignedTo", "==", assignedTo]);
            res.status(200).json({ 
                success: true,
                data: tickets 
            });
        } catch (error) {
            console.error("Error fetching service tickets by assignee:", error);
            res.status(500).json({ 
                success: false,
                error: "Error fetching service tickets by assignee" 
            });
        }
    }
    
    static async updateServiceTicket(req, res) {
        try {
            const { id } = req.params;
            const updatedTicket = req.body;
            
            const ticket = await getDocument("serviceTickets", id);
            if (!ticket) {
                return res.status(404).json({ 
                    success: false,
                    error: "Service ticket not found" 
                });
            }

            const result = await updateDocument("serviceTickets", id, updatedTicket);
            res.status(200).json({ 
                success: true,
                message: "Service ticket updated successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error updating service ticket:", error);
            res.status(500).json({ 
                success: false,
                error: "Error updating service ticket" 
            });
        }
    }

    static async deleteServiceTicket(req, res) {
        try {
            const { id } = req.params;
            
            const ticket = await getDocument("serviceTickets", id);
            if (!ticket) {
                return res.status(404).json({ 
                    success: false,
                    error: "Service ticket not found" 
                });
            }

            await deleteDocument("serviceTickets", id);
            res.status(200).json({ 
                success: true,
                message: "Service ticket deleted successfully" 
            });
        } catch (error) {
            console.error("Error deleting service ticket:", error);
            res.status(500).json({ 
                success: false,
                error: "Error deleting service ticket" 
            });
        }
    }

    static async addComment(req, res) {
        try {
            const { id } = req.params;
            const { comment, authorId, authorName } = req.body;
            
            if (!comment || !authorId) {
                return res.status(400).json({ 
                    error: "Comment and authorId are required" 
                });
            }

            const ticket = await getDocument("serviceTickets", id);
            if (!ticket) {
                return res.status(404).json({ 
                    success: false,
                    error: "Service ticket not found" 
                });
            }

            const newComment = {
                id: Date.now().toString(),
                comment: comment.trim(),
                authorId: authorId.trim(),
                authorName: authorName ? authorName.trim() : "",
                createdAt: new Date().toISOString()
            };

            const updatedComments = [...(ticket.comments || []), newComment];
            
            const result = await updateDocument("serviceTickets", id, { comments: updatedComments });
            res.status(200).json({ 
                success: true,
                message: "Comment added successfully",
                data: result 
            });
        } catch (error) {
            console.error("Error adding comment:", error);
            res.status(500).json({ 
                success: false,
                error: "Error adding comment" 
            });
        }
    }
}

module.exports = ServiceTicketController;