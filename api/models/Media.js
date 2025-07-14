/**
 * Media Model
 * Handles media files management operations
 */

import { getSupabase, executeQuery } from "../utils/database.js";
import { deleteFromCloudinary, getMediaDetails } from "../utils/cloudinary.js";

export class Media {
  constructor(data = {}) {
    this.id = data.id;
    this.cloudinaryId = data.cloudinary_id || data.cloudinaryId;
    this.publicId = data.public_id || data.publicId;
    this.url = data.url;
    this.secureUrl = data.secure_url || data.secureUrl;
    this.format = data.format;
    this.resourceType = data.resource_type || data.resourceType;
    this.width = data.width;
    this.height = data.height;
    this.bytes = data.bytes;
    this.altText = data.alt_text || data.altText;
    this.folder = data.folder;
    this.tags = data.tags || [];
    this.metadata = data.metadata || {};
    this.createdAt = data.created_at || data.createdAt;
  }

  /**
   * Get all media files
   */
  static async findAll(options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (options.resourceType) {
        query = query.eq("resource_type", options.resourceType);
      }

      if (options.folder) {
        query = query.ilike("folder", `${options.folder}%`);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 50) - 1
        );
      }

      return await query;
    });
  }

  /**
   * Find media by ID
   */
  static async findById(id) {
    return executeQuery(async (supabase) => {
      return await supabase.from("media").select("*").eq("id", id).single();
    });
  }

  /**
   * Find media by Cloudinary ID
   */
  static async findByCloudinaryId(cloudinaryId) {
    return executeQuery(async (supabase) => {
      return await supabase
        .from("media")
        .select("*")
        .eq("cloudinary_id", cloudinaryId)
        .single();
    });
  }

  /**
   * Find media by folder
   */
  static async findByFolder(folder, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("media")
        .select("*")
        .eq("folder", folder)
        .order("created_at", { ascending: false });

      if (options.resourceType) {
        query = query.eq("resource_type", options.resourceType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Find media by tags
   */
  static async findByTags(tags, options = {}) {
    return executeQuery(async (supabase) => {
      const tagArray = Array.isArray(tags) ? tags : [tags];

      let query = supabase
        .from("media")
        .select("*")
        .overlaps("tags", tagArray)
        .order("created_at", { ascending: false });

      if (options.resourceType) {
        query = query.eq("resource_type", options.resourceType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Create new media record
   */
  static async create(mediaData) {
    return executeQuery(async (supabase) => {
      const data = {
        cloudinary_id: mediaData.cloudinaryId || mediaData.cloudinary_id,
        public_id: mediaData.publicId || mediaData.public_id,
        url: mediaData.url,
        secure_url: mediaData.secureUrl || mediaData.secure_url,
        format: mediaData.format,
        resource_type:
          mediaData.resourceType || mediaData.resource_type || "image",
        width: mediaData.width,
        height: mediaData.height,
        bytes: mediaData.bytes,
        alt_text: mediaData.altText || mediaData.alt_text,
        folder: mediaData.folder,
        tags: mediaData.tags || [],
        metadata: mediaData.metadata || {},
      };

      return await supabase.from("media").insert(data).select().single();
    });
  }

  /**
   * Update media record
   */
  static async update(id, updateData) {
    return executeQuery(async (supabase) => {
      const data = { ...updateData };

      // Convert camelCase to snake_case for database
      if (data.cloudinaryId) {
        data.cloudinary_id = data.cloudinaryId;
        delete data.cloudinaryId;
      }
      if (data.publicId) {
        data.public_id = data.publicId;
        delete data.publicId;
      }
      if (data.secureUrl) {
        data.secure_url = data.secureUrl;
        delete data.secureUrl;
      }
      if (data.resourceType) {
        data.resource_type = data.resourceType;
        delete data.resourceType;
      }
      if (data.altText) {
        data.alt_text = data.altText;
        delete data.altText;
      }

      return await supabase
        .from("media")
        .update(data)
        .eq("id", id)
        .select()
        .single();
    });
  }

  /**
   * Delete media record and file from Cloudinary
   */
  static async delete(id, deleteFromCloud = true) {
    return executeQuery(async (supabase) => {
      // Get media info first
      const { data: media, error: getError } = await supabase
        .from("media")
        .select("*")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      // Delete from Cloudinary if requested
      if (deleteFromCloud && media.cloudinary_id) {
        const cloudinaryResult = await deleteFromCloudinary(
          media.cloudinary_id,
          media.resource_type
        );

        if (!cloudinaryResult.success) {
          console.warn(
            `Failed to delete from Cloudinary: ${cloudinaryResult.error}`
          );
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from("media")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      return { data: media };
    });
  }

  /**
   * Search media by filename or alt text
   */
  static async search(searchTerm, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("media")
        .select("*")
        .or(
          `cloudinary_id.ilike.%${searchTerm}%,alt_text.ilike.%${searchTerm}%,folder.ilike.%${searchTerm}%`
        )
        .order("created_at", { ascending: false });

      if (options.resourceType) {
        query = query.eq("resource_type", options.resourceType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Get media statistics
   */
  static async getStats() {
    return executeQuery(async (supabase) => {
      const { data: total, error: totalError } = await supabase
        .from("media")
        .select("count", { count: "exact", head: true });

      if (totalError) throw totalError;

      const { data: byType, error: typeError } = await supabase
        .from("media")
        .select("resource_type, count(*), sum(bytes)")
        .group("resource_type");

      if (typeError) throw typeError;

      const { data: totalSize, error: sizeError } = await supabase
        .from("media")
        .select("sum(bytes)");

      if (sizeError) throw sizeError;

      return {
        data: {
          total: total || 0,
          totalSizeBytes: totalSize?.[0]?.sum || 0,
          byType: byType || [],
        },
      };
    });
  }

  /**
   * Get media by size range
   */
  static async findBySize(minBytes = 0, maxBytes = null, options = {}) {
    return executeQuery(async (supabase) => {
      let query = supabase
        .from("media")
        .select("*")
        .gte("bytes", minBytes)
        .order("bytes", { ascending: false });

      if (maxBytes) {
        query = query.lte("bytes", maxBytes);
      }

      if (options.resourceType) {
        query = query.eq("resource_type", options.resourceType);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      return await query;
    });
  }

  /**
   * Get unused media (not referenced in any section)
   */
  static async findUnused(options = {}) {
    return executeQuery(async (supabase) => {
      // This is a complex query that would need to check if cloudinary_id
      // appears in any section's content.images or content.videos
      // For now, return all media and let the application logic handle filtering
      const { data: allMedia, error: mediaError } = await supabase
        .from("media")
        .select("*")
        .order("created_at", { ascending: false });

      if (mediaError) throw mediaError;

      const { data: sections, error: sectionsError } = await supabase
        .from("sections")
        .select("content");

      if (sectionsError) throw sectionsError;

      // Extract all cloudinary IDs used in sections
      const usedIds = new Set();
      sections.forEach((section) => {
        if (section.content) {
          if (section.content.images) {
            section.content.images.forEach((img) => {
              if (img.cloudinaryId) usedIds.add(img.cloudinaryId);
            });
          }
          if (section.content.videos) {
            section.content.videos.forEach((vid) => {
              if (vid.cloudinaryId) usedIds.add(vid.cloudinaryId);
            });
          }
        }
      });

      // Filter unused media
      const unusedMedia = allMedia.filter(
        (media) => !usedIds.has(media.cloudinary_id)
      );

      return {
        data: options.limit ? unusedMedia.slice(0, options.limit) : unusedMedia,
      };
    });
  }

  /**
   * Sync with Cloudinary (refresh metadata)
   */
  static async syncWithCloudinary(id) {
    return executeQuery(async (supabase) => {
      // Get current record
      const { data: media, error: getError } = await supabase
        .from("media")
        .select("*")
        .eq("id", id)
        .single();

      if (getError) throw getError;

      // Get fresh data from Cloudinary
      const cloudinaryResult = await getMediaDetails(media.cloudinary_id);

      if (!cloudinaryResult.success) {
        throw new Error(
          `Failed to get Cloudinary details: ${cloudinaryResult.error}`
        );
      }

      // Update database with fresh data
      const updateData = {
        url: cloudinaryResult.data.url,
        secure_url: cloudinaryResult.data.secure_url,
        format: cloudinaryResult.data.format,
        width: cloudinaryResult.data.width,
        height: cloudinaryResult.data.height,
        bytes: cloudinaryResult.data.bytes,
        metadata: {
          ...media.metadata,
          lastSync: new Date().toISOString(),
          cloudinaryData: cloudinaryResult.data,
        },
      };

      return await supabase
        .from("media")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();
    });
  }
}
