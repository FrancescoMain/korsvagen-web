/**
 * ROUTES MEDIA - API endpoints per gestione media
 *
 * Gestisce upload, modifica ed eliminazione di media attraverso Cloudinary
 * Include supporto per immagini, video e documenti.
 *
 * Endpoints disponibili:
 * - POST /api/media/upload - Upload file singolo
 * - POST /api/media/upload/video - Upload video specifico
 * - DELETE /api/media/:publicId - Elimina media
 * - GET /api/media/library - Lista media library
 *
 * @author KORSVAGEN S.R.L.
 */

import express from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../utils/auth.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  cloudinaryStorage,
} from "../config/cloudinary.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Configurazione Multer per upload
const upload = multer({
  storage: cloudinaryStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/webm",
      "application/pdf",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo file non supportato: ${file.mimetype}`), false);
    }
  },
});

/**
 * POST /api/media/upload
 * Upload generico di file media
 */
router.post(
  "/upload",
  requireAuth,
  requireRole(["admin", "editor"]),
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nessun file fornito",
        });
      }

      logger.info(`📁 Upload file: ${req.file.originalname} by ${req.user.username}`);

      res.json({
        success: true,
        message: "File caricato con successo",
        data: {
          public_id: req.file.public_id,
          secure_url: req.file.secure_url,
          url: req.file.url,
          format: req.file.format,
          resource_type: req.file.resource_type,
          bytes: req.file.bytes,
          width: req.file.width,
          height: req.file.height,
        },
      });
    } catch (error) {
      logger.error("❌ Errore upload file:", error);
      res.status(500).json({
        success: false,
        message: "Errore durante l'upload del file",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * POST /api/media/upload/video
 * Upload specifico per video hero
 */
router.post(
  "/upload/video",
  requireAuth,
  requireRole(["admin", "editor"]),
  upload.single("video"), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Nessun video fornito",
        });
      }

      // Verifica che sia effettivamente un video
      if (!req.file.mimetype.startsWith("video/")) {
        return res.status(400).json({
          success: false,
          message: "Il file deve essere un video",
        });
      }

      logger.info(`🎥 Upload video: ${req.file.originalname} by ${req.user.username}`);

      res.json({
        success: true,
        message: "Video caricato con successo",
        data: {
          public_id: req.file.public_id,
          secure_url: req.file.secure_url,
          url: req.file.url,
          format: req.file.format,
          resource_type: req.file.resource_type,
          bytes: req.file.bytes,
          width: req.file.width,
          height: req.file.height,
          duration: req.file.duration,
        },
      });
    } catch (error) {
      logger.error("❌ Errore upload video:", error);
      res.status(500).json({
        success: false,
        message: "Errore durante l'upload del video",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * DELETE /api/media/:publicId
 * Elimina un file media da Cloudinary
 */
router.delete(
  "/:publicId",
  requireAuth,
  requireRole(["admin", "editor"]),
  async (req, res) => {
    try {
      const { publicId } = req.params;
      const { resourceType = "image" } = req.query;

      // Decodifica il public_id se contiene caratteri speciali
      const decodedPublicId = decodeURIComponent(publicId);

      logger.info(`🗑️  Eliminazione media: ${decodedPublicId} by ${req.user.username}`);

      const result = await deleteFromCloudinary(decodedPublicId, resourceType);

      if (result.success) {
        res.json({
          success: true,
          message: "File eliminato con successo",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Errore durante l'eliminazione del file",
          error: result.error,
        });
      }
    } catch (error) {
      logger.error("❌ Errore eliminazione media:", error);
      res.status(500).json({
        success: false,
        message: "Errore interno del server",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * GET /api/media/library
 * Recupera lista dei media dalla library
 */
router.get(
  "/library",
  requireAuth,
  requireRole(["admin", "editor"]),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type = "all" } = req.query;

      // Per ora ritorniamo dati mock, ma qui si potrebbe implementare
      // la chiamata alle API Cloudinary per recuperare la lista
      const mockData = {
        images: [
          {
            public_id: "korsvagen/images/hero_bg_1",
            secure_url: "https://res.cloudinary.com/korsvagen/image/upload/v1/korsvagen/images/hero_bg_1",
            format: "jpg",
            width: 1920,
            height: 1080,
            bytes: 245760,
            created_at: "2024-01-15T10:00:00Z",
          },
        ],
        videos: [
          {
            public_id: "korsvagen/videos/hero_video_1",
            secure_url: "https://res.cloudinary.com/korsvagen/video/upload/v1/korsvagen/videos/hero_video_1",
            format: "mp4",
            width: 1920,
            height: 1080,
            bytes: 15728640,
            duration: 30.5,
            created_at: "2024-01-15T10:00:00Z",
          },
        ],
      };

      let data = [];
      if (type === "all") {
        data = [...mockData.images, ...mockData.videos];
      } else if (type === "images") {
        data = mockData.images;
      } else if (type === "videos") {
        data = mockData.videos;
      }

      res.json({
        success: true,
        data: {
          media: data,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: data.length,
            pages: Math.ceil(data.length / limit),
          },
        },
      });
    } catch (error) {
      logger.error("❌ Errore recupero media library:", error);
      res.status(500).json({
        success: false,
        message: "Errore durante il recupero della media library",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * Middleware per gestire errori Multer
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File troppo grande. Dimensione massima: 100MB",
      });
    }
  }

  if (error.message && error.message.includes("Tipo file non supportato")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  logger.error("❌ Errore middleware media:", error);
  res.status(500).json({
    success: false,
    message: "Errore interno del server",
  });
});

export default router;