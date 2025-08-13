/**
 * KORSVAGEN WEB APPLICATION - MESSAGES ADMIN ROUTES
 *
 * Administrative routes for managing contact messages and emergency requests.
 * Restricted to authenticated admin users only.
 *
 * Features:
 * - List messages with filtering and pagination
 * - Message statistics for dashboard
 * - Update message status and assignments
 * - Message detail retrieval
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import express from "express";
import { body, query, param, validationResult } from "express-validator";
import { supabaseClient } from "../config/supabase.js";
import { logger } from "../utils/logger.js";
import { requireAuth } from "../utils/auth.js";

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

/**
 * ROUTE: GET /api/admin/messages
 *
 * Lista messaggi con filtri e paginazione
 */
router.get("/", [
  query("type").optional().isIn(["contact", "emergency"]).withMessage("Tipo non valido"),
  query("status").optional().isIn(["new", "read", "replied", "closed"]).withMessage("Status non valido"),
  query("priority").optional().isIn(["low", "normal", "high", "emergency"]).withMessage("Priorità non valida"),
  query("page").optional().isInt({ min: 1 }).withMessage("Pagina deve essere un numero positivo"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit deve essere tra 1 e 100"),
  query("search").optional().isLength({ max: 255 }).withMessage("Ricerca troppo lunga"),
  query("assigned_to").optional().isEmail().withMessage("Email assegnatario non valida"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Parametri di ricerca non validi",
        errors: errors.array(),
      });
    }

    const {
      type,
      status,
      priority,
      page = 1,
      limit = 20,
      search,
      assigned_to,
    } = req.query;

    // Costruisce la query di base
    let query = supabaseClient
      .from("contact_messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Applica filtri
    if (type) query = query.eq("type", type);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (assigned_to) query = query.eq("assigned_to", assigned_to);

    // Ricerca full-text
    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,message.ilike.%${search}%,subject.ilike.%${search}%`
      );
    }

    // Paginazione
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: messages, error, count } = await query;

    if (error) {
      logger.error("Errore recupero messaggi:", error);
      throw new Error("Errore durante il recupero dei messaggi");
    }

    // Calcola metadati paginazione
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    logger.error("Errore lista messaggi:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/admin/messages/stats
 *
 * Statistiche messaggi per dashboard
 */
router.get("/stats", async (req, res) => {
  try {
    const { data: stats, error } = await supabaseClient
      .from("message_stats")
      .select("*")
      .single();

    if (error) {
      logger.error("Errore recupero statistiche messaggi:", error);
      throw new Error("Errore durante il recupero delle statistiche");
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Errore statistiche messaggi:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "STATS_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/admin/messages/:id
 *
 * Dettaglio singolo messaggio
 */
router.get("/:id", [
  param("id").isInt().withMessage("ID messaggio deve essere un numero"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "ID messaggio non valido",
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const { data: message, error } = await supabaseClient
      .from("contact_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Messaggio non trovato",
          code: "MESSAGE_NOT_FOUND",
        });
      }
      logger.error("Errore recupero messaggio:", error);
      throw new Error("Errore durante il recupero del messaggio");
    }

    // Marca come letto se non lo è già
    if (message.status === "new") {
      await supabaseClient
        .from("contact_messages")
        .update({ status: "read" })
        .eq("id", id);
      
      message.status = "read"; // Aggiorna l'oggetto locale
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    logger.error("Errore dettaglio messaggio:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: PUT /api/admin/messages/:id/status
 *
 * Aggiorna stato messaggio
 */
router.put("/:id/status", [
  param("id").isInt().withMessage("ID messaggio deve essere un numero"),
  body("status")
    .isIn(["new", "read", "replied", "closed"])
    .withMessage("Status non valido"),
  body("admin_notes")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Note amministrative troppo lunghe"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati aggiornamento non validi",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const updateData = { status };
    
    if (admin_notes !== undefined) {
      updateData.admin_notes = admin_notes;
    }
    
    if (status === "replied") {
      updateData.replied_at = new Date().toISOString();
    }

    const { data: updatedMessage, error } = await supabaseClient
      .from("contact_messages")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Messaggio non trovato",
          code: "MESSAGE_NOT_FOUND",
        });
      }
      logger.error("Errore aggiornamento stato messaggio:", error);
      throw new Error("Errore durante l'aggiornamento del messaggio");
    }

    logger.info("Stato messaggio aggiornato:", {
      messageId: id,
      newStatus: status,
      adminUser: req.user.email,
    });

    res.json({
      success: true,
      message: "Stato messaggio aggiornato con successo",
      data: updatedMessage,
    });
  } catch (error) {
    logger.error("Errore aggiornamento stato:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "UPDATE_ERROR",
    });
  }
});

/**
 * ROUTE: PUT /api/admin/messages/:id/assign
 *
 * Assegna messaggio a un amministratore
 */
router.put("/:id/assign", [
  param("id").isInt().withMessage("ID messaggio deve essere un numero"),
  body("assigned_to")
    .optional()
    .isEmail()
    .withMessage("Email assegnatario non valida"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati assegnazione non validi",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { assigned_to } = req.body;

    const { data: updatedMessage, error } = await supabaseClient
      .from("contact_messages")
      .update({ assigned_to: assigned_to || null })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Messaggio non trovato",
          code: "MESSAGE_NOT_FOUND",
        });
      }
      logger.error("Errore assegnazione messaggio:", error);
      throw new Error("Errore durante l'assegnazione del messaggio");
    }

    logger.info("Messaggio assegnato:", {
      messageId: id,
      assignedTo: assigned_to,
      assignedBy: req.user.email,
    });

    res.json({
      success: true,
      message: assigned_to 
        ? `Messaggio assegnato a ${assigned_to}` 
        : "Assegnazione rimossa",
      data: updatedMessage,
    });
  } catch (error) {
    logger.error("Errore assegnazione messaggio:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "ASSIGN_ERROR",
    });
  }
});

/**
 * ROUTE: DELETE /api/admin/messages/:id
 *
 * Elimina un messaggio (uso con cautela)
 */
router.delete("/:id", [
  param("id").isInt().withMessage("ID messaggio deve essere un numero"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "ID messaggio non valido",
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // Recupera il messaggio prima di eliminarlo per logging
    const { data: messageToDelete, error: fetchError } = await supabaseClient
      .from("contact_messages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Messaggio non trovato",
          code: "MESSAGE_NOT_FOUND",
        });
      }
      throw fetchError;
    }

    // Elimina il messaggio
    const { error: deleteError } = await supabaseClient
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (deleteError) {
      logger.error("Errore eliminazione messaggio:", deleteError);
      throw new Error("Errore durante l'eliminazione del messaggio");
    }

    // Log importante per audit
    logger.warn("MESSAGGIO ELIMINATO:", {
      messageId: id,
      sender: messageToDelete.first_name + (messageToDelete.last_name ? ` ${messageToDelete.last_name}` : ''),
      email: messageToDelete.email,
      type: messageToDelete.type,
      deletedBy: req.user.email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: "Messaggio eliminato con successo",
    });
  } catch (error) {
    logger.error("Errore eliminazione messaggio:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "DELETE_ERROR",
    });
  }
});

/**
 * ROUTE: POST /api/admin/messages/bulk-update
 *
 * Aggiornamento in massa dei messaggi
 */
router.post("/bulk-update", [
  body("message_ids")
    .isArray({ min: 1 })
    .withMessage("Deve essere specificato almeno un messaggio"),
  body("message_ids.*")
    .isInt()
    .withMessage("ID messaggi devono essere numeri"),
  body("action")
    .isIn(["mark_read", "mark_closed", "assign", "delete"])
    .withMessage("Azione non valida"),
  body("assigned_to")
    .optional()
    .isEmail()
    .withMessage("Email assegnatario non valida"),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati aggiornamento bulk non validi",
        errors: errors.array(),
      });
    }

    const { message_ids, action, assigned_to } = req.body;

    let updateData = {};
    let successMessage = "";

    switch (action) {
      case "mark_read":
        updateData = { status: "read" };
        successMessage = "Messaggi marcati come letti";
        break;
      case "mark_closed":
        updateData = { status: "closed" };
        successMessage = "Messaggi chiusi";
        break;
      case "assign":
        if (!assigned_to) {
          return res.status(400).json({
            success: false,
            message: "Email assegnatario obbligatoria per l'assegnazione",
          });
        }
        updateData = { assigned_to };
        successMessage = `Messaggi assegnati a ${assigned_to}`;
        break;
      case "delete":
        const { error: deleteError } = await supabaseClient
          .from("contact_messages")
          .delete()
          .in("id", message_ids);

        if (deleteError) {
          throw deleteError;
        }

        logger.warn("ELIMINAZIONE BULK MESSAGGI:", {
          messageIds: message_ids,
          deletedBy: req.user.email,
          timestamp: new Date().toISOString(),
        });

        return res.json({
          success: true,
          message: `${message_ids.length} messaggi eliminati`,
        });
    }

    const { data: updatedMessages, error } = await supabaseClient
      .from("contact_messages")
      .update(updateData)
      .in("id", message_ids)
      .select();

    if (error) {
      logger.error("Errore aggiornamento bulk:", error);
      throw new Error("Errore durante l'aggiornamento bulk");
    }

    logger.info("Aggiornamento bulk completato:", {
      action,
      messageIds: message_ids,
      updatedCount: updatedMessages.length,
      adminUser: req.user.email,
    });

    res.json({
      success: true,
      message: successMessage,
      data: {
        updated_count: updatedMessages.length,
        updated_messages: updatedMessages,
      },
    });
  } catch (error) {
    logger.error("Errore aggiornamento bulk:", error);
    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "BULK_UPDATE_ERROR",
    });
  }
});

export default router;