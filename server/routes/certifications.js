/**
 * ROUTES CERTIFICATIONS - API endpoints per gestione certificazioni
 *
 * Gestisce le certificazioni e qualifiche dell'azienda per la pagina About
 * Include CRUD operations per amministratori
 *
 * Endpoints disponibili:
 * - GET /api/certifications/public - Certificazioni attive per pagina About
 * - GET /api/certifications - Tutte le certificazioni (admin only)
 * - POST /api/certifications - Crea nuova certificazione (admin only)
 * - PUT /api/certifications/:id - Aggiorna certificazione (admin only)
 * - DELETE /api/certifications/:id - Elimina certificazione (admin only)
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
const validateCertification = [
  body("name")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome certificazione deve essere tra 2 e 100 caratteri"),
  body("code")
    .isLength({ min: 1, max: 20 })
    .withMessage("Codice certificazione deve essere tra 1 e 20 caratteri"),
  body("description")
    .isLength({ min: 10, max: 500 })
    .withMessage("Descrizione deve essere tra 10 e 500 caratteri"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active deve essere true o false"),
  body("display_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("display_order deve essere un numero intero positivo"),
];

const validateCertificationUpdate = [
  param("id")
    .isUUID()
    .withMessage("ID certificazione non valido"),
  ...validateCertification,
];

/**
 * GET /api/certifications/public
 * Recupera certificazioni attive per la pagina About (pubblico)
 */
router.get("/public", async (req, res) => {
  try {
    logger.info("Richiesta certificazioni pubbliche");

    const { data: certifications, error } = await supabaseClient
      .from("certifications")
      .select("id, name, code, description")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Errore database recupero certificazioni pubbliche:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    // Se non ci sono certificazioni, restituisci array vuoto
    if (!certifications || certifications.length === 0) {
      logger.info("Nessuna certificazione attiva trovata nel database");
      return res.json({
        success: true,
        data: [],
        count: 0
      });
    }

    logger.info(`Trovate ${certifications.length} certificazioni attive`);

    res.json({
      success: true,
      data: certifications,
      count: certifications.length
    });

  } catch (error) {
    logger.error("Errore recupero certificazioni pubbliche:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "CERTIFICATIONS_FETCH_ERROR"
    });
  }
});

/**
 * GET /api/certifications
 * Recupera tutte le certificazioni (admin only)
 */
router.get("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { page = 1, limit = 10, active } = req.query;
    const offset = (page - 1) * limit;

    logger.info(`Admin ${req.user.email} richiede lista certificazioni (page: ${page}, limit: ${limit})`);

    let query = supabaseClient
      .from("certifications")
      .select(`
        id,
        name,
        code,
        description,
        is_active,
        display_order,
        created_at,
        updated_at,
        created_by,
        updated_by
      `)
      .order("display_order", { ascending: true })
      .range(offset, offset + limit - 1);

    // Filtro per stato attivo se specificato
    if (active !== undefined) {
      query = query.eq("is_active", active === "true");
    }

    const { data: certifications, error, count } = await query;

    if (error) {
      logger.error("Errore database recupero certificazioni admin:", error);
      return res.status(500).json({
        success: false,
        message: "Errore interno del server",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Trovate ${certifications?.length || 0} certificazioni`);

    res.json({
      success: true,
      data: certifications || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    logger.error("Errore recupero certificazioni admin:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "CERTIFICATIONS_FETCH_ERROR"
    });
  }
});

/**
 * POST /api/certifications
 * Crea una nuova certificazione (admin only)
 */
router.post("/", requireAuth, requireRole(["admin", "editor", "super_admin"]), validateCertification, async (req, res) => {
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

    const { name, code, description, is_active = true, display_order = 0 } = req.body;

    logger.info(`Admin ${req.user.email} crea nuova certificazione: ${name}`);

    const { data: certification, error } = await supabaseClient
      .from("certifications")
      .insert({
        name,
        code,
        description,
        is_active,
        display_order,
        created_by: req.user.id,
        updated_by: req.user.id
      })
      .select()
      .single();

    if (error) {
      logger.error("Errore creazione certificazione:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante la creazione della certificazione",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Certificazione creata con successo: ${certification.id}`);

    res.status(201).json({
      success: true,
      message: "Certificazione creata con successo",
      data: certification
    });

  } catch (error) {
    logger.error("Errore creazione certificazione:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "CERTIFICATION_CREATE_ERROR"
    });
  }
});

/**
 * PUT /api/certifications/:id
 * Aggiorna una certificazione (admin only)
 */
