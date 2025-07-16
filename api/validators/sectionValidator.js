/**
 * Section Validation Module
 * Comprehensive validation rules for section content management
 */

import Joi from "joi";
import { body, param, query, validationResult } from "express-validator";

/**
 * Valid section types with their specific content schemas
 */
export const SECTION_TYPES = {
  hero: "hero",
  about: "about",
  gallery: "gallery",
  contact: "contact",
  services: "services",
  testimonials: "testimonials",
  team: "team",
  cta: "cta",
};

/**
 * Content schemas for different section types
 */
const heroContentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  subtitle: Joi.string().max(300).allow(""),
  description: Joi.string().max(500).allow(""),
  backgroundImage: Joi.string().uri().allow(""),
  backgroundVideo: Joi.string().uri().allow(""),
  ctaButton: Joi.object({
    text: Joi.string().max(50),
    link: Joi.string().max(500),
    style: Joi.string().valid("primary", "secondary", "outline"),
  }).allow(null),
  overlayOpacity: Joi.number().min(0).max(1).default(0.5),
});

const aboutContentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().min(1).max(2000).required(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        alt: Joi.string().max(255).required(),
        caption: Joi.string().max(500).allow(""),
      })
    )
    .max(10),
  features: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().max(100).required(),
        description: Joi.string().max(300).required(),
        icon: Joi.string().max(50).allow(""),
      })
    )
    .max(6),
});

const galleryContentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(500).allow(""),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        thumbnail: Joi.string().uri().allow(""),
        alt: Joi.string().max(255).required(),
        caption: Joi.string().max(500).allow(""),
        category: Joi.string().max(50).allow(""),
      })
    )
    .min(1)
    .max(50),
  layout: Joi.string().valid("grid", "masonry", "carousel").default("grid"),
  columns: Joi.number().min(1).max(6).default(3),
});

const contactContentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(500).allow(""),
  showForm: Joi.boolean().default(true),
  showMap: Joi.boolean().default(false),
  mapEmbedUrl: Joi.string().uri().allow(""),
  contactInfo: Joi.object({
    phone: Joi.string().max(20).allow(""),
    email: Joi.string().email().allow(""),
    address: Joi.string().max(200).allow(""),
    hours: Joi.string().max(200).allow(""),
  }),
});

const servicesContentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(500).allow(""),
  services: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().max(100).required(),
        description: Joi.string().max(500).required(),
        image: Joi.string().uri().allow(""),
        icon: Joi.string().max(50).allow(""),
        features: Joi.array().items(Joi.string().max(100)).max(10),
        price: Joi.string().max(50).allow(""),
      })
    )
    .min(1)
    .max(20),
});

const testimonialsContentSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(500).allow(""),
  testimonials: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().max(100).required(),
        role: Joi.string().max(100).allow(""),
        company: Joi.string().max(100).allow(""),
        content: Joi.string().max(1000).required(),
        avatar: Joi.string().uri().allow(""),
        rating: Joi.number().min(1).max(5).allow(null),
      })
    )
    .min(1)
    .max(20),
});

/**
 * Main section schema with dynamic content validation
 */
