/**
 * Page Controller
 * Business logic for page content management
 */

import { Page } from "../models/Page.js";
import { Section } from "../models/Section.js";
import {
  validatePageData,
  sanitizePageData,
} from "../validators/pageValidator.js";

export class PageController {
  /**
   * Get all pages with optional filtering
   */
  static async getAllPages(options = {}) {
    try {
      const {
        published = true,
        withSections = false,
        limit = 50,
        offset = 0,
        sortBy = "created_at",
        sortOrder = "desc",
      } = options;

      // Get pages from database
      const result = await Page.findAll({
        publishedOnly: published,
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch pages");
      }

      let pages = result.data || [];

      // Include sections if requested
      if (withSections && pages.length > 0) {
        pages = await Promise.all(
          pages.map(async (page) => {
            const sectionsResult = await Section.findByPageId(
              page.page_id || page.pageId
            );
            return {
              ...page,
              sections: sectionsResult.success ? sectionsResult.data : [],
            };
          })
        );
      }

      return {
        success: true,
        data: {
          pages,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: pages.length,
          },
        },
      };
    } catch (error) {
      console.error("PageController.getAllPages error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve pages",
      };
    }
  }

  /**
   * Get a specific page by ID
   */
  static async getPageById(pageId, options = {}) {
    try {
      const { withSections = false, published = true } = options;

      // Get page from database
      const result = await Page.findByPageId(pageId);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: "Page not found",
          statusCode: 404,
        };
      }

      const page = result.data;

      // Check if page is published (for public access)
      if (published && !page.is_published) {
        return {
          success: false,
          error: "Page not found",
          statusCode: 404,
        };
      }

      // Include sections if requested
      if (withSections) {
        const sectionsResult = await Section.findByPageId(pageId);
        page.sections = sectionsResult.success ? sectionsResult.data : [];
      }

      return {
        success: true,
        data: page,
      };
    } catch (error) {
      console.error("PageController.getPageById error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve page",
      };
    }
  }

  /**
   * Create a new page
   */
  static async createPage(pageData, userId) {
    try {
      // Sanitize input data
      const sanitized = sanitizePageData(pageData);

      // Validate page data
      const validation = validatePageData(sanitized);
      if (validation.error) {
        return {
          success: false,
          error: "Validation failed",
          details: validation.error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        };
      }

      const validData = validation.value;

      // Check if page with same pageId already exists
      const existingPage = await Page.findByPageId(validData.pageId);
      if (existingPage.success && existingPage.data) {
        return {
          success: false,
          error: "Page with this ID already exists",
          statusCode: 409,
        };
      }

      // Generate slug if not provided
      if (!validData.slug) {
        validData.slug = validData.pageId;
      }

      // Create the page
      const createResult = await Page.create({
        page_id: validData.pageId,
        title: validData.metadata.title,
        slug: validData.slug,
        description: validData.metadata.description,
        og_image: validData.metadata.ogImage || null,
        is_published: validData.isPublished || false,
        metadata: {
          ...validData.metadata,
          customFields: validData.customFields || {},
        },
        created_by: userId,
      });

      if (!createResult.success) {
        throw new Error(createResult.error || "Failed to create page");
      }

      return {
        success: true,
        data: createResult.data,
        message: "Page created successfully",
      };
    } catch (error) {
      console.error("PageController.createPage error:", error);
      return {
        success: false,
        error: error.message || "Failed to create page",
      };
    }
  }

  /**
   * Update an existing page
   */
  static async updatePage(pageId, updateData, userId) {
    try {
      // Check if page exists
      const existingPage = await Page.findByPageId(pageId);
      if (!existingPage.success || !existingPage.data) {
        return {
          success: false,
          error: "Page not found",
          statusCode: 404,
        };
      }

      // Sanitize input data
      const sanitized = sanitizePageData(updateData);

      // Validate update data (partial validation)
      const validation = validatePageData(sanitized, true);
      if (validation.error) {
        return {
          success: false,
          error: "Validation failed",
          details: validation.error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        };
      }

      const validData = validation.value;

      // Prepare update object
      const updateObject = {};

      if (validData.metadata) {
        if (validData.metadata.title)
          updateObject.title = validData.metadata.title;
        if (validData.metadata.description)
          updateObject.description = validData.metadata.description;
        if (validData.metadata.ogImage !== undefined)
          updateObject.og_image = validData.metadata.ogImage;

        // Update metadata object
        updateObject.metadata = {
          ...existingPage.data.metadata,
          ...validData.metadata,
        };
      }

      if (validData.slug !== undefined) updateObject.slug = validData.slug;
      if (validData.isPublished !== undefined)
        updateObject.is_published = validData.isPublished;
      if (validData.customFields) {
        updateObject.metadata = {
          ...updateObject.metadata,
          customFields: validData.customFields,
        };
      }

      updateObject.updated_by = userId;

      // Update the page
      const updateResult = await Page.update(
        existingPage.data.id,
        updateObject
      );

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update page");
      }

      return {
        success: true,
        data: updateResult.data,
        message: "Page updated successfully",
      };
    } catch (error) {
      console.error("PageController.updatePage error:", error);
      return {
        success: false,
        error: error.message || "Failed to update page",
      };
    }
  }

  /**
   * Delete a page and all its sections
   */
  static async deletePage(pageId, userId) {
    try {
      // Check if page exists
      const existingPage = await Page.findByPageId(pageId);
      if (!existingPage.success || !existingPage.data) {
        return {
          success: false,
          error: "Page not found",
          statusCode: 404,
        };
      }

      // Get all sections for this page
      const sectionsResult = await Section.findByPageId(pageId, {
        activeOnly: false,
      });

      // Delete all sections first
      if (sectionsResult.success && sectionsResult.data?.length > 0) {
        await Promise.all(
          sectionsResult.data.map((section) => Section.delete(section.id))
        );
      }

      // Delete the page
      const deleteResult = await Page.delete(existingPage.data.id);

      if (!deleteResult.success) {
        throw new Error(deleteResult.error || "Failed to delete page");
      }

      return {
        success: true,
        message: "Page and all associated sections deleted successfully",
      };
    } catch (error) {
      console.error("PageController.deletePage error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete page",
      };
    }
  }

  /**
   * Get page with complete content structure
   */
  static async getPageWithContent(pageId, options = {}) {
    try {
      const { published = true } = options;

      // Get page data
      const pageResult = await this.getPageById(pageId, {
        withSections: true,
        published,
      });

      if (!pageResult.success) {
        return pageResult;
      }

      const page = pageResult.data;

      // Format response according to API specification
      const response = {
        pageId: page.page_id || page.pageId,
        metadata: {
          title: page.title,
          description: page.description,
          ogImage: page.og_image || page.ogImage,
          keywords: page.metadata?.keywords || [],
          canonicalUrl: page.metadata?.canonicalUrl || null,
        },
        slug: page.slug,
        isPublished: page.is_published,
        publishedAt: page.published_at,
        sections: (page.sections || []).map((section) => ({
          id: section.section_id || section.id,
          type: section.type,
          title: section.title,
          order: section.order_index,
          isActive: section.is_active,
          content: section.content || {},
          customFields: section.metadata?.customFields || {},
        })),
        customFields: page.metadata?.customFields || {},
        createdAt: page.created_at,
        updatedAt: page.updated_at,
      };

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("PageController.getPageWithContent error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve page content",
      };
    }
  }

  /**
   * Publish/unpublish a page
   */
  static async togglePagePublication(pageId, isPublished, userId) {
    try {
      const updateData = {
        isPublished,
        publishedAt: isPublished ? new Date().toISOString() : null,
      };

      return await this.updatePage(pageId, updateData, userId);
    } catch (error) {
      console.error("PageController.togglePagePublication error:", error);
      return {
        success: false,
        error: error.message || "Failed to update page publication status",
      };
    }
  }
}
