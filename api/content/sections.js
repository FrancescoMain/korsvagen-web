/**
 * Sections Content API Endpoint
 * Comprehensive CRUD operations for section content management
 */

import { applyMiddleware } from "../utils/middleware.js";
import { requireAuth } from "../utils/auth.js";
import {
  validateSectionCreate,
  validateSectionUpdate,
  validateSectionReorder,
  validateSectionQuery,
  validatePageParam,
  validateSectionParam,
} from "../validators/sectionValidator.js";
import { SectionController } from "../controllers/sectionController.js";

async function handler(req, res) {
  const { method } = req;
  const { pageId, sectionId } = req.query;

  try {
    switch (method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      case "PATCH":
        return await handlePatch(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: "Method not allowed",
          message: `${method} method is not supported for this endpoint`,
        });
    }
  } catch (error) {
    console.error("Sections API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/content/sections?pageId=home
 * GET /api/content/sections?sectionId=hero-1
 */
async function handleGet(req, res) {
  const {
    pageId,
    sectionId,
    type,
    activeOnly = "true",
    sortBy = "order_index",
    sortOrder = "asc",
  } = req.query;

  try {
    if (sectionId) {
      // Get specific section
      const result = await SectionController.getSectionById(sectionId);

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
    } else if (pageId) {
      // Get sections for a page
      const result = await SectionController.getSectionsByPageId(pageId, {
        activeOnly: activeOnly === "true",
        sortBy,
        sortOrder,
      });

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
      return res.status(400).json({
        success: false,
        error: "Missing parameter",
        message: "Either pageId or sectionId is required",
      });
    }
  } catch (error) {
    console.error("GET sections error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to retrieve sections",
      message: error.message,
    });
  }
}

/**
 * POST /api/content/sections?pageId=home
 * Create a new section for a page
 */
async function handlePost(req, res) {
  // Authentication required for creating sections
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to create sections",
    });
  }

  const { pageId } = req.query;
  if (!pageId) {
    return res.status(400).json({
      success: false,
      error: "Missing pageId",
      message: "pageId is required in query parameters",
    });
  }

  const userId = authResult.user.id;

  try {
    const result = await SectionController.createSection(
      pageId,
      req.body,
      userId
    );

    if (!result.success) {
      const statusCode = result.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.error,
        details: result.details,
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("POST sections error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create section",
      message: error.message,
    });
  }
}

/**
 * PUT /api/content/sections?sectionId=hero-1
 * Update an existing section
 */
async function handlePut(req, res) {
  // Authentication required for updating sections
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to update sections",
    });
  }

  const { sectionId } = req.query;
  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "Missing sectionId",
      message: "sectionId is required in query parameters",
    });
  }

  const userId = authResult.user.id;

  try {
    const result = await SectionController.updateSection(
      sectionId,
      req.body,
      userId
    );

    if (!result.success) {
      const statusCode = result.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        error: result.error,
        message: result.error,
        details: result.details,
      });
    }

    return res.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("PUT sections error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update section",
      message: error.message,
    });
  }
}

/**
 * DELETE /api/content/sections?sectionId=hero-1
 * Delete a section
 */
async function handleDelete(req, res) {
  // Authentication required for deleting sections
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to delete sections",
    });
  }

  const { sectionId } = req.query;
  if (!sectionId) {
    return res.status(400).json({
      success: false,
      error: "Missing sectionId",
      message: "sectionId is required in query parameters",
    });
  }

  const userId = authResult.user.id;

  try {
    const result = await SectionController.deleteSection(sectionId, userId);

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
    console.error("DELETE sections error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete section",
      message: error.message,
    });
  }
}

/**
 * PATCH /api/content/sections?sectionId=hero-1
 * Special operations: reorder, toggle status, duplicate
 */
async function handlePatch(req, res) {
  // Authentication required for section operations
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to perform section operations",
    });
  }

  const { sectionId } = req.query;
  const { action, ...actionData } = req.body;

  if (!action) {
    return res.status(400).json({
      success: false,
      error: "Missing action",
      message: "action is required in request body",
    });
  }

  const userId = authResult.user.id;

  try {
    let result;

    switch (action) {
      case "reorder":
        if (!sectionId) {
          return res.status(400).json({
            success: false,
            error: "Missing sectionId",
            message: "sectionId is required for reorder action",
          });
        }

        const { newOrder } = actionData;
        if (typeof newOrder !== "number") {
          return res.status(400).json({
            success: false,
            error: "Invalid newOrder",
            message: "newOrder must be a number",
          });
        }

        result = await SectionController.reorderSection(
          sectionId,
          newOrder,
          userId
        );
        break;

      case "toggle-status":
        if (!sectionId) {
          return res.status(400).json({
            success: false,
            error: "Missing sectionId",
            message: "sectionId is required for toggle-status action",
          });
        }

        const { isActive } = actionData;
        if (typeof isActive !== "boolean") {
          return res.status(400).json({
            success: false,
            error: "Invalid isActive",
            message: "isActive must be a boolean",
          });
        }

        result = await SectionController.toggleSectionStatus(
          sectionId,
          isActive,
          userId
        );
        break;

      case "duplicate":
        if (!sectionId) {
          return res.status(400).json({
            success: false,
            error: "Missing sectionId",
            message: "sectionId is required for duplicate action",
          });
        }

        result = await SectionController.duplicateSection(sectionId, userId);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid action",
          message: `Unsupported action: ${action}`,
        });
    }

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
      data: result.data || null,
      message: result.message,
    });
  } catch (error) {
    console.error("PATCH sections error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to perform section operation",
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
