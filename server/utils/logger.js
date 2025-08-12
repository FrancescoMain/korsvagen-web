/**
 * SISTEMA DI LOGGING
 *
 * Sistema di logging strutturato per l'applicazione KORSVAGEN.
 * Gestisce diversi livelli di log e formattazione consistente
 * per monitoraggio e debugging.
 *
 * Livelli di log supportati:
 * - error: Errori critici che richiedono attenzione
 * - warn: Avvisi per situazioni potenzialmente problematiche
 * - info: Informazioni generali sul funzionamento
 * - debug: Informazioni dettagliate per debugging
 *
 * @author KORSVAGEN S.R.L.
 */

/**
 * Configurazione livelli di log
 */
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

/**
 * Colori per output console (solo in development)
 */
const COLORS = {
  error: "\x1b[31m", // Rosso
  warn: "\x1b[33m", // Giallo
  info: "\x1b[36m", // Ciano
  debug: "\x1b[35m", // Magenta
  reset: "\x1b[0m", // Reset
};

/**
 * Ottiene il livello di log corrente dalle variabili d'ambiente
 */
function getCurrentLogLevel() {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() || "info";
  return LOG_LEVELS[envLevel] !== undefined ? envLevel : "info";
}

/**
 * Determina se un messaggio deve essere loggato
 * basandosi sul livello corrente
 */
function shouldLog(messageLevel) {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVELS[messageLevel] <= LOG_LEVELS[currentLevel];
}

/**
 * Formatta un messaggio di log con timestamp e metadati
 */
function formatLogMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const pid = process.pid;
  const env = process.env.NODE_ENV || "development";

  // Oggetto log strutturato
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message: typeof message === "string" ? message : JSON.stringify(message),
    pid,
    env,
    ...meta,
  };

  // In development, usa formato colorato per console
  if (env === "development") {
    const color = COLORS[level] || COLORS.reset;
    const resetColor = COLORS.reset;

    return `${color}[${timestamp}] ${level.toUpperCase()}${resetColor}: ${
      logEntry.message
    }${Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ""}`;
  }

  // In production, usa formato JSON per parsing automatico
  // Safe stringify per evitare errori con circular references
  const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    };
  };
  
  return JSON.stringify(logEntry, getCircularReplacer());
}

/**
 * Funzione di output log
 *
 * Scrive il log sulla console o su file basandosi
 * sulla configurazione dell'ambiente
 */
function outputLog(level, formattedMessage) {
  if (level === "error") {
    console.error(formattedMessage);
  } else if (level === "warn") {
    console.warn(formattedMessage);
  } else {
    console.log(formattedMessage);
  }
}

/**
 * Logger principale
 *
 * Oggetto con metodi per i diversi livelli di log
 */
export const logger = {
  /**
   * Log di errori critici
   *
   * @param {string|Object} message - Messaggio di errore
   * @param {Object} meta - Metadati aggiuntivi
   */
  error(message, meta = {}) {
    if (!shouldLog("error")) return;

    // Se il messaggio è un Error object, estrai informazioni utili
    if (message instanceof Error) {
      meta = {
        ...meta,
        stack: message.stack,
        name: message.name,
      };
      message = message.message;
    }

    const formatted = formatLogMessage("error", message, meta);
    outputLog("error", formatted);
  },

  /**
   * Log di avvertimenti
   *
   * @param {string|Object} message - Messaggio di avvertimento
   * @param {Object} meta - Metadati aggiuntivi
   */
  warn(message, meta = {}) {
    if (!shouldLog("warn")) return;

    const formatted = formatLogMessage("warn", message, meta);
    outputLog("warn", formatted);
  },

  /**
   * Log informazioni generali
   *
   * @param {string|Object} message - Messaggio informativo
   * @param {Object} meta - Metadati aggiuntivi
   */
  info(message, meta = {}) {
    if (!shouldLog("info")) return;

    const formatted = formatLogMessage("info", message, meta);
    outputLog("info", formatted);
  },

  /**
   * Log per debugging
   *
   * @param {string|Object} message - Messaggio di debug
   * @param {Object} meta - Metadati aggiuntivi
   */
  debug(message, meta = {}) {
    if (!shouldLog("debug")) return;

    const formatted = formatLogMessage("debug", message, meta);
    outputLog("debug", formatted);
  },

  /**
   * Log di una richiesta HTTP
   *
   * @param {Object} req - Oggetto request Express
   * @param {Object} res - Oggetto response Express
   * @param {number} duration - Durata della richiesta in ms
   */
  request(req, res, duration = 0) {
    if (!shouldLog("info")) return;

    const meta = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      userAgent: req.get("User-Agent"),
      ip: req.ip,
      duration: `${duration}ms`,
    };

    // Include userId se presente nell'autenticazione
    if (req.user?.id) {
      meta.userId = req.user.id;
    }

    const message = `${req.method} ${req.originalUrl} - ${res.statusCode}`;
    this.info(message, meta);
  },

  /**
   * Log operazioni database
   *
   * @param {string} operation - Tipo di operazione (SELECT, INSERT, etc.)
   * @param {string} table - Nome tabella
   * @param {Object} meta - Metadati aggiuntivi
   */
  database(operation, table, meta = {}) {
    if (!shouldLog("debug")) return;

    const message = `Database ${operation} on ${table}`;
    this.debug(message, {
      operation,
      table,
      ...meta,
    });
  },

  /**
   * Log operazioni di autenticazione
   *
   * @param {string} action - Azione eseguita (login, logout, etc.)
   * @param {string} userId - ID utente
   * @param {Object} meta - Metadati aggiuntivi
   */
  auth(action, userId, meta = {}) {
    if (!shouldLog("info")) return;

    const message = `Auth ${action} for user ${userId}`;
    this.info(message, {
      action,
      userId,
      ...meta,
    });
  },

  /**
   * Log operazioni su media/file
   *
   * @param {string} action - Azione eseguita (upload, delete, etc.)
   * @param {string} filename - Nome file
   * @param {Object} meta - Metadati aggiuntivi
   */
  media(action, filename, meta = {}) {
    if (!shouldLog("info")) return;

    const message = `Media ${action}: ${filename}`;
    this.info(message, {
      action,
      filename,
      ...meta,
    });
  },
};

/**
 * Middleware Express per logging automatico delle richieste
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Override del metodo res.end per catturare la fine della richiesta
  const originalEnd = res.end;
  res.end = function (chunk, encoding) {
    const duration = Date.now() - startTime;
    logger.request(req, res, duration);
    originalEnd.call(this, chunk, encoding);
  };

  next();
}

/**
 * Utility per creare logger con contesto specifico
 *
 * @param {string} context - Contesto del logger (es. 'AuthService', 'DatabaseManager')
 */
export function createContextLogger(context) {
  return {
    error: (message, meta = {}) => logger.error(message, { context, ...meta }),
    warn: (message, meta = {}) => logger.warn(message, { context, ...meta }),
    info: (message, meta = {}) => logger.info(message, { context, ...meta }),
    debug: (message, meta = {}) => logger.debug(message, { context, ...meta }),
  };
}

// Log inizializzazione del logger
logger.info(
  `📝 Sistema di logging inizializzato (livello: ${getCurrentLogLevel()})`
);
