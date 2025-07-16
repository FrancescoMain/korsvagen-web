/**
 * Media Validation Module
 * Comprehensive validation rules for media file management
 */

import Joi from "joi";
import { body, param, query, validationResult } from "express-validator";
import multer from "multer";
import path from "path";

/**
 * Allowed file types and configurations
 */
export const MEDIA_CONFIG = {
  images: {
    extensions: ["jpg", "jpeg", "png", "webp", "gif"],
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    maxSize: 10 * 1024 * 1024, // 10MB
    quality: 85,
  },
  videos: {
    extensions: ["mp4", "webm", "avi", "mov"],
    mimeTypes: ["video/mp4", "video/webm", "video/avi", "video/quicktime"],
    maxSize: 100 * 1024 * 1024, // 100MB
    quality: 80,
  },
  documents: {
    extensions: ["pdf", "doc", "docx"],
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSize: 25 * 1024 * 1024, // 25MB
  },
};

/**
 * Joi schema for media validation
 */
export const mediaSchema = Joi.object({
  cloudinaryId: Joi.string().min(1).max(255).required().messages({
    "string.min": "Cloudinary ID is required",
    "string.max": "Cloudinary ID cannot exceed 255 characters",
  }),

  publicId: Joi.string().min(1).max(255).required().messages({
    "string.min": "Public ID is required",
    "string.max": "Public ID cannot exceed 255 characters",
  }),

  url: Joi.string().uri().required().messages({
    "string.uri": "URL must be a valid URI",
  }),

  secureUrl: Joi.string().uri().required().messages({
    "string.uri": "Secure URL must be a valid URI",
  }),

  format: Joi.string()
    .valid(
      ...MEDIA_CONFIG.images.extensions,
      ...MEDIA_CONFIG.videos.extensions,
      ...MEDIA_CONFIG.documents.extensions
    )
    .required()
    .messages({
      "any.only": `Format must be one of: ${[
        ...MEDIA_CONFIG.images.extensions,
        ...MEDIA_CONFIG.videos.extensions,
        ...MEDIA_CONFIG.documents.extensions,
      ].join(", ")}`,
    }),

  resourceType: Joi.string()
    .valid("image", "video", "document", "raw")
    .required()
    .messages({
      "any.only": "Resource type must be one of: image, video, document, raw",
    }),

  width: Joi.number().integer().min(1).max(10000).allow(null).messages({
    "number.min": "Width must be at least 1 pixel",
    "number.max": "Width cannot exceed 10000 pixels",
  }),

  height: Joi.number().integer().min(1).max(10000).allow(null).messages({
    "number.min": "Height must be at least 1 pixel",
    "number.max": "Height cannot exceed 10000 pixels",
  }),

  bytes: Joi.number().integer().min(1).required().messages({
    "number.min": "File size must be at least 1 byte",
  }),

  altText: Joi.string().max(255).allow("", null).messages({
    "string.max": "Alt text cannot exceed 255 characters",
  }),

  folder: Joi.string()
    .pattern(/^[a-zA-Z0-9\/_-]*$/)
    .max(100)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Folder path can only contain letters, numbers, slashes, underscores, and hyphens",
      "string.max": "Folder path cannot exceed 100 characters",
    }),

  tags: Joi.array().items(Joi.string().max(50)).max(20).default([]).messages({
    "array.max": "Cannot have more than 20 tags",
    "string.max": "Each tag cannot exceed 50 characters",
  }),

  metadata: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives().try(Joi.string(), Joi.number(), Joi.boolean())
    )
    .default({}),
});

/**
 * Upload configuration schema
 */
export const uploadConfigSchema = Joi.object({
  folder: Joi.string()
    .pattern(/^[a-zA-Z0-9\/_-]*$/)
    .max(100)
    .default("uploads")
    .messages({
      "string.pattern.base":
        "Folder path can only contain letters, numbers, slashes, underscores, and hyphens",
    }),

  tags: Joi.array().items(Joi.string().max(50)).max(10).default([]).messages({
    "array.max": "Cannot have more than 10 tags",
  }),

  transformation: Joi.object({
    quality: Joi.number().min(1).max(100).default(85),
    format: Joi.string().valid("auto", "jpg", "png", "webp").default("auto"),
    width: Joi.number().min(1).max(5000).allow(null),
    height: Joi.number().min(1).max(5000).allow(null),
    crop: Joi.string()
      .valid("scale", "fit", "fill", "crop", "thumb")
      .default("scale"),
  }).default({}),
});

/**
 * Multer configuration for file uploads
 */
