/**
 * ROUTES REVIEWS - API endpoints per gestione recensioni
 *
 * Gestisce le recensioni dei clienti per la homepage
 * Include CRUD operations per amministratori e endpoint pubblico
 *
 * Endpoints disponibili:
 * - GET /api/reviews/public - Recensioni attive per homepage
 * - GET /api/reviews - Tutte le recensioni (admin only)
 * - POST /api/reviews - Crea nuova recensione (admin only)
 * - PUT /api/reviews/:id - Aggiorna recensione (admin only)
 * - DELETE /api/reviews/:id - Elimina recensione (admin only)
 *
 * @author KORSVAGEN S.R.L.
 */

import express from "express";
import { body, validationResult, param } from "express-validator";
import { requireAuth, requireRole } from "../utils/auth.js";
import { supabaseClient } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * VALIDAZIONI
 */
const validateReview = [
  body("author_name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome autore deve essere tra 2 e 100 caratteri"),
  body("author_company")
    .optional()
    .isLength({ max: 150 })
    .withMessage("Azienda non può superare 150 caratteri"),
  body("review_text")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Testo recensione deve essere tra 10 e 1000 caratteri"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating deve essere un numero tra 1 e 5"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active deve essere true o false"),
  body("display_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("display_order deve essere un numero intero positivo"),
];

const validateReviewUpdate = [
  param("id")
    .isUUID()
    .withMessage("ID recensione non valido"),
  ...validateReview,
];

/**
 * GET /api/reviews/public
 * Recupera recensioni attive per la homepage (pubblico)
 */
router.get("/public", async (req, res) => {
  try {
    logger.info("Richiesta recensioni pubbliche");

    const { data: reviews, error } = await supabaseClient
      .from("reviews")
      .select("id, author_name, author_company, review_text, rating")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Errore database recupero recensioni pubbliche:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    // Se non ci sono recensioni, restituisci quelle di default
    if (!reviews || reviews.length === 0) {
      logger.info("Nessuna recensione trovata, uso dati di default");
      const defaultReviews = [
        {
          id: "default-1",
          author_name: "Mario Rossi",
          author_company: "Imprenditore edile",
          review_text: "Eccezionale! Korsvagen ha realizzato la casa dei nostri sogni con professionalità e attenzione ai dettagli incredibili.",
          rating: 5,
        },
        {
          id: "default-2",
          author_name: "Giulia Verdi",
          author_company: "Architetto",
          review_text: "Ottima esperienza, team competente e disponibile. Consigliatissimi per chi cerca qualità e affidabilità.",
          rating: 5,
        },
        {
          id: "default-3",
          author_name: "Laura Bianchi",
          author_company: "Cliente privato",
          review_text: "Hanno trasformato la mia visione in realtà. Ogni fase del progetto è stata gestita con cura e precisione.",
          rating: 5,
        },
      ];

      return res.json({
        success: true,
        data: defaultReviews,
        count: defaultReviews.length
      });
    }

    logger.info(`Trovate ${reviews.length} recensioni attive`);

    res.json({
      success: true,
      data: reviews,
      count: reviews.length
    });

  } catch (error) {
    logger.error("Errore recupero recensioni pubbliche:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "REVIEWS_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/reviews
 * Recupera tutte le recensioni (admin only)
 */
router.get("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    const offset = (page - 1) * limit;

    logger.info(`Admin ${req.user.email} richiede lista recensioni (page: ${page}, limit: ${limit})`);

    let query = supabaseClient
      .from("reviews")
      .select(`
        id,
        author_name,
        author_company,
        review_text,
        rating,
        is_active,
        display_order,
        created_at,
        updated_at,
        admin_users!reviews_created_by_fkey(username),
        admin_users!reviews_updated_by_fkey(username)
      `)
      .order("display_order", { ascending: true })
      .range(offset, offset + limit - 1);

    // Filtro per stato attivo se specificato
    if (active !== undefined) {
      query = query.eq("is_active", active === "true");
    }

    const { data: reviews, error, count } = await query;

    if (error) {
      logger.error("Errore database recupero recensioni admin:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Trovate ${reviews?.length || 0} recensioni`);

    res.json({
      success: true,
      data: reviews || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    logger.error("Errore recupero recensioni admin:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "REVIEWS_FETCH_ERROR"
    });
  }
});

/**
 * POST /api/reviews
 * Crea una nuova recensione (admin only)
 */
router.post("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), validateReview, async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati non validi",
        errors: errors.array()
      });
    }

    const { author_name, author_company, review_text, rating, is_active = true, display_order = 0 } = req.body;

    logger.info(`Admin ${req.user.email} crea nuova recensione: ${author_name}`);

    const { data: review, error } = await supabaseClient
      .from("reviews")
      .insert({
        author_name,
        author_company,
        review_text,
        rating,
        is_active,
        display_order,
        created_by: req.user.id,
        updated_by: req.user.id
      })
      .select()
      .single();

    if (error) {
      logger.error("Errore creazione recensione:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante la creazione della recensione",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Recensione creata con successo: ${review.id}`);

    res.status(201).json({
      success: true,
      message: "Recensione creata con successo",
      data: review
    });

  } catch (error) {
    logger.error("Errore creazione recensione:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "REVIEW_CREATE_ERROR"
    });
  }
});

/**
 * PUT /api/reviews/:id
 * Aggiorna una recensione (admin only)
 */
router.put("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), validateReviewUpdate, async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati non validi",
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { author_name, author_company, review_text, rating, is_active, display_order } = req.body;

    logger.info(`Admin ${req.user.email} aggiorna recensione: ${id}`);

    // Verifica esistenza recensione
    const { data: existingReview } = await supabaseClient
      .from("reviews")
      .select("id")
      .eq("id", id)
      .single();

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Recensione non trovata",
        code: "REVIEW_NOT_FOUND"
      });
    }

    const updateData = {
      updated_by: req.user.id
    };

    // Aggiungi solo i campi presenti nella request
    if (author_name !== undefined) updateData.author_name = author_name;
    if (author_company !== undefined) updateData.author_company = author_company;
    if (review_text !== undefined) updateData.review_text = review_text;
    if (rating !== undefined) updateData.rating = rating;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data: review, error } = await supabaseClient
      .from("reviews")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Errore aggiornamento recensione:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'aggiornamento della recensione",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Recensione aggiornata con successo: ${id}`);

    res.json({
      success: true,
      message: "Recensione aggiornata con successo",
      data: review
    });

  } catch (error) {
    logger.error("Errore aggiornamento recensione:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "REVIEW_UPDATE_ERROR"
    });
  }
});

/**
 * DELETE /api/reviews/:id
 * Elimina una recensione (admin only)
 */
router.delete("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "ID recensione non valido",
        code: "INVALID_REVIEW_ID"
      });
    }

    logger.info(`Admin ${req.user.email} elimina recensione: ${id}`);

    // Verifica esistenza recensione
    const { data: existingReview } = await supabaseClient
      .from("reviews")
      .select("id, author_name")
      .eq("id", id)
      .single();

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Recensione non trovata",
        code: "REVIEW_NOT_FOUND"
      });
    }

    const { error } = await supabaseClient
      .from("reviews")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Errore eliminazione recensione:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'eliminazione della recensione",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Recensione eliminata con successo: ${id} (${existingReview.author_name})`);

    res.json({
      success: true,
      message: "Recensione eliminata con successo"
    });

  } catch (error) {
    logger.error("Errore eliminazione recensione:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "REVIEW_DELETE_ERROR"
    });
  }
});

export default router;