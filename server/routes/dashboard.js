/**
 * KORSVAGEN WEB APPLICATION - DASHBOARD ROUTES
 *
 * Routes per la dashboard amministratori con statistiche,
 * gestione contenuti e messaggi.
 *
 * Features:
 * - Statistiche generali applicazione
 * - Gestione messaggi con notifiche
 * - Dati utenti e sessioni attive
 * - Logging attività recenti
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import express from "express";
import { supabaseClient } from "../config/supabase.js";
import { requireAuth } from "../utils/auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * ROUTE: GET /api/dashboard/stats
 *
 * Restituisce le statistiche generali per la dashboard
 */
router.get("/stats", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Esegui tutte le query in parallelo per migliori performance
    const [
      { data: usersCount },
      { data: activeSessions },
      { data: unreadMessages },
      { data: totalMessages },
      { data: recentActivity },
      { data: todayActivity },
    ] = await Promise.all([
      // Conteggio utenti attivi
      supabaseClient
        .from("admin_users")
        .select("id", { count: "exact" })
        .eq("is_active", true),

      // Sessioni attive
      supabaseClient
        .from("admin_sessions")
        .select("id", { count: "exact" })
        .eq("is_active", true)
        .gte("expires_at", new Date().toISOString()),

      // Messaggi non letti
      supabaseClient
        .from("admin_messages")
        .select("id", { count: "exact" })
        .eq("is_read", false),

      // Totale messaggi
      supabaseClient.from("admin_messages").select("id", { count: "exact" }),

      // Attività recenti (ultime 24 ore)
      supabaseClient
        .from("admin_activity_logs")
        .select("id", { count: "exact" })
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ),

      // Attività di oggi
      supabaseClient
        .from("admin_activity_logs")
        .select("id", { count: "exact" })
        .gte("created_at", new Date().toDateString()),
    ]);

    // Messaggi per status
    const { data: messagesByStatus } = await supabaseClient
      .from("admin_messages")
      .select("status")
      .neq("status", "archived");

    const statusCounts =
      messagesByStatus?.reduce((acc, msg) => {
        acc[msg.status] = (acc[msg.status] || 0) + 1;
        return acc;
      }, {}) || {};

    // Attività recenti dettagliate (ultime 10)
    const { data: recentActivityDetails } = await supabaseClient
      .from("admin_activity_logs")
      .select(
        `
        id,
        action,
        success,
        created_at,
        admin_users (username)
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    // Log dell'accesso alle statistiche
    await supabaseClient.from("admin_activity_logs").insert({
      user_id: userId,
      action: "DASHBOARD_STATS_VIEW",
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent") || null,
      success: true,
    });

    const stats = {
      users: {
        total: usersCount?.length || 0,
        active: usersCount?.length || 0,
      },
      sessions: {
        active: activeSessions?.length || 0,
      },
      messages: {
        total: totalMessages?.length || 0,
        unread: unreadMessages?.length || 0,
        byStatus: statusCounts,
      },
      activity: {
        last24Hours: recentActivity?.length || 0,
        today: todayActivity?.length || 0,
        recent: recentActivityDetails || [],
      },
      system: {
        status: "operational",
        lastUpdate: new Date().toISOString(),
      },
    };

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    logger.error("Errore recupero statistiche dashboard:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/dashboard/messages
 *
 * Restituisce i messaggi con paginazione e filtri
 */
router.get("/messages", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, unread, search } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseClient.from("admin_messages").select(`
        id,
        type,
        subject,
        content,
        sender_name,
        sender_email,
        sender_phone,
        is_read,
        is_important,
        status,
        created_at,
        updated_at,
        read_at,
        admin_users!assigned_to (username)
      `);

    // Applica filtri
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    if (unread === "true") {
      query = query.eq("is_read", false);
    }

    if (search) {
      query = query.or(
        `subject.ilike.%${search}%,content.ilike.%${search}%,sender_name.ilike.%${search}%`
      );
    }

    // Conteggio totale per paginazione
    const { count: totalCount } = await supabaseClient
      .from("admin_messages")
      .select("id", { count: "exact" });

    // Esegui query con paginazione
    const { data: messages, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((totalCount || 0) / parseInt(limit));

    res.json({
      success: true,
      data: {
        messages: messages || [],
        pagination: {
          current: parseInt(page),
          total: totalPages,
          limit: parseInt(limit),
          totalItems: totalCount || 0,
        },
      },
    });
  } catch (error) {
    logger.error("Errore recupero messaggi:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/dashboard/messages/:id
 *
 * Restituisce un messaggio specifico e lo marca come letto
 */
router.get("/messages/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const { data: message, error } = await supabaseClient
      .from("admin_messages")
      .select(
        `
        *,
        admin_users!assigned_to (username, email)
      `
      )
      .eq("id", id)
      .single();

    if (error || !message) {
      return res.status(404).json({
        success: false,
        message: "Messaggio non trovato",
        code: "MESSAGE_NOT_FOUND",
      });
    }

    // Marca come letto se non lo è già
    if (!message.is_read) {
      await supabaseClient
        .from("admin_messages")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq("id", id);

      // Log attività
      await supabaseClient.from("admin_activity_logs").insert({
        user_id: userId,
        action: "MESSAGE_READ",
        resource_type: "message",
        resource_id: id,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get("User-Agent") || null,
        success: true,
      });
    }

    res.json({
      success: true,
      data: { message },
    });
  } catch (error) {
    logger.error("Errore recupero messaggio:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: PUT /api/dashboard/messages/:id
 *
 * Aggiorna lo status di un messaggio
 */
router.put("/messages/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, is_important, assigned_to } = req.body;
    const userId = req.user.sub;

    const updateData = {};

    if (status) {
      if (!["new", "in_progress", "resolved", "archived"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status non valido",
          code: "INVALID_STATUS",
        });
      }
      updateData.status = status;
    }

    if (typeof is_important === "boolean") {
      updateData.is_important = is_important;
    }

    if (assigned_to) {
      updateData.assigned_to = assigned_to;
    }

    updateData.updated_at = new Date().toISOString();

    const { data: updatedMessage, error } = await supabaseClient
      .from("admin_messages")
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
      throw error;
    }

    // Log attività
    await supabaseClient.from("admin_activity_logs").insert({
      user_id: userId,
      action: "MESSAGE_UPDATED",
      resource_type: "message",
      resource_id: id,
      details: updateData,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent") || null,
      success: true,
    });

    res.json({
      success: true,
      message: "Messaggio aggiornato con successo",
      data: { message: updatedMessage },
    });
  } catch (error) {
    logger.error("Errore aggiornamento messaggio:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: DELETE /api/dashboard/messages/:id
 *
 * Archivia (soft delete) un messaggio
 */
router.delete("/messages/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.sub;

    const { error } = await supabaseClient
      .from("admin_messages")
      .update({
        status: "archived",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        return res.status(404).json({
          success: false,
          message: "Messaggio non trovato",
          code: "MESSAGE_NOT_FOUND",
        });
      }
      throw error;
    }

    // Log attività
    await supabaseClient.from("admin_activity_logs").insert({
      user_id: userId,
      action: "MESSAGE_ARCHIVED",
      resource_type: "message",
      resource_id: id,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent") || null,
      success: true,
    });

    res.json({
      success: true,
      message: "Messaggio archiviato con successo",
    });
  } catch (error) {
    logger.error("Errore archiviazione messaggio:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: POST /api/dashboard/messages/mark-read
 *
 * Marca multipli messaggi come letti
 */
router.post("/messages/mark-read", requireAuth, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const userId = req.user.sub;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Array di ID messaggi richiesto",
        code: "INVALID_MESSAGE_IDS",
      });
    }

    const { error } = await supabaseClient
      .from("admin_messages")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .in("id", messageIds);

    if (error) {
      throw error;
    }

    // Log attività
    await supabaseClient.from("admin_activity_logs").insert({
      user_id: userId,
      action: "MESSAGES_MARK_READ",
      details: { count: messageIds.length, message_ids: messageIds },
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent") || null,
      success: true,
    });

    res.json({
      success: true,
      message: `${messageIds.length} messaggi marcati come letti`,
    });
  } catch (error) {
    logger.error("Errore marcatura messaggi come letti:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/dashboard/activity
 *
 * Restituisce il log delle attività recenti
 */
router.get("/activity", requireAuth, async (req, res) => {
  try {
    const { page = 1, limit = 50, user_id, action } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseClient.from("admin_activity_logs").select(`
        id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address,
        success,
        created_at,
        admin_users (username, email)
      `);

    // Applica filtri
    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    if (action) {
      query = query.eq("action", action);
    }

    const { data: activities, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: { activities: activities || [] },
    });
  } catch (error) {
    logger.error("Errore recupero attività:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/dashboard/users
 *
 * Restituisce la lista degli utenti amministratori
 */
router.get("/users", requireAuth, async (req, res) => {
  try {
    // Solo super_admin può vedere tutti gli utenti
    if (req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Accesso non autorizzato",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const { data: users, error } = await supabaseClient
      .from("admin_users")
      .select(
        `
        id,
        username,
        email,
        role,
        is_active,
        last_login,
        login_attempts,
        profile_data,
        created_at
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: { users: users || [] },
    });
  } catch (error) {
    logger.error("Errore recupero utenti:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

export default router;
