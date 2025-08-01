/**
 * ROUTES PAGES - API endpoints per gestione pagine
 *
 * Gestisce il contenuto delle pagine del sito web
 * Include CRUD operations per hero sections, sezioni e contenuti.
 *
 * Endpoints disponibili:
 * - GET /api/pages/:pageId - Recupera dati pagina specifica
 * - PUT /api/pages/:pageId - Aggiorna pagina (admin only)
 * - GET /api/pages/public/:pageId - Dati pubblici per frontend
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
const validatePageUpdate = [
  param("pageId")
    .isLength({ min: 1, max: 50 })
    .withMessage("Page ID non valido"),
  body("heroTitle")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Hero title troppo lungo"),
  body("heroSubtitle")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Hero subtitle troppo lungo"),
  body("heroVideo")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true; // Allow empty strings
      // Basic URL validation for non-empty values
      return /^https?:\/\/.+/.test(value);
    })
    .withMessage("URL video non valido"),
  body("heroImage")
    .optional()
    .custom((value) => {
      if (!value || value === "") return true; // Allow empty strings
      // Basic URL validation for non-empty values
      return /^https?:\/\/.+/.test(value);
    })
    .withMessage("URL immagine non valido"),
  body("sections")
    .optional()
    .isObject()
    .withMessage("Sections deve essere un oggetto"),
  body("metaTitle")
    .optional()
    .isLength({ max: 200 })
    .withMessage("Meta title troppo lungo"),
  body("metaDescription")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Meta description troppo lungo"),
];

/**
 * GET /api/pages/public/:pageId
 * Recupera dati pubblici di una pagina per il frontend
 */
router.get("/public/:pageId", async (req, res) => {
  try {
    const { pageId } = req.params;
    
    logger.info(`Richiesta dati pubblici pagina: ${pageId}`);

    // Query con timeout
    const queryPromise = supabaseClient
      .from("pages")
      .select("page_id, hero_title, hero_subtitle, hero_video, hero_image, sections, meta_title, meta_description")
      .eq("page_id", pageId)
      .single();

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Database query timeout")), 5000)
    );

    const { data: page, error } = await Promise.race([queryPromise, timeoutPromise]);

    if (error || !page) {
      logger.warn(`Pagina ${pageId} non trovata, uso dati di default`);
      
      // Dati di fallback per pagina non trovata
      const defaultPages = {
        home: {
          page_id: "home",
          hero_title: "KORSVAGEN",
          hero_subtitle: "Costruzioni di qualità dal 1985",
          hero_video: null,
          hero_image: null,
          sections: {
            services: {
              title: "I Nostri Servizi",
              subtitle: "Soluzioni innovative per ogni esigenza",
              content: "Offriamo servizi completi nel settore delle costruzioni con esperienza trentennale e tecnologie all'avanguardia."
            },
            about: {
              title: "Chi Siamo",
              subtitle: "La nostra storia",
              content: "Con oltre 30 anni di esperienza nel settore delle costruzioni, KORSVAGEN è sinonimo di qualità e affidabilità."
            }
          },
          meta_title: "KORSVAGEN - Costruzioni di qualità",
          meta_description: "Azienda leader nelle costruzioni con oltre 30 anni di esperienza"
        },
        about: {
          page_id: "about",
          hero_title: "La Nostra Storia",
          hero_subtitle: "Oltre 30 anni di eccellenza nelle costruzioni",
          hero_video: null,
          hero_image: null,
          sections: {
            story: {
              title: "La Nostra Storia",
              subtitle: "Dal 1985 al vostro servizio",
              content: "La nostra azienda è stata fondata nel 1985 con l'obiettivo di offrire servizi di costruzione di alta qualità."
            }
          },
          meta_title: "Chi Siamo - KORSVAGEN",
          meta_description: "Scopri la storia di KORSVAGEN e i nostri valori"
        },
        contact: {
          page_id: "contact",
          hero_title: "Contattaci",
          hero_subtitle: "Siamo qui per aiutarti",
          hero_video: null,
          hero_image: null,
          sections: {
            info: {
              title: "Informazioni di Contatto",
              subtitle: "I nostri recapiti",
              content: "Puoi contattarci tramite telefono, email o visitando i nostri uffici per un preventivo gratuito."
            }
          },
          meta_title: "Contatti - KORSVAGEN",
          meta_description: "Contatta KORSVAGEN per informazioni e preventivi"
        }
      };

      const defaultPage = defaultPages[pageId] || defaultPages.home;
      
      return res.json({
        success: true,
        data: defaultPage,
        fallback: true
      });
    }

    res.json({
      success: true,
      data: page,
      fallback: false
    });

  } catch (error) {
    logger.error(`Errore recupero pagina pubblica ${req.params.pageId}:`, error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "PAGE_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/pages/:pageId
 * Recupera dati completi di una pagina (admin only)
 */
router.get("/:pageId", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { pageId } = req.params;
    
    logger.info(`Admin ${req.user.email} richiede dati pagina: ${pageId}`);

    const { data: page, error } = await supabaseClient
      .from("pages")
      .select("*")
      .eq("page_id", pageId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Pagina non trovata",
          code: "PAGE_NOT_FOUND"
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: page
    });

  } catch (error) {
    logger.error(`Errore recupero pagina ${req.params.pageId}:`, error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "PAGE_FETCH_ERROR"
    });
  }
});

/**
 * PUT /api/pages/:pageId
 * Aggiorna una pagina (admin only)
 */
router.put("/:pageId", requireAuth, requireRole(["admin", "editor", "super_admin"]), validatePageUpdate, async (req, res) => {
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

    const { pageId } = req.params;
    const { heroTitle, heroSubtitle, heroVideo, heroImage, sections, metaTitle, metaDescription } = req.body;

    logger.info(`Admin ${req.user.email} aggiorna pagina: ${pageId}`);

    // Verifica se la pagina esiste
    const { data: existingPage } = await supabaseClient
      .from("pages")
      .select("id")
      .eq("page_id", pageId)
      .single();

    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Aggiungi solo i campi presenti nella request
    if (heroTitle !== undefined) updateData.hero_title = heroTitle;
    if (heroSubtitle !== undefined) updateData.hero_subtitle = heroSubtitle;
    if (heroVideo !== undefined) updateData.hero_video = heroVideo;
    if (heroImage !== undefined) updateData.hero_image = heroImage;
    if (sections !== undefined) updateData.sections = sections;
    if (metaTitle !== undefined) updateData.meta_title = metaTitle;
    if (metaDescription !== undefined) updateData.meta_description = metaDescription;

    let result;
    if (existingPage) {
      // Aggiorna pagina esistente
      const { data, error } = await supabaseClient
        .from("pages")
        .update(updateData)
        .eq("page_id", pageId)
        .select()
        .single();

      if (error) throw error;
      result = data;
      logger.info(`Pagina ${pageId} aggiornata con successo`);
    } else {
      // Crea nuova pagina
      const { data, error } = await supabaseClient
        .from("pages")
        .insert({
          page_id: pageId,
          ...updateData
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
      logger.info(`Nuova pagina ${pageId} creata con successo`);
    }

    res.json({
      success: true,
      message: existingPage ? "Pagina aggiornata con successo" : "Pagina creata con successo",
      data: result
    });

  } catch (error) {
    logger.error(`Errore aggiornamento pagina ${req.params.pageId}:`, error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "PAGE_UPDATE_ERROR"
    });
  }
});

/**
 * GET /api/pages
 * Lista tutte le pagine (admin only)
 */
router.get("/", requireAuth, requireRole(["admin", "editor"]), async (req, res) => {
  try {
    logger.info(`Admin ${req.user.email} richiede lista pagine`);

    const { data: pages, error } = await supabaseClient
      .from("pages")
      .select("page_id, hero_title, updated_at")
      .order("page_id");

    if (error) throw error;

    res.json({
      success: true,
      data: pages,
      count: pages.length
    });

  } catch (error) {
    logger.error("Errore recupero lista pagine:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "PAGES_LIST_ERROR"
    });
  }
});

export default router;