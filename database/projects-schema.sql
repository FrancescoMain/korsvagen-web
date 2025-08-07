-- =============================================
-- KORSVAGEN - Projects Management Schema
-- =============================================
-- This schema creates tables for dynamic projects management
-- with comprehensive project information and image galleries

-- =============================================
-- 1. Projects Main Table
-- =============================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(500),
    
    -- Classification
    year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),
    location VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Completato', 'In corso', 'Progettazione')),
    label VARCHAR(100) NOT NULL, -- Residenziale, Commerciale, Industriale, etc.
    
    -- Description
    description TEXT NOT NULL, -- Short description for cards
    long_description TEXT, -- Detailed description for project page
    
    -- Project Details
    client VARCHAR(255),
    surface VARCHAR(100), -- e.g., "450 mq"
    budget VARCHAR(100), -- e.g., "€ 850.000"
    duration VARCHAR(100), -- e.g., "18 mesi"
    
    -- Features as JSON array
    features JSONB DEFAULT '[]',
    
    -- Display Settings
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    
    -- SEO and Metadata
    slug VARCHAR(255) UNIQUE, -- URL-friendly identifier
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_active ON projects (is_active);
CREATE INDEX IF NOT EXISTS idx_projects_label ON projects (label);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_year ON projects (year);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects (display_order, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects (slug);

-- =============================================
-- 2. Project Images Table
-- =============================================
CREATE TABLE IF NOT EXISTS project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Cloudinary Information
    image_url VARCHAR(500) NOT NULL,
    image_public_id VARCHAR(255) NOT NULL, -- Cloudinary public_id for management
    
    -- Image Information
    title VARCHAR(255) NOT NULL,
    alt_text VARCHAR(500),
    
    -- Display Settings
    display_order INTEGER DEFAULT 0,
    is_cover BOOLEAN DEFAULT false, -- Main project image
    
    -- Image Dimensions (optional)
    width INTEGER,
    height INTEGER,
    
    -- Upload Information
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images (project_id);
CREATE INDEX IF NOT EXISTS idx_project_images_cover ON project_images (project_id, is_cover);
CREATE INDEX IF NOT EXISTS idx_project_images_order ON project_images (project_id, display_order);

-- =============================================
-- 3. Project Labels Table (Optional - for dynamic management)
-- =============================================
CREATE TABLE IF NOT EXISTS project_labels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    color VARCHAR(7), -- HEX color for UI
    icon VARCHAR(50), -- Icon class or emoji
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial labels
INSERT INTO project_labels (name, display_name, color, display_order) VALUES
    ('residenziale', 'Residenziale', '#3B82F6', 1),
    ('commerciale', 'Commerciale', '#EF4444', 2),
    ('industriale', 'Industriale', '#10B981', 3),
    ('ristrutturazione', 'Ristrutturazioni', '#F59E0B', 4),
    ('pubblico', 'Opere Pubbliche', '#8B5CF6', 5)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 4. Triggers for automatic updates
-- =============================================

-- Update updated_at on projects table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Ensure only one cover image per project
CREATE OR REPLACE FUNCTION ensure_single_cover_image()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this image as cover, remove cover from other images
    IF NEW.is_cover = true THEN
        UPDATE project_images 
        SET is_cover = false 
        WHERE project_id = NEW.project_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_ensure_single_cover 
    BEFORE INSERT OR UPDATE OF is_cover ON project_images 
    FOR EACH ROW 
    EXECUTE PROCEDURE ensure_single_cover_image();

-- Auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate slug from title if not provided
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = LOWER(
            REGEXP_REPLACE(
                REGEXP_REPLACE(NEW.title, '[àáâãäå]', 'a', 'g'),
                '[^a-z0-9]+', '-', 'g'
            )
        );
        
        -- Ensure uniqueness
        WHILE EXISTS(SELECT 1 FROM projects WHERE slug = NEW.slug AND id != COALESCE(NEW.id, 0)) LOOP
            NEW.slug = NEW.slug || '-' || EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_generate_slug 
    BEFORE INSERT OR UPDATE OF title, slug ON projects 
    FOR EACH ROW 
    EXECUTE PROCEDURE generate_project_slug();

-- =============================================
-- 5. Views for common queries
-- =============================================

-- Active projects with cover image
CREATE OR REPLACE VIEW projects_with_cover AS
SELECT 
    p.*,
    pi.image_url as cover_image_url,
    pi.image_public_id as cover_image_public_id,
    pi.title as cover_image_title,
    pi.alt_text as cover_image_alt
FROM projects p
LEFT JOIN project_images pi ON (p.id = pi.project_id AND pi.is_cover = true)
WHERE p.is_active = true
ORDER BY p.display_order ASC, p.created_at DESC;

-- Complete project data for detail pages
CREATE OR REPLACE VIEW projects_complete AS
SELECT 
    p.*,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'id', pi.id,
                'url', pi.image_url,
                'public_id', pi.image_public_id,
                'title', pi.title,
                'alt_text', pi.alt_text,
                'display_order', pi.display_order,
                'is_cover', pi.is_cover
            ) ORDER BY pi.display_order ASC, pi.id ASC
        ) FILTER (WHERE pi.id IS NOT NULL),
        '[]'::json
    ) as images
FROM projects p
LEFT JOIN project_images pi ON p.id = pi.project_id
GROUP BY p.id;

-- =============================================
-- 6. Seed Data (sample projects)
-- =============================================
INSERT INTO projects (
    title, 
    subtitle,
    year, 
    location, 
    status, 
    label, 
    description, 
    long_description,
    client,
    surface,
    budget,
    duration,
    features,
    display_order
) VALUES 
(
    'Villa Moderna Toscana',
    'Progetto residenziale di lusso',
    2024,
    'Firenze, Italia',
    'Completato',
    'residenziale',
    'Villa unifamiliare moderna con design contemporaneo e soluzioni tecnologiche avanzate per il comfort abitativo.',
    'Questo progetto di villa moderna rappresenta il perfetto equilibrio tra design contemporaneo e comfort abitativo. Situata nelle colline toscane, la villa si distingue per le sue linee pulite e minimali, grandi vetrate che massimizzano la luce naturale e spazi aperti che favoriscono la convivialità. L''integrazione di tecnologie smart home e soluzioni per l''efficienza energetica rendono questa abitazione un esempio di architettura sostenibile.',
    'Famiglia Rossi',
    '450 mq',
    '€ 850.000',
    '18 mesi',
    '["Design sostenibile", "Domotica avanzata", "Piscina infinity", "Giardino panoramico", "Certificazione energetica A+", "Pannelli solari", "Sistema di recupero acque"]',
    1
),
(
    'Centro Commerciale Metropolitan',
    'Complesso commerciale multifunzionale',
    2023,
    'Roma, Italia', 
    'Completato',
    'commerciale',
    'Realizzazione di centro commerciale moderno con aree retail, uffici e spazi per la ristorazione.',
    'Il Centro Commerciale Metropolitan rappresenta un nuovo concetto di shopping center, dove commerce, lavoro e socialità si integrano in un unico spazio architettonico. Il progetto prevede oltre 15.000 mq di superficie commerciale distribuiti su tre livelli, con particolare attenzione alla sostenibilità ambientale e all''accessibilità universale.',
    'Gruppo Immobiliare Italia',
    '15.000 mq',
    '€ 12.500.000',
    '24 mesi',
    '["120 negozi", "Area food court", "Cinema multisala", "Parcheggio multipiano", "Giardino pensile", "Sistemi di climatizzazione eco-friendly", "Illuminazione LED", "Accessibilità universale"]',
    2
),
(
    'Ristrutturazione Palazzo Storico',
    'Restauro conservativo XVIII secolo',
    2024,
    'Firenze, Italia',
    'In corso',
    'ristrutturazione',
    'Restauro conservativo e riqualificazione energetica di palazzo storico del XVIII secolo nel centro di Firenze.',
    'Il progetto di restauro di questo palazzo settecentesco richiede un approccio delicato che sappia coniugare la conservazione del patrimonio artistico con le esigenze contemporanee di comfort e efficienza energetica. Ogni intervento è studiato per rispettare l''autenticità dell''edificio, utilizzando tecniche tradizionali e materiali compatibili.',
    'Fondazione Patrimonio Culturale',
    '800 mq',
    '€ 2.200.000',
    '30 mesi',
    '["Restauro affreschi originali", "Consolidamento strutturale", "Nuovo impianto di climatizzazione invisibile", "Restauro pavimenti in cotto", "Sistema antincendio museale", "Illuminazione artistica", "Ascensore panoramico", "Giardino interno restaurato"]',
    3
)
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust based on your user setup)
-- GRANT ALL PRIVILEGES ON TABLE projects TO your_app_user;
-- GRANT ALL PRIVILEGES ON TABLE project_images TO your_app_user;  
-- GRANT ALL PRIVILEGES ON TABLE project_labels TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE projects_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE project_images_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE project_labels_id_seq TO your_app_user;

-- =============================================
-- Notes for Implementation:
-- =============================================
-- 1. Features are stored as JSONB for flexibility
-- 2. Slug generation is automatic from title
-- 3. Only one cover image per project is enforced
-- 4. Views provide optimized queries for common use cases
-- 5. Indexes ensure good performance for filtering and sorting
-- 6. Soft delete available via is_active flag
-- 7. All timestamps include timezone information
-- =============================================