/**
 * Media Optimization API Endpoint
 * Handles bulk media optimization and transformation
 */

import { applyMiddleware } from "../utils/middleware.js";
import { requireAuth } from "../utils/auth.js";
import { validateOptimizeRequest } from "../validators/mediaValidator.js";
import { MediaController } from "../controllers/mediaController.js";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
      message: "Only POST method is supported for media optimization",
    });
  }

  // Authentication required for optimization
  const authResult = await requireAuth(req, res);
  if (!authResult.success) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "You must be logged in to optimize media",
    });
  }

  const userId = authResult.user.id;

  try {
    const { mediaIds, transformations = {} } = req.body;

    // Validate request body
    if (!mediaIds || !Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid mediaIds",
        message: "mediaIds must be a non-empty array",
      });
    }

    if (mediaIds.length > 50) {
      return res.status(400).json({
        success: false,
        error: "Too many media files",
        message: "Maximum 50 media files can be optimized at once",
      });
    }

    // Validate transformations
    const validTransformations = {};
    if (
      transformations.quality &&
      (typeof transformations.quality !== "number" ||
        transformations.quality < 1 ||
        transformations.quality > 100)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid quality",
        message: "Quality must be a number between 1 and 100",
      });
    }
    if (
      transformations.format &&
      !["auto", "jpg", "png", "webp"].includes(transformations.format)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid format",
        message: "Format must be one of: auto, jpg, png, webp",
      });
    }

    // Use default optimization settings if none provided
    const optimizationConfig = {
      quality: transformations.quality || 85,
      format: transformations.format || "auto",
      ...transformations,
    };

    // Optimize media files
    const result = await MediaController.optimizeMedia(
      mediaIds,
      optimizationConfig,
      userId
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        message: result.error,
      });
    }

    return res.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error("Media optimization error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to optimize media",
      message: error.message,
    });
  }
}

// Apply middleware and export
export default applyMiddleware(handler, {
  auth: false, // Authentication handled in handler
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit to 10 optimization requests per 15 minutes
  },
  cors: true,
  compression: true,
});
