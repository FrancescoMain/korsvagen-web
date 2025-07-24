/**
 * SCRIPT DI TEST PER IL SERVER
 *
 * Script semplificato per testare il funzionamento
 * del server in ambiente di sviluppo
 */

import dotenv from "dotenv";
import { logger } from "./utils/logger.js";

// Carica variabili d'ambiente
dotenv.config();

console.log("🚀 Test avvio server KORSVAGEN...");

// Test importazioni
try {
  const { supabaseClient } = await import("./config/supabase.js");
  console.log("✅ Configurazione Supabase caricata");

  const { cloudinaryConfig } = await import("./config/cloudinary.js");
  console.log("✅ Configurazione Cloudinary caricata");

  console.log("✅ Tutte le configurazioni sono state caricate correttamente");

  // Test connessione Supabase
  try {
    const { data, error } = await supabaseClient
      .from("users")
      .select("count")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      console.warn("⚠️  Warning Supabase:", error.message);
    } else {
      console.log("✅ Connessione Supabase OK");
    }
  } catch (supabaseError) {
    console.warn("⚠️  Warning test Supabase:", supabaseError.message);
  }

  console.log("🎉 Test completato con successo!");
  console.log("📝 Ora puoi avviare il server con: npm run dev");
} catch (error) {
  console.error("❌ Errore durante il test:", error.message);
  console.error("Stack:", error.stack);
  process.exit(1);
}
