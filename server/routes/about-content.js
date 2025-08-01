/**
 * ROUTES ABOUT CONTENT - API endpoints per gestione contenuti pagina About
 *
 * Gestisce tutti i contenuti testuali della pagina About
 * Include sezioni: Hero, Storia, Mission, Vision, Perché Sceglierci
 *
 * Endpoints disponibili:
 * - GET /api/about-content/public - Contenuti per pagina About (pubblico)
 * - GET /api/about-content - Contenuti per admin (admin only)
 * - PUT /api/about-content - Aggiorna contenuti (admin only)
 *
 * @author KORSVAGEN S.R.L.
 */

import express from "express";
import { body, validationResult } from "express-validator";
import { requireAuth, requireRole } from "../utils/auth.js";
import { supabaseClient } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * VALIDAZIONI
 */
const validateAboutContent = [
  // Hero Section
  body("hero_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo hero deve essere tra 1 e 100 caratteri"),
  body("hero_subtitle")
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage("Sottotitolo hero deve essere tra 1 e 200 caratteri"),

  // Storia Section
  body("storia_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo storia deve essere tra 1 e 100 caratteri"),
  body("storia_content")
    .optional()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Contenuto storia deve essere tra 1 e 2000 caratteri"),

  // Mission Section
  body("mission_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo mission deve essere tra 1 e 100 caratteri"),
  body("mission_content")
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Contenuto mission deve essere tra 1 e 1000 caratteri"),

  // Vision Section
  body("vision_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo vision deve essere tra 1 e 100 caratteri"),
  body("vision_content")
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Contenuto vision deve essere tra 1 e 1000 caratteri"),

  // Perché Sceglierci Section
  body("why_choose_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo perché sceglierci deve essere tra 1 e 100 caratteri"),
  body("why_choose_subtitle")
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage("Sottotitolo perché sceglierci deve essere tra 1 e 200 caratteri"),

  // Esperienza Consolidata
  body("experience_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo esperienza deve essere tra 1 e 100 caratteri"),
  body("experience_content")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Contenuto esperienza deve essere tra 1 e 500 caratteri"),

  // Qualità Garantita
  body("quality_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo qualità deve essere tra 1 e 100 caratteri"),
  body("quality_content")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Contenuto qualità deve essere tra 1 e 500 caratteri"),

  // Approccio Personalizzato
  body("approach_title")
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage("Titolo approccio deve essere tra 1 e 100 caratteri"),
  body("approach_content")
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage("Contenuto approccio deve essere tra 1 e 500 caratteri"),
];

/**
 * GET /api/about-content/public
 * Recupera contenuti About per la pagina pubblica
 */
router.get("/public", async (req, res) => {
  try {
    logger.info("Richiesta contenuti About pubblici");

    const { data: content, error } = await supabaseClient
      .from("about_content")
      .select("*")
      .maybeSingle();

    if (error) {
      logger.error("Errore database recupero contenuti About pubblici:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    // Se non ci sono contenuti, restituisci quelli di default
    if (!content) {
      logger.info("Nessun contenuto About trovato, uso dati di default");
      const defaultContent = {
        id: "default",
        hero_title: "Chi Siamo",
        hero_subtitle: "Esperienza, professionalità e passione per l'edilizia di qualità",
        
        storia_title: "La Nostra Storia",
        storia_content: "KORSVAGEN S.R.L. nasce dalla passione per l'edilizia e dalla volontà di offrire servizi di costruzione e progettazione di altissima qualità. Con anni di esperienza nel settore, ci siamo affermati come punto di riferimento per privati e aziende che cercano professionalità e affidabilità.\n\nLa nostra filosofia è semplice: trasformare i sogni dei nostri clienti in realtà, garantendo sempre la massima qualità, rispetto dei tempi e trasparenza in ogni fase del progetto.",
        
        mission_title: "Mission",
        mission_content: "Realizzare progetti edilizi di eccellenza, combinando innovazione tecnologica, sostenibilità ambientale e tradizione artigianale per costruire il futuro delle nostre comunità.",
        
        vision_title: "Vision",
        vision_content: "Essere il partner di fiducia per chiunque voglia costruire il proprio futuro, offrendo soluzioni personalizzate e all'avanguardia che rispettino l'ambiente e durino nel tempo.",
        
        why_choose_title: "Perché Sceglierci",
        why_choose_subtitle: "I vantaggi che ci distinguono nel panorama dell'edilizia",
        
        experience_title: "Esperienza Consolidata",
        experience_content: "Oltre 15 anni di attività nel settore edile ci hanno permesso di perfezionare le nostre competenze e di affrontare ogni tipo di progetto con professionalità.",
        
        quality_title: "Qualità Garantita",
        quality_content: "Utilizziamo solo materiali di prima qualità e tecnologie all'avanguardia per garantire risultati duraturi e soddisfacenti.",
        
        approach_title: "Approccio Personalizzato",
        approach_content: "Ogni progetto è unico. Ascoltiamo le esigenze del cliente e sviluppiamo soluzioni su misura che rispettino budget e tempistiche.",
      };

      return res.json({
        success: true,
        data: defaultContent
      });
    }

    logger.info("Contenuti About recuperati con successo");

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    logger.error("Errore recupero contenuti About pubblici:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "ABOUT_CONTENT_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/about-content
 * Recupera contenuti About per admin
 */
router.get("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    logger.info(`Admin ${req.user.email} richiede contenuti About`);

    const { data: content, error } = await supabaseClient
      .from("about_content")
      .select(`
        *,
        created_by_user:admin_users!about_content_created_by_fkey(username),
        updated_by_user:admin_users!about_content_updated_by_fkey(username)
      `)
      .maybeSingle();

    if (error) {
      logger.error("Errore database recupero contenuti About admin:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    logger.info("Contenuti About admin recuperati con successo");

    res.json({
      success: true,
      data: content || {}
    });

  } catch (error) {
    logger.error("Errore recupero contenuti About admin:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "ABOUT_CONTENT_FETCH_ERROR"
    });
  }
});

/**
 * PUT /api/about-content
 * Aggiorna contenuti About (admin only)
 */
router.put("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), validateAboutContent, async (req, res) => {
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

    logger.info(`Admin ${req.user.email} aggiorna contenuti About`);

    // Verifica se esiste già un record
    const { data: existingContent, error: checkError } = await supabaseClient
      .from("about_content")
      .select("id")
      .maybeSingle(); // Usa maybeSingle() invece di single() per gestire il caso di zero record

    if (checkError) {
      logger.error("Errore controllo esistenza contenuti About:", checkError);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    const updateData = {
      ...req.body,
      updated_by: req.user.id
    };

    let result;

    if (existingContent) {
      // Aggiorna record esistente
      result = await supabaseClient
        .from("about_content")
        .update(updateData)
        .eq("id", existingContent.id)
        .select()
        .single();
    } else {
      // Crea nuovo record
      updateData.created_by = req.user.id;
      result = await supabaseClient
        .from("about_content")
        .insert(updateData)
        .select()
        .single();
    }

    const { data: content, error } = result;

    if (error) {
      logger.error("Errore aggiornamento contenuti About:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'aggiornamento dei contenuti",
        code: "DATABASE_ERROR"
      });
    }

    logger.info("Contenuti About aggiornati con successo");

    res.json({
      success: true,
      message: "Contenuti About aggiornati con successo",
      data: content
    });

  } catch (error) {
    logger.error("Errore aggiornamento contenuti About:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "ABOUT_CONTENT_UPDATE_ERROR"
    });
  }
});

export default router;