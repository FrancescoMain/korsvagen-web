-- =====================================================
-- KORSVAGEN WEB APPLICATION - DATABASE SCHEMA
-- =====================================================
-- 
-- Schema SQL per Supabase che definisce le tabelle
-- necessarie per il sistema di autenticazione e 
-- gestione contenuti dell'applicazione KORSVAGEN.
--
-- @author KORSVAGEN S.R.L.
-- @version 1.0.0
-- =====================================================

-- =====================================================
-- 1. TABELLA UTENTI AMMINISTRATORI
-- =====================================================
-- Gestisce gli account degli amministratori che possono
-- accedere alla dashboard di gestione contenuti

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'editor', 'super_admin')),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);

-- =====================================================
-- 2. TABELLA SESSIONI DI AUTENTICAZIONE
-- =====================================================
-- Gestisce le sessioni attive degli utenti con supporto
-- per refresh token e invalidazione delle sessioni

CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_refresh_token ON admin_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active);

-- =====================================================
-- 3. TABELLA LOG DELLE ATTIVITÀ
-- =====================================================
-- Traccia tutte le attività degli amministratori per
-- audit e sicurezza

CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(255),
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_user_id ON admin_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);

-- =====================================================
-- 4. TABELLA IMPOSTAZIONI APPLICAZIONE
-- =====================================================
-- Gestisce le configurazioni globali dell'applicazione

CREATE TABLE IF NOT EXISTS app_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_public ON app_settings(is_public);

-- =====================================================
-- 5. TABELLA MESSAGGI/NOTIFICHE
-- =====================================================
-- Gestisce i messaggi di contatto e le notifiche per
-- la dashboard amministratori

CREATE TABLE IF NOT EXISTS admin_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) DEFAULT 'contact' CHECK (type IN ('contact', 'notification', 'system')),
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sender_name VARCHAR(100),
    sender_email VARCHAR(255),
    sender_phone VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    is_important BOOLEAN DEFAULT false,
    assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_admin_messages_type ON admin_messages(type);
CREATE INDEX IF NOT EXISTS idx_admin_messages_is_read ON admin_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_admin_messages_status ON admin_messages(status);
CREATE INDEX IF NOT EXISTS idx_admin_messages_created_at ON admin_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_messages_assigned_to ON admin_messages(assigned_to);

-- =====================================================
-- 6. FUNZIONI E TRIGGER PER TIMESTAMP AUTOMATICI
-- =====================================================

-- Funzione per aggiornare automatically updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per admin_users
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger per app_settings
CREATE TRIGGER update_app_settings_updated_at 
    BEFORE UPDATE ON app_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger per admin_messages
CREATE TRIGGER update_admin_messages_updated_at 
    BEFORE UPDATE ON admin_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Per semplificare l'implementazione con Supabase service key,
-- disabilitiamo RLS sulle tabelle admin. In produzione,
-- considera di abilitare RLS con policy più specifiche.

-- Disabilita RLS (opzionale per maggiore semplicità)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_messages DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. DATI INIZIALI
-- =====================================================

-- Inserimento utente amministratore di default
-- Password: "KorsvagenAdmin2024!" (da cambiare al primo accesso)
INSERT INTO admin_users (
    id,
    username, 
    email, 
    password_hash, 
    role,
    profile_data
) VALUES (
    gen_random_uuid(),
    'admin',
    'admin@korsvagen.it',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewTYfPV1OJqjQ0sW', -- Password hash per "KorsvagenAdmin2024!"
    'super_admin',
    '{
        "firstName": "Amministratore",
        "lastName": "Sistema",
        "preferences": {
            "theme": "light",
            "language": "it",
            "notifications": true
        }
    }'::jsonb
) ON CONFLICT (username) DO NOTHING;

-- Inserimento secondo utente amministratore con credenziali specifiche
-- Username: korsvagen_admin, Email: korsvagen@admin.it, Password: "Korsvagen1234!"
INSERT INTO admin_users (
    id,
    username, 
    email, 
    password_hash, 
    role,
    profile_data
) VALUES (
    gen_random_uuid(),
    'korsvagen_admin',
    'korsvagen@admin.it',
    '$2b$12$Uf4.zBGWmHtJVFwal7uJW.XZyVOkkQ9v5jfSZ9CGzu2afFXJ.KyHO', -- Password hash per "Korsvagen1234!"
    'super_admin',
    '{
        "firstName": "Admin",
        "lastName": "Korsvagen",
        "preferences": {
            "theme": "light",
            "language": "it",
            "notifications": true
        }
    }'::jsonb
) ON CONFLICT (username) DO NOTHING;

-- Impostazioni iniziali dell'applicazione
INSERT INTO app_settings (key, value, description, category, is_public) VALUES
    ('site_title', '"KORSVAGEN S.R.L."', 'Titolo principale del sito', 'general', true),
    ('contact_email', '"info@korsvagen.it"', 'Email di contatto principale', 'contact', true),
    ('maintenance_mode', 'false', 'Modalità manutenzione attiva', 'system', false),
    ('max_login_attempts', '5', 'Massimo numero di tentativi di login', 'security', false),
    ('session_timeout', '3600', 'Timeout sessione in secondi', 'security', false),
    ('enable_registration', 'false', 'Abilita registrazione nuovi utenti', 'security', false)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 9. FUNZIONI UTILITY
-- =====================================================

-- Funzione per pulire le sessioni scadute
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM admin_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Funzione per ottenere statistiche dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_users', (SELECT COUNT(*) FROM admin_users WHERE is_active = true),
        'active_sessions', (SELECT COUNT(*) FROM admin_sessions WHERE is_active = true AND expires_at > NOW()),
        'unread_messages', (SELECT COUNT(*) FROM admin_messages WHERE is_read = false),
        'recent_activity', (SELECT COUNT(*) FROM admin_activity_logs WHERE created_at > NOW() - INTERVAL '24 hours')
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FINE SCHEMA DATABASE
-- =====================================================
