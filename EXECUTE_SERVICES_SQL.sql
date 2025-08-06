-- ⚡ ESEGUI QUESTO SQL IN SUPABASE PER ABILITARE IL SISTEMA SERVIZI DINAMICO
-- Copia tutto questo contenuto e incollalo nell'SQL Editor di Supabase

-- SERVICES MANAGEMENT SYSTEM per KORSVAGEN S.R.L.
-- Sistema completo per gestione dinamica dei servizi aziendali
-- Include migrazione dei dati statici esistenti

-- =====================================================
-- SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic service information
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    description TEXT NOT NULL,
    
    -- Service image (Cloudinary integration)
    image_url TEXT,
    image_public_id VARCHAR(255), -- Cloudinary public ID for management
    image_upload_date TIMESTAMPTZ,
    
    -- Microservices as JSON array
    microservices JSONB DEFAULT '[]'::jsonb,
    
    -- Display and visibility settings
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata and audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id),
    updated_by UUID REFERENCES admin_users(id),
    
    -- Constraints
    CONSTRAINT check_title_length CHECK (char_length(title) >= 3),
    CONSTRAINT check_description_length CHECK (char_length(description) >= 10),
    CONSTRAINT check_subtitle_length CHECK (subtitle IS NULL OR char_length(subtitle) >= 3),
    CONSTRAINT check_microservices_array CHECK (jsonb_typeof(microservices) = 'array')
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_services_active_order ON services(is_active, display_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_services_created_by ON services(created_by);
CREATE INDEX IF NOT EXISTS idx_services_updated_by ON services(updated_by);
CREATE INDEX IF NOT EXISTS idx_services_title ON services(title);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATE
-- =====================================================

-- Use existing update_updated_at_column() function (should exist from previous schemas)
CREATE TRIGGER update_services_updated_at 
    BEFORE UPDATE ON services 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (for website visitors)
CREATE POLICY "Services are viewable by everyone when active" ON services
    FOR SELECT USING (is_active = true);

-- Policy for authenticated admin users (full CRUD access)
CREATE POLICY "Admins can manage all services" ON services
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

-- =====================================================
-- VIEWS FOR API RESPONSES
-- =====================================================

-- Public view for frontend (only active services with essential data)
CREATE VIEW services_public AS
SELECT 
    id,
    title,
    subtitle,
    description,
    image_url,
    microservices,
    display_order
FROM services 
WHERE is_active = true
ORDER BY display_order ASC, title ASC;

-- Admin view with complete data and audit information
CREATE VIEW services_admin AS
SELECT 
    s.*,
    cu.username as created_by_username,
    uu.username as updated_by_username
FROM services s
LEFT JOIN admin_users cu ON s.created_by = cu.id
LEFT JOIN admin_users uu ON s.updated_by = uu.id
ORDER BY s.display_order ASC, s.created_at DESC;

-- =====================================================
-- INITIAL DATA MIGRATION FROM STATIC SERVICES
-- =====================================================

-- Insert existing static services data
INSERT INTO services (
    title, subtitle, description, microservices, display_order, is_active, created_at
) VALUES 
(
    'Progettazione',
    'Dall''idea al progetto definitivo',
    'Offriamo servizi completi di progettazione per trasformare le tue idee in progetti realizzabili.',
    '["Progettazione Architettonica", "Progettazione Strutturale", "Progettazione Impiantistica", "Pratiche Edilizie", "Rendering 3D"]'::jsonb,
    1,
    true,
    NOW()
),
(
    'Costruzioni',
    'Realizziamo i tuoi progetti',
    'Costruiamo edifici di ogni tipo con materiali di qualità e tecniche all''avanguardia.',
    '["Costruzioni Residenziali", "Costruzioni Commerciali", "Costruzioni Industriali", "Ville e Abitazioni Custom", "Edifici Pubblici"]'::jsonb,
    2,
    true,
    NOW()
),
(
    'Ristrutturazioni',
    'Rinnova i tuoi spazi',
    'Ristrutturiamo e riqualifichiamo edifici esistenti per renderli moderni e funzionali.',
    '["Ristrutturazioni Complete", "Ristrutturazioni Parziali", "Riqualificazione Energetica", "Restauro Conservativo", "Bonus Edilizi"]'::jsonb,
    3,
    true,
    NOW()
),
(
    'Gestione Cantiere',
    'Controllo totale del progetto',
    'Gestiamo ogni fase del cantiere garantendo qualità, sicurezza e rispetto dei tempi.',
    '["Direzione Lavori", "Coordinamento Sicurezza", "Controllo Qualità", "Gestione Fornitori", "Collaudi e Certificazioni"]'::jsonb,
    4,
    true,
    NOW()
),
(
    'Consulenza Tecnica',
    'Esperti al tuo servizio',
    'Forniamo consulenza specializzata per risolvere problematiche tecniche e normative.',
    '["Perizie Tecniche", "Valutazioni Immobiliari", "Consulenza Normativa", "Due Diligence Immobiliare", "Assistenza Legale Tecnica"]'::jsonb,
    5,
    true,
    NOW()
),
(
    'Efficienza Energetica',
    'Sostenibilità e risparmio',
    'Miglioriamo l''efficienza energetica degli edifici per ridurre i consumi e l''impatto ambientale.',
    '["Certificazione Energetica", "Cappotto Termico", "Impianti Rinnovabili", "Domotica e Smart Home", "Superbonus e Incentivi"]'::jsonb,
    6,
    true,
    NOW()
)
ON CONFLICT DO NOTHING; -- Avoid duplicates if already exists

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to reorder services
CREATE OR REPLACE FUNCTION reorder_services(service_ids UUID[])
RETURNS BOOLEAN AS $$
DECLARE
    service_id UUID;
    new_order INTEGER := 1;
BEGIN
    -- Update display_order for each service in the provided order
    FOREACH service_id IN ARRAY service_ids
    LOOP
        UPDATE services 
        SET display_order = new_order, updated_at = NOW()
        WHERE id = service_id;
        
        new_order := new_order + 1;
    END LOOP;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get services statistics for dashboard
CREATE OR REPLACE FUNCTION get_services_stats()
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_services', (SELECT COUNT(*) FROM services),
        'active_services', (SELECT COUNT(*) FROM services WHERE is_active = true),
        'inactive_services', (SELECT COUNT(*) FROM services WHERE is_active = false),
        'services_with_images', (SELECT COUNT(*) FROM services WHERE image_url IS NOT NULL),
        'average_microservices', (SELECT ROUND(AVG(jsonb_array_length(microservices)), 1) FROM services WHERE microservices IS NOT NULL)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to validate microservices JSON structure
CREATE OR REPLACE FUNCTION validate_microservices(microservices_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if it's an array
    IF jsonb_typeof(microservices_json) != 'array' THEN
        RETURN FALSE;
    END IF;
    
    -- Check if all elements are strings
    IF EXISTS (
        SELECT 1 FROM jsonb_array_elements(microservices_json) elem
        WHERE jsonb_typeof(elem) != 'string'
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check maximum number of microservices (reasonable limit)
    IF jsonb_array_length(microservices_json) > 20 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE services IS 'Dynamic services management for KORSVAGEN website';
COMMENT ON COLUMN services.title IS 'Service title displayed on website';
COMMENT ON COLUMN services.subtitle IS 'Optional subtitle for additional context';
COMMENT ON COLUMN services.description IS 'Main service description';
COMMENT ON COLUMN services.image_url IS 'Cloudinary URL for service image';
COMMENT ON COLUMN services.image_public_id IS 'Cloudinary public ID for image management';
COMMENT ON COLUMN services.microservices IS 'JSON array of microservice names';
COMMENT ON COLUMN services.display_order IS 'Order for displaying services (1 = first)';
COMMENT ON COLUMN services.is_active IS 'Whether service is visible on public website';

COMMENT ON VIEW services_public IS 'Public view for frontend - only active services';
COMMENT ON VIEW services_admin IS 'Admin view with complete data and audit info';

COMMENT ON FUNCTION reorder_services(UUID[]) IS 'Reorder services by providing array of service IDs in desired order';
COMMENT ON FUNCTION get_services_stats() IS 'Get services statistics for dashboard';
COMMENT ON FUNCTION validate_microservices(JSONB) IS 'Validate microservices JSON structure';

-- =====================================================
-- VERIFICATION AND SUCCESS MESSAGE
-- =====================================================
SELECT 'SUCCESS: Services table created with ' || COUNT(*) || ' services' as result FROM services;
SELECT 'SUCCESS: Services management system ready!' as status;

-- Test the public view
SELECT 'TEST: Public services view working - ' || COUNT(*) || ' active services visible' as test_result 
FROM services_public;

-- Test the admin view  
SELECT 'TEST: Admin services view working - ' || COUNT(*) || ' total services in management' as test_result 
FROM services_admin;

-- Test statistics function
SELECT 'TEST: Statistics function - ' || (get_services_stats())::text as test_stats;

-- =====================================================
-- FINAL INSTRUCTIONS
-- =====================================================

-- After running this script:
-- 1. Verify all queries returned SUCCESS messages
-- 2. Check the TEST results show expected data
-- 3. The frontend /servizi page should now load services from database
-- 4. The admin dashboard at /dashboard/services should be accessible
-- 5. You can now manage services dynamically through the admin interface

-- IMPORTANT NOTES:
-- - The original static services have been migrated to the database
-- - The public website will now show services from the database
-- - Admin users can add/edit/delete services through /dashboard/services
-- - Images can be uploaded via Cloudinary integration
-- - Services can be reordered using drag-and-drop (future enhancement)
-- - All changes are immediately reflected on the public website

SELECT '🎉 SERVICES SYSTEM SETUP COMPLETE! 🎉' as final_message;