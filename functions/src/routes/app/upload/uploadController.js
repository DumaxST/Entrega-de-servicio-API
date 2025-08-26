const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

class UploadController {
  static async uploadProductImage(req, res) {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const file = req.files.file;
      const { userId, productId, folder = 'product' } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      if (!productId) {
        return res.status(400).json({
          success: false,
          error: 'Product ID is required'
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed'
        });
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size is 5MB'
        });
      }

      // Initialize Firebase Storage
      const bucket = admin.storage().bucket();

      // Generate unique filename with productImageId
      const fileExtension = file.name.split('.').pop();
      const productImageId = uuidv4();
      const fileName = `${productImageId}.${fileExtension}`;
      const filePath = `${userId}/${productId}/${fileName}`;

      // Create a file reference
      const fileRef = bucket.file(filePath);

      // Upload the file
      await fileRef.save(file.data, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            originalName: file.name,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          }
        },
        public: true // Make the file publicly accessible
      });

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: publicUrl,
        fileName: fileName,
        filePath: filePath,
        productImageId: productImageId
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to upload image',
        details: error.message
      });
    }
  }

  static async deleteProductImage(req, res) {
    try {
      const { filePath } = req.body;
      const { userId } = req.params;

      if (!filePath || !userId) {
        return res.status(400).json({
          success: false,
          error: 'File path and user ID are required'
        });
      }

      // Verify that the file path belongs to the user (security check)
      if (!filePath.startsWith(`${userId}/`)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only delete your own files'
        });
      }

      // Initialize Firebase Storage
      const bucket = admin.storage().bucket();
      const fileRef = bucket.file(filePath);

      // Check if file exists
      const [exists] = await fileRef.exists();
      if (!exists) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // Delete the file
      await fileRef.delete();

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully',
        deletedPath: filePath
      });

    } catch (error) {
      console.error('Error deleting image:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete image',
        details: error.message
      });
    }
  }

  static async listUserImages(req, res) {
    try {
      const { userId } = req.params;
      const { productId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Initialize Firebase Storage
      const bucket = admin.storage().bucket();
      const prefix = productId ? `${userId}/${productId}/` : `${userId}/`;

      // List files with the prefix
      const [files] = await bucket.getFiles({ prefix });

      const imageList = await Promise.all(
        files.map(async (file) => {
          const [metadata] = await file.getMetadata();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
          
          return {
            fileName: file.name.split('/').pop(),
            filePath: file.name,
            publicUrl: publicUrl,
            contentType: metadata.contentType,
            size: metadata.size,
            created: metadata.timeCreated,
            updated: metadata.updated
          };
        })
      );

      res.status(200).json({
        success: true,
        images: imageList,
        total: imageList.length
      });

    } catch (error) {
      console.error('Error listing images:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list images',
        details: error.message
      });
    }
  }
}

module.exports = UploadController;