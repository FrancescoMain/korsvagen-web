/**
 * Section Controller
 * Business logic for section content management
 */

import { Section } from "../models/Section.js";
import { Page } from "../models/Page.js";
import {
  validateSectionData,
  sanitizeSectionData,
} from "../validators/sectionValidator.js";
import { v4 as uuidv4 } from "uuid";

export class SectionController {
  /**
   * Get all sections for a specific page
   */
  static async getSectionsByPageId(pageId, options = {}) {
    try {
      const {
        activeOnly = true,
        sortBy = "order_index",
        sortOrder = "asc",
      } = options;

      // Check if page exists
      const pageResult = await Page.findByPageId(pageId);
      if (!pageResult.success || !pageResult.data) {
        return {
          success: false,
          error: "Page not found",
          statusCode: 404,
        };
      }

      // Get sections from database
      const result = await Section.findByPageId(pageId, {
        activeOnly,
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch sections");
      }

      const sections = (result.data || []).map((section) => ({
        id: section.id,
        sectionId: section.section_id,
        pageId: section.page_id,
        type: section.type,
        title: section.title,
        content: section.content || {},
        order: section.order_index,
        isActive: section.is_active,
        customFields: section.metadata?.customFields || {},
        createdAt: section.created_at,
        updatedAt: section.updated_at,
      }));

      return {
        success: true,
        data: {
          pageId,
          sections,
          total: sections.length,
        },
      };
    } catch (error) {
      console.error("SectionController.getSectionsByPageId error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve sections",
      };
    }
  }

  /**
   * Get a specific section by ID
   */
  static async getSectionById(sectionId) {
    try {
      const result = await Section.findById(sectionId);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: "Section not found",
          statusCode: 404,
        };
      }

      const section = result.data;

      return {
        success: true,
        data: {
          id: section.id,
          sectionId: section.section_id,
          pageId: section.page_id,
          type: section.type,
          title: section.title,
          content: section.content || {},
          order: section.order_index,
          isActive: section.is_active,
          customFields: section.metadata?.customFields || {},
          createdAt: section.created_at,
          updatedAt: section.updated_at,
        },
      };
    } catch (error) {
      console.error("SectionController.getSectionById error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve section",
      };
    }
  }

  /**
   * Create a new section
   */
  static async createSection(pageId, sectionData, userId) {
    try {
      // Check if page exists
      const pageResult = await Page.findByPageId(pageId);
      if (!pageResult.success || !pageResult.data) {
        return {
          success: false,
          error: "Page not found",
          statusCode: 404,
        };
      }

      // Sanitize input data
      const sanitized = sanitizeSectionData({
        ...sectionData,
        pageId,
      });

      // Validate section data
      const validation = validateSectionData(sanitized);
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

      // Generate section ID if not provided
      if (!validData.sectionId) {
        validData.sectionId = `${validData.type}-${Date.now()}`;
      }

      // Get the next order index if not specified
      if (validData.orderIndex === undefined || validData.orderIndex === null) {
        const existingSections = await Section.findByPageId(pageId, {
          activeOnly: false,
        });
        const maxOrder =
          existingSections.success && existingSections.data?.length > 0
            ? Math.max(...existingSections.data.map((s) => s.order_index || 0))
            : -1;
        validData.orderIndex = maxOrder + 1;
      }

      // Create the section
      const createResult = await Section.create({
        section_id: validData.sectionId,
        page_id: pageId,
        type: validData.type,
        title: validData.title || "",
        content: validData.content || {},
        order_index: validData.orderIndex,
        is_active: validData.isActive !== undefined ? validData.isActive : true,
        metadata: {
          customFields: validData.customFields || {},
        },
        created_by: userId,
      });

      if (!createResult.success) {
        throw new Error(createResult.error || "Failed to create section");
      }

      return {
        success: true,
        data: {
          id: createResult.data.id,
          sectionId: createResult.data.section_id,
          pageId: createResult.data.page_id,
          type: createResult.data.type,
          title: createResult.data.title,
          content: createResult.data.content,
          order: createResult.data.order_index,
          isActive: createResult.data.is_active,
          customFields: createResult.data.metadata?.customFields || {},
          createdAt: createResult.data.created_at,
        },
        message: "Section created successfully",
      };
    } catch (error) {
      console.error("SectionController.createSection error:", error);
      return {
        success: false,
        error: error.message || "Failed to create section",
      };
    }
  }

  /**
   * Update an existing section
   */
  static async updateSection(sectionId, updateData, userId) {
    try {
      // Check if section exists
      const existingSection = await Section.findById(sectionId);
      if (!existingSection.success || !existingSection.data) {
        return {
          success: false,
          error: "Section not found",
          statusCode: 404,
        };
      }

      // Sanitize input data
      const sanitized = sanitizeSectionData(updateData);

      // Validate update data (partial validation)
      const validation = validateSectionData(sanitized, true);
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

      if (validData.type !== undefined) updateObject.type = validData.type;
      if (validData.title !== undefined) updateObject.title = validData.title;
      if (validData.content !== undefined)
        updateObject.content = validData.content;
      if (validData.orderIndex !== undefined)
        updateObject.order_index = validData.orderIndex;
      if (validData.isActive !== undefined)
        updateObject.is_active = validData.isActive;

      if (validData.customFields) {
        updateObject.metadata = {
          ...existingSection.data.metadata,
          customFields: validData.customFields,
        };
      }

      updateObject.updated_by = userId;

      // Update the section
      const updateResult = await Section.update(sectionId, updateObject);

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update section");
      }

      return {
        success: true,
        data: {
          id: updateResult.data.id,
          sectionId: updateResult.data.section_id,
          pageId: updateResult.data.page_id,
          type: updateResult.data.type,
          title: updateResult.data.title,
          content: updateResult.data.content,
          order: updateResult.data.order_index,
          isActive: updateResult.data.is_active,
          customFields: updateResult.data.metadata?.customFields || {},
          updatedAt: updateResult.data.updated_at,
        },
        message: "Section updated successfully",
      };
    } catch (error) {
      console.error("SectionController.updateSection error:", error);
      return {
        success: false,
        error: error.message || "Failed to update section",
      };
    }
  }

  /**
   * Delete a section
   */
  static async deleteSection(sectionId, userId) {
    try {
      // Check if section exists
      const existingSection = await Section.findById(sectionId);
      if (!existingSection.success || !existingSection.data) {
        return {
          success: false,
          error: "Section not found",
          statusCode: 404,
        };
      }

      // Delete the section
      const deleteResult = await Section.delete(sectionId);

      if (!deleteResult.success) {
        throw new Error(deleteResult.error || "Failed to delete section");
      }

      // Reorder remaining sections to fill the gap
      await this.reorderSectionsAfterDelete(
        existingSection.data.page_id,
        existingSection.data.order_index
      );

      return {
        success: true,
        message: "Section deleted successfully",
      };
    } catch (error) {
      console.error("SectionController.deleteSection error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete section",
      };
    }
  }

  /**
   * Reorder sections
   */
  static async reorderSection(sectionId, newOrder, userId) {
    try {
      // Check if section exists
      const existingSection = await Section.findById(sectionId);
      if (!existingSection.success || !existingSection.data) {
        return {
          success: false,
          error: "Section not found",
          statusCode: 404,
        };
      }

      const section = existingSection.data;
      const currentOrder = section.order_index;
      const pageId = section.page_id;

      if (currentOrder === newOrder) {
        return {
          success: true,
          message: "Section is already at the specified position",
        };
      }

      // Get all sections for this page
      const sectionsResult = await Section.findByPageId(pageId, {
        activeOnly: false,
      });
      if (!sectionsResult.success) {
        throw new Error("Failed to fetch sections for reordering");
      }

      const sections = sectionsResult.data || [];

      // Validate new order
      if (newOrder < 0 || newOrder >= sections.length) {
        return {
          success: false,
          error: "Invalid order position",
        };
      }

      // Reorder sections
      const reorderPromises = [];

      if (newOrder > currentOrder) {
        // Moving down: shift sections up
        sections.forEach((s) => {
          if (
            s.id !== sectionId &&
            s.order_index > currentOrder &&
            s.order_index <= newOrder
          ) {
            reorderPromises.push(
              Section.update(s.id, {
                order_index: s.order_index - 1,
                updated_by: userId,
              })
            );
          }
        });
      } else {
        // Moving up: shift sections down
        sections.forEach((s) => {
          if (
            s.id !== sectionId &&
            s.order_index >= newOrder &&
            s.order_index < currentOrder
          ) {
            reorderPromises.push(
              Section.update(s.id, {
                order_index: s.order_index + 1,
                updated_by: userId,
              })
            );
          }
        });
      }

      // Update the target section
      reorderPromises.push(
        Section.update(sectionId, {
          order_index: newOrder,
          updated_by: userId,
        })
      );

      // Execute all updates
      await Promise.all(reorderPromises);

      return {
        success: true,
        message: "Section reordered successfully",
      };
    } catch (error) {
      console.error("SectionController.reorderSection error:", error);
      return {
        success: false,
        error: error.message || "Failed to reorder section",
      };
    }
  }

  /**
   * Reorder sections after deletion to fill gaps
   */
  static async reorderSectionsAfterDelete(pageId, deletedOrder) {
    try {
      const sectionsResult = await Section.findByPageId(pageId, {
        activeOnly: false,
      });
      if (!sectionsResult.success || !sectionsResult.data) {
        return;
      }

      const sections = sectionsResult.data
        .filter((s) => s.order_index > deletedOrder)
        .sort((a, b) => a.order_index - b.order_index);

      const updatePromises = sections.map((section) =>
        Section.update(section.id, {
          order_index: section.order_index - 1,
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error(
        "SectionController.reorderSectionsAfterDelete error:",
        error
      );
      // Non-critical operation, don't throw
    }
  }

  /**
   * Toggle section active status
   */
  static async toggleSectionStatus(sectionId, isActive, userId) {
    try {
      const updateData = { isActive };
      return await this.updateSection(sectionId, updateData, userId);
    } catch (error) {
      console.error("SectionController.toggleSectionStatus error:", error);
      return {
        success: false,
        error: error.message || "Failed to update section status",
      };
    }
  }

  /**
   * Duplicate a section
   */
  static async duplicateSection(sectionId, userId) {
    try {
      // Get the original section
      const originalResult = await this.getSectionById(sectionId);
      if (!originalResult.success) {
        return originalResult;
      }

      const original = originalResult.data;

      // Create a copy with new ID and incremented order
      const duplicateData = {
        type: original.type,
        title: `${original.title} (Copy)`,
        content: { ...original.content },
        orderIndex: original.order + 1,
        isActive: false, // Start as inactive
        customFields: { ...original.customFields },
      };

      return await this.createSection(original.pageId, duplicateData, userId);
    } catch (error) {
      console.error("SectionController.duplicateSection error:", error);
      return {
        success: false,
        error: error.message || "Failed to duplicate section",
      };
    }
  }
}
