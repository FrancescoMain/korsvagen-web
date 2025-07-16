/**
 * Page Validation Module
 * Comprehensive validation rules for page content management
 */

import Joi from "joi";
import { body, param, query, validationResult } from "express-validator";

/**
 * Joi schema for page validation
 */
export const pageSchema = Joi.object({
  pageId: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(1)
    .max(50)
    .required()
    .messages({
      "string.pattern.base":
        "Page ID must contain only lowercase letters, numbers, and hyphens",
      "string.min": "Page ID must be at least 1 character long",
      "string.max": "Page ID cannot exceed 50 characters",
    }),

  metadata: Joi.object({
    title: Joi.string().min(1).max(100).required().messages({
      "string.min": "Title is required",
      "string.max": "Title cannot exceed 100 characters",
    }),

    description: Joi.string().min(1).max(300).required().messages({
      "string.min": "Description is required",
      "string.max": "Description cannot exceed 300 characters",
    }),

    ogImage: Joi.string().uri().allow("", null).messages({
      "string.uri": "OG Image must be a valid URL",
    }),

    keywords: Joi.array()
      .items(Joi.string().max(50))
      .max(10)
      .default([])
      .messages({
        "array.max": "Cannot have more than 10 keywords",
      }),

    canonicalUrl: Joi.string().uri().allow("", null).messages({
      "string.uri": "Canonical URL must be a valid URL",
    }),
  }).required(),

  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(1)
    .max(100)
    .allow("", null)
    .messages({
      "string.pattern.base":
        "Slug must contain only lowercase letters, numbers, and hyphens",
    }),

  isPublished: Joi.boolean().default(false),

  publishedAt: Joi.date().iso().allow(null),

  customFields: Joi.object()
    .pattern(
      Joi.string(),
      Joi.alternatives().try(
        Joi.string(),
        Joi.number(),
        Joi.boolean(),
        Joi.array(),
        Joi.object()
      )
    )
    .default({}),
});

/**
 * Express validator rules for page creation/update
 */
export const validatePageCreate = [
  body("pageId")
    .matches(/^[a-z0-9-]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Page ID must be 1-50 characters, lowercase letters, numbers, and hyphens only"
    ),

  body("metadata.title")
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage("Title is required and must be 1-100 characters"),

  body("metadata.description")
    .isLength({ min: 1, max: 300 })
    .trim()
    .withMessage("Description is required and must be 1-300 characters"),

  body("metadata.ogImage")
    .optional()
    .isURL()
    .withMessage("OG Image must be a valid URL"),

  body("metadata.keywords")
    .optional()
    .isArray({ max: 10 })
    .withMessage("Keywords must be an array with maximum 10 items"),

  body("slug")
    .optional()
    .matches(/^[a-z0-9-]*$/)
    .isLength({ max: 100 })
    .withMessage(
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  handleValidationErrors,
];

export const validatePageUpdate = [
  param("pageId")
    .matches(/^[a-z0-9-]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage("Invalid page ID format"),

  body("metadata.title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage("Title must be 1-100 characters"),

  body("metadata.description")
    .optional()
    .isLength({ min: 1, max: 300 })
    .trim()
    .withMessage("Description must be 1-300 characters"),

  body("metadata.ogImage")
    .optional()
    .isURL()
    .withMessage("OG Image must be a valid URL"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  handleValidationErrors,
];

export const validatePageQuery = [
  query("withSections")
    .optional()
    .isBoolean()
    .withMessage("withSections must be a boolean"),

  query("published")
    .optional()
    .isBoolean()
    .withMessage("published must be a boolean"),

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

export const validatePageParam = [
  param("pageId")
    .matches(/^[a-z0-9-]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage("Invalid page ID format"),

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
 * Validate page data with Joi
 */
export function validatePageData(data, isUpdate = false) {
  const schema = isUpdate
    ? pageSchema.fork(["pageId"], (schema) => schema.optional())
    : pageSchema;
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
}

/**
 * Sanitize page data
 */
export function sanitizePageData(data) {
  if (data.metadata) {
    if (data.metadata.title) {
      data.metadata.title = data.metadata.title.trim();
    }
    if (data.metadata.description) {
      data.metadata.description = data.metadata.description.trim();
    }
  }

  if (data.slug) {
    data.slug = data.slug.toLowerCase().trim();
  }

  return data;
}
