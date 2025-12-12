/**
 * ROUTES POLICIES - API endpoints per gestione politiche aziendali
 *
 * Gestisce le politiche aziendali (Qualita, Parita di Genere, etc.)
 * Include CRUD operations e upload/download documenti PDF
 *
 * Endpoints disponibili:
 * - GET /api/policies/public - Politiche pubblicate per pagina pubblica
 * - GET /api/policies - Tutte le politiche (admin only)
 * - GET /api/policies/:id - Singola policy (admin only)
 * - POST /api/policies - Crea nuova policy (admin only)
 * - PUT /api/policies/:id - Aggiorna policy (admin only)
 * - DELETE /api/policies/:id - Elimina policy (admin only)
 * - POST /api/policies/:id/document - Carica documento PDF (admin only)
 * - GET /api/policies/:id/document - Download documento (pubblico se pubblicata)
 * - DELETE /api/policies/:id/document - Elimina documento (admin only)
 *
 * @author KORSVAGEN S.R.L.
 */

import express from "express";
import { body, param, validationResult } from "express-validator";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireRole } from "../utils/auth.js";
import { supabaseClient } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Configurazione multer per upload PDF
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max per documenti policy
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Solo file PDF sono permessi"), false);
    }
  },
});

/**
 * VALIDAZIONI
 */
const validatePolicy = [
  body("title")
    .isLength({ min: 2, max: 200 })
    .withMessage("Titolo deve essere tra 2 e 200 caratteri"),
  body("slug")
    .optional()
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug deve contenere solo lettere minuscole, numeri e trattini"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Descrizione max 1000 caratteri"),
  body("content")
    .optional()
    .isLength({ max: 50000 })
    .withMessage("Contenuto max 50000 caratteri"),
  body("category")
    .optional()
    .isIn(["quality", "environment", "safety", "anticorruption", "gender_equality", "general"])
    .withMessage("Categoria non valida"),
  body("is_published")
    .optional()
    .isBoolean()
    .withMessage("is_published deve essere true o false"),
  body("display_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("display_order deve essere un numero intero positivo"),
];

/**
 * Genera slug da titolo
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // rimuovi accenti
    .replace(/[^a-z0-9\s-]/g, "") // rimuovi caratteri speciali
    .replace(/\s+/g, "-") // sostituisci spazi con trattini
    .replace(/-+/g, "-") // rimuovi trattini multipli
    .trim();
};

/**
 * GET /api/policies/public
 * Recupera politiche pubblicate per la pagina pubblica
 */
router.get("/public", async (req, res) => {
  try {
    logger.info("Richiesta politiche pubbliche");

    const { data: policies, error } = await supabaseClient
      .from("company_policies")
      .select(`
        id,
        title,
        slug,
        description,
        category,
        document_url,
        effective_date,
        revision_number,
        revision_date
      `)
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Errore database recupero politiche pubbliche:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Trovate ${policies?.length || 0} politiche pubblicate`);

    res.json({
      success: true,
      data: policies || [],
      count: policies?.length || 0
    });

  } catch (error) {
    logger.error("Errore recupero politiche pubbliche:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "POLICIES_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/policies/:id/download
 * Download pubblico del documento PDF politica aziendale
 */
router.get("/:id/download", async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica che sia un UUID valido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: "ID policy non valido",
        code: "INVALID_ID"
      });
    }

    const { data: policy, error } = await supabaseClient
      .from("company_policies")
      .select("id, title, slug, document_url, is_published")
      .eq("id", id)
      .single();

    if (error || !policy) {
      return res.status(404).json({
        success: false,
        message: "Policy non trovata",
        code: "POLICY_NOT_FOUND"
      });
    }

    // Verifica che sia pubblicata (per accesso pubblico)
    if (!policy.is_published) {
      return res.status(404).json({
        success: false,
        message: "Documento non disponibile",
        code: "DOCUMENT_NOT_AVAILABLE"
      });
    }

    if (!policy.document_url) {
      return res.status(404).json({
        success: false,
        message: "Nessun documento associato a questa policy",
        code: "DOCUMENT_NOT_FOUND"
      });
    }

    // Genera nome file per download
    const fileName = `${policy.title.replace(/[:\s]/g, '_')}.pdf`;

    // Forza download usando fl_attachment di Cloudinary
    const downloadUrl = policy.document_url.includes('?')
      ? `${policy.document_url}&fl_attachment=${encodeURIComponent(fileName)}`
      : `${policy.document_url}?fl_attachment=${encodeURIComponent(fileName)}`;

    logger.info(`Download policy ${policy.title} -> ${downloadUrl}`);

    // Redirect con parametri per forzare download
    res.redirect(302, downloadUrl);

  } catch (error) {
    logger.error("Errore download policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "POLICY_DOWNLOAD_ERROR"
    });
  }
});

/**
 * GET /api/policies
 * Recupera tutte le politiche (admin only)
 */
router.get("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const offset = (page - 1) * limit;

    logger.info(`Admin ${req.user.email} richiede lista politiche`);

    let query = supabaseClient
      .from("company_policies")
      .select("*", { count: "exact" })
      .order("display_order", { ascending: true })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: policies, error, count } = await query;

    if (error) {
      logger.error("Errore database recupero politiche admin:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    res.json({
      success: true,
      data: policies || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    logger.error("Errore recupero politiche admin:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "POLICIES_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/policies/:id
 * Recupera singola policy (admin only)
 */
router.get("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const { data: policy, error } = await supabaseClient
      .from("company_policies")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !policy) {
      return res.status(404).json({
        success: false,
        message: "Policy non trovata",
        code: "POLICY_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      data: policy
    });

  } catch (error) {
    logger.error("Errore recupero policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "POLICY_FETCH_ERROR"
    });
  }
});

/**
 * POST /api/policies
 * Crea una nuova policy (admin only)
 */
router.post("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), validatePolicy, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati non validi",
        errors: errors.array()
      });
    }

    const {
      title,
      slug,
      description,
      content,
      category = "general",
      is_published = true,
      display_order = 0,
      effective_date,
      revision_date,
      revision_number
    } = req.body;

    const finalSlug = slug || generateSlug(title);

    logger.info(`Admin ${req.user.email} crea nuova policy: ${title}`);

    // Non settiamo created_by/updated_by per evitare FK constraint con users
    const { data: policy, error } = await supabaseClient
      .from("company_policies")
      .insert({
        title,
        slug: finalSlug,
        description,
        content,
        category,
        is_published,
        display_order,
        effective_date,
        revision_date,
        revision_number
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // unique violation
        return res.status(400).json({
          success: false,
          message: "Esiste gia una policy con questo slug",
          code: "DUPLICATE_SLUG"
        });
      }
      logger.error("Errore creazione policy:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante la creazione della policy",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Policy creata con successo: ${policy.id}`);

    res.status(201).json({
      success: true,
      message: "Policy creata con successo",
      data: policy
    });

  } catch (error) {
    logger.error("Errore creazione policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "POLICY_CREATE_ERROR"
    });
  }
});

/**
 * PUT /api/policies/:id
 * Aggiorna una policy (admin only)
 */
router.put("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), validatePolicy, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati non validi",
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateData = { ...req.body };

    // Rimuovi campi che non devono essere aggiornati direttamente
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;
    delete updateData.updated_by; // Evita FK constraint
    delete updateData.document_url;
    delete updateData.document_public_id;
    delete updateData.file_size;

    logger.info(`Admin ${req.user.email} aggiorna policy: ${id}`);

    const { data: policy, error } = await supabaseClient
      .from("company_policies")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Errore aggiornamento policy:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'aggiornamento della policy",
        code: "DATABASE_ERROR"
      });
    }

    if (!policy) {
      return res.status(404).json({
        success: false,
        message: "Policy non trovata",
        code: "POLICY_NOT_FOUND"
      });
    }

    res.json({
      success: true,
      message: "Policy aggiornata con successo",
      data: policy
    });

  } catch (error) {
    logger.error("Errore aggiornamento policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "POLICY_UPDATE_ERROR"
    });
  }
});

/**
 * DELETE /api/policies/:id
 * Elimina una policy (admin only)
 */
router.delete("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Admin ${req.user.email} elimina policy: ${id}`);

    // Recupera policy per eliminare documento da Cloudinary
    const { data: existingPolicy } = await supabaseClient
      .from("company_policies")
      .select("document_public_id, title")
      .eq("id", id)
      .single();

    if (!existingPolicy) {
      return res.status(404).json({
        success: false,
        message: "Policy non trovata",
        code: "POLICY_NOT_FOUND"
      });
    }

    // Elimina documento da Cloudinary se presente
    if (existingPolicy.document_public_id) {
      try {
        await cloudinary.uploader.destroy(existingPolicy.document_public_id, { resource_type: "raw" });
        logger.info(`Documento Cloudinary eliminato: ${existingPolicy.document_public_id}`);
      } catch (cloudinaryError) {
        logger.warn("Errore eliminazione documento Cloudinary:", cloudinaryError);
      }
    }

    // Elimina da database
    const { error } = await supabaseClient
      .from("company_policies")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Errore eliminazione policy:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'eliminazione della policy",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Policy eliminata con successo: ${id} (${existingPolicy.title})`);

    res.json({
      success: true,
      message: "Policy eliminata con successo"
    });

  } catch (error) {
    logger.error("Errore eliminazione policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "POLICY_DELETE_ERROR"
    });
  }
});

/**
 * POST /api/policies/:id/document
 * Carica documento PDF per una policy (admin only)
 */
