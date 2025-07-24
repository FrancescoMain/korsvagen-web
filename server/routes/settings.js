/**
 * KORSVAGEN WEB APPLICATION - SETTINGS ROUTES
 *
 * Route per la gestione delle impostazioni generali dell'applicazione.
 * Gestisce la lettura e modifica dei settings dell'app salvati nel database.
 *
 * Features:
 * - Recupero settings pubblici per il frontend
 * - Gestione completa settings dalla dashboard admin
 * - Validazione e sanitizzazione dati
 * - Cache management per performance
 * - Logging delle modifiche
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import express from "express";
import { body, validationResult, param } from "express-validator";
import { supabaseClient } from "../config/supabase.js";
import { requireAuth } from "../utils/auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * MIDDLEWARE DI VALIDAZIONE
 */

// Validazione per l'aggiornamento di un setting
const validateSettingUpdate = [
  param("key")
    .isLength({ min: 1, max: 100 })
    .withMessage("Chiave setting non valida"),
  body("value").exists().withMessage("Valore richiesto"),
  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Descrizione troppo lunga"),
  body("category")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Categoria non valida"),
  body("is_public")
    .optional()
    .isBoolean()
    .withMessage("is_public deve essere boolean"),
];

// Validazione per settings multipli
const validateBulkUpdate = [
  body("settings")
    .isArray({ min: 1 })
    .withMessage("Array di settings richiesto"),
  body("settings.*.key")
    .isLength({ min: 1, max: 100 })
    .withMessage("Chiave setting non valida"),
  body("settings.*.value")
    .exists()
    .withMessage("Valore richiesto per ogni setting"),
];

/**
 * ROUTE: GET /api/settings/public
 *
 * Recupera tutti i settings pubblici per l'uso nel frontend.
 * Questa route è utilizzata dall'app per caricare le configurazioni
 * al primo avvio e popolare lo stato globale.
 */
router.get("/public", async (req, res) => {
  try {
    logger.info("Recupero settings pubblici richiesto");

    // Query per recuperare tutti i settings pubblici
    const { data: settings, error } = await supabaseClient
      .from("app_settings")
      .select("key, value, category")
      .eq("is_public", true)
      .order("category", { ascending: true });

    if (error) {
      logger.error("Errore recupero settings pubblici:", error);
      throw error;
    }

    // Raggruppa i settings per categoria per una migliore organizzazione
    const categorizedSettings = settings.reduce((acc, setting) => {
      const category = setting.category || "general";
      if (!acc[category]) {
        acc[category] = {};
      }
      acc[category][setting.key] = setting.value;
      return acc;
    }, {});

    // Crea anche un oggetto flat per compatibilità
    const flatSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});

    logger.info(`Ritornati ${settings.length} settings pubblici`);

    res.json({
      success: true,
      data: {
        categorized: categorizedSettings,
        flat: flatSettings,
        count: settings.length,
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Errore nel recupero settings pubblici:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "SETTINGS_FETCH_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/settings/all
 *
 * Recupera tutti i settings (admin only) per la gestione dalla dashboard.
 * Include anche i settings privati e informazioni di gestione.
 */
router.get("/all", requireAuth, async (req, res) => {
  try {
    logger.info(`Admin ${req.user.username} ha richiesto tutti i settings`);

    // Query per recuperare tutti i settings con informazioni complete
    const { data: settings, error } = await supabaseClient
      .from("app_settings")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });

    if (error) {
      logger.error("Errore recupero tutti i settings:", error);
      throw error;
    }

    // Raggruppa per categoria
    const categorizedSettings = settings.reduce((acc, setting) => {
      const category = setting.category || "general";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(setting);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        settings: categorizedSettings,
        total_count: settings.length,
        categories: Object.keys(categorizedSettings),
      },
    });
  } catch (error) {
    logger.error("Errore nel recupero di tutti i settings:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "ADMIN_SETTINGS_FETCH_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/settings/category/:category
 *
 * Recupera tutti i settings di una categoria specifica.
 */
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const isAdmin = req.headers.authorization; // Controlla se è una richiesta admin

    logger.info(`Recupero settings categoria: ${category}`);

    let query = supabaseClient
      .from("app_settings")
      .select("key, value, description, is_public, created_at, updated_at")
      .eq("category", category);

    // Se non è admin, mostra solo settings pubblici
    if (!isAdmin) {
      query = query.eq("is_public", true);
    }

    const { data: settings, error } = await query.order("key", {
      ascending: true,
    });

    if (error) {
      logger.error(`Errore recupero settings categoria ${category}:`, error);
      throw error;
    }

    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description,
        is_public: setting.is_public,
        updated_at: setting.updated_at,
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        category,
        settings: settingsObject,
        count: settings.length,
      },
    });
  } catch (error) {
    logger.error("Errore nel recupero settings per categoria:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "CATEGORY_SETTINGS_FETCH_ERROR",
    });
  }
});

/**
 * ROUTE: PUT /api/settings/:key
 *
 * Aggiorna un singolo setting (admin only).
 */
