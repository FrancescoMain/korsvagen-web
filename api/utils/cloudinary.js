/**
 * Cloudinary Configuration and Utilities
 * Optimized for media management and transformations
 */

import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v4 as uuidv4 } from "uuid";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Generate folder path for organized media storage
 */
export const generateFolderPath = (pageId, sectionType) => {
  return `korsvagen/${pageId}/${sectionType}`;
};

/**
 * Cloudinary storage configuration for multer
 */
export const createCloudinaryStorage = (folder = "korsvagen/uploads") => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const { pageId, sectionType } = req.body;
      const folderPath =
        pageId && sectionType
          ? generateFolderPath(pageId, sectionType)
          : folder;

      return {
        folder: folderPath,
        public_id: `${Date.now()}-${uuidv4()}`,
        allowed_formats: [
          "jpg",
          "jpeg",
          "png",
          "webp",
          "gif",
          "svg",
          "mp4",
          "mov",
          "avi",
        ],
        transformation: file.mimetype.startsWith("image/")
          ? [{ quality: "auto:good" }, { fetch_format: "auto" }]
          : undefined,
      };
    },
  });
};

/**
 * Multer configuration for file uploads
 */
export const upload = multer({
  storage: createCloudinaryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/mov",
      "video/avi",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

/**
 * Image transformation presets
 */
export const transformations = {
  thumbnail: {
    width: 300,
    height: 300,
    crop: "fill",
    quality: "auto:good",
    fetch_format: "auto",
  },
  medium: {
    width: 800,
    height: 600,
    crop: "limit",
    quality: "auto:good",
    fetch_format: "auto",
  },
  large: {
    width: 1920,
    height: 1080,
    crop: "limit",
    quality: "auto:good",
    fetch_format: "auto",
  },
  hero: {
    width: 1920,
    height: 1080,
    crop: "fill",
    gravity: "center",
    quality: "auto:good",
    fetch_format: "auto",
  },
};

/**
 * Generate responsive image URLs
 */
export const generateResponsiveUrls = (publicId) => {
  const baseOptions = { secure: true };

  return {
    thumbnail: cloudinary.url(publicId, {
      ...baseOptions,
      ...transformations.thumbnail,
    }),
    medium: cloudinary.url(publicId, {
      ...baseOptions,
      ...transformations.medium,
    }),
    large: cloudinary.url(publicId, {
      ...baseOptions,
      ...transformations.large,
    }),
    original: cloudinary.url(publicId, baseOptions),
  };
};

/**
 * Upload file to Cloudinary with custom options
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      resource_type: "auto",
      quality: "auto:good",
      fetch_format: "auto",
      folder: "korsvagen/uploads",
    };

    const uploadOptions = { ...defaultOptions, ...options };
    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    return {
      success: true,
      data: {
        cloudinary_id: result.public_id,
        public_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        folder: result.folder,
        responsive_urls:
          result.resource_type === "image"
            ? generateResponsiveUrls(result.public_id)
            : null,
      },
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (
  publicId,
  resourceType = "image"
) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return {
      success: result.result === "ok",
      result: result.result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get media details from Cloudinary
 */
export const getMediaDetails = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);

    return {
      success: true,
      data: {
        cloudinary_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
        folder: result.folder,
        tags: result.tags,
        responsive_urls:
          result.resource_type === "image"
            ? generateResponsiveUrls(result.public_id)
            : null,
      },
    };
  } catch (error) {
    console.error("Cloudinary get details error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * List files in a folder
 */
export const listMediaInFolder = async (folder, options = {}) => {
  try {
    const defaultOptions = {
      type: "upload",
      prefix: folder,
      max_results: 50,
    };

    const searchOptions = { ...defaultOptions, ...options };
    const result = await cloudinary.api.resources(searchOptions);

    return {
      success: true,
      data: result.resources.map((resource) => ({
        cloudinary_id: resource.public_id,
        url: resource.url,
        secure_url: resource.secure_url,
        format: resource.format,
        resource_type: resource.resource_type,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        created_at: resource.created_at,
        folder: resource.folder,
        responsive_urls:
          resource.resource_type === "image"
            ? generateResponsiveUrls(resource.public_id)
            : null,
      })),
      total_count: result.total_count,
    };
  } catch (error) {
    console.error("Cloudinary list media error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Search media by tags
 */
export const searchMediaByTags = async (tags, options = {}) => {
  try {
    const expression = Array.isArray(tags) ? tags.join(" AND ") : tags;
    const result = await cloudinary.search
      .expression(`tags:${expression}`)
      .sort_by([["created_at", "desc"]])
      .max_results(options.max_results || 50)
      .execute();

    return {
      success: true,
      data: result.resources.map((resource) => ({
        cloudinary_id: resource.public_id,
        url: resource.url,
        secure_url: resource.secure_url,
        format: resource.format,
        resource_type: resource.resource_type,
        width: resource.width,
        height: resource.height,
        bytes: resource.bytes,
        created_at: resource.created_at,
        tags: resource.tags,
        responsive_urls:
          resource.resource_type === "image"
            ? generateResponsiveUrls(resource.public_id)
            : null,
      })),
      total_count: result.total_count,
    };
  } catch (error) {
    console.error("Cloudinary search error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default cloudinary;
