/**
 * Media Upload API Endpoint
 * Handles secure file uploads to Cloudinary
 */

import {
  upload,
  uploadToCloudinary,
  generateFolderPath,
} from "../utils/cloudinary.js";
import { Media } from "../models/Media.js";
import { applyMiddleware } from "../utils/middleware.js";
import { validateRequest, uploadValidation } from "../utils/validation.js";

async function handler(req, res) {
  if (req.method === "POST") {
    // Handle file upload
    upload.array("files", 10)(req, res, async (err) => {
      if (err) {
        console.error("Upload error:", err);
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      try {
        const { pageId, sectionType, tags, altTexts } = req.body;
        const files = req.files;

        if (!files || files.length === 0) {
          return res.status(400).json({
            success: false,
            error: "No files uploaded",
          });
        }

        // Process uploaded files
        const uploadResults = [];
        const altTextArray = altTexts ? altTexts.split(",") : [];

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const altText = altTextArray[i] || "";

          // File was already uploaded to Cloudinary via multer-storage-cloudinary
          const mediaData = {
            cloudinaryId: file.filename, // This is actually the public_id from Cloudinary
            publicId: file.filename,
            url: file.path, // This is the Cloudinary URL
            secureUrl: file.path.replace("http://", "https://"),
            format: file.originalname.split(".").pop().toLowerCase(),
            resourceType: file.mimetype.startsWith("video/")
              ? "video"
              : "image",
            width: file.width,
            height: file.height,
            bytes: file.size,
            altText: altText,
            folder: generateFolderPath(pageId, sectionType),
            tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
            metadata: {
              originalName: file.originalname,
              mimetype: file.mimetype,
              uploadedAt: new Date().toISOString(),
            },
          };

          // Save to database
          const dbResult = await Media.create(mediaData);

          if (dbResult.success) {
            uploadResults.push({
              success: true,
              data: dbResult.data,
              originalName: file.originalname,
            });
          } else {
            uploadResults.push({
              success: false,
              error: dbResult.error,
              originalName: file.originalname,
            });
          }
        }

        // Check if all uploads were successful
        const successCount = uploadResults.filter((r) => r.success).length;
        const failCount = uploadResults.length - successCount;

        res.status(successCount > 0 ? 200 : 400).json({
          success: successCount > 0,
          message: `${successCount} files uploaded successfully${
            failCount > 0 ? `, ${failCount} failed` : ""
          }`,
          data: uploadResults,
          stats: {
            total: uploadResults.length,
            successful: successCount,
            failed: failCount,
          },
        });
      } catch (error) {
        console.error("Upload processing error:", error);
        res.status(500).json({
          success: false,
          error: "Failed to process uploads",
        });
      }
    });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
}

export default applyMiddleware(handler);
