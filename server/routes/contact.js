/**
 * KORSVAGEN WEB APPLICATION - CONTACT ROUTES
 *
 * Comprehensive contact and emergency messaging system.
 * Handles both normal contact form submissions and emergency requests.
 *
 * Features:
 * - Normal contact form submissions
 * - Emergency request handling
 * - Comprehensive validation
 * - Rate limiting anti-spam
 * - Priority-based message classification
 *
 * @author KORSVAGEN S.R.L.
 * @version 2.0.0 - Enhanced with emergency system
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { supabaseClient } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * RATE LIMITERS
 */
// Standard contact form rate limiter
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 5, // Massimo 5 messaggi per IP all'ora
  message: {
    success: false,
    message: "Troppi messaggi inviati. Riprova tra un'ora.",
    code: "CONTACT_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Emergency requests rate limiter (più permissivo)
const emergencyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 ora
  max: 3, // Massimo 3 emergenze per IP all'ora
  message: {
    success: false,
    message: "Limite emergenze raggiunto. Se si tratta di un'emergenza reale, contatta direttamente il numero telefonico.",
    code: "EMERGENCY_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * VALIDATORI INPUT
 */
// Validatori per messaggi di contatto normali
const contactValidators = [
  body("first_name")
    .notEmpty()
    .withMessage("Nome è obbligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve essere tra 2 e 100 caratteri")
    .trim()
    .escape(),
  body("last_name")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Cognome troppo lungo")
    .trim()
    .escape(),
  body("email")
    .isEmail()
    .withMessage("Email non valida")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email troppo lunga"),
  body("phone")
    .optional()
    .matches(/^[\+]?[0-9\s\-\(\)]{8,}$/)
    .withMessage("Numero di telefono non valido")
    .isLength({ max: 50 })
    .withMessage("Numero di telefono troppo lungo"),
  body("subject")
    .optional()
    .isLength({ min: 5, max: 255 })
    .withMessage("Oggetto deve essere tra 5 e 255 caratteri")
    .trim()
    .escape(),
  body("message")
    .notEmpty()
    .withMessage("Messaggio è obbligatorio")
    .isLength({ min: 10, max: 2000 })
    .withMessage("Messaggio deve essere tra 10 e 2000 caratteri")
    .trim(),
  body("company")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Nome azienda troppo lungo")
    .trim()
    .escape(),
];

// Validatori per richieste di emergenza
const emergencyValidators = [
  body("first_name")
    .notEmpty()
    .withMessage("Nome è obbligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve essere tra 2 e 100 caratteri")
    .trim()
    .escape(),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email non valida")
    .normalizeEmail(),
  body("phone")
    .notEmpty()
    .withMessage("Telefono è obbligatorio per le emergenze")
    .matches(/^[\+]?[0-9\s\-\(\)]{8,}$/)
    .withMessage("Formato telefono non valido")
    .isLength({ max: 50 })
    .withMessage("Numero di telefono troppo lungo"),
  body("message")
    .notEmpty()
    .withMessage("Descrizione emergenza è obbligatoria")
    .isLength({ min: 10, max: 1000 })
    .withMessage("Descrizione deve essere tra 10 e 1000 caratteri")
    .trim(),
];

/**
 * ROUTE: POST /api/contact
 *
 * Riceve e salva un messaggio di contatto dal form del sito
 */
router.post("/", contactLimiter, contactValidators, async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati del form non validi",
        errors: errors.array(),
      });
    }

    const {
      first_name,
      last_name,
      email,
      phone,
      subject,
      message,
      company,
    } = req.body;

    // Salva il messaggio nel database usando la nuova struttura
    const { data: savedMessage, error } = await supabaseClient
      .from("contact_messages")
      .insert({
        type: "contact",
        first_name,
        last_name: last_name || null,
        email,
        phone: phone || null,
        company: company || null,
        subject: subject || "Richiesta di contatto",
        message,
        status: "new",
        priority: "normal",
        source: "website",
        user_agent: req.get("User-Agent") || null,
        ip_address: req.ip || req.connection.remoteAddress,
      })
      .select()
      .single();

    if (error) {
      logger.error("Errore salvataggio messaggio contatto:", error);
      throw new Error("Errore durante il salvataggio del messaggio");
    }

    // Log dell'attività
    logger.info("Nuovo messaggio di contatto ricevuto:", {
      messageId: savedMessage.id,
      sender: first_name + (last_name ? ` ${last_name}` : ''),
      email,
      subject,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Messaggio inviato con successo! Ti risponderemo al più presto.",
      data: {
        id: savedMessage.id,
        timestamp: savedMessage.created_at,
      },
    });
  } catch (error) {
    logger.error("Errore invio messaggio contatto:", error);

    res.status(500).json({
      success: false,
      message: "Si è verificato un errore durante l'invio del messaggio. Riprova più tardi.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: POST /api/contact/emergency
 *
 * Riceve e salva una richiesta di emergenza
 */
router.post("/emergency", emergencyLimiter, emergencyValidators, async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati della richiesta di emergenza non validi",
        errors: errors.array(),
      });
    }

    const { first_name, email, phone, message } = req.body;

    // Salva la richiesta di emergenza
    const { data: savedMessage, error } = await supabaseClient
      .from("contact_messages")
      .insert({
        type: "emergency",
        first_name,
        email: email || null,
        phone,
        subject: "🚨 EMERGENZA - Richiesta immediata",
        message,
        status: "new",
        priority: "emergency",
        source: "emergency_button",
        user_agent: req.get("User-Agent") || null,
        ip_address: req.ip || req.connection.remoteAddress,
      })
      .select()
      .single();

    if (error) {
      logger.error("Errore salvataggio richiesta emergenza:", error);
      throw new Error("Errore durante il salvataggio della richiesta di emergenza");
    }

    // Log urgente per le emergenze
    logger.warn("🚨 NUOVA EMERGENZA RICEVUTA:", {
      messageId: savedMessage.id,
      sender: first_name,
      phone,
      email,
      message: message.substring(0, 100) + '...',
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    // TODO: Qui andrebbero implementate notifiche immediate:
    // - Email agli amministratori
    // - SMS/notifiche push
    // - Integrazione con sistemi di alerting

    res.status(201).json({
      success: true,
      message: "Richiesta emergenza ricevuta! Ti richiameremo entro 24 ore.",
      data: {
        id: savedMessage.id,
        timestamp: savedMessage.created_at,
      },
    });
  } catch (error) {
    logger.error("Errore richiesta emergenza:", error);

    res.status(500).json({
      success: false,
      message: "Errore durante l'invio della richiesta di emergenza. Contatta direttamente il numero telefonico.",
      code: "EMERGENCY_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/contact/info
 *
 * Restituisce le informazioni di contatto pubbliche
 */
router.get("/info", async (req, res) => {
  try {
    // Recupera le impostazioni pubbliche di contatto
    const { data: settings, error } = await supabaseClient
      .from("app_settings")
      .select("key, value")
      .eq("is_public", true)
      .in("key", [
        "contact_email",
        "contact_phone",
        "contact_address",
        "business_hours",
        "social_links",
      ]);

    if (error) {
      throw error;
    }

    // Converti in oggetto per facilità d'uso
    const contactInfo =
      settings?.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {}) || {};

    // Dati di contatto di default se non presenti nel database
    const defaultContactInfo = {
      contact_email: "info@korsvagen.it",
      contact_phone: "+39 XXX XXX XXXX",
      contact_address: "Via Example, 123 - 00000 Roma (RM)",
      business_hours: {
        monday: "09:00-18:00",
        tuesday: "09:00-18:00",
        wednesday: "09:00-18:00",
        thursday: "09:00-18:00",
        friday: "09:00-18:00",
        saturday: "Chiuso",
        sunday: "Chiuso",
      },
      social_links: {
        linkedin: "https://linkedin.com/company/korsvagen",
        instagram: "https://instagram.com/korsvagen",
        facebook: "https://facebook.com/korsvagen",
      },
    };

    // Unisci con i default
    const finalContactInfo = { ...defaultContactInfo, ...contactInfo };

    res.json({
      success: true,
      data: { contact: finalContactInfo },
    });
  } catch (error) {
    logger.error("Errore recupero info contatto:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/contact/types
 *
 * Restituisce i tipi di messaggi disponibili per il form
 */
router.get("/types", (req, res) => {
  const messageTypes = [
    {
      value: "contact",
      label: "Richiesta Generale",
      description: "Per informazioni generali sui nostri servizi",
    },
    {
      value: "quote",
      label: "Richiesta Preventivo",
      description: "Per ricevere un preventivo personalizzato",
    },
    {
      value: "partnership",
      label: "Partnership",
      description: "Proposta di collaborazione o partnership",
    },
    {
      value: "support",
      label: "Supporto Tecnico",
      description: "Per assistenza su progetti esistenti",
    },
    {
      value: "other",
      label: "Altro",
      description: "Per qualsiasi altra richiesta",
    },
  ];

  res.json({
    success: true,
    data: { types: messageTypes },
  });
});

export default router;
