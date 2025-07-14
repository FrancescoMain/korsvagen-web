/**
 * Page Content API Endpoint
 * Handles CRUD operations for page content using Supabase
 */

import { applyMiddleware } from "../utils/middleware.js";
import { validateRequest, pageContentValidation } from "../utils/validation.js";
import { requireAuth } from "../utils/auth.js";
import { Page } from "../models/Page.js";

async function handler(req, res) {
  if (req.method === "GET") {
    // Public endpoint - Get published pages
    const { pageId, slug, withSections } = req.query;

    try {
      if (pageId) {
        // Get specific page by pageId
        let result;

        if (withSections === "true") {
          result = await Page.findWithSections(pageId);
        } else {
          result = await Page.findByPageId(pageId);
        }

        if (!result.success || !result.data) {
          return res.status(404).json({
            success: false,
            error: "Page not found",
          });
        }

        // Check if page is published (for public access)
        if (!result.data.is_published) {
          return res.status(404).json({
            success: false,
            error: "Page not found",
          });
        }

        res.json({
          success: true,
          data: result.data,
        });
      } else if (slug) {
        // Get page by slug
        const result = await Page.findBySlug(slug);

        if (!result.success || !result.data) {
          return res.status(404).json({
            success: false,
            error: "Page not found",
          });
        }

        res.json({
          success: true,
          data: result.data,
        });
      } else {
        // Get all published pages
        const result = await Page.findAll({ publishedOnly: true });

        if (!result.success) {
          throw new Error(result.error);
        }

        res.json({
          success: true,
          data: result.data || [],
        });
      }
    } catch (error) {
      console.error("Get pages error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve pages",
      });
    }
  } else if (req.method === "POST") {
    // Protected endpoint - Create new page
    const authResult = await requireAuth(req);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error,
      });
    }

    try {
      // Validate request body
      const validation = validateRequest(req.body, pageContentValidation);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validation.errors,
        });
      }

      const pageData = req.body;

      // Check if page with same pageId or slug already exists
      if (pageData.pageId) {
        const existingPage = await Page.findByPageId(pageData.pageId);
        if (existingPage.success && existingPage.data) {
          return res.status(409).json({
            success: false,
            error: "Page with this pageId already exists",
          });
        }
      }

      // Create new page
      const result = await Page.create(pageData);

      if (!result.success) {
        throw new Error(result.error);
      }

      res.status(201).json({
        success: true,
        message: "Page created successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Create page error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create page",
      });
    }
  } else if (req.method === "PUT") {
    // Protected endpoint - Update page
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

      // Update page
      const result = await Page.update(id, updateData);

      if (!result.success) {
        if (result.error.includes("not found")) {
          return res.status(404).json({
            success: false,
            error: "Page not found",
          });
        }
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Page updated successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("Update page error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update page",
      });
    }
  } else if (req.method === "DELETE") {
    // Protected endpoint - Delete page
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

      // Delete page (will cascade delete sections)
      const result = await Page.delete(id);

      if (!result.success) {
        if (result.error.includes("not found")) {
          return res.status(404).json({
            success: false,
            error: "Page not found",
          });
        }
        throw new Error(result.error);
      }

      res.json({
        success: true,
        message: "Page deleted successfully",
      });
    } catch (error) {
      console.error("Delete page error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete page",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}

export default applyMiddleware(handler);
