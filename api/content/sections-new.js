/**
 * Sections API Endpoint
 * Handles CRUD operations for website sections using Supabase
 */

import { applyMiddleware } from "../utils/middleware.js";
import { validateRequest, sectionValidation } from "../utils/validation.js";
import { requireAuth } from "../utils/auth.js";
import { Section } from "../models/Section.js";

async function handler(req, res) {
  if (req.method === "GET") {
    // Public endpoint - Get active sections
    const { pageId, type, sectionId } = req.query;

    try {
      if (sectionId) {
        // Get specific section by ID
        const result = await Section.findBySectionId(sectionId);

        if (!result.success || !result.data) {
          return res.status(404).json({
            success: false,
            error: "Section not found",
          });
        }

        // Check if section is active (for public access)
        if (!result.data.is_active) {
          return res.status(404).json({
            success: false,
            error: "Section not found",
          });
        }

        res.json({
          success: true,
          data: result.data,
        });
      } else if (pageId) {
        // Get sections for a specific page
        const result = await Section.findByPageId(pageId, { activeOnly: true });

        if (!result.success) {
          throw new Error(result.error);
        }

        res.json({
          success: true,
          data: result.data || [],
        });
      } else if (type) {
        // Get sections by type
        const result = await Section.findByType(type, { activeOnly: true });

        if (!result.success) {
          throw new Error(result.error);
        }

        res.json({
          success: true,
          data: result.data || [],
        });
      } else {
        return res.status(400).json({
          success: false,
          error: "pageId, type, or sectionId parameter is required",
        });
      }
    } catch (error) {
      console.error("Get sections error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve sections",
      });
    }
  } else if (req.method === "POST") {
    // Protected endpoint - Create new section
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    try {
      // Validate request body
      const validation = validateRequest(req.body, sectionValidation);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const sectionData = req.body;

      // Check if section with same sectionId already exists
      if (sectionData.sectionId) {
        const existingSection = await Section.findBySectionId(
          sectionData.sectionId
        );
        if (existingSection.success && existingSection.data) {
          return res.status(409).json({
            success: false,
            error: "Section with this sectionId already exists",
          });
        }
      }

      // Create new section
      const result = await Section.create(sectionData);

      if (!result.success) {
        throw new Error(result.error);
      }

      res.status(201).json({
        success: true,
        message: "Section created successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Create section error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create section",
      });
    }
  } else if (req.method === "PUT") {
    // Protected endpoint - Update section
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

      // Update section
      const result = await Section.update(id, updateData);

      if (!result.success) {
        if (result.error.includes("not found")) {
          return res.status(404).json({
            success: false,
            error: "Section not found",
          });
        }
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Section updated successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Update section error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update section",
      });
    }
  } else if (req.method === "DELETE") {
    // Protected endpoint - Delete section
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "id is required",
        });
      }

      // Delete section
      const result = await Section.delete(id);

      if (!result.success) {
        if (result.error.includes("not found")) {
          return res.status(404).json({
            success: false,
            error: "Section not found",
          });
        }
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Section deleted successfully",
      });
    } catch (error) {
      console.error("Delete section error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete section",
      });
    }
  } else if (req.method === "PATCH") {
    // Protected endpoint - Special operations (reorder, toggle active, etc.)
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
        case "reorder":
          const { pageId, sections } = actionData;
          if (!pageId || !Array.isArray(sections)) {
            return res.status(400).json({
              success: false,
              error:
                "pageId and sections array are required for reorder action",
            });
          }

          const reorderResult = await Section.reorder(pageId, sections);
          if (!reorderResult.success) {
            throw new Error(reorderResult.error);
          }

          res.json({
            success: true,
            message: "Sections reordered successfully",
            data: reorderResult.data,
          });
          break;

        case "toggle-active":
          const { id } = actionData;
          if (!id) {
            return res.status(400).json({
              success: false,
              error: "id is required for toggle-active action",
            });
          }

          const toggleResult = await Section.toggleActive(id);
          if (!toggleResult.success) {
            throw new Error(toggleResult.error);
          }

          res.json({
            success: true,
            message: "Section status toggled successfully",
            data: toggleResult.data,
          });
          break;

        case "duplicate":
          const { sourceId, targetPageId } = actionData;
          if (!sourceId) {
            return res.status(400).json({
              success: false,
              error: "sourceId is required for duplicate action",
            });
          }

          const duplicateResult = await Section.duplicate(
            sourceId,
            targetPageId
          );
          if (!duplicateResult.success) {
            throw new Error(duplicateResult.error);
          }

          res.json({
            success: true,
            message: "Section duplicated successfully",
            data: duplicateResult.data,
          });
          break;

        default:
          return res.status(400).json({
            success: false,
            error: `Unknown action: ${action}`,
          });
      }
    } catch (error) {
      console.error("Section action error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to perform section action",
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
