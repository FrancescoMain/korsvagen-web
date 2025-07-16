/**
 * Media Upload API Endpoint
 * Comprehensive file upload with Cloudinary integration and validation
 */

import { applyMiddleware } from "../utils/middleware.js";
import { requireAuth } from "../utils/auth.js";
import {
  validateMediaUpload,
  multerConfig,
  validateFileType,
  validateFileSize,
} from "../validators/mediaValidator.js";
import { MediaController } from "../controllers/mediaController.js";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      message: "Only POST method is supported for file uploads",
    });
  }

  // Authentication required for uploads
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to upload files",
    });
  }

  const userId = authResult.user.id;

  // Handle file upload with multer
  multerConfig.array("files", 10)(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        error:
          err.code === "LIMIT_FILE_SIZE"
            ? "File size exceeds limit"
            : err.message,
        message: "File upload failed",
      });
    }

    try {
      const files = req.files;
      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files provided",
          message: "Please select files to upload",
        });
      }

      // Validate files before processing
      const fileValidationErrors = [];
      for (const file of files) {
        const sizeValidation = validateFileSize(file);
        if (!sizeValidation.valid) {
          fileValidationErrors.push({
            filename: file.originalname,
            error: sizeValidation.error,
          });
        }
      }

      if (fileValidationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: "File validation failed",
          details: fileValidationErrors,
        });
      }

      // Extract upload configuration from request body
      const uploadConfig = {
        folder: req.body.folder || "uploads",
        tags: req.body.tags
          ? req.body.tags.split(",").map((tag) => tag.trim())
          : [],
        altText: req.body.altText || "",
        quality: req.body.quality ? parseInt(req.body.quality) : 85,
        transformation: {
          quality: req.body.quality ? parseInt(req.body.quality) : 85,
          format: req.body.format || "auto",
        },
      };

      // Upload files using MediaController
      const result = await MediaController.uploadMedia(
        files,
        uploadConfig,
        userId
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          message: result.error,
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        message: result.message,
      });
    } catch (error) {
      console.error("Upload processing error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to process uploads",
        message: error.message,
      });
    }
  });
}

// Apply middleware and export
export default applyMiddleware(handler, {
  auth: false, // Authentication handled in handler
  rateLimiting: true,
  cors: true,
  compression: false, // Don't compress file uploads
});
