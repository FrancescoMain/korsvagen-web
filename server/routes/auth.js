/**
 * KORSVAGEN WEB APPLICATION - AUTH ROUTES
 *
 * Routes dedicati all'autenticazione degli amministratori.
 * Gestisce login, logout, refresh token e validazione sessioni.
 *
 * Features:
 * - Login con rate limiting specifico
 * - Gestione refresh token sicura
 * - Logging attività per audit
 * - Validazione input robusta
 * - Gestione errori centralizzata
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { supabaseClient } from "../config/supabase.js";
import {
  requireAuth,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from "../utils/auth.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

/**
 * RATE LIMITERS SPECIFICI PER AUTENTICAZIONE
 *
 * Limitazioni più stringenti per prevenire attacchi brute force
 */

// Rate limiter per login - più restrittivo
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // Usa env variable o 5 come fallback
  message: {
    error: "Troppi tentativi di login. Riprova tra 15 minuti.",
    code: "LOGIN_RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * VALIDATORI INPUT
 *
 * Validazione robusta dei dati in ingresso usando express-validator
 */

const loginValidators = [
  body("username")
    .notEmpty()
    .withMessage("Username è obbligatorio")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username deve essere tra 3 e 50 caratteri")
    .trim()
    .escape(),
  body("password")
    .notEmpty()
    .withMessage("Password è obbligatoria")
    .isLength({ min: 6 })
    .withMessage("Password deve essere almeno 6 caratteri"),
  body("rememberMe")
    .optional()
    .isBoolean()
    .withMessage("RememberMe deve essere un boolean"),
];

/**
 * UTILITY FUNCTIONS
 */

/**
 * Genera JWT token con payload specifico
 * @param {Object} user - Dati utente
 * @param {string} type - Tipo di token ('access' | 'refresh')
 * @returns {string} JWT token
 */
/**
 * Salva sessione nel database
 * @param {string} userId - ID utente
 * @param {string} refreshToken - Refresh token
 * @param {Object} req - Request object per user agent e IP
 * @param {boolean} rememberMe - Se mantenere la sessione più a lungo
 */
const saveSession = async (userId, refreshToken, req, rememberMe = false) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (rememberMe ? 30 : 7)); // 30 giorni se remember me, altrimenti 7

  const { error } = await supabaseClient.from("admin_sessions").insert({
    user_id: userId,
    refresh_token: refreshToken,
    user_agent: req.get("User-Agent") || null,
    ip_address: req.ip || req.connection.remoteAddress,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    logger.error("Errore salvataggio sessione:", error);
    throw new Error("Errore interno durante il salvataggio della sessione");
  }
};

/**
 * Log attività utente per audit
 * @param {string} userId - ID utente
 * @param {string} action - Azione eseguita
 * @param {Object} req - Request object
 * @param {boolean} success - Se l'azione è riuscita
 * @param {Object} details - Dettagli aggiuntivi
 */
const logActivity = async (
  userId,
  action,
  req,
  success = true,
  details = {}
) => {
  try {
    await supabaseClient.from("admin_activity_logs").insert({
      user_id: userId,
      action,
      details,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent") || null,
      success,
    });
  } catch (error) {
    logger.error("Errore logging attività:", error);
    // Non bloccare l'operazione principale per errori di logging
  }
};

/**
 * ROUTE: POST /api/auth/login
 *
 * Autentica un amministratore e restituisce i token di accesso
 */
