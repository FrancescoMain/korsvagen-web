/**
 * ROUTES HEALTH CHECK
 *
 * Endpoint per monitoraggio dello stato del server e dei servizi
 * collegati (Supabase, Cloudinary). Utilizzato per:
 *
 * - Health check di base per uptime monitoring
 * - Verifica connessioni ai servizi esterni
 * - Diagnostica dello stato dell'applicazione
 * - Informazioni sulla versione e configurazione
 *
 * @author KORSVAGEN S.R.L.
 */

import { Router } from "express";
import { logger } from "../utils/logger.js";
import { testSupabaseConnection } from "../config/supabase.js";
import { testCloudinaryConnection } from "../config/cloudinary.js";

const router = Router();

/**
 * GET /api/health
 *
 * Health check di base - verifica che il server sia attivo
 * e risponda correttamente alle richieste
 */
router.get("/", async (req, res) => {
  try {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    };

    logger.debug("Health check richiesto", {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      success: true,
      data: healthStatus,
    });
  } catch (error) {
    logger.error("Errore durante health check:", error.message);

    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: "Errore interno del server",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/detailed
 *
 * Health check dettagliato - include verifica dei servizi esterni
 * (Supabase, Cloudinary) e informazioni diagnostiche avanzate
 */
router.get("/detailed", async (req, res) => {
  const startTime = Date.now();

  try {
    logger.info("Esecuzione health check dettagliato");

    // Verifica servizi esterni in parallelo
    const [supabaseStatus, cloudinaryStatus] = await Promise.allSettled([
      testSupabaseConnection(),
      testCloudinaryConnection(),
    ]);

    // Calcola tempo di risposta
    const responseTime = Date.now() - startTime;

    // Determina stato generale
    const isSupabaseHealthy =
      supabaseStatus.status === "fulfilled" && supabaseStatus.value.success;
    const isCloudinaryHealthy =
      cloudinaryStatus.status === "fulfilled" && cloudinaryStatus.value.success;
    const overallStatus =
      isSupabaseHealthy && isCloudinaryHealthy ? "healthy" : "degraded";

    const healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      uptime: process.uptime(),
      version: process.env.npm_package_version || "1.0.0",
      environment: process.env.NODE_ENV || "development",
      nodeVersion: process.version,

      // Informazioni sistema
      system: {
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024),
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
        },
        cpu: process.cpuUsage(),
      },

      // Stato servizi esterni
      services: {
        supabase:
          supabaseStatus.status === "fulfilled"
            ? supabaseStatus.value
            : {
                success: false,
                message:
                  supabaseStatus.reason?.message || "Errore di connessione",
              },

        cloudinary:
          cloudinaryStatus.status === "fulfilled"
            ? cloudinaryStatus.value
            : {
                success: false,
                message:
                  cloudinaryStatus.reason?.message || "Errore di connessione",
              },
      },

      // Configurazioni (senza dati sensibili)
      config: {
        corsOrigin: process.env.CORS_ORIGIN ? "✅ Configurato" : "❌ Mancante",
        jwtSecret: (process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET) ? "✅ Configurato" : "❌ Mancante",
        supabaseUrl: process.env.SUPABASE_URL
          ? "✅ Configurato"
          : "❌ Mancante",
        cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME
          ? "✅ Configurato"
          : "❌ Mancante",
        logLevel: process.env.LOG_LEVEL || "info",
      },
    };

    // Log del risultato
    logger.info("Health check dettagliato completato", {
      status: overallStatus,
      responseTime: `${responseTime}ms`,
      supabaseHealthy: isSupabaseHealthy,
      cloudinaryHealthy: isCloudinaryHealthy,
    });

    const statusCode = overallStatus === "healthy" ? 200 : 503;

    res.status(statusCode).json({
      success: overallStatus === "healthy",
      data: healthStatus,
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error("Errore durante health check dettagliato:", {
      error: error.message,
      responseTime: `${responseTime}ms`,
      stack: error.stack,
    });

    res.status(500).json({
      success: false,
      status: "unhealthy",
      error: "Errore durante verifica stato servizi",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    });
  }
});

/**
 * GET /api/health/readiness
 *
 * Readiness probe - verifica che l'applicazione sia pronta
 * a ricevere traffico (tutti i servizi essenziali attivi)
 */
router.get("/readiness", async (req, res) => {
  try {
    // Verifica solo i servizi critici
    const supabaseStatus = await testSupabaseConnection();

    const isReady = supabaseStatus.success;

    if (isReady) {
      res.status(200).json({
        success: true,
        status: "ready",
        message: "Applicazione pronta a ricevere traffico",
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        success: false,
        status: "not_ready",
        message: "Applicazione non pronta - servizi critici non disponibili",
        timestamp: new Date().toISOString(),
        details: {
          supabase: supabaseStatus,
        },
      });
    }
  } catch (error) {
    logger.error("Errore durante readiness check:", error.message);

    res.status(503).json({
      success: false,
      status: "not_ready",
      message: "Errore durante verifica readiness",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/liveness
 *
 * Liveness probe - verifica che l'applicazione sia viva
 * e non in stato di deadlock (controllo di base)
 */
router.get("/liveness", (req, res) => {
  try {
    // Controllo molto semplice - se arriviamo qui, l'app è viva
    res.status(200).json({
      success: true,
      status: "alive",
      message: "Applicazione attiva e funzionante",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    // Se anche questo fallisce, c'è un problema grave
    logger.error("Errore critico durante liveness check:", error.message);

    res.status(500).json({
      success: false,
      status: "dead",
      message: "Applicazione in stato critico",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/health/version
 *
 * Informazioni sulla versione dell'applicazione
 * e build info (utile per deployment tracking)
 */
router.get("/version", (req, res) => {
  try {
    const versionInfo = {
      name: "KORSVAGEN Web Backend",
      version: process.env.npm_package_version || "1.0.0",
      description:
        process.env.npm_package_description ||
        "Backend API for KORSVAGEN Web Application",
      author: "KORSVAGEN S.R.L.",

      build: {
        environment: process.env.NODE_ENV || "development",
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },

      timestamp: new Date().toISOString(),

      // Informazioni Git (se disponibili)
      git: {
        commit:
          process.env.VERCEL_GIT_COMMIT_SHA ||
          process.env.GIT_COMMIT ||
          "unknown",
        branch:
          process.env.VERCEL_GIT_COMMIT_REF ||
          process.env.GIT_BRANCH ||
          "unknown",
        repo: process.env.VERCEL_GIT_REPO_SLUG || "korsvagen-web",
      },
    };

    res.status(200).json({
      success: true,
      data: versionInfo,
    });
  } catch (error) {
    logger.error("Errore durante recupero info versione:", error.message);

    res.status(500).json({
      success: false,
      error: "Errore recupero informazioni versione",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
