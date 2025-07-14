const Joi = require("joi");

// Validation schemas
const schemas = {
  // Email validation
  email: Joi.string().email().required(),

  // Phone validation (Italian format)
  phone: Joi.string()
    .pattern(/^(\+39)?[\s]?([0-9]{3}[\s]?[0-9]{3}[\s]?[0-9]{4})$/)
    .required(),

  // Text content validation
  text: Joi.string().min(1).max(1000).required(),

  // ID validation
  id: Joi.string().alphanum().required(),

  // Contact form validation
  contactForm: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(
      /^(\+39)?[\s]?([0-9]{3}[\s]?[0-9]{3}[\s]?[0-9]{4})$/
    ),
    subject: Joi.string().min(5).max(200).required(),
    message: Joi.string().min(10).max(2000).required(),
  }),

  // Page content validation
  pageContent: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    content: Joi.string().min(1).required(),
    meta_description: Joi.string().max(300),
    status: Joi.string().valid("draft", "published").default("draft"),
  }),
};

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return res.status(400).json({
        success: false,
        error: "Validation Error",
        message: errorMessage,
        details: error.details,
      });
    }

    next();
  };
};

module.exports = {
  schemas,
  validate,
};
