/**
 * Media API Endpoint
 * Handles CRUD operations for media files using Supabase and Cloudinary
 */

import { applyMiddleware } from "../utils/middleware.js";
import { validateRequest, mediaValidation } from "../utils/validation.js";
import { requireAuth } from "../utils/auth.js";
import { Media } from "../models/Media.js";
import { generateResponsiveUrls } from "../utils/cloudinary.js";

async function handler(req, res) {
  if (req.method === "GET") {
    // Public endpoint - Get media files
    const {
      mediaId,
      folder,
      resourceType,
      tags,
      search,
      limit = 50,
      offset = 0,
      withResponsive = false,
    } = req.query;

    try {
      if (mediaId) {
        // Get specific media by ID
        const result = await Media.findById(mediaId);

        if (!result.success || !result.data) {
          return res.status(404).json({
            success: false,
            error: "Media not found",
          });
        }

        let mediaData = result.data;

        // Add responsive URLs if requested and it's an image
        if (withResponsive === "true" && mediaData.resource_type === "image") {
          mediaData.responsive_urls = generateResponsiveUrls(
            mediaData.cloudinary_id
          );
        }

        res.json({
          success: true,
          data: mediaData,
        });
      } else if (search) {
        // Search media
        const result = await Media.search(search, {
          resourceType,
          limit: parseInt(limit),
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        res.json({
          success: true,
          data: result.data || [],
          pagination: {
            limit: parseInt(limit),
            total: result.data?.length || 0,
          },
        });
      } else if (tags) {
        // Get media by tags
        const tagArray = tags.split(",").map((tag) => tag.trim());
        const result = await Media.findByTags(tagArray, {
          resourceType,
          limit: parseInt(limit),
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        res.json({
          success: true,
          data: result.data || [],
          pagination: {
            limit: parseInt(limit),
            total: result.data?.length || 0,
          },
        });
      } else if (folder) {
        // Get media by folder
        const result = await Media.findByFolder(folder, {
          resourceType,
          limit: parseInt(limit),
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        res.json({
          success: true,
          data: result.data || [],
          pagination: {
            limit: parseInt(limit),
            total: result.data?.length || 0,
          },
        });
      } else {
        // Get all media with pagination
        const result = await Media.findAll({
          resourceType,
          limit: parseInt(limit),
          offset: parseInt(offset),
        });

        if (!result.success) {
          throw new Error(result.error);
        }

        res.json({
          success: true,
          data: result.data || [],
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: result.data?.length || 0,
          },
        });
      }
    } catch (error) {
      console.error("Get media error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve media",
      });
    }
  } else if (req.method === "POST") {
    // Protected endpoint - Create media record (usually called after upload)
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    try {
      // Validate request body
      const validation = validateRequest(req.body, mediaValidation);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const mediaData = req.body;

      // Check if media with same cloudinaryId already exists
      if (mediaData.cloudinaryId) {
        const existingMedia = await Media.findByCloudinaryId(
          mediaData.cloudinaryId
        );
        if (existingMedia.success && existingMedia.data) {
          return res.status(409).json({
            success: false,
            error: "Media with this cloudinaryId already exists",
          });
        }
      }

      // Create new media record
      const result = await Media.create(mediaData);

      if (!result.success) {
        throw new Error(result.error);
      }

      res.status(201).json({
        success: true,
        message: "Media record created successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Create media error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create media record",
      });
    }
  } else if (req.method === "PUT") {
    // Protected endpoint - Update media record
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    try {
      const { id, ...updateData } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "id is required",
        });
      }

      // Update media record
      const result = await Media.update(id, updateData);

      if (!result.success) {
        if (result.error.includes("not found")) {
          return res.status(404).json({
            success: false,
            error: "Media not found",
          });
        }
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Media updated successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Update media error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update media",
      });
    }
  } else if (req.method === "DELETE") {
    // Protected endpoint - Delete media
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    try {
      const { id, deleteFromCloud = true } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "id is required",
        });
      }

      // Delete media (and optionally from Cloudinary)
      const result = await Media.delete(id, deleteFromCloud);

      if (!result.success) {
        if (result.error.includes("not found")) {
          return res.status(404).json({
            success: false,
            error: "Media not found",
          });
        }
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Media deleted successfully",
        data: {
          deletedMedia: result.data,
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
  } else if (req.method === "PATCH") {
    // Protected endpoint - Special operations
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    try {
      const { action, ...actionData } = req.body;

      if (!action) {
        return res.status(400).json({
          success: false,
          error: "action is required",
        });
      }

      switch (action) {
        case "sync":
          const { id } = actionData;
          if (!id) {
            return res.status(400).json({
              success: false,
              error: "id is required for sync action",
            });
          }

          const syncResult = await Media.syncWithCloudinary(id);
          if (!syncResult.success) {
            throw new Error(syncResult.error);
          }

          res.json({
            success: true,
            message: "Media synced with Cloudinary successfully",
            data: syncResult.data,
          });
          break;

        case "get-unused":
          const unusedResult = await Media.findUnused({
            limit: actionData.limit || 50,
          });

          if (!unusedResult.success) {
            throw new Error(unusedResult.error);
          }

          res.json({
            success: true,
            data: unusedResult.data,
            message: `Found ${
              unusedResult.data?.length || 0
            } unused media files`,
          });
          break;

        case "get-stats":
          const statsResult = await Media.getStats();

          if (!statsResult.success) {
            throw new Error(statsResult.error);
          }

          res.json({
            success: true,
            data: statsResult.data,
          });
          break;

        default:
          return res.status(400).json({
            success: false,
            error: `Unknown action: ${action}`,
          });
      }
    } catch (error) {
      console.error("Media action error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to perform media action",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE", "PATCH"]);
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}

export default applyMiddleware(handler);