router.put("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), validateCertificationUpdate, async (req, res) => {
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
    const { name, code, description, is_active, display_order } = req.body;

    logger.info(`Dati dopo validazione Express:`, { 
      name, 
      code, 
      description, 
      is_active, 
      display_order,
      descriptionLength: description?.length,
      descriptionCharCodes: description ? Array.from(description).map(c => c.charCodeAt(0)) : null
    });

    logger.info(`Admin ${req.user.email} aggiorna certificazione: ${id}`);
    logger.info(`Dati ricevuti dal frontend:`, { 
      name, 
      code, 
      description, 
      is_active, 
      display_order,
      fullBody: req.body 
    });

    // Verifica esistenza certificazione
    const { data: existingCertification, error: checkError } = await supabaseClient
      .from("certifications")
      .select("id")
      .eq("id", id);

    logger.info(`Verifica esistenza certificazione ${id}:`, { 
      found: existingCertification?.length || 0, 
      error: checkError,
      data: existingCertification 
    });

    if (checkError || !existingCertification || existingCertification.length === 0) {
      logger.error("Certificazione non trovata durante verifica:", { 
        id, 
        error: checkError, 
        dataLength: existingCertification?.length || 0 
      });
      return res.status(404).json({
        success: false,
        message: "Certificazione non trovata",
        code: "CERTIFICATION_NOT_FOUND"
      });
    }

    const updateData = {};

    // Aggiungi solo i campi presenti nella request
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (display_order !== undefined) updateData.display_order = display_order;
    
    // Add updated_by only if user exists and we have valid fields to update
    if (Object.keys(updateData).length > 0 && req.user?.id) {
      updateData.updated_by = req.user.id;
    }

    // Check if we have anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nessun campo da aggiornare fornito",
        code: "NO_UPDATE_FIELDS"
      });
    }

    logger.info(`Eseguendo update certificazione ${id} con dati:`, updateData);

    // Direct test - try to update description with a simple string
    const testResult = await supabaseClient
      .from("certifications")
      .update({ description: "TEST_DESCRIPTION_UPDATE" })
      .eq("id", id);
    
    logger.info(`Test update result:`, testResult);

    const { error: updateError } = await supabaseClient
      .from("certifications")
      .update(updateData)
      .eq("id", id);

    logger.info(`Risultato update operation:`, { error: updateError, success: !updateError });

    if (updateError) {
      logger.error("Errore aggiornamento certificazione:", updateError);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'aggiornamento della certificazione",
        code: "DATABASE_ERROR"
      });
    }

    // Add a small delay to handle potential DB consistency issues
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fetch the updated record
    let { data: updatedCertification, error: fetchError } = await supabaseClient
      .from("certifications")
      .select("*")
      .eq("id", id)
      .single();

    // If the data hasn't changed, try once more after a longer delay
    const originalDescription = "Certificazione di qualità nei processi di gestione";
    if (!fetchError && updatedCertification && updateData.description && updatedCertification.description === originalDescription) {
      logger.info("Dati non cambiati dopo primo fetch, ritento dopo delay...");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: retryData, error: retryError } = await supabaseClient
        .from("certifications")
        .select("*")
        .eq("id", id)
        .single();
        
      if (!retryError && retryData) {
        updatedCertification = retryData;
        fetchError = retryError;
      }
    }

    logger.info(`Risultato fetch dopo update:`, { 
      error: fetchError, 
      data: updatedCertification,
      dataChanged: updatedCertification?.description !== originalDescription,
      expectedDescription: updateData.description,
      actualDescription: updatedCertification?.description
    });

    if (fetchError || !updatedCertification) {
      logger.error("Errore recupero certificazione dopo update:", fetchError);
      return res.status(500).json({
        success: false,
        message: "Errore nel recupero della certificazione aggiornata",
        code: "FETCH_ERROR"
      });
    }

    logger.info(`Certificazione aggiornata con successo: ${id}`);

    res.json({
      success: true,
      message: "Certificazione aggiornata con successo",
      data: updatedCertification
    });

  } catch (error) {
    logger.error("Errore aggiornamento certificazione:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "CERTIFICATION_UPDATE_ERROR"
    });
  }
});

/**
 * DELETE /api/certifications/:id
 * Elimina una certificazione (admin only)
 */
router.delete("/:id", requireAuth, requireRole(["admin", "editor", "super_admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
      return res.status(400).json({
        success: false,
        message: "ID certificazione non valido",
        code: "INVALID_CERTIFICATION_ID"
      });
    }

    logger.info(`Admin ${req.user.email} elimina certificazione: ${id}`);

    // Verifica esistenza certificazione
    const { data: existingCertification, error: checkError } = await supabaseClient
      .from("certifications")
      .select("id, name")
      .eq("id", id);

    if (checkError || !existingCertification || existingCertification.length === 0) {
      logger.error("Certificazione non trovata durante verifica per eliminazione:", { id, error: checkError });
      return res.status(404).json({
        success: false,
        message: "Certificazione non trovata",
        code: "CERTIFICATION_NOT_FOUND"
      });
    }

    const { error } = await supabaseClient
      .from("certifications")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Errore eliminazione certificazione:", error);
      return res.status(500).json({
        success: false,
        message: "Errore durante l'eliminazione della certificazione",
        code: "DATABASE_ERROR"
      });
    }

    logger.info(`Certificazione eliminata con successo: ${id} (${existingCertification[0]?.name})`);

    res.json({
      success: true,
      message: "Certificazione eliminata con successo"
    });

  } catch (error) {
    logger.error("Errore eliminazione certificazione:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "CERTIFICATION_DELETE_ERROR"
    });
  }
});

export default router;