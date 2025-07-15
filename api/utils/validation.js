/**
 * Enhanced Validation Utilities
 * Combined Joi validation with express-validator for authentication
 * Updated for Supabase database integration
 */

import Joi from "joi";
import { body, validationResult } from "express-validator";
import { validatePasswordStrength } from "./password.js";

/**
 * Handle express-validator validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      message: "Please check your input and try again.",
      details: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }

  next();
};

/**
 * Login validation rules
 */
export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address")
    .isLength({ max: 254 })
    .withMessage("Email address is too long"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1, max: 128 })
    .withMessage("Password must be between 1 and 128 characters"),

  handleValidationErrors,
];

/**
 * Change password validation rules
 */
export const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8, max: 128 })
    .withMessage("New password must be between 8 and 128 characters")
    .custom((value) => {
      const validation = validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(", "));
      }
      return true;
    }),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Password confirmation does not match");
    }
    return true;
  }),

  handleValidationErrors,
];

/**
 * Refresh token validation
 */
export const validateRefreshToken = [
  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required")
    .isJWT()
    .withMessage("Invalid refresh token format"),

  handleValidationErrors,
];

/**
 * Sanitize user input
 */
export const sanitizeInput = (req, res, next) => {
  // Remove any HTML tags from string fields
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;
    return str.replace(/<[^>]*>/g, "").trim();
  };

  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === "string") {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  next();
};

// Validation schemas
export const pageContentValidation = Joi.object({
  pageId: Joi.string().min(1).max(100).optional(),
  title: Joi.string().min(1).max(255).required(),
  slug: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional(),
  ogImage: Joi.string().uri().optional(),
  isPublished: Joi.boolean().optional(),
  metadata: Joi.object().optional(),
});

export const sectionValidation = Joi.object({
  sectionId: Joi.string().min(1).max(100).optional(),
  pageId: Joi.string().uuid().required(),
  type: Joi.string().min(1).max(50).required(),
  title: Joi.string().min(1).max(255).optional(),
  content: Joi.object().optional(),
  orderIndex: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const mediaValidation = Joi.object({
  cloudinaryId: Joi.string().required(),
  publicId: Joi.string().required(),
  url: Joi.string().uri().required(),
  secureUrl: Joi.string().uri().required(),
  format: Joi.string().max(20).optional(),
  resourceType: Joi.string().valid("image", "video", "raw").default("image"),
  width: Joi.number().integer().positive().optional(),
  height: Joi.number().integer().positive().optional(),
  bytes: Joi.number().integer().positive().optional(),
  altText: Joi.string().max(255).optional(),
  folder: Joi.string().max(255).optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  metadata: Joi.object().optional(),
});

export const userValidation = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(1).max(255).required(),
  role: Joi.string().valid("admin", "editor").default("admin"),
  isActive: Joi.boolean().optional(),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const uploadValidation = Joi.object({
  pageId: Joi.string().optional(),
  sectionType: Joi.string().optional(),
  tags: Joi.string().optional(),
  altTexts: Joi.string().optional(),
});

export const deleteMediaValidation = Joi.object({
  mediaId: Joi.string().uuid().required(),
  deleteFromCloud: Joi.boolean().default(true),
});

// Contact form validation (keeping existing for compatibility)
export const contactFormValidation = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .pattern(/^(\+39)?[\s]?([0-9]{3}[\s]?[0-9]{3}[\s]?[0-9]{4})$/)
    .optional(),
  subject: Joi.string().min(5).max(200).required(),
  message: Joi.string().min(10).max(2000).required(),
});

/**
 * Validate request data against a schema
 */
export const validateRequest = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      })),
      value: null,
    };
  }

  return {
    isValid: true,
    errors: null,
    value,
  };
};

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validation = validateRequest(req.body, schema);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Replace req.body with validated/sanitized data
    req.body = validation.value;
    next();
  };
};

/**
 * Query parameter validation
 */
export const validateQuery = (query, schema) => {
  const { error, value } = schema.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
        value: detail.context?.value,
      })),
      value: null,
    };
  }

  return {
    isValid: true,
    errors: null,
    value,
  };
};

// Legacy export for backward compatibility
export const schemas = {
  contactForm: contactFormValidation,
  pageContent: pageContentValidation,
  section: sectionValidation,
  media: mediaValidation,
  user: userValidation,
  login: loginValidation,
};
