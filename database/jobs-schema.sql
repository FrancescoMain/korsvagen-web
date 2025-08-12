-- =============================================
-- KORSVAGEN - Jobs Management Schema
-- =============================================
-- This schema creates tables for dynamic job positions and applications management
-- with comprehensive job information and application tracking

-- =============================================
-- 1. Job Positions Table
-- =============================================
CREATE TABLE IF NOT EXISTS job_positions (
    id SERIAL PRIMARY KEY,
    
    -- Basic Information
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Classification
    department VARCHAR(100) NOT NULL, -- IT, Design, Marketing, Sales, HR, Operations, etc.
    location VARCHAR(100) NOT NULL, -- Milano, Remote, Hybrid, etc.
    employment_type VARCHAR(50) NOT NULL CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Internship')),
    experience_level VARCHAR(50) NOT NULL CHECK (experience_level IN ('Junior', 'Mid', 'Senior', 'Lead', 'Executive')),
    
    -- Job Details
    description TEXT NOT NULL, -- Main job description
    requirements TEXT NOT NULL, -- Required qualifications and skills
    nice_to_have TEXT, -- Preferred qualifications
    benefits TEXT, -- Company benefits and perks
    salary_range VARCHAR(100), -- e.g., "€ 30.000 - € 45.000"
    
    -- Application Settings
    is_active BOOLEAN DEFAULT true, -- Whether the position is open for applications
    applications_count INTEGER DEFAULT 0, -- Counter for total applications
    display_order INTEGER DEFAULT 0, -- Display order on careers page
    
    -- SEO and Metadata
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for job positions
CREATE INDEX IF NOT EXISTS idx_job_positions_active ON job_positions(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_job_positions_department ON job_positions(department, is_active);
CREATE INDEX IF NOT EXISTS idx_job_positions_location ON job_positions(location, is_active);
CREATE INDEX IF NOT EXISTS idx_job_positions_employment_type ON job_positions(employment_type, is_active);
CREATE INDEX IF NOT EXISTS idx_job_positions_slug ON job_positions(slug);

-- =============================================
-- 2. Job Applications Table
-- =============================================
CREATE TABLE IF NOT EXISTS job_applications (
    id SERIAL PRIMARY KEY,
    
    -- Foreign Key
    job_position_id INTEGER NOT NULL REFERENCES job_positions(id) ON DELETE CASCADE,
    
    -- Applicant Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    -- Application Documents and Links
    cv_url VARCHAR(500), -- Cloudinary URL for CV
    cv_public_id VARCHAR(255), -- Cloudinary reference for deletion
    cover_letter TEXT, -- Cover letter or presentation message
    linkedin_profile VARCHAR(255),
    portfolio_url VARCHAR(255),
    
    -- Application Status and Management
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'contacted', 'interview', 'hired', 'rejected')),
    admin_notes TEXT, -- Internal notes for HR/Admin
    
    -- Timestamps
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for job applications
CREATE INDEX IF NOT EXISTS idx_job_applications_position ON job_applications(job_position_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_date ON job_applications(applied_at DESC);

-- =============================================
-- 3. Triggers for Automatic Updates
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for job_positions updated_at
DROP TRIGGER IF EXISTS update_job_positions_updated_at ON job_positions;
CREATE TRIGGER update_job_positions_updated_at
    BEFORE UPDATE ON job_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for job_applications updated_at
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update application count
CREATE OR REPLACE FUNCTION update_applications_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE job_positions
        SET applications_count = applications_count + 1
        WHERE id = NEW.job_position_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE job_positions
        SET applications_count = applications_count - 1
        WHERE id = OLD.job_position_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to update applications count
DROP TRIGGER IF EXISTS trigger_update_applications_count ON job_applications;
CREATE TRIGGER trigger_update_applications_count
    AFTER INSERT OR DELETE ON job_applications
    FOR EACH ROW EXECUTE FUNCTION update_applications_count();

-- =============================================
-- 4. Views for Easy Data Access
-- =============================================

-- View for active job positions with application counts
CREATE OR REPLACE VIEW active_job_positions AS
SELECT 
    jp.*,
    COUNT(ja.id) as current_applications_count
FROM job_positions jp
LEFT JOIN job_applications ja ON jp.id = ja.job_position_id
WHERE jp.is_active = true
GROUP BY jp.id
ORDER BY jp.display_order ASC, jp.created_at DESC;

-- View for job applications with position details
CREATE OR REPLACE VIEW job_applications_with_positions AS
SELECT 
    ja.*,
    jp.title as job_title,
    jp.department as job_department,
    jp.location as job_location,
    jp.employment_type as job_employment_type
FROM job_applications ja
JOIN job_positions jp ON ja.job_position_id = jp.id
ORDER BY ja.applied_at DESC;

-- View for applications summary by status
CREATE OR REPLACE VIEW applications_summary AS
SELECT 
    jp.id as position_id,
    jp.title as position_title,
    jp.department,
    COUNT(ja.id) as total_applications,
    COUNT(CASE WHEN ja.status = 'new' THEN 1 END) as new_applications,
    COUNT(CASE WHEN ja.status = 'reviewed' THEN 1 END) as reviewed_applications,
    COUNT(CASE WHEN ja.status = 'contacted' THEN 1 END) as contacted_applications,
    COUNT(CASE WHEN ja.status = 'interview' THEN 1 END) as interview_applications,
    COUNT(CASE WHEN ja.status = 'hired' THEN 1 END) as hired_applications,
    COUNT(CASE WHEN ja.status = 'rejected' THEN 1 END) as rejected_applications
FROM job_positions jp
LEFT JOIN job_applications ja ON jp.id = ja.job_position_id
WHERE jp.is_active = true
GROUP BY jp.id, jp.title, jp.department
ORDER BY jp.display_order ASC;

-- =============================================
-- 5. Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to active job positions
DROP POLICY IF EXISTS "Public can view active job positions" ON job_positions;
CREATE POLICY "Public can view active job positions"
    ON job_positions FOR SELECT
    USING (is_active = true);

-- Policy for authenticated users to manage job positions
DROP POLICY IF EXISTS "Authenticated users can manage job positions" ON job_positions;
CREATE POLICY "Authenticated users can manage job positions"
    ON job_positions FOR ALL
    USING (auth.role() = 'authenticated');

-- Policy for public to submit applications
DROP POLICY IF EXISTS "Public can submit applications" ON job_applications;
CREATE POLICY "Public can submit applications"
    ON job_applications FOR INSERT
    WITH CHECK (true);

-- Policy for authenticated users to manage applications
DROP POLICY IF EXISTS "Authenticated users can manage applications" ON job_applications;
CREATE POLICY "Authenticated users can manage applications"
    ON job_applications FOR ALL
    USING (auth.role() = 'authenticated');

-- Allow public to view specific views
GRANT SELECT ON active_job_positions TO anon;
GRANT SELECT ON active_job_positions TO authenticated;

-- Allow authenticated users to manage everything
GRANT ALL ON job_positions TO authenticated;
GRANT ALL ON job_applications TO authenticated;
GRANT ALL ON job_applications_with_positions TO authenticated;
GRANT ALL ON applications_summary TO authenticated;

-- =============================================
-- 6. Sample Data
-- =============================================

-- Insert sample job positions (from the existing static data)
INSERT INTO job_positions (
    title, slug, department, location, employment_type, experience_level, 
    description, requirements, nice_to_have, benefits, salary_range, display_order
) VALUES
(
    'Ingegnere Strutturale',
    'ingegnere-strutturale',
    'Engineering',
    'Pompei (NA)',
    'Full-time',
    'Mid',
    'Cerchiamo un ingegnere strutturale esperto per la progettazione e il calcolo di strutture in cemento armato, acciaio e legno.',
    'Laurea in Ingegneria Civile/Strutturale
Esperienza con software di calcolo strutturale
Conoscenza normative tecniche
Capacità di lavoro in team',
    'Esperienza con BIM e modellazione 3D
Conoscenza di software avanzati (SAP2000, Midas)
Esperienza con strutture prefabbricate',
    'Stipendio competitivo
Formazione continua
Ambiente di lavoro stimolante
Possibilità di crescita professionale',
    '€ 35.000 - € 50.000',
    1
),
(
    'Architetto Progettista',
    'architetto-progettista',
    'Design',
    'Pompei (NA)',
    'Full-time',
    'Mid',
    'Ricerchiamo un architetto per la progettazione architettonica di edifici residenziali e commerciali.',
    'Laurea in Architettura
Esperienza con AutoCAD, Revit, SketchUp
Creatività e senso estetico
Conoscenza normative urbanistiche',
    'Esperienza con software di rendering
Conoscenza di sostenibilità ambientale
Portfolio di progetti realizzati',
    'Progetti stimolanti e innovativi
Formazione su nuove tecnologie
Flessibilità oraria
Team giovane e dinamico',
    '€ 32.000 - € 45.000',
    2
),
(
    'Geometra/Capo Cantiere',
    'geometra-capo-cantiere',
    'Operations',
    'Varie sedi',
    'Full-time',
    'Senior',
    'Cerchiamo un geometra esperto per la gestione e supervisione dei cantieri edilizi.',
    'Diploma di Geometra
Esperienza nella gestione cantieri
Conoscenza normative sicurezza
Capacità organizzative e leadership',
    'Patente per uso di mezzi d''opera
Esperienza con grandi progetti
Conoscenza lingue straniere',
    'Auto aziendale
Rimborsi spese trasferta
Bonus produttività
Assicurazione sanitaria integrativa',
    '€ 40.000 - € 55.000',
    3
),
(
    'Operaio Specializzato',
    'operaio-specializzato',
    'Operations',
    'Varie sedi',
    'Full-time',
    'Junior',
    'Ricerchiamo operai specializzati in muratura, carpenteria e finiture edili.',
    'Esperienza nel settore edile
Conoscenza tecniche costruttive
Attestati di sicurezza
Disponibilità trasferte',
    'Specializzazione in tecniche particolari
Patenti per utilizzo macchinari
Esperienza con materiali innovativi',
    'Formazione continua
Dotazione DPI completa
Stabilità contrattuale
Opportunità di crescita',
    '€ 28.000 - € 35.000',
    4
),
(
    'Project Manager',
    'project-manager',
    'Management',
    'Pompei (NA) / Remote',
    'Full-time',
    'Senior',
    'Cerchiamo un project manager per coordinare progetti edilizi complessi e gestire team multidisciplinari.',
    'Laurea in Ingegneria o Architettura
Esperienza 5+ anni in project management
Conoscenza metodologie Agile/PMI
Capacità di leadership e comunicazione',
    'Certificazione PMP o Prince2
Esperienza con software di project management
Conoscenza del settore edile
Bilinguismo italiano/inglese',
    'Smart working parziale
Bonus obiettivi
Formazione manageriale
Crescita professionale rapida',
    '€ 50.000 - € 70.000',
    5
);

-- =============================================
-- 7. Success Message
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '✅ KORSVAGEN Jobs Schema Created Successfully!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- job_positions table with % sample positions', (SELECT COUNT(*) FROM job_positions);
    RAISE NOTICE '- job_applications table';
    RAISE NOTICE '- Indexes for performance optimization';
    RAISE NOTICE '- Views for easy data access';
    RAISE NOTICE '- Triggers for automatic updates';
    RAISE NOTICE '- Row Level Security policies';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Implement backend API endpoints';
    RAISE NOTICE '2. Create admin dashboard components';
    RAISE NOTICE '3. Update frontend to use dynamic data';
    RAISE NOTICE '';
    RAISE NOTICE 'Sample data loaded:';
    RAISE NOTICE '- % active job positions', (SELECT COUNT(*) FROM job_positions WHERE is_active = true);
    RAISE NOTICE '- Ready for applications!';
    RAISE NOTICE '';
END $$;