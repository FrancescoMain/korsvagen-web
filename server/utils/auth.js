/**
 * SISTEMA DI AUTENTICAZIONE JWT
 *
 * Gestisce l'autenticazione e autorizzazione tramite JSON Web Tokens
 * per l'applicazione KORSVAGEN. Include funzionalità per:
 *
 * - Generazione e validazione JWT tokens
 * - Middleware di autenticazione per Express
 * - Gestione refresh tokens
 * - Controllo ruoli e permessi
 * - Rate limiting per tentativi di login
 *
 * @author KORSVAGEN S.R.L.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { logger } from "./logger.js";
import { supabaseClient } from "../config/supabase.js";

/**
 * Configurazione JWT dalle variabili d'ambiente
 * Supporta sia le variabili Supabase che quelle custom
 */
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.SUPABASE_JWT_SECRET,
  expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  issuer: "korsvagen-web",
  audience: "korsvagen-users",
};

/**
 * Validazione configurazione JWT
 */
function validateJWTConfig() {
  // Debug per capire quale variabile viene usata
  const jwtSource = process.env.JWT_SECRET ? 'JWT_SECRET' : 
                   process.env.SUPABASE_JWT_SECRET ? 'SUPABASE_JWT_SECRET' : 'NONE';
  
  logger.info("🔑 JWT Configuration:", {
    source: jwtSource,
    hasSecret: !!JWT_CONFIG.secret,
    secretLength: JWT_CONFIG.secret?.length || 0,
    hasRefreshSecret: !!JWT_CONFIG.refreshSecret,
    refreshSecretLength: JWT_CONFIG.refreshSecret?.length || 0
  });

  if (!JWT_CONFIG.secret || JWT_CONFIG.secret.length < 32) {
    logger.warn(
      "JWT_SECRET non configurato o troppo corto - autenticazione disabilitata per questa fase. " +
      "Verificare JWT_SECRET o SUPABASE_JWT_SECRET nelle variabili d'ambiente."
    );
    return false;
  }

  if (!JWT_CONFIG.refreshSecret || JWT_CONFIG.refreshSecret.length < 32) {
    logger.warn(
      "JWT_REFRESH_SECRET non configurato, usando JWT_SECRET/SUPABASE_JWT_SECRET per refresh tokens"
    );
  }

  logger.info("✅ Configurazione JWT validata");
  return true;
}

// Validazione all'inizializzazione (non bloccante)
let jwtConfigValid = false;
try {
  jwtConfigValid = validateJWTConfig();
} catch (error) {
  logger.warn("⚠️  Warning configurazione JWT:", error.message);
}

/**
 * GESTIONE PASSWORD
 */

/**
 * Hash di una password con bcrypt
 *
 * @param {string} password - Password in chiaro
 * @returns {Promise<string>} Password hashata
 */
export async function hashPassword(password) {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    logger.debug("Password hashata con successo");
    return hashedPassword;
  } catch (error) {
    logger.error("Errore hashing password:", error.message);
    throw new Error("Errore durante l'elaborazione della password");
  }
}

/**
 * Verifica una password contro il suo hash
 *
 * @param {string} password - Password in chiaro
 * @param {string} hash - Hash della password
 * @returns {Promise<boolean>} True se la password è corretta
 */
export async function verifyPassword(password, hash) {
  try {
    const isValid = await bcrypt.compare(password, hash);

    logger.debug("Verifica password completata", { isValid });
    return isValid;
  } catch (error) {
    logger.error("Errore verifica password:", error.message);
    return false;
  }
}

/**
 * GESTIONE JWT TOKENS
 */

/**
 * Genera un JWT access token
 *
 * @param {Object} payload - Dati da includere nel token
 * @param {Object} options - Opzioni aggiuntive
 * @returns {string} JWT token
 */
