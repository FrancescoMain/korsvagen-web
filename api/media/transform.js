/**
 * Media Transform API Endpoint
 * Handles image transformations and responsive URL generation
 */

import { Media } from "../models/Media.js";
import {
  generateResponsiveUrls,
  transformations,
} from "../utils/cloudinary.js";
import { applyMiddleware } from "../utils/middleware.js";
import cloudinary from "../utils/cloudinary.js";

async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { mediaId, transformation = "medium" } = req.query;

      if (!mediaId) {
        return res.status(400).json({
          success: false,
          error: "mediaId is required",
        });
      }

      // Get media record
      const mediaResult = await Media.findById(mediaId);

      if (!mediaResult.success || !mediaResult.data) {
        return res.status(404).json({
          success: false,
          error: "Media not found",
        });
      }

      const media = mediaResult.data;

      // Generate responsive URLs
      const responsiveUrls = generateResponsiveUrls(media.cloudinary_id);

      // Get specific transformation URL
      const transformationConfig = transformations[transformation];
      let transformedUrl = media.secure_url;

      if (transformationConfig && media.resource_type === "image") {
        transformedUrl = cloudinary.url(media.cloudinary_id, {
          secure: true,
          ...transformationConfig,
        });
      }

      res.json({
        success: true,
        data: {
          media,
          transformedUrl,
          responsiveUrls,
          availableTransformations: Object.keys(transformations),
        },
      });
    } catch (error) {
      console.error("Transform media error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to generate transformations",
      });
    }
  } else if (req.method === "POST") {
    // Custom transformation
    try {
      const {
        mediaId,
        width,
        height,
        crop = "limit",
        quality = "auto:good",
        format = "auto",
      } = req.body;

      if (!mediaId) {
        return res.status(400).json({
          success: false,
          error: "mediaId is required",
        });
      }

      // Get media record
      const mediaResult = await Media.findById(mediaId);

      if (!mediaResult.success || !mediaResult.data) {
        return res.status(404).json({
          success: false,
          error: "Media not found",
        });
      }

      const media = mediaResult.data;

      if (media.resource_type !== "image") {
        return res.status(400).json({
          success: false,
          error: "Transformations only available for images",
        });
      }

      // Build custom transformation
      const customTransformation = {
        secure: true,
        quality,
        fetch_format: format,
      };

      if (width) customTransformation.width = parseInt(width);
      if (height) customTransformation.height = parseInt(height);
      if (crop) customTransformation.crop = crop;

      const transformedUrl = cloudinary.url(
        media.cloudinary_id,
        customTransformation
      );

      res.json({
        success: true,
        data: {
          media,
          transformedUrl,
          transformation: customTransformation,
        },
      });
    } catch (error) {
      console.error("Custom transform error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create custom transformation",
      });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}

export default applyMiddleware(handler);
