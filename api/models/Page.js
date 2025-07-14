/**
 * Page Model
 * Handles page content management operations
 */

import { getSupabase, executeQuery } from "../utils/database.js";
import { v4 as uuidv4 } from "uuid";

export class Page {
  constructor(data = {}) {
    this.id = data.id;
    this.pageId = data.page_id || data.pageId;
    this.title = data.title;
    this.slug = data.slug;
    this.description = data.description;
    this.ogImage = data.og_image || data.ogImage;
    this.isPublished =
      data.is_published !== undefined ? data.is_published : data.isPublished;
    this.metadata = data.metadata || {};
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Get all published pages
   */
  static async findAll(options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("pages")
        .select("*")
        .order("created_at", { ascending: false });

      if (options.publishedOnly !== false) {
        query = query.eq("is_published", true);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Find page by ID
   */
  static async findById(id) {
    return executeQuery(async (supabase) => {
      return await supabase.from("pages").select("*").eq("id", id).single();
    });
  }

  /**
   * Find page by page_id
   */
  static async findByPageId(pageId) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("pages")
        .select("*")
        .eq("page_id", pageId)
        .single();
    });
  }

  /**
   * Find page by slug
   */
  static async findBySlug(slug) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
    });
  }

  /**
   * Get page with all its sections
   */
  static async findWithSections(pageId) {
    return executeQuery(async (supabase) => {
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .select("*")
        .eq("page_id", pageId)
        .single();

      if (pageError) throw pageError;

      const { data: sections, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("page_id", page.id)
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (sectionsError) throw sectionsError;

      return {
        data: {
          ...page,
          sections: sections || [],
        },
      };
    });
  }

  /**
   * Create new page
   */
  static async create(pageData) {
    return executeQuery(async (supabase) => {
      const data = {
        page_id: pageData.pageId || uuidv4(),
        title: pageData.title,
        slug: pageData.slug,
        description: pageData.description,
        og_image: pageData.ogImage,
        is_published:
          pageData.isPublished !== undefined ? pageData.isPublished : true,
        metadata: pageData.metadata || {},
        updated_at: new Date().toISOString(),
      };

      return await supabase.from("pages").insert(data).select().single();
    });
  }

  /**
   * Update page
   */
  static async update(id, updateData) {
    return executeQuery(async (supabase) => {
      const data = {
        ...updateData,
        updated_at: new Date().toISOString(),
      };

      // Convert camelCase to snake_case for database
      if (data.pageId) {
        data.page_id = data.pageId;
        delete data.pageId;
      }
      if (data.ogImage) {
        data.og_image = data.ogImage;
        delete data.ogImage;
      }
      if (data.isPublished !== undefined) {
        data.is_published = data.isPublished;
        delete data.isPublished;
      }

      return await supabase
        .from("pages")
        .update(data)
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Delete page and all its sections
   */
  static async delete(id) {
    return executeQuery(async (supabase) => {
      // Supabase will cascade delete sections due to foreign key constraint
      return await supabase.from("pages").delete().eq("id", id);
    });
  }

  /**
   * Publish/unpublish page
   */
  static async togglePublish(id) {
    return executeQuery(async (supabase) => {
      // First get current state
      const { data: page, error: getError } = await supabase
        .from("pages")
        .select("is_published")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      // Toggle the state
      return await supabase
        .from("pages")
        .update({
          is_published: !page.is_published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Search pages by title or description
   */
  static async search(searchTerm, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("pages")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order("created_at", { ascending: false });

      if (options.publishedOnly !== false) {
        query = query.eq("is_published", true);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Get page metadata for SEO
   */
  static async getMetadata(pageId) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("pages")
        .select("title, description, og_image, metadata")
        .eq("page_id", pageId)
        .eq("is_published", true)
        .single();
    });
  }

  /**
   * Duplicate page
   */
  static async duplicate(id, newPageId) {
    return executeQuery(async (supabase) => {
      // Get original page
      const { data: originalPage, error: getError } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      // Create new page
      const newPageData = {
        page_id: newPageId || `${originalPage.page_id}-copy`,
        title: `${originalPage.title} (Copy)`,
        slug: `${originalPage.slug}-copy`,
        description: originalPage.description,
        og_image: originalPage.og_image,
        is_published: false, // Duplicated pages start as drafts
        metadata: originalPage.metadata,
      };

      const { data: newPage, error: createError } = await supabase
        .from("pages")
        .insert(newPageData)
        .select()
        .single();

      if (createError) throw createError;

      // Get and duplicate sections
      const { data: sections, error: sectionsError } = await supabase
        .from("sections")
        .select("*")
        .eq("page_id", id);

      if (sectionsError) throw sectionsError;

      if (sections && sections.length > 0) {
        const newSections = sections.map((section) => ({
          section_id: `${section.section_id}-copy`,
          page_id: newPage.id,
          type: section.type,
          title: section.title,
          content: section.content,
          order_index: section.order_index,
          is_active: section.is_active,
        }));

        const { error: insertSectionsError } = await supabase
          .from("sections")
          .insert(newSections);

        if (insertSectionsError) throw insertSectionsError;
      }

      return { data: newPage };
    });
  }

  /**
   * Get page statistics
   */
  static async getStats() {
    return executeQuery(async (supabase) => {
      const { data: published, error: publishedError } = await supabase
        .from("pages")
        .select("count", { count: "exact", head: true })
        .eq("is_published", true);

      if (publishedError) throw publishedError;

      const { data: draft, error: draftError } = await supabase
        .from("pages")
        .select("count", { count: "exact", head: true })
        .eq("is_published", false);

      if (draftError) throw draftError;

      const { data: total, error: totalError } = await supabase
        .from("pages")
        .select("count", { count: "exact", head: true });

      if (totalError) throw totalError;

      return {
        data: {
          total: total || 0,
          published: published || 0,
          draft: draft || 0,
        },
      };
    });
  }
}