router.post("/:id/document", requireAuth, requireRole(["admin", "editor", "super_admin"]), upload.single("document"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Nessun file caricato",
        code: "NO_FILE"
      });
    }

    logger.info(`Admin ${req.user.email} carica documento per policy: ${id}`);

    // Verifica esistenza policy
    const { data: existingPolicy, error: checkError } = await supabaseClient
      .from("company_policies")
      .select("id, document_public_id, slug")
      .eq("id", id)
      .single();

    if (checkError || !existingPolicy) {
      return res.status(404).json({
        success: false,
        message: "Policy non trovata",
        code: "POLICY_NOT_FOUND"
      });
    }

    // Elimina documento precedente se esiste
    if (existingPolicy.document_public_id) {
      try {
        await cloudinary.uploader.destroy(existingPolicy.document_public_id, { resource_type: "raw" });
        logger.info(`Documento precedente eliminato: ${existingPolicy.document_public_id}`);
      } catch (cloudinaryError) {
        logger.warn("Errore eliminazione documento precedente:", cloudinaryError);
      }
    }

    // Sanitize slug for URL-safe public_id
    const sanitizedSlug = existingPolicy.slug
      .replace(/[:\s]/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');

    // Upload nuovo documento su Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "korsvagen/policies",
          public_id: `policy_${sanitizedSlug}_${Date.now()}`,
          format: "pdf"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Aggiorna database (non settiamo updated_by per evitare FK constraint)
    const { data: policy, error: updateError } = await supabaseClient
      .from("company_policies")
      .update({
        document_url: uploadResult.secure_url,
        document_public_id: uploadResult.public_id,
        file_size: req.file.size
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      logger.error("Errore aggiornamento database dopo upload:", updateError);
      return res.status(500).json({
        success: false,
        message: "Errore durante il salvataggio del documento",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Documento caricato con successo per policy ${id}`);

    res.json({
      success: true,
      message: "Documento caricato con successo",
      data: {
        document_url: policy.document_url,
        file_size: policy.file_size
      }
    });

  } catch (error) {
    logger.error("Errore upload documento policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore durante il caricamento del documento",
      code: "DOCUMENT_UPLOAD_ERROR"
    });
  }
});

/**
 * GET /api/policies/:id/document
 * Download documento policy (pubblico se policy pubblicata)
 */
router.get("/:id/document", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: policy, error } = await supabaseClient
      .from("company_policies")
      .select("document_url, title, is_published")
      .eq("id", id)
      .single();

    if (error || !policy) {
      return res.status(404).json({
        success: false,
        message: "Policy non trovata",
        code: "POLICY_NOT_FOUND"
      });
    }

    if (!policy.is_published) {
      return res.status(403).json({
        success: false,
        message: "Policy non pubblicata",
        code: "POLICY_NOT_PUBLISHED"
      });
    }

    if (!policy.document_url) {
      return res.status(404).json({
        success: false,
        message: "Documento non disponibile",
        code: "DOCUMENT_NOT_FOUND"
      });
    }

    // Redirect al documento Cloudinary
    res.redirect(policy.document_url);

  } catch (error) {
    logger.error("Errore download documento policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore durante il download del documento",
      code: "DOCUMENT_DOWNLOAD_ERROR"
    });
  }
});

/**
 * DELETE /api/policies/:id/document
 * Elimina documento da una policy (admin only)
 */
router.delete("/:id/document", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    logger.info(`Admin ${req.user.email} elimina documento policy: ${id}`);

    const { data: policy, error: fetchError } = await supabaseClient
      .from("company_policies")
      .select("document_public_id")
      .eq("id", id)
      .single();

    if (fetchError || !policy) {
      return res.status(404).json({
        success: false,
        message: "Policy non trovata",
        code: "POLICY_NOT_FOUND"
      });
    }

    if (!policy.document_public_id) {
      return res.status(404).json({
        success: false,
        message: "Nessun documento da eliminare",
        code: "DOCUMENT_NOT_FOUND"
      });
    }

    // Elimina da Cloudinary
    try {
      await cloudinary.uploader.destroy(policy.document_public_id, { resource_type: "raw" });
    } catch (cloudinaryError) {
      logger.warn("Errore eliminazione da Cloudinary:", cloudinaryError);
    }

    // Aggiorna database (non settiamo updated_by per evitare FK constraint)
    const { error: updateError } = await supabaseClient
      .from("company_policies")
      .update({
        document_url: null,
        document_public_id: null,
        file_size: null
      })
      .eq("id", id);

    if (updateError) {
      logger.error("Errore aggiornamento database dopo eliminazione:", updateError);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'eliminazione del documento",
        code: "DATABASE_ERROR"
      });
    }

    res.json({
      success: true,
      message: "Documento eliminato con successo"
    });

  } catch (error) {
    logger.error("Errore eliminazione documento policy:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "DOCUMENT_DELETE_ERROR"
    });
  }
});

export default router;