export const sectionSchema = Joi.object({
  sectionId: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(1)
    .max(50)
    .messages({
      "string.pattern.base":
        "Section ID must contain only lowercase letters, numbers, and hyphens",
    }),

  pageId: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .min(1)
    .max(50)
    .required()
    .messages({
      "string.pattern.base":
        "Page ID must contain only lowercase letters, numbers, and hyphens",
    }),

  type: Joi.string()
    .valid(...Object.values(SECTION_TYPES))
    .required()
    .messages({
      "any.only": `Section type must be one of: ${Object.values(
        SECTION_TYPES
      ).join(", ")}`,
    }),

  title: Joi.string().min(1).max(200).allow("").messages({
    "string.max": "Title cannot exceed 200 characters",
  }),

  content: Joi.alternatives()
    .conditional("type", [
      { is: SECTION_TYPES.hero, then: heroContentSchema },
      { is: SECTION_TYPES.about, then: aboutContentSchema },
      { is: SECTION_TYPES.gallery, then: galleryContentSchema },
      { is: SECTION_TYPES.contact, then: contactContentSchema },
      { is: SECTION_TYPES.services, then: servicesContentSchema },
      { is: SECTION_TYPES.testimonials, then: testimonialsContentSchema },
    ])
    .default({}),

  orderIndex: Joi.number().integer().min(0).max(999).default(0).messages({
    "number.min": "Order must be a non-negative number",
    "number.max": "Order cannot exceed 999",
  }),

  isActive: Joi.boolean().default(true),

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
 * Express validator rules for section operations
 */
export const validateSectionCreate = [
  body("pageId")
    .matches(/^[a-z0-9-]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage(
      "Page ID must be 1-50 characters, lowercase letters, numbers, and hyphens only"
    ),

  body("type")
    .isIn(Object.values(SECTION_TYPES))
    .withMessage(
      `Section type must be one of: ${Object.values(SECTION_TYPES).join(", ")}`
    ),

  body("content").isObject().withMessage("Content must be an object"),

  body("orderIndex")
    .optional()
    .isInt({ min: 0, max: 999 })
    .withMessage("Order must be between 0 and 999"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  handleValidationErrors,
];

export const validateSectionUpdate = [
  param("sectionId").isUUID().withMessage("Invalid section ID format"),

  body("type")
    .optional()
    .isIn(Object.values(SECTION_TYPES))
    .withMessage(
      `Section type must be one of: ${Object.values(SECTION_TYPES).join(", ")}`
    ),

  body("content")
    .optional()
    .isObject()
    .withMessage("Content must be an object"),

  body("orderIndex")
    .optional()
    .isInt({ min: 0, max: 999 })
    .withMessage("Order must be between 0 and 999"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),

  handleValidationErrors,
];

export const validateSectionReorder = [
  param("sectionId").isUUID().withMessage("Invalid section ID format"),

  body("newOrder")
    .isInt({ min: 0, max: 999 })
    .withMessage("New order must be between 0 and 999"),

  body("direction")
    .optional()
    .isIn(["up", "down"])
    .withMessage('Direction must be either "up" or "down"'),

  handleValidationErrors,
];

export const validateSectionQuery = [
  query("activeOnly")
    .optional()
    .isBoolean()
    .withMessage("activeOnly must be a boolean"),

  query("type")
    .optional()
    .isIn(Object.values(SECTION_TYPES))
    .withMessage(
      `Type filter must be one of: ${Object.values(SECTION_TYPES).join(", ")}`
    ),

  handleValidationErrors,
];

export const validatePageParam = [
  param("pageId")
    .matches(/^[a-z0-9-]+$/)
    .isLength({ min: 1, max: 50 })
    .withMessage("Invalid page ID format"),

  handleValidationErrors,
];

export const validateSectionParam = [
  param("sectionId").isUUID().withMessage("Invalid section ID format"),

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
 * Validate section data with Joi
 */
export function validateSectionData(data, isUpdate = false) {
  const schema = isUpdate
    ? sectionSchema.fork(["pageId", "type"], (schema) => schema.optional())
    : sectionSchema;

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
}

/**
 * Sanitize section data
 */
export function sanitizeSectionData(data) {
  if (data.title) {
    data.title = data.title.trim();
  }

  // Sanitize content based on section type
  if (data.content && data.type) {
    switch (data.type) {
      case SECTION_TYPES.hero:
        if (data.content.title) data.content.title = data.content.title.trim();
        if (data.content.subtitle)
          data.content.subtitle = data.content.subtitle.trim();
        break;
      case SECTION_TYPES.about:
        if (data.content.title) data.content.title = data.content.title.trim();
        if (data.content.description)
          data.content.description = data.content.description.trim();
        break;
      // Add more sanitization rules for other types as needed
    }
  }

  return data;
}