export const multerConfig = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Math.max(
      MEDIA_CONFIG.images.maxSize,
      MEDIA_CONFIG.videos.maxSize,
      MEDIA_CONFIG.documents.maxSize
    ),
    files: 10, // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().substring(1);
    const allowedExtensions = [
      ...MEDIA_CONFIG.images.extensions,
      ...MEDIA_CONFIG.videos.extensions,
      ...MEDIA_CONFIG.documents.extensions,
    ];

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `File type .${ext} is not allowed. Allowed types: ${allowedExtensions.join(
            ", "
          )}`
        ),
        false
      );
    }
  },
});

/**
 * Express validator rules for media operations
 */
export const validateMediaUpload = [
  body("folder")
    .optional()
    .matches(/^[a-zA-Z0-9\/_-]*$/)
    .isLength({ max: 100 })
    .withMessage(
      "Folder path can only contain letters, numbers, slashes, underscores, and hyphens"
    ),

  body("tags")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Tags must be an array with maximum 10 items"),

  body("tags.*")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Each tag cannot exceed 50 characters"),

  body("altText")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Alt text cannot exceed 255 characters"),

  body("quality")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Quality must be between 1 and 100"),

  handleValidationErrors,
];

export const validateMediaUpdate = [
  param("mediaId").isUUID().withMessage("Invalid media ID format"),

  body("altText")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Alt text cannot exceed 255 characters"),

  body("tags")
    .optional()
    .isArray({ max: 20 })
    .withMessage("Tags must be an array with maximum 20 items"),

  body("tags.*")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Each tag cannot exceed 50 characters"),

  handleValidationErrors,
];

export const validateMediaQuery = [
  query("resourceType")
    .optional()
    .isIn(["image", "video", "document", "raw"])
    .withMessage("Resource type must be one of: image, video, document, raw"),

  query("folder")
    .optional()
    .matches(/^[a-zA-Z0-9\/_-]*$/)
    .withMessage(
      "Folder path can only contain letters, numbers, slashes, underscores, and hyphens"
    ),

  query("tags")
    .optional()
    .isString()
    .withMessage("Tags filter must be a string"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Offset must be a non-negative integer"),

  handleValidationErrors,
];

export const validateMediaParam = [
  param("mediaId").isUUID().withMessage("Invalid media ID format"),

  handleValidationErrors,
];

export const validateOptimizeRequest = [
  body("mediaIds")
    .isArray({ min: 1, max: 50 })
    .withMessage("Media IDs must be an array with 1-50 items"),

  body("mediaIds.*").isUUID().withMessage("Each media ID must be a valid UUID"),

  body("transformations")
    .optional()
    .isObject()
    .withMessage("Transformations must be an object"),

  body("transformations.quality")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Quality must be between 1 and 100"),

  body("transformations.format")
    .optional()
    .isIn(["auto", "jpg", "png", "webp"])
    .withMessage("Format must be one of: auto, jpg, png, webp"),

  handleValidationErrors,
];

/**
 * Handle express-validator validation errors
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Please check your input and try again.",
      details: errors.array().map((error) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
}

/**
 * Validate media data with Joi
 */
export function validateMediaData(data) {
  return mediaSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
}

/**
 * Validate upload configuration
 */
export function validateUploadConfig(data) {
  return uploadConfigSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
}

/**
 * File type validation helper
 */
export function validateFileType(file) {
  const ext = path.extname(file.originalname).toLowerCase().substring(1);
  const mimeType = file.mimetype;

  // Check if it's an image
  if (
    MEDIA_CONFIG.images.extensions.includes(ext) &&
    MEDIA_CONFIG.images.mimeTypes.includes(mimeType)
  ) {
    return {
      valid: true,
      type: "image",
      maxSize: MEDIA_CONFIG.images.maxSize,
    };
  }

  // Check if it's a video
  if (
    MEDIA_CONFIG.videos.extensions.includes(ext) &&
    MEDIA_CONFIG.videos.mimeTypes.includes(mimeType)
  ) {
    return {
      valid: true,
      type: "video",
      maxSize: MEDIA_CONFIG.videos.maxSize,
    };
  }

  // Check if it's a document
  if (
    MEDIA_CONFIG.documents.extensions.includes(ext) &&
    MEDIA_CONFIG.documents.mimeTypes.includes(mimeType)
  ) {
    return {
      valid: true,
      type: "document",
      maxSize: MEDIA_CONFIG.documents.maxSize,
    };
  }

  return {
    valid: false,
    error: `File type .${ext} (${mimeType}) is not supported`,
  };
}

/**
 * File size validation helper
 */
export function validateFileSize(file) {
  const validation = validateFileType(file);

  if (!validation.valid) {
    return validation;
  }

  if (file.size > validation.maxSize) {
    const maxSizeMB = Math.round(validation.maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit for ${validation.type} files`,
    };
  }

  return { valid: true, type: validation.type };
}
