/**
 * Media Controller
 * Business logic for media file management with Cloudinary integration
 */

import { Media } from "../models/Media.js";
import {
  validateMediaData,
  validateUploadConfig,
  validateFileType,
  validateFileSize,
} from "../validators/mediaValidator.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  transformMedia,
  getMediaDetails,
  optimizeMedia,
} from "../utils/cloudinary.js";

export class MediaController {
  /**
   * Get all media files with optional filtering
   */
  static async getAllMedia(options = {}) {
    try {
      const {
        resourceType,
        folder,
        tags,
        limit = 50,
        offset = 0,
        sortBy = "created_at",
        sortOrder = "desc",
      } = options;

      // Get media from database
      const result = await Media.findAll({
        resourceType,
        folder,
        tags,
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
        sortOrder,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch media");
      }

      const media = (result.data || []).map((item) => ({
        id: item.id,
        cloudinaryId: item.cloudinary_id,
        publicId: item.public_id,
        url: item.url,
        secureUrl: item.secure_url,
        format: item.format,
        resourceType: item.resource_type,
        width: item.width,
        height: item.height,
        bytes: item.bytes,
        altText: item.alt_text,
        folder: item.folder,
        tags: item.tags || [],
        metadata: item.metadata || {},
        createdAt: item.created_at,
      }));

      return {
        success: true,
        data: {
          media,
          pagination: {
            limit: parseInt(limit),
            offset: parseInt(offset),
            total: media.length,
          },
        },
      };
    } catch (error) {
      console.error("MediaController.getAllMedia error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve media",
      };
    }
  }

  /**
   * Get a specific media file by ID
   */
  static async getMediaById(mediaId) {
    try {
      const result = await Media.findById(mediaId);

      if (!result.success || !result.data) {
        return {
          success: false,
          error: "Media not found",
          statusCode: 404,
        };
      }

      const media = result.data;

      return {
        success: true,
        data: {
          id: media.id,
          cloudinaryId: media.cloudinary_id,
          publicId: media.public_id,
          url: media.url,
          secureUrl: media.secure_url,
          format: media.format,
          resourceType: media.resource_type,
          width: media.width,
          height: media.height,
          bytes: media.bytes,
          altText: media.alt_text,
          folder: media.folder,
          tags: media.tags || [],
          metadata: media.metadata || {},
          createdAt: media.created_at,
        },
      };
    } catch (error) {
      console.error("MediaController.getMediaById error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve media",
      };
    }
  }

  /**
   * Upload multiple files to Cloudinary and save to database
   */
  static async uploadMedia(files, config = {}, userId) {
    try {
      if (!files || files.length === 0) {
        return {
          success: false,
          error: "No files provided",
        };
      }

      // Validate upload configuration
      const configValidation = validateUploadConfig(config);
      if (configValidation.error) {
        return {
          success: false,
          error: "Invalid upload configuration",
          details: configValidation.error.details.map((detail) => ({
            field: detail.path.join("."),
            message: detail.message,
          })),
        };
      }

      const validConfig = configValidation.value;
      const uploadResults = [];
      const errors = [];

      // Process each file
      for (const file of files) {
        try {
          // Validate file type and size
          const fileValidation = validateFileSize(file);
          if (!fileValidation.valid) {
            errors.push({
              filename: file.originalname,
              error: fileValidation.error,
            });
            continue;
          }

          // Upload to Cloudinary
          const uploadResult = await uploadToCloudinary(file, {
            folder: validConfig.folder,
            tags: validConfig.tags,
            transformation: validConfig.transformation,
            resource_type: fileValidation.type === "video" ? "video" : "image",
          });

          if (!uploadResult.success) {
            errors.push({
              filename: file.originalname,
              error: uploadResult.error || "Upload failed",
            });
            continue;
          }

          const cloudinaryData = uploadResult.data;

          // Prepare media data for database
          const mediaData = {
            cloudinaryId: cloudinaryData.public_id,
            publicId: cloudinaryData.public_id,
            url: cloudinaryData.url,
            secureUrl: cloudinaryData.secure_url,
            format: cloudinaryData.format,
            resourceType: cloudinaryData.resource_type,
            width: cloudinaryData.width || null,
            height: cloudinaryData.height || null,
            bytes: cloudinaryData.bytes,
            altText: config.altText || "",
            folder: cloudinaryData.folder || validConfig.folder,
            tags: cloudinaryData.tags || validConfig.tags,
            metadata: {
              originalFilename: file.originalname,
              uploadedBy: userId,
              ...cloudinaryData.metadata,
            },
          };

          // Validate media data
          const validation = validateMediaData(mediaData);
          if (validation.error) {
            errors.push({
              filename: file.originalname,
              error: "Data validation failed",
              details: validation.error.details,
            });
            continue;
          }

          // Save to database
          const saveResult = await Media.create({
            cloudinary_id: mediaData.cloudinaryId,
            public_id: mediaData.publicId,
            url: mediaData.url,
            secure_url: mediaData.secureUrl,
            format: mediaData.format,
            resource_type: mediaData.resourceType,
            width: mediaData.width,
            height: mediaData.height,
            bytes: mediaData.bytes,
            alt_text: mediaData.altText,
            folder: mediaData.folder,
            tags: mediaData.tags,
            metadata: mediaData.metadata,
            created_by: userId,
          });

          if (saveResult.success) {
            uploadResults.push({
              id: saveResult.data.id,
              filename: file.originalname,
              cloudinaryId: mediaData.cloudinaryId,
              url: mediaData.url,
              secureUrl: mediaData.secureUrl,
              format: mediaData.format,
              resourceType: mediaData.resourceType,
              bytes: mediaData.bytes,
            });
          } else {
            errors.push({
              filename: file.originalname,
              error: saveResult.error || "Database save failed",
            });
          }
        } catch (fileError) {
          console.error(
            `Error processing file ${file.originalname}:`,
            fileError
          );
          errors.push({
            filename: file.originalname,
            error: fileError.message || "Processing failed",
          });
        }
      }

      return {
        success: uploadResults.length > 0,
        data: {
          uploaded: uploadResults,
          errors: errors,
          summary: {
            total: files.length,
            successful: uploadResults.length,
            failed: errors.length,
          },
        },
        message: `${uploadResults.length} file(s) uploaded successfully`,
      };
    } catch (error) {
      console.error("MediaController.uploadMedia error:", error);
      return {
        success: false,
        error: error.message || "Failed to upload media",
      };
    }
  }

  /**
   * Update media metadata
   */
  static async updateMedia(mediaId, updateData, userId) {
    try {
      // Check if media exists
      const existingMedia = await Media.findById(mediaId);
      if (!existingMedia.success || !existingMedia.data) {
        return {
          success: false,
          error: "Media not found",
          statusCode: 404,
        };
      }

      // Prepare update object
      const updateObject = {};

      if (updateData.altText !== undefined)
        updateObject.alt_text = updateData.altText;
      if (updateData.tags !== undefined) updateObject.tags = updateData.tags;

      if (updateData.metadata) {
        updateObject.metadata = {
          ...existingMedia.data.metadata,
          ...updateData.metadata,
          updatedBy: userId,
        };
      }

      updateObject.updated_by = userId;

      // Update the media
      const updateResult = await Media.update(mediaId, updateObject);

      if (!updateResult.success) {
        throw new Error(updateResult.error || "Failed to update media");
      }

      return {
        success: true,
        data: {
          id: updateResult.data.id,
          altText: updateResult.data.alt_text,
          tags: updateResult.data.tags,
          metadata: updateResult.data.metadata,
          updatedAt: updateResult.data.updated_at,
        },
        message: "Media updated successfully",
      };
    } catch (error) {
      console.error("MediaController.updateMedia error:", error);
      return {
        success: false,
        error: error.message || "Failed to update media",
      };
    }
  }

  /**
   * Delete media from Cloudinary and database
   */
  static async deleteMedia(mediaId, userId) {
    try {
      // Check if media exists
      const existingMedia = await Media.findById(mediaId);
      if (!existingMedia.success || !existingMedia.data) {
        return {
          success: false,
          error: "Media not found",
          statusCode: 404,
        };
      }

      const media = existingMedia.data;

      // Delete from Cloudinary
      const cloudinaryResult = await deleteFromCloudinary(
        media.public_id || media.cloudinary_id,
        media.resource_type
      );

      if (!cloudinaryResult.success) {
        console.warn(
          `Failed to delete from Cloudinary: ${cloudinaryResult.error}`
        );
        // Continue with database deletion even if Cloudinary deletion fails
      }

      // Delete from database
      const deleteResult = await Media.delete(mediaId);

      if (!deleteResult.success) {
        throw new Error(
          deleteResult.error || "Failed to delete media from database"
        );
      }

      return {
        success: true,
        message: "Media deleted successfully",
      };
    } catch (error) {
      console.error("MediaController.deleteMedia error:", error);
      return {
        success: false,
        error: error.message || "Failed to delete media",
      };
    }
  }

  /**
   * Get media gallery with organized folder structure
   */
  static async getMediaGallery(options = {}) {
    try {
      const { folder = "", resourceType, limit = 100, offset = 0 } = options;

      // Get media from database
      const result = await this.getAllMedia({
        folder,
        resourceType,
        limit,
        offset,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      if (!result.success) {
        return result;
      }

      const media = result.data.media;

      // Organize by folders
      const folderStructure = {};
      const rootFiles = [];

      media.forEach((item) => {
        if (item.folder && item.folder !== "") {
          if (!folderStructure[item.folder]) {
            folderStructure[item.folder] = [];
          }
          folderStructure[item.folder].push(item);
        } else {
          rootFiles.push(item);
        }
      });

      return {
        success: true,
        data: {
          folders: folderStructure,
          rootFiles,
          totalFiles: media.length,
          pagination: result.data.pagination,
        },
      };
    } catch (error) {
      console.error("MediaController.getMediaGallery error:", error);
      return {
        success: false,
        error: error.message || "Failed to retrieve media gallery",
      };
    }
  }

  /**
   * Optimize existing media files
   */
  static async optimizeMedia(mediaIds, transformations = {}, userId) {
    try {
      if (!mediaIds || mediaIds.length === 0) {
        return {
          success: false,
          error: "No media IDs provided",
        };
      }

      const optimizationResults = [];
      const errors = [];

      for (const mediaId of mediaIds) {
        try {
          // Get media from database
          const mediaResult = await Media.findById(mediaId);
          if (!mediaResult.success || !mediaResult.data) {
            errors.push({
              mediaId,
              error: "Media not found",
            });
            continue;
          }

          const media = mediaResult.data;

          // Apply optimizations
          const optimizeResult = await optimizeMedia(
            media.public_id || media.cloudinary_id,
            media.resource_type,
            transformations
          );

          if (optimizeResult.success) {
            // Update media record with new optimized data
            const updateResult = await Media.update(mediaId, {
              url: optimizeResult.data.url,
              secure_url: optimizeResult.data.secure_url,
              bytes: optimizeResult.data.bytes,
              metadata: {
                ...media.metadata,
                optimized: true,
                optimizedAt: new Date().toISOString(),
                optimizedBy: userId,
                originalBytes: media.bytes,
              },
              updated_by: userId,
            });

            if (updateResult.success) {
              optimizationResults.push({
                mediaId,
                originalBytes: media.bytes,
                optimizedBytes: optimizeResult.data.bytes,
                savings: media.bytes - optimizeResult.data.bytes,
                url: optimizeResult.data.url,
              });
            } else {
              errors.push({
                mediaId,
                error: "Failed to update optimized media data",
              });
            }
          } else {
            errors.push({
              mediaId,
              error: optimizeResult.error || "Optimization failed",
            });
          }
        } catch (itemError) {
          console.error(`Error optimizing media ${mediaId}:`, itemError);
          errors.push({
            mediaId,
            error: itemError.message || "Processing failed",
          });
        }
      }

      return {
        success: optimizationResults.length > 0,
        data: {
          optimized: optimizationResults,
          errors: errors,
          summary: {
            total: mediaIds.length,
            successful: optimizationResults.length,
            failed: errors.length,
            totalSavings: optimizationResults.reduce(
              (sum, item) => sum + item.savings,
              0
            ),
          },
        },
        message: `${optimizationResults.length} file(s) optimized successfully`,
      };
    } catch (error) {
      console.error("MediaController.optimizeMedia error:", error);
      return {
        success: false,
        error: error.message || "Failed to optimize media",
      };
    }
  }

  /**
   * Get media transformations for responsive images
   */
  static async getMediaTransformations(mediaId, transformations) {
    try {
      const mediaResult = await this.getMediaById(mediaId);
      if (!mediaResult.success) {
        return mediaResult;
      }

      const media = mediaResult.data;
      const transformedUrls = {};

      for (const [name, transformation] of Object.entries(transformations)) {
        const transformResult = await transformMedia(
          media.cloudinaryId,
          transformation
        );

        if (transformResult.success) {
          transformedUrls[name] = transformResult.data.url;
        }
      }

      return {
        success: true,
        data: {
          original: media.url,
          transformations: transformedUrls,
        },
      };
    } catch (error) {
      console.error("MediaController.getMediaTransformations error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate transformations",
      };
    }
  }
}
