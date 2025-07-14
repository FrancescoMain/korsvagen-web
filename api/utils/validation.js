const Joi = require("joi");

/**
 * Enhanced Validation Utilities with Joi
 * Updated for Supabase database integration
 */

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
