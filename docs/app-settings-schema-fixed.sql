-- =====================================================
-- KORSVAGEN WEB APPLICATION - APP SETTINGS SCHEMA (FIXED)
-- =====================================================
-- 
-- Schema SQL per la gestione delle impostazioni generali dell'applicazione
-- Estende la tabella app_settings esistente con i dati di configurazione
-- utilizzati in tutto l'applicativo (contatti, informazioni aziendali, ecc.)
--
-- VERSIONE CORRETTA - Escape characters fixed
--
-- @author KORSVAGEN S.R.L.
-- @version 1.0.1 - Fixed SQL syntax
-- =====================================================

-- Inserimento dati di configurazione generali dell'applicazione
-- Questi dati sostituiranno i valori hardcoded in contactData.ts

INSERT INTO app_settings (key, value, description, category, is_public) VALUES

-- INFORMAZIONI AZIENDALI
('company_name', '"KORSVAGEN S.R.L."', 'Nome dell''azienda', 'company', true),
('company_legal_name', '"KORSVAGEN S.R.L."', 'Ragione sociale completa', 'company', true),

-- DATI DI CONTATTO
('contact_email', '"korsvagensrl@gmail.com"', 'Email di contatto principale', 'contact', true),
('contact_phone', '"+39 349 429 8547"', 'Numero di telefono principale', 'contact', true),
('contact_fax', 'null', 'Numero di fax (opzionale)', 'contact', true),

-- INDIRIZZO AZIENDALE
('company_address', '{
  "street": "Via Santa Maria la Carità 18",
  "city": "Scafati (SA)",
  "postal_code": "84018",
  "country": "Italia",
  "region": "Campania"
}', 'Indirizzo completo dell''azienda', 'contact', true),

-- SOCIAL MEDIA
('social_media', '{
  "instagram": "https://instagram.com/korsvagensrl",
  "linkedin": "https://www.linkedin.com/company/korsvagen",
  "facebook": null,
  "twitter": null,
  "youtube": null
}', 'Link ai profili social media', 'social', true),

-- DATI LEGALI E FISCALI
('business_info', '{
  "rea": "1071429",
  "vat_number": "09976601212",
  "tax_code": "09976601212",
  "chamber_of_commerce": "Camera di Commercio di Salerno",
  "founding_year": 2018
}', 'Informazioni legali e fiscali dell''azienda', 'legal', true),

-- ORARI DI APERTURA
('business_hours', '{
  "monday": "09:00-18:00",
  "tuesday": "09:00-18:00", 
  "wednesday": "09:00-18:00",
  "thursday": "09:00-18:00",
  "friday": "09:00-18:00",
  "saturday": "09:00-13:00",
  "sunday": "Chiuso"
}', 'Orari di apertura dell''ufficio', 'contact', true),

-- INFORMAZIONI AGGIUNTIVE AZIENDALI
('company_description', '"KORSVAGEN S.R.L. è una società specializzata in sviluppo web, consulenza digitale e soluzioni innovative per le aziende."', 'Descrizione aziendale', 'company', true),

('company_mission', '"Fornire soluzioni digitali innovative e di alta qualità per accompagnare le aziende nella loro trasformazione digitale."', 'Mission aziendale', 'company', true),

('company_vision', '"Essere il partner di riferimento per l''innovazione digitale nel territorio campano e oltre."', 'Vision aziendale', 'company', true),

-- STATISTICHE AZIENDALI (aggiornabili dalla dashboard)
('company_stats', '{
  "years_experience": 7,
  "projects_completed": 150,
  "revenue_growth": 35,
  "team_members": 5,
  "last_updated": "2025-01-01T00:00:00Z"
}', 'Statistiche aziendali visualizzate nel sito', 'company', true),

-- CONFIGURAZIONI DI SISTEMA
('site_maintenance_mode', 'false', 'Modalità manutenzione del sito pubblico', 'system', false),
('admin_notifications_enabled', 'true', 'Abilita notifiche per gli amministratori', 'system', false),
('contact_form_enabled', 'true', 'Abilita il form di contatto', 'system', true),

-- CONFIGURAZIONI EMAIL
('smtp_settings', '{
  "enabled": false,
  "host": "",
  "port": 587,
  "secure": false,
  "auth": {
    "user": "",
    "pass": ""
  }
}', 'Configurazioni SMTP per invio email', 'email', false),

-- CONFIGURAZIONI ANALYTICS
('analytics_settings', '{
  "google_analytics_id": "",
  "google_tag_manager_id": "",
  "facebook_pixel_id": "",
  "enabled": false
}', 'Configurazioni strumenti di analytics', 'analytics', false)

ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- =====================================================
-- INDICI AGGIUNTIVI PER PERFORMANCE
-- =====================================================

-- Indice per ricerche per categoria
CREATE INDEX IF NOT EXISTS idx_app_settings_category_public 
ON app_settings(category, is_public);

-- Indice per ricerche rapide dei dati pubblici
CREATE INDEX IF NOT EXISTS idx_app_settings_public_key 
ON app_settings(is_public, key) WHERE is_public = true;

-- =====================================================
-- FUNZIONI UTILITY PER GESTIONE SETTINGS
-- =====================================================

-- Funzione per ottenere tutti i settings pubblici
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS JSONB AS $$
DECLARE
    settings_data JSONB;
BEGIN
    SELECT jsonb_object_agg(key, value) INTO settings_data
    FROM app_settings 
    WHERE is_public = true;
    
    RETURN COALESCE(settings_data, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Funzione per ottenere settings per categoria
CREATE OR REPLACE FUNCTION get_settings_by_category(category_name VARCHAR)
RETURNS JSONB AS $$
DECLARE
    settings_data JSONB;
BEGIN
    SELECT jsonb_object_agg(key, value) INTO settings_data
    FROM app_settings 
    WHERE category = category_name AND is_public = true;
    
    RETURN COALESCE(settings_data, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Funzione per aggiornare un setting specifico
CREATE OR REPLACE FUNCTION update_app_setting(
    setting_key VARCHAR,
    setting_value JSONB,
    setting_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE app_settings 
    SET 
        value = setting_value,
        description = COALESCE(setting_description, description),
        updated_at = NOW()
    WHERE key = setting_key;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRAZIONE: Cambio da satisfied_clients a revenue_growth
-- =====================================================

-- Query per aggiornare il campo nelle statistiche esistenti
UPDATE app_settings 
SET value = jsonb_set(
    jsonb_set(
        value,
        '{revenue_growth}',
        '35'::jsonb
    ),
    '{satisfied_clients}',
    'null'::jsonb
) - 'satisfied_clients'
WHERE key = 'company_stats';

-- Verifica che la migrazione sia andata a buon fine
-- SELECT key, jsonb_pretty(value) FROM app_settings WHERE key = 'company_stats';

-- =====================================================
-- QUERY DI VERIFICA E TEST
-- =====================================================

-- Test 1: Verifica inserimento dati
-- SELECT key, value, description, category FROM app_settings WHERE category = 'company';

-- Test 2: Verifica funzioni utility
-- SELECT get_public_settings();
-- SELECT get_settings_by_category('contact');

-- Test 3: Verifica struttura JSON
-- SELECT key, jsonb_pretty(value) FROM app_settings WHERE key IN ('company_address', 'social_media', 'business_info');

-- =====================================================
-- FINE SCHEMA APP SETTINGS (VERSIONE CORRETTA)
-- =====================================================