export function generateAccessToken(payload, options = {}) {
  try {
    const tokenPayload = {
      sub: payload.userId || payload.id,
      email: payload.email,
      role: payload.role || "user",
      iat: Math.floor(Date.now() / 1000),
      ...payload,
    };

    const token = jwt.sign(tokenPayload, JWT_CONFIG.secret, {
      expiresIn: options.expiresIn || JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      ...options,
    });

    logger.debug("Access token generato", {
      userId: tokenPayload.sub,
      expiresIn: options.expiresIn || JWT_CONFIG.expiresIn,
    });

    return token;
  } catch (error) {
    logger.error("Errore generazione access token:", error.message);
    throw new Error("Errore generazione token di accesso");
  }
}

/**
 * Genera un JWT refresh token
 *
 * @param {Object} payload - Dati da includere nel token
 * @returns {string|null} Refresh token o null se non configurato
 */
export function generateRefreshToken(payload) {
  if (!JWT_CONFIG.refreshSecret) {
    logger.warn(
      "Refresh token non generato: JWT_REFRESH_SECRET non configurato"
    );
    return null;
  }

  try {
    const tokenPayload = {
      sub: payload.userId || payload.id,
      type: "refresh",
      iat: Math.floor(Date.now() / 1000),
    };

    const token = jwt.sign(tokenPayload, JWT_CONFIG.refreshSecret, {
      expiresIn: JWT_CONFIG.refreshExpiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });

    logger.debug("Refresh token generato", { userId: tokenPayload.sub });

    return token;
  } catch (error) {
    logger.error("Errore generazione refresh token:", error.message);
    return null;
  }
}

/**
 * Verifica e decodifica un JWT token
 *
 * @param {string} token - Token da verificare
 * @param {boolean} isRefreshToken - Se true, usa la refresh secret
 * @returns {Object} Payload decodificato
 */
export function verifyToken(token, isRefreshToken = false) {
  const secret = isRefreshToken
    ? JWT_CONFIG.refreshSecret
    : JWT_CONFIG.secret;

  try {
    if (!secret) {
      throw new Error("Secret non configurato per questo tipo di token");
    }

    const decoded = jwt.verify(token, secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });

    logger.debug("Token verificato con successo", {
      userId: decoded.sub,
      type: isRefreshToken ? "refresh" : "access",
    });

    return decoded;
  } catch (error) {
    logger.warn("🔍 Token verification failed:", {
      errorName: error.name,
      errorMessage: error.message,
      tokenPrefix: (typeof token === 'string' && token) ? token.substring(0, 20) + "..." : "NO_TOKEN",
      tokenLength: (typeof token === 'string') ? token.length : 'NOT_STRING',
      tokenType: typeof token,
      isRefreshToken,
      hasSecret: !!secret,
      issuer: "korsvagen-web",
      audience: "korsvagen-users"
    });

    // Classifica l'errore per gestione specifica
    if (error.name === "TokenExpiredError") {
      throw new Error("Token scaduto");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Token non valido");
    } else {
      throw new Error("Errore verifica token");
    }
  }
}

/**
 * MIDDLEWARE DI AUTENTICAZIONE
 */

/**
 * Middleware per autenticazione obbligatoria
 *
 * Verifica la presenza e validità del token JWT
 * e aggiunge i dati utente alla request
 */
