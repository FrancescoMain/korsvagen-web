/**
 * CONFIGURAZIONE CLOUDINARY
 *
 * Gestisce la configurazione e connessione a Cloudinary
 * per la gestione dei media (immagini, video, documenti).
 *
 * Cloudinary fornisce:
 * - Upload e storage di media
 * - Trasformazioni automatiche immagini
 * - Ottimizzazione e compressione
 * - CDN globale per delivery veloce
 * - API per gestione avanzata media
 *
 * @author KORSVAGEN S.R.L.
 */

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Carica variabili d'ambiente se non già caricate
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
}

import { logger } from "../utils/logger.js";

/**
 * Validazione configurazione Cloudinary
 *
 * Verifica che tutte le credenziali necessarie
 * siano presenti nelle variabili d'ambiente
 */
function validateCloudinaryConfig() {
  const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Variabili d'ambiente Cloudinary mancanti: ${missingVars.join(", ")}`
    );
  }

  logger.info("✅ Configurazione Cloudinary validata con successo");
}

// Validazione prima della configurazione
try {
  validateCloudinaryConfig();
} catch (error) {
  logger.error("❌ Errore validazione Cloudinary:", error.message);
  throw error;
}

/**
 * Configurazione principale Cloudinary
 *
 * Configura l'SDK Cloudinary con le credenziali
 * e impostazioni dell'applicazione
 */
export const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Utilizza sempre HTTPS
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || "korsvagen_default",
};

// Inizializzazione SDK Cloudinary
cloudinary.config(cloudinaryConfig);

/**
 * Storage Multer per Cloudinary
 *
 * Configurazione per upload diretto tramite Multer
 * con categorizzazione automatica dei file
 */
export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determina la cartella basata sul tipo di file
    let folder = "korsvagen/uploads";

    if (file.mimetype.startsWith("image/")) {
      folder = "korsvagen/images";
    } else if (file.mimetype.startsWith("video/")) {
      folder = "korsvagen/videos";
    } else if (file.mimetype === "application/pdf") {
      folder = "korsvagen/documents";
    }

    // Genera un nome file unico
    const timestamp = Date.now();
    const originalName = file.originalname.split(".")[0];
    const publicId = `${originalName}_${timestamp}`;

    return {
      folder: folder,
      public_id: publicId,
      allowed_formats: [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "pdf",
        "mp4",
        "avi",
        "mov",
      ],
      transformation: file.mimetype.startsWith("image/")
        ? [{ quality: "auto:good" }, { format: "auto" }]
        : undefined,
    };
  },
});

/**
 * Configurazioni preset per diversi tipi di upload
 */
export const uploadPresets = {
  // Immagini profilo team
  profileImage: {
    folder: "korsvagen/team/profiles",
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto:good" },
      { format: "auto" },
    ],
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },

  // Immagini progetti portfolio
  projectImage: {
    folder: "korsvagen/projects",
    transformation: [
      { width: 1200, height: 800, crop: "fill" },
      { quality: "auto:good" },
      { format: "auto" },
    ],
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },

  // Immagini news/blog
  newsImage: {
    folder: "korsvagen/news",
    transformation: [
      { width: 1000, height: 600, crop: "fill" },
      { quality: "auto:good" },
      { format: "auto" },
    ],
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },

  // Documenti generici
  document: {
    folder: "korsvagen/documents",
    allowed_formats: ["pdf", "doc", "docx", "txt"],
    resource_type: "raw",
  },

  // Video
  video: {
    folder: "korsvagen/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "avi", "mov", "webm"],
  },
};

/**
 * Utility per upload file con preset personalizzato
 *
 * @param {Buffer|string} file - File da uploadare
 * @param {string} presetType - Tipo di preset da utilizzare
 * @param {Object} options - Opzioni aggiuntive
 */
export async function uploadToCloudinary(
  file,
  presetType = "default",
  options = {}
) {
  try {
    const preset = uploadPresets[presetType] || {};

    const uploadOptions = {
      ...preset,
      ...options,
      timestamp: Math.round(Date.now() / 1000),
    };

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    logger.info(`✅ File caricato su Cloudinary: ${result.public_id}`);

    return {
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        created_at: result.created_at,
      },
    };
  } catch (error) {
    logger.error("❌ Errore upload Cloudinary:", error.message);

    return {
      success: false,
      error: {
        message: error.message,
        code: "CLOUDINARY_UPLOAD_ERROR",
      },
    };
  }
}

/**
 * Utility per eliminare file da Cloudinary
 *
 * @param {string} publicId - ID pubblico del file da eliminare
 * @param {string} resourceType - Tipo di risorsa (image, video, raw)
 */
export async function deleteFromCloudinary(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result === "ok") {
      logger.info(`✅ File eliminato da Cloudinary: ${publicId}`);
      return { success: true, result: result.result };
    } else {
      throw new Error(`Eliminazione fallita: ${result.result}`);
    }
  } catch (error) {
    logger.error("❌ Errore eliminazione Cloudinary:", error.message);

    return {
      success: false,
      error: {
        message: error.message,
        code: "CLOUDINARY_DELETE_ERROR",
      },
    };
  }
}

/**
 * Utility per generare URL trasformato
 *
 * @param {string} publicId - ID pubblico del file
 * @param {Object} transformations - Trasformazioni da applicare
 */
export function getTransformedUrl(publicId, transformations = {}) {
  try {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations,
    });
  } catch (error) {
    logger.error("❌ Errore generazione URL trasformato:", error.message);
    return null;
  }
}

/**
 * Test connessione Cloudinary
 *
 * Verifica che le credenziali siano valide
 * e il servizio sia raggiungibile
 */
export async function testCloudinaryConnection() {
  try {
    const result = await cloudinary.api.ping();

    return {
      success: true,
      message: "Connessione Cloudinary attiva",
      status: result.status,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      message: `Errore connessione Cloudinary: ${error.message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Esporta l'istanza principale di Cloudinary
 */
export { cloudinary };

logger.info("☁️  Configurazione Cloudinary inizializzata");
