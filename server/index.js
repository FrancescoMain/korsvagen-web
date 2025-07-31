/**
 * KORSVAGEN WEB APPLICATION - BACKEND SERVER
 *
 * Server Express.js principale che gestisce tutte le API del backend
 * per l'applicazione web KORSVAGEN.
 *
 * Features principali:
 * - Autenticazione JWT
 * - Integrazione con Supabase (database)
 * - Integrazione con Cloudinary (media storage)
 * - Rate limiting e sicurezza
 * - Logging strutturato
 * - Compatibilità Vercel per deployment
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Ottieni il percorso corrente per moduli ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carica le variabili d'ambiente dalla root del progetto
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Importa le configurazioni e utilities
import { supabaseClient } from "./config/supabase.js";
import { cloudinaryConfig } from "./config/cloudinary.js";
import { logger } from "./utils/logger.js";

// Importa i routes
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import contactRoutes from "./routes/contact.js";
import settingsRoutes from "./routes/settings.js";

// Inizializza l'app Express
const app = express();
const PORT = process.env.PORT || 3001;

// Configurazione per Vercel - Trust proxy
app.set('trust proxy', 1);

/**
 * CONFIGURAZIONE MIDDLEWARE GLOBALI
 *
 * Configura i middleware essenziali per sicurezza,
 * parsing, logging e gestione delle richieste cross-origin
 */

// Sicurezza: Headers di sicurezza HTTP
app.use(
  helmet({
    crossOriginEmbedderPolicy: false, // Necessario per Cloudinary
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      },
    },
  })
);