export function requireAuth(req, res, next) {
  try {
    // Estrai token dall'header Authorization o dai cookies
    let token = req.headers.authorization?.replace("Bearer ", "");

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    // Debug logging per investigare il problema del token
    logger.debug("🔍 Token auth debug:", {
      hasAuthHeader: !!req.headers.authorization,
      authHeaderLength: req.headers.authorization?.length,
      hasCookieToken: !!req.cookies?.accessToken,
      tokenFound: !!token,
      tokenPrefix: (typeof token === 'string' && token) ? token.substring(0, 20) + "..." : "NO_TOKEN",
      tokenType: typeof token,
      url: req.url,
      method: req.method
    });

    if (!token) {
      logger.warn("❌ Token di accesso mancante", {
        url: req.url,
        method: req.method,
        headers: {
          authorization: req.headers.authorization ? "PRESENTE" : "MANCANTE",
          cookie: req.headers.cookie ? "PRESENTE" : "MANCANTE"
        }
      });
      
      return res.status(401).json({
        success: false,
        error: "Token di accesso richiesto",
        code: "AUTH_TOKEN_REQUIRED",
      });
    }

    // Verifica il token
    const decoded = verifyToken(token);

    // Aggiungi i dati utente alla request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      tokenData: decoded,
    };

    logger.auth("Token validato", decoded.sub, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    next();
  } catch (error) {
    logger.warn("Tentativo accesso con token non valido", {
      error: error.message,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(401).json({
      success: false,
      error: error.message,
      code: "AUTH_TOKEN_INVALID",
    });
  }
}

/**
 * Middleware per autenticazione opzionale
 *
 * Se presente un token valido, aggiunge i dati utente
 * alla request, altrimenti continua senza errori
 */
export function optionalAuth(req, res, next) {
  try {
    let token = req.headers.authorization?.replace("Bearer ", "");

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        tokenData: decoded,
      };
    }

    next();
  } catch (error) {
    // In caso di errore, continua senza autenticazione
    logger.debug("Token opzionale non valido, continuando senza auth", {
      error: error.message,
    });
    next();
  }
}

/**
 * Middleware per controllo ruolo
 *
 * @param {string|string[]} allowedRoles - Ruoli autorizzati
 */
export function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Autenticazione richiesta",
        code: "AUTH_REQUIRED",
      });
    }

    const userRole = req.user.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(userRole)) {
      logger.warn("Accesso negato per ruolo insufficiente", {
        userId: req.user.id,
        userRole,
        requiredRoles: roles,
        ip: req.ip,
      });

      return res.status(403).json({
        success: false,
        error: "Privilegi insufficienti per questa operazione",
        code: "INSUFFICIENT_PRIVILEGES",
      });
    }

    logger.debug("Accesso autorizzato per ruolo", {
      userId: req.user.id,
      userRole,
      requiredRoles: roles,
    });

    next();
  };
}

/**
 * GESTIONE REFRESH TOKEN
 */

/**
 * Salva refresh token nel database
 *
 * @param {string} userId - ID utente
 * @param {string} refreshToken - Token da salvare
 */
export async function saveRefreshToken(userId, refreshToken) {
  try {
    const { error } = await supabaseClient.from("user_refresh_tokens").upsert({
      user_id: userId,
      token: refreshToken,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 giorni
    });

    if (error) throw error;

    logger.debug("Refresh token salvato", { userId });
  } catch (error) {
    logger.error("Errore salvataggio refresh token:", error.message);
    throw new Error("Errore salvataggio token di refresh");
  }
}

/**
 * Valida e rimuove refresh token dal database
 *
 * @param {string} refreshToken - Token da validare
 * @returns {Object} Dati utente se valido
 */
export async function validateRefreshToken(refreshToken) {
  try {
    // Verifica JWT
    const decoded = verifyToken(refreshToken, true);

    // Verifica esistenza nel database
    const { data, error } = await supabaseClient
      .from("user_refresh_tokens")
      .select("user_id, expires_at")
      .eq("token", refreshToken)
      .single();

    if (error || !data) {
      throw new Error("Refresh token non trovato");
    }

    // Verifica scadenza
    if (new Date(data.expires_at) < new Date()) {
      // Rimuovi token scaduto
      await supabaseClient
        .from("user_refresh_tokens")
        .delete()
        .eq("token", refreshToken);

      throw new Error("Refresh token scaduto");
    }

    // Rimuovi il token usato (one-time use)
    await supabaseClient
      .from("user_refresh_tokens")
      .delete()
      .eq("token", refreshToken);

    logger.debug("Refresh token validato", { userId: data.user_id });

    return { userId: data.user_id };
  } catch (error) {
    logger.warn("Tentativo uso refresh token non valido:", error.message);
    throw error;
  }
}

logger.info("🔐 Sistema di autenticazione JWT inizializzato");
