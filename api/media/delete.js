/**
 * Media Delete API Endpoint
 * Handles secure file deletion from Cloudinary and database
 */

import { applyMiddleware } from "../utils/middleware.js";
import { requireAuth } from "../utils/auth.js";
import { validateMediaParam } from "../validators/mediaValidator.js";
import { MediaController } from "../controllers/mediaController.js";

async function handler(req, res) {
  const { method } = req;
  const { mediaId } = req.query;

  // Authentication required for deleting media
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to delete media",
    });
  }

  const userId = authResult.user.id;

  try {
    switch (method) {
      case "DELETE":
        return await handleDelete(req, res, userId);
      case "POST":
        return await handleBulkDelete(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          error: "Method not allowed",
          message: `${method} method is not supported for this endpoint`,
        });
    }
  } catch (error) {
    console.error("Media Delete API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * DELETE /api/media/delete?mediaId=123
 * Delete a single media file
 */
async function handleDelete(req, res, userId) {
  const { mediaId } = req.query;

  if (!mediaId) {
    return res.status(400).json({
      success: false,
      error: "Missing mediaId",
      message: "mediaId is required in query parameters",
    });
  }

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
    console.error("Single media delete error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete media",
      message: error.message,
    });
  }
}

/**
 * POST /api/media/delete
 * Bulk delete multiple media files
 */
async function handleBulkDelete(req, res, userId) {
  const { mediaIds } = req.body;

  if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid mediaIds",
      message: "mediaIds must be a non-empty array",
    });
  }

  if (mediaIds.length > 50) {
    return res.status(400).json({
      success: false,
      error: "Too many media files",
      message: "Maximum 50 media files can be deleted at once",
    });
  }

  try {
    const deleteResults = [];
    const errors = [];

    // Process deletions
    for (const mediaId of mediaIds) {
      try {
        const result = await MediaController.deleteMedia(mediaId, userId);

        if (result.success) {
          deleteResults.push({
            mediaId,
            success: true,
          });
        } else {
          errors.push({
            mediaId,
            error: result.error,
          });
        }
      } catch (error) {
        errors.push({
          mediaId,
          error: error.message,
        });
      }
    }

    return res.json({
      success: deleteResults.length > 0,
      data: {
        deleted: deleteResults,
        errors: errors,
        summary: {
          total: mediaIds.length,
          successful: deleteResults.length,
          failed: errors.length,
        },
      },
      message: `${deleteResults.length} media file(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk media delete error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to bulk delete media",
      message: error.message,
    });
  }
}

// Apply middleware and export
export default applyMiddleware(handler, {
  auth: false, // Authentication handled in handler
  rateLimiting: true,
  cors: true,
  compression: true,
});
