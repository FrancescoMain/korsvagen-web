/**
 * CONFIGURAZIONE SUPABASE
 *
 * Gestisce la connessione e configurazione del client Supabase
 * per operazioni su database PostgreSQL.
 *
 * Supabase fornisce:
 * - Database PostgreSQL gestito
 * - Autenticazione integrata
 * - API REST automatiche
 * - Realtime subscriptions
 * - Storage per file
 *
 * @author KORSVAGEN S.R.L.
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Carica variabili d'ambiente se non già caricate
if (!process.env.SUPABASE_URL) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
}

import { logger } from "../utils/logger.js";

/**
 * Validazione delle variabili d'ambiente Supabase
 *
 * Verifica che tutte le configurazioni necessarie
 * siano presenti nelle variabili d'ambiente
 */
function validateSupabaseConfig() {
  const requiredVars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"];

  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Variabili d'ambiente Supabase mancanti: ${missingVars.join(", ")}`
    );
  }

  // Validazione formato URL
  try {
    new URL(process.env.SUPABASE_URL);
  } catch (error) {
    throw new Error("SUPABASE_URL non è un URL valido");
  }

  logger.info("✅ Configurazione Supabase validata con successo");
}

/**
 * Configurazione client Supabase
 *
 * Crea e configura il client Supabase con le opzioni
 * ottimali per l'applicazione
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Opzioni di configurazione del client
const supabaseOptions = {
  auth: {
    // Configurazione per autenticazione JWT personalizzata
    autoRefreshToken: true,
    persistSession: false, // Gestiamo le sessioni lato server
    detectSessionInUrl: false,
  },
  db: {
    // Schema di default del database
    schema: "public",
  },
  global: {
    // Headers personalizzati per tutte le richieste
    headers: {
      "X-Client-Info": "korsvagen-web-backend",
    },
  },
};

// Validazione configurazione prima di creare il client
try {
  validateSupabaseConfig();
} catch (error) {
  logger.error("❌ Errore validazione Supabase:", error.message);
  throw error;
}

/**
 * Client Supabase principale
 *
 * Istanza del client Supabase configurata per l'applicazione.
 * Utilizzare questo client per tutte le operazioni su database.
 */
export const supabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  supabaseOptions
);

/**
 * Client Supabase con privilegi amministrativi
 *
 * Client configurato con service role key per operazioni
 * che richiedono privilegi elevati (solo se necessario)
 */
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      ...supabaseOptions,
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

/**
 * Utility per test di connessione
 *
 * Verifica che la connessione al database Supabase
 * sia attiva e funzionante
 */
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseClient
      .from("users")
      .select("count")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return {
      success: true,
      message: "Connessione Supabase attiva",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      message: `Errore connessione Supabase: ${error.message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Utility per gestione errori Supabase
 *
 * Converte gli errori Supabase in formato standardizzato
 * per l'applicazione
 */
export function handleSupabaseError(error) {
  if (!error) return null;

  // Mapping errori comuni
  const errorMap = {
    PGRST116: {
      status: 404,
      code: "RESOURCE_NOT_FOUND",
      message: "Risorsa non trovata",
    },
    23505: {
      status: 409,
      code: "DUPLICATE_ENTRY",
      message: "Record duplicato",
    },
    23503: {
      status: 400,
      code: "FOREIGN_KEY_VIOLATION",
      message: "Violazione chiave esterna",
    },
    42501: {
      status: 403,
      code: "INSUFFICIENT_PRIVILEGES",
      message: "Privilegi insufficienti",
    },
  };

  const mappedError = errorMap[error.code] || {
    status: 500,
    code: "DATABASE_ERROR",
    message: error.message || "Errore database",
  };

  return {
    ...mappedError,
    originalError: error,
  };
}

logger.info("🗄️  Configurazione Supabase inizializzata");