router.put("/:key", requireAuth, validateSettingUpdate, async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati non validi",
        errors: errors.array(),
      });
    }

    const { key } = req.params;
    const { value, description, category, is_public } = req.body;

    // Ensure value is never null - convert null/undefined to empty string
    const cleanValue = value === null || value === undefined ? "" : value;

    logger.info(`Admin ${req.user.username} aggiorna setting: ${key}`);

    // Controlla se il setting esiste
    const { data: existingSetting, error: checkError } = await supabaseClient
      .from("app_settings")
      .select("*")
      .eq("key", key)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      logger.error(`Errore controllo esistenza setting ${key}:`, checkError);
      throw checkError;
    }

    let result;
    if (existingSetting) {
      // Aggiorna setting esistente
      const updateData = {
        value: cleanValue,
        updated_at: new Date().toISOString(),
      };
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (is_public !== undefined) updateData.is_public = is_public;

      const { data, error } = await supabaseClient
        .from("app_settings")
        .update(updateData)
        .eq("key", key)
        .select()
        .single();

      if (error) throw error;
      result = data;

      logger.info(`Setting ${key} aggiornato con successo`);
    } else {
      // Crea nuovo setting
      const { data, error } = await supabaseClient
        .from("app_settings")
        .insert({
          key,
          value: cleanValue,
          description: description || `Setting ${key}`,
          category: category || "general",
          is_public: is_public !== undefined ? is_public : false,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;

      logger.info(`Nuovo setting ${key} creato con successo`);
    }

    res.json({
      success: true,
      message: existingSetting
        ? "Setting aggiornato con successo"
        : "Setting creato con successo",
      data: result,
    });
  } catch (error) {
    logger.error("Errore nell'aggiornamento setting:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "SETTING_UPDATE_ERROR",
    });
  }
});

/**
 * ROUTE: PUT /api/settings/bulk
 *
 * Aggiorna multipli settings in una singola operazione (admin only).
 */
router.put("/bulk", requireAuth, validateBulkUpdate, async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati non validi",
        errors: errors.array(),
      });
    }

    const { settings } = req.body;

    logger.info(
      `Admin ${req.user.username} aggiorna ${settings.length} settings in bulk`
    );

    const results = [];
    const errors_occurred = [];

    // Processa ogni setting
    for (const setting of settings) {
      try {
        const { key, value, description, category, is_public } = setting;

        // Ensure value is never null - convert null/undefined to empty string
        const cleanValue = value === null || value === undefined ? "" : value;

        // Controlla se esiste
        const { data: existing } = await supabaseClient
          .from("app_settings")
          .select("id")
          .eq("key", key)
          .single();

        let result;
        if (existing) {
          // Aggiorna
          const updateData = {
            value: cleanValue,
            updated_at: new Date().toISOString(),
          };
          if (description !== undefined) updateData.description = description;
          if (category !== undefined) updateData.category = category;
          if (is_public !== undefined) updateData.is_public = is_public;

          const { data, error } = await supabaseClient
            .from("app_settings")
            .update(updateData)
            .eq("key", key)
            .select()
            .single();

          if (error) throw error;
          result = { ...data, action: "updated" };
        } else {
          // Crea
          const { data, error } = await supabaseClient
            .from("app_settings")
            .insert({
              key,
              value: cleanValue,
              description: description || `Setting ${key}`,
              category: category || "general",
              is_public: is_public !== undefined ? is_public : false,
            })
            .select()
            .single();

          if (error) throw error;
          result = { ...data, action: "created" };
        }

        results.push(result);
      } catch (error) {
        errors_occurred.push({
          key: setting.key,
          error: error.message,
        });
        logger.error(`Errore aggiornamento setting ${setting.key}:`, error);
      }
    }

    logger.info(
      `Bulk update completato: ${results.length} successi, ${errors_occurred.length} errori`
    );

    res.json({
      success: errors_occurred.length === 0,
      message: `Aggiornati ${results.length} settings${
        errors_occurred.length > 0
          ? ` con ${errors_occurred.length} errori`
          : ""
      }`,
      data: {
        updated: results,
        errors: errors_occurred,
        total_processed: settings.length,
      },
    });
  } catch (error) {
    logger.error("Errore nel bulk update settings:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "BULK_UPDATE_ERROR",
    });
  }
});

/**
 * ROUTE: DELETE /api/settings/:key
 *
 * Elimina un setting (admin only) - usare con cautela.
 */
router.delete("/:key", requireAuth, async (req, res) => {
  try {
    const { key } = req.params;

    logger.warn(`Admin ${req.user.username} sta eliminando il setting: ${key}`);

    const { data, error } = await supabaseClient
      .from("app_settings")
      .delete()
      .eq("key", key)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Setting non trovato",
          code: "SETTING_NOT_FOUND",
        });
      }
      throw error;
    }

    logger.warn(`Setting ${key} eliminato con successo`);

    res.json({
      success: true,
      message: "Setting eliminato con successo",
      data: data,
    });
  } catch (error) {
    logger.error("Errore nell'eliminazione setting:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "SETTING_DELETE_ERROR",
    });
  }
});

/**
 * ROUTE: POST /api/settings/reset-defaults
 *
 * Ripristina i settings ai valori di default (admin only) - OPERAZIONE PERICOLOSA.
 */
router.post("/reset-defaults", requireAuth, async (req, res) => {
  try {
    // Solo super_admin può fare reset
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Operazione riservata ai super amministratori",
        code: "INSUFFICIENT_PRIVILEGES",
      });
    }

    logger.warn(
      `SUPER ADMIN ${req.user.username} sta resettando i settings ai default`
    );

    // Qui potresti implementare la logica per ripristinare i valori di default
    // Per ora ritorniamo un messaggio di warning

    res.json({
      success: false,
      message:
        "Operazione non implementata - troppo pericolosa per l'automazione",
      code: "OPERATION_NOT_IMPLEMENTED",
    });
  } catch (error) {
    logger.error("Errore nel reset defaults:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "RESET_ERROR",
    });
  }
});

export default router;
