/**
 * Section Model
 * Handles website sections management operations
 */

import { getSupabase, executeQuery } from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

export class Section {
  constructor(data = {}) {
    this.id = data.id;
    this.sectionId = data.section_id || data.sectionId;
    this.pageId = data.page_id || data.pageId;
    this.type = data.type;
    this.title = data.title;
    this.content = data.content || {};
    this.orderIndex = data.order_index || data.orderIndex || 0;
    this.isActive =
      data.is_active !== undefined ? data.is_active : data.isActive;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Get all sections for a page
   */
  static async findByPageId(pageId, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("sections")
        .select("*")
        .eq("page_id", pageId)
        .order("order_index", { ascending: true });

      if (options.activeOnly !== false) {
        query = query.eq("is_active", true);
      }

      return await query;
    });
  }

  /**
   * Find section by ID
   */
  static async findById(id) {
    return executeQuery(async (supabase) => {
      return await supabase.from("sections").select("*").eq("id", id).single();
    });
  }

  /**
   * Find section by section_id
   */
  static async findBySectionId(sectionId) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("sections")
        .select("*")
        .eq("section_id", sectionId)
        .single();
    });
  }

  /**
   * Get sections by type
   */
  static async findByType(type, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("sections")
        .select("*")
        .eq("type", type)
        .order("created_at", { ascending: false });

      if (options.activeOnly !== false) {
        query = query.eq("is_active", true);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Create new section
   */
  static async create(sectionData) {
    return executeQuery(async (supabase) => {
      // Get the next order index for this page
      const { data: maxOrder } = await supabase
        .from("sections")
        .select("order_index")
        .eq("page_id", sectionData.pageId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      const nextOrderIndex = maxOrder ? maxOrder.order_index + 1 : 1;

      const data = {
        section_id: sectionData.sectionId || uuidv4(),
        page_id: sectionData.pageId,
        type: sectionData.type,
        title: sectionData.title,
        content: sectionData.content || {},
        order_index:
          sectionData.orderIndex !== undefined
            ? sectionData.orderIndex
            : nextOrderIndex,
        is_active:
          sectionData.isActive !== undefined ? sectionData.isActive : true,
        updated_at: new Date().toISOString(),
      };

      return await supabase.from("sections").insert(data).select().single();
    });
  }

  /**
   * Update section
   */
  static async update(id, updateData) {
    return executeQuery(async (supabase) => {
      const data = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      // Convert camelCase to snake_case for database
      if (data.sectionId) {
        data.section_id = data.sectionId;
        delete data.sectionId;
      }
      if (data.pageId) {
        data.page_id = data.pageId;
        delete data.pageId;
      }
      if (data.orderIndex !== undefined) {
        data.order_index = data.orderIndex;
        delete data.orderIndex;
      }
      if (data.isActive !== undefined) {
        data.is_active = data.isActive;
        delete data.isActive;
      }

      return await supabase
        .from("sections")
        .update(data)
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Delete section
   */
  static async delete(id) {
    return executeQuery(async (supabase) => {
      return await supabase.from("sections").delete().eq("id", id);
    });
  }

  /**
   * Reorder sections within a page
   */
  static async reorder(pageId, sectionOrders) {
    return executeQuery(async (supabase) => {
      // sectionOrders should be an array of {id, orderIndex}
      const updates = sectionOrders.map(async (item) => {
        return supabase
          .from("sections")
          .update({
            order_index: item.orderIndex,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.id)
          .eq("page_id", pageId);
      });

      await Promise.all(updates);

      // Return updated sections
      return await supabase
        .from("sections")
        .select("*")
        .eq("page_id", pageId)
        .order("order_index", { ascending: true });
    });
  }

  /**
   * Toggle section active status
   */
  static async toggleActive(id) {
    return executeQuery(async (supabase) => {
      // First get current state
      const { data: section, error: getError } = await supabase
        .from("sections")
        .select("is_active")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      // Toggle the state
      return await supabase
        .from("sections")
        .update({
          is_active: !section.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Duplicate section
   */
  static async duplicate(id, targetPageId = null) {
    return executeQuery(async (supabase) => {
      // Get original section
      const { data: originalSection, error: getError } = await supabase
        .from("sections")
        .select("*")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      // Get next order index for target page
      const pageId = targetPageId || originalSection.page_id;
      const { data: maxOrder } = await supabase
        .from("sections")
        .select("order_index")
        .eq("page_id", pageId)
        .order("order_index", { ascending: false })
        .limit(1)
        .single();

      const nextOrderIndex = maxOrder ? maxOrder.order_index + 1 : 1;

      // Create new section
      const newSectionData = {
        section_id: `${originalSection.section_id}-copy`,
        page_id: pageId,
        type: originalSection.type,
        title: `${originalSection.title} (Copy)`,
        content: originalSection.content,
        order_index: nextOrderIndex,
        is_active: originalSection.is_active,
      };

      return await supabase
        .from("sections")
        .insert(newSectionData)
        .select()
        .single();
    });
  }

  /**
   * Get section content with media resolved
   */
  static async findWithMedia(id) {
    return executeQuery(async (supabase) => {
      const { data: section, error: sectionError } = await supabase
        .from("sections")
        .select("*")
        .eq("id", id)
        .single();

      if (sectionError) throw sectionError;

      // If section has media references in content, resolve them
      if (
        section.content &&
        (section.content.images || section.content.videos)
      ) {
        const mediaIds = [
          ...(section.content.images || [])
            .map((img) => img.cloudinaryId)
            .filter(Boolean),
          ...(section.content.videos || [])
            .map((vid) => vid.cloudinaryId)
            .filter(Boolean),
        ];

        if (mediaIds.length > 0) {
          const { data: mediaFiles, error: mediaError } = await supabase
            .from("media")
            .select("*")
            .in("cloudinary_id", mediaIds);

          if (mediaError) throw mediaError;

          // Create media lookup
          const mediaLookup = {};
          mediaFiles.forEach((media) => {
            mediaLookup[media.cloudinary_id] = media;
          });

          // Resolve media in content
          if (section.content.images) {
            section.content.images = section.content.images.map((img) => ({
              ...img,
              ...mediaLookup[img.cloudinaryId],
            }));
          }

          if (section.content.videos) {
            section.content.videos = section.content.videos.map((vid) => ({
              ...vid,
              ...mediaLookup[vid.cloudinaryId],
            }));
          }
        }
      }

      return { data: section };
    });
  }

  /**
   * Search sections by content
   */
  static async search(searchTerm, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("sections")
        .select("*")
        .or(
          `title.ilike.%${searchTerm}%,content->>title.ilike.%${searchTerm}%,content->>description.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (options.activeOnly !== false) {
        query = query.eq("is_active", true);
      }

      if (options.type) {
        query = query.eq("type", options.type);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Get sections statistics
   */
  static async getStats() {
    return executeQuery(async (supabase) => {
      const { data: total, error: totalError } = await supabase
        .from("sections")
        .select("count", { count: "exact", head: true });

      if (totalError) throw totalError;

      const { data: active, error: activeError } = await supabase
        .from("sections")
        .select("count", { count: "exact", head: true })
        .eq("is_active", true);

      if (activeError) throw activeError;

      const { data: byType, error: typeError } = await supabase
        .from("sections")
        .select("type, count(*)")
        .group("type");

      if (typeError) throw typeError;

      return {
        data: {
          total: total || 0,
          active: active || 0,
          inactive: (total || 0) - (active || 0),
          byType: byType || [],
        },
      };
    });
  }

  /**
   * Get available section types
   */
  static async getTypes() {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("sections")
        .select("type")
        .group("type")
        .order("type");
    });
  }
}