// CORS: Configurazione per permettere richieste dal frontend
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(",") || [
      "http://localhost:3000",
      "http://localhost:3002",
      "https://korsvagen-web.vercel.app",
      "https://www.korsvagen.it",
      "https://korsvagen.it",
    ];

    // Permetti richieste senza origin (es. favicon, health checks, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Permetti tutti gli origins allowedOrigins
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`🚫 CORS blocked origin: ${origin}`);
      console.log(`📝 Allowed origins: ${allowedOrigins.join(", ")}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "Origin",
    "X-Requested-With",
    "Accept",
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Handler esplicito per richieste OPTIONS preflight
app.options("*", cors(corsOptions));

// Rate Limiting: Prevenzione attacchi DDoS
const generalLimiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000, // 15 minuti default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 richieste per finestra
  message: {
    error: "Troppe richieste da questo IP, riprova più tardi.",
    code: "RATE_LIMIT_EXCEEDED",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Parsing: JSON e URL-encoded data
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing
app.use(cookieParser());

// Logging: Morgan per logging delle richieste HTTP
if (process.env.NODE_ENV !== "test") {
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => logger.info(message.trim()),
      },
    })
  );
}

/**
 * INIZIALIZZAZIONE SERVIZI ESTERNI
 *
 * Verifica la connessione ai servizi esterni
 * (Supabase e Cloudinary) all'avvio del server
 */
async function initializeServices() {
  try {
    logger.info("🔄 Inizializzazione servizi esterni...");

    // Test connessione Supabase (con timeout)
    const supabasePromise = Promise.race([
      supabaseClient.from("users").select("count").limit(1),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), 5000)
      ),
    ]);

    try {
      const { data, error } = await supabasePromise;
      if (error && error.code !== "PGRST116") {
        logger.warn("⚠️  Warning Supabase:", error.message);
      } else {
        logger.info("✅ Connessione Supabase OK");
      }
    } catch (supabaseError) {
      logger.warn("⚠️  Warning connessione Supabase:", supabaseError.message);
    }

    // Test configurazione Cloudinary (rapido)
    if (cloudinaryConfig.cloud_name && cloudinaryConfig.api_key) {
      logger.info("✅ Configurazione Cloudinary OK");
    } else {
      logger.warn("⚠️  Warning: Configurazione Cloudinary incompleta");
    }

    logger.info("✅ Inizializzazione servizi completata");
  } catch (error) {
    logger.error("❌ Errore inizializzazione servizi:", error.message);
    // Non fermiamo il server, ma logghiamo l'errore
  }
}

/**
 * CONFIGURAZIONE ROUTES
 *
 * Definisce tutti gli endpoint API disponibili per l'applicazione
 */

// Health Check - per monitoraggio uptime e stato servizi
app.use("/api/health", healthRoutes);

// Test endpoint diretto per debug Vercel
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test endpoint works!",
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
  });
});

// Autenticazione - login, logout, refresh token
app.use("/api/auth", authRoutes);

// Dashboard - statistiche, messaggi, gestione contenuti
app.use("/api/dashboard", dashboardRoutes);

// Contatti - form di contatto del sito web
app.use("/api/contact", contactRoutes);

// Settings - gestione impostazioni applicazione
app.use("/api/settings", settingsRoutes);

// Placeholder per futuri endpoint che saranno aggiunti nelle fasi successive:
// - /api/users (gestione utenti)
// - /api/media (upload Cloudinary)
// - /api/content (contenuti CMS)
// - /api/projects (portfolio)
// - /api/news (blog/news)

/**
 * MIDDLEWARE DI GESTIONE ERRORI
 *
 * Gestisce gli errori globali dell'applicazione
 * e fornisce risposte strutturate al client
 */

// Handler per route non trovate (404)
app.use("*", (req, res) => {
  logger.warn(
    `Richiesta a route non esistente: ${req.method} ${req.originalUrl}`
  );

  res.status(404).json({
    success: false,
    error: "Endpoint non trovato",
    code: "ENDPOINT_NOT_FOUND",
    path: req.originalUrl,
    method: req.method,
  });
});

// Handler globale per errori
app.use((error, req, res, next) => {
  logger.error("Errore non gestito:", {
    error: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Non esporre dettagli dell'errore in produzione
  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(error.status || 500).json({
    success: false,
    error: isDevelopment ? error.message : "Errore interno del server",
    code: error.code || "INTERNAL_SERVER_ERROR",
    ...(isDevelopment && { stack: error.stack }),
  });
});

/**
 * AVVIO DEL SERVER
 *
 * Inizializza i servizi e avvia il server Express
 * sulla porta specificata
 */
async function startServer() {
  try {
    // Inizializza i servizi esterni
    await initializeServices();

    // Avvia il server
    app.listen(PORT, () => {
      logger.info(`🚀 Server KORSVAGEN avviato con successo`);
      logger.info(`📍 Porta: ${PORT}`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
      logger.info(
        `🔗 API Base URL: ${
          process.env.API_BASE_URL || `http://localhost:${PORT}`
        }`
      );

      // Log delle configurazioni attive
      logger.info("📋 Configurazioni attive:");
      logger.info(
        `   - Supabase URL: ${
          process.env.SUPABASE_URL ? "✅ Configurato" : "❌ Mancante"
        }`
      );
      logger.info(
        `   - Cloudinary: ${
          process.env.CLOUDINARY_CLOUD_NAME ? "✅ Configurato" : "❌ Mancante"
        }`
      );
      logger.info(
        `   - JWT Secret: ${
          process.env.JWT_SECRET ? "✅ Configurato" : "❌ Mancante"
        }`
      );
    });
  } catch (error) {
    logger.error("❌ Errore durante l'avvio del server:", error.message);
    process.exit(1);
  }
}

// Gestione graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM ricevuto, shutdown del server...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT ricevuto, shutdown del server...");
  process.exit(0);
});

// Avvia il server solo se questo file viene eseguito direttamente
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url === `file:///${process.argv[1].replace(/\\/g, "/")}` ||
  process.argv[1].endsWith("index.js");

if (isMainModule) {
  startServer();
}

// Esporta per Vercel come funzione serverless
export default async function handler(req, res) {
  // Inizializza i servizi la prima volta
  if (!app.locals.initialized) {
    try {
      await initializeServices();
      app.locals.initialized = true;
    } catch (error) {
      logger.error("Errore inizializzazione servizi:", error);
    }
  }

  // Passa la richiesta all'app Express
  return app(req, res);
}