router.post("/login", loginLimiter, loginValidators, async (req, res) => {
  try {
    // Validazione input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Dati di input non validi",
        errors: errors.array(),
      });
    }

    const { username, password, rememberMe = false } = req.body;

    logger.info(`Tentativo di login per utente: ${username}`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    // Recupera utente dal database
    const { data: user, error: userError } = await supabaseClient
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single();

    if (userError || !user) {
      await logActivity(null, "LOGIN_FAILED", req, false, {
        reason: "user_not_found",
        username,
      });

      return res.status(401).json({
        success: false,
        message: "Credenziali non valide",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Controlla se l'account è bloccato
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      await logActivity(user.id, "LOGIN_BLOCKED", req, false, {
        reason: "account_locked",
        locked_until: user.locked_until,
      });

      return res.status(423).json({
        success: false,
        message:
          "Account temporaneamente bloccato per troppi tentativi falliti",
        code: "ACCOUNT_LOCKED",
        locked_until: user.locked_until,
      });
    }

    // Verifica password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Incrementa tentativi falliti
      let newAttempts = (user.login_attempts || 0) + 1;
      let lockedUntil = null;

      // Blocca l'account dopo 5 tentativi falliti per 30 minuti
      if (newAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minuti
      }

      await supabaseClient
        .from("admin_users")
        .update({
          login_attempts: newAttempts,
          locked_until: lockedUntil,
        })
        .eq("id", user.id);

      await logActivity(user.id, "LOGIN_FAILED", req, false, {
        reason: "invalid_password",
        attempts: newAttempts,
      });

      return res.status(401).json({
        success: false,
        message: "Credenziali non valide",
        code: "INVALID_CREDENTIALS",
        attemptsRemaining: Math.max(0, 5 - newAttempts),
      });
    }

    // Login riuscito - reset tentativi e genera token
    await supabaseClient
      .from("admin_users")
      .update({
        login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString(),
      })
      .eq("id", user.id);

    // Genera token
    const accessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Salva sessione
    await saveSession(user.id, refreshToken, req, rememberMe);

    // Log attività riuscita
    await logActivity(user.id, "LOGIN_SUCCESS", req, true, {
      remember_me: rememberMe,
    });

    // Prepara dati utente per response (senza dati sensibili)
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile_data: user.profile_data,
      last_login: user.last_login,
    };

    logger.info(`Login riuscito per utente: ${username}`, {
      userId: user.id,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: "Login effettuato con successo",
      data: {
        user: userResponse,
        tokens: {
          access: accessToken,
          refresh: refreshToken,
        },
      },
    });
  } catch (error) {
    logger.error("Errore durante login:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: POST /api/auth/refresh
 *
 * Rinnova i token di accesso usando il refresh token
 */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token mancante",
        code: "MISSING_REFRESH_TOKEN",
      });
    }

    // Verifica il refresh token
    let decoded;
    try {
      // Importa la funzione verifyToken per consistenza
      decoded = verifyToken(refreshToken, true);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Refresh token non valido o scaduto",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Verifica che sia un refresh token
    if (decoded.type !== "refresh") {
      return res.status(401).json({
        success: false,
        message: "Token non valido per refresh",
        code: "INVALID_TOKEN_TYPE",
      });
    }

    // Verifica sessione nel database
    const { data: session, error: sessionError } = await supabaseClient
      .from("admin_sessions")
      .select("*")
      .eq("refresh_token", refreshToken)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return res.status(401).json({
        success: false,
        message: "Sessione non valida o scaduta",
        code: "INVALID_SESSION",
      });
    }

    // Recupera dati utente aggiornati
    const { data: user, error: userError } = await supabaseClient
      .from("admin_users")
      .select("*")
      .eq("id", decoded.sub)
      .eq("is_active", true)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: "Utente non trovato o disattivato",
        code: "USER_NOT_FOUND",
      });
    }

    // Genera nuovo access token
    const newAccessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Aggiorna last_used_at della sessione
    await supabaseClient
      .from("admin_sessions")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", session.id);

    // Log attività
    await logActivity(user.id, "TOKEN_REFRESH", req, true);

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      profile_data: user.profile_data,
    };

    res.json({
      success: true,
      message: "Token rinnovato con successo",
      data: {
        user: userResponse,
        tokens: {
          access: newAccessToken,
          refresh: refreshToken, // Il refresh token rimane lo stesso
        },
      },
    });
  } catch (error) {
    logger.error("Errore durante refresh token:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: POST /api/auth/logout
 *
 * Effettua il logout invalidando la sessione corrente
 */
router.post("/logout", requireAuth, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user.sub;

    // Invalida la sessione specifica se refresh token fornito
    if (refreshToken) {
      await supabaseClient
        .from("admin_sessions")
        .update({ is_active: false })
        .eq("refresh_token", refreshToken)
        .eq("user_id", userId);
    } else {
      // Invalida tutte le sessioni dell'utente se nessun refresh token specifico
      await supabaseClient
        .from("admin_sessions")
        .update({ is_active: false })
        .eq("user_id", userId);
    }

    // Log attività
    await logActivity(userId, "LOGOUT", req, true, {
      session_invalidated: !!refreshToken,
    });

    logger.info(`Logout effettuato per utente: ${req.user.username}`, {
      userId,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: "Logout effettuato con successo",
    });
  } catch (error) {
    logger.error("Errore durante logout:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/auth/me
 *
 * Restituisce i dati dell'utente attualmente autenticato
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    // Recupera dati aggiornati dell'utente
    const { data: user, error } = await supabaseClient
      .from("admin_users")
      .select("id, username, email, role, profile_data, last_login, created_at")
      .eq("id", userId)
      .eq("is_active", true)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Utente non trovato",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    logger.error("Errore recupero dati utente:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: GET /api/auth/sessions
 *
 * Restituisce le sessioni attive dell'utente corrente
 */
router.get("/sessions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.sub;

    const { data: sessions, error } = await supabaseClient
      .from("admin_sessions")
      .select(
        "id, user_agent, ip_address, created_at, last_used_at, expires_at"
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .gte("expires_at", new Date().toISOString())
      .order("last_used_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: { sessions: sessions || [] },
    });
  } catch (error) {
    logger.error("Errore recupero sessioni:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

/**
 * ROUTE: DELETE /api/auth/sessions/:sessionId
 *
 * Invalida una sessione specifica
 */
router.delete("/sessions/:sessionId", requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.sub;

    const { error } = await supabaseClient
      .from("admin_sessions")
      .update({ is_active: false })
      .eq("id", sessionId)
      .eq("user_id", userId);

    if (error) {
      throw error;
    }

    await logActivity(userId, "SESSION_REVOKED", req, true, {
      session_id: sessionId,
    });

    res.json({
      success: true,
      message: "Sessione invalidata con successo",
    });
  } catch (error) {
    logger.error("Errore invalidazione sessione:", error);

    res.status(500).json({
      success: false,
      message: "Errore interno del server",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
});

export default router;
