const { Router } = require("express");
const fileUpload = require('express-fileupload');
const UploadController = require('./uploadController');

const uploadRouter = Router();

// Configure file upload middleware
uploadRouter.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  responseOnLimit: "File size limit exceeded"
}));

// Upload product image
uploadRouter.post(
  "/upload-product-image",
  UploadController.uploadProductImage
);

// Delete product image
uploadRouter.delete(
  "/user/:userId/image",
  UploadController.deleteProductImage
);

// List user images
uploadRouter.get(
  "/user/:userId/images",
  UploadController.listUserImages
);

module.exports = { uploadRouter };