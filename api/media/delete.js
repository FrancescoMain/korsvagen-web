/**
 * Media Delete API Endpoint
 * Handles secure file deletion from Cloudinary and database
 */

import { Media } from "../models/Media.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";
import { applyMiddleware } from "../utils/middleware.js";
import { validateRequest, deleteMediaValidation } from "../utils/validation.js";

async function handler(req, res) {
  if (req.method === "DELETE") {
    try {
      // Validate request
      const validation = validateRequest(req.body, deleteMediaValidation);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const { mediaId, deleteFromCloud = true } = req.body;

      // Get media record
      const mediaResult = await Media.findById(mediaId);

      if (!mediaResult.success || !mediaResult.data) {
        return res.status(404).json({
          success: false,
          error: "Media not found",
        });
      }

      const media = mediaResult.data;

      // Delete from database and optionally from Cloudinary
      const deleteResult = await Media.delete(mediaId, deleteFromCloud);

      if (!deleteResult.success) {
        return res.status(500).json({
          success: false,
          error: deleteResult.error,
        });
      }

      res.json({
        success: true,
        message: "Media deleted successfully",
        data: {
          deletedMedia: media,
          deletedFromCloud: deleteFromCloud,
        },
      });
    } catch (error) {
      console.error("Delete media error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete media",
      });
    }
  } else if (req.method === "POST") {
    // Bulk delete
    try {
      const { mediaIds, deleteFromCloud = true } = req.body;

      if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "mediaIds must be a non-empty array",
        });
      }

      const deleteResults = [];

      for (const mediaId of mediaIds) {
        try {
          const deleteResult = await Media.delete(mediaId, deleteFromCloud);
          deleteResults.push({
            mediaId,
            success: deleteResult.success,
            error: deleteResult.error || null,
          });
        } catch (error) {
          deleteResults.push({
            mediaId,
            success: false,
            error: error.message,
          });
        }
      }

      const successCount = deleteResults.filter((r) => r.success).length;
      const failCount = deleteResults.length - successCount;

      res.json({
        success: successCount > 0,
        message: `${successCount} media files deleted${
          failCount > 0 ? `, ${failCount} failed` : ""
        }`,
        data: deleteResults,
        stats: {
          total: deleteResults.length,
          successful: successCount,
          failed: failCount,
        },
      });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to bulk delete media",
      });
    }
  } else {
    res.setHeader("Allow", ["DELETE", "POST"]);
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}

export default applyMiddleware(handler);
