/**
 * Media Gallery API Endpoint
 * Handles media file listing, filtering, and management
 */

import { applyMiddleware } from "../utils/middleware.js";
import { requireAuth } from "../utils/auth.js";
import {
  validateMediaQuery,
  validateMediaParam,
  validateMediaUpdate,
} from "../validators/mediaValidator.js";
import { MediaController } from "../controllers/mediaController.js";

async function handler(req, res) {
  const { method } = req;
  const { mediaId } = req.query;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "PUT":
        return await handlePut(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: "Method not allowed",
          message: `${method} method is not supported for this endpoint`,
        });
    }
  } catch (error) {
    console.error("Media Gallery API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/media/gallery
 * GET /api/media/gallery?mediaId=123
 * Get media gallery or specific media file
 */
async function handleGet(req, res) {
  const {
    mediaId,
    resourceType,
    folder,
    tags,
    limit = "50",
    offset = "0",
    sortBy = "created_at",
    sortOrder = "desc",
  } = req.query;

  // Validate query parameters
  const validationErrors = [];
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    validationErrors.push("Limit must be between 1 and 100");
  }
  if (offset && (isNaN(offset) || parseInt(offset) < 0)) {
    validationErrors.push("Offset must be a non-negative integer");
  }
  if (
    resourceType &&
    !["image", "video", "document", "raw"].includes(resourceType)
  ) {
    validationErrors.push(
      "Resource type must be one of: image, video, document, raw"
    );
  }

  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: validationErrors.map((error) => ({ message: error })),
    });
  }

  try {
    if (mediaId) {
      // Get specific media file
      const result = await MediaController.getMediaById(mediaId);

      if (!result.success) {
        const statusCode = result.statusCode || 500;
        return res.status(statusCode).json({
          success: false,
          error: result.error,
          message: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } else {
      // Get media gallery
      const result = await MediaController.getMediaGallery({
        folder,
        resourceType,
        tags,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
          message: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    }
  } catch (error) {
    console.error("GET media gallery error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve media",
      message: error.message,
    });
  }
}

/**
 * PUT /api/media/gallery?mediaId=123
 * Update media metadata
 */
async function handlePut(req, res) {
  // Authentication required for updating media
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to update media",
    });
  }

  const { mediaId } = req.query;
  if (!mediaId) {
    return res.status(400).json({
      success: false,
      error: "Missing mediaId",
      message: "mediaId is required in query parameters",
    });
  }

  const userId = authResult.user.id;

  try {
    const result = await MediaController.updateMedia(mediaId, req.body, userId);

    if (!result.success) {
      const statusCode = result.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.error,
      });
    }

    return res.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("PUT media error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update media",
      message: error.message,
    });
  }
}

/**
 * DELETE /api/media/gallery?mediaId=123
 * Delete media file
 */
async function handleDelete(req, res) {
  // Authentication required for deleting media
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to delete media",
    });
  }

  const { mediaId } = req.query;
  if (!mediaId) {
    return res.status(400).json({
      success: false,
      error: "Missing mediaId",
      message: "mediaId is required in query parameters",
    });
  }

  const userId = authResult.user.id;

  try {
    const result = await MediaController.deleteMedia(mediaId, userId);

    if (!result.success) {
      const statusCode = result.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.error,
      });
    }

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("DELETE media error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete media",
      message: error.message,
    });
  }
}

// Apply middleware and export
export default applyMiddleware(handler, {
  auth: false, // Authentication handled per method
  rateLimiting: true,
  cors: true,
  compression: true,
});
