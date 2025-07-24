/**
 * KORSVAGEN WEB APPLICATION - CONTACT ROUTES
 *
 * Routes per gestire i form di contatto del sito web
 * e inviarli alla dashboard amministratori come messaggi.
 *
 * Features:
 * - Invio messaggi di contatto
 * - Validazione robusta dei dati
 * - Rate limiting anti-spam
 * - Notifiche email opzionali
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import express from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { supabaseClient } from "../config/supabase.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * RATE LIMITER PER FORM DI CONTATTO
 *
 * Prevenzione spam con limiti più restrittivi
 */
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

/**
 * VALIDATORI INPUT
 */
const contactValidators = [
  body("name")
    .notEmpty()
    .withMessage("Nome è obbligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nome deve essere tra 2 e 100 caratteri")
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
    .isMobilePhone("any")
    .withMessage("Numero di telefono non valido")
    .isLength({ max: 50 })
    .withMessage("Numero di telefono troppo lungo"),
  body("subject")
    .notEmpty()
    .withMessage("Oggetto è obbligatorio")
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
  body("type")
    .optional()
    .isIn(["contact", "quote", "partnership", "support", "other"])
    .withMessage("Tipo di messaggio non valido"),
  body("company")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Nome azienda troppo lungo")
    .trim()
    .escape(),
  body("website").optional().isURL().withMessage("URL sito web non valido"),
];

/**
 * ROUTE: POST /api/contact/send
 *
 * Riceve e salva un messaggio di contatto dal form del sito
 */
router.post("/send", contactLimiter, contactValidators, async (req, res) => {
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
      name,
      email,
      phone,
      subject,
      message,
      type = "contact",
      company,
      website,
    } = req.body;

    // Prepara i metadati aggiuntivi
    const metadata = {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent") || null,
      referer: req.get("Referer") || null,
      language: req.get("Accept-Language") || null,
      timestamp: new Date().toISOString(),
    };

    if (company) metadata.company = company;
    if (website) metadata.website = website;

    // Salva il messaggio nel database
    const { data: savedMessage, error } = await supabaseClient
      .from("admin_messages")
      .insert({
        type,
        subject,
        content: message,
        sender_name: name,
        sender_email: email,
        sender_phone: phone || null,
        metadata,
        status: "new",
        is_read: false,
        is_important: type === "quote" || type === "partnership", // Segna come importante richieste di preventivo/partnership
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
      sender: name,
      email,
      type,
      subject,
      ip: req.ip,
    });

    // TODO: In futuro aggiungere invio email di notifica agli amministratori
    // e email di conferma al mittente

    res.status(201).json({
      success: true,
      message: "Messaggio inviato con successo. Ti risponderemo al più presto!",
      data: {
        id: savedMessage.id,
        timestamp: savedMessage.created_at,
      },
    });
  } catch (error) {
    logger.error("Errore invio messaggio contatto:", error);

    res.status(500).json({
      success: false,
      message:
        "Si è verificato un errore durante l'invio del messaggio. Riprova più tardi.",
      code: "INTERNAL_SERVER_ERROR",
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
