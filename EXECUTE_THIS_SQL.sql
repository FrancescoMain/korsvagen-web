-- ⚡ ESEGUI QUESTO SQL IN SUPABASE PER CREARE LE TABELLE TEAM
-- Copia tutto questo contenuto e incollalo nell'SQL Editor di Supabase

-- TEAM MANAGEMENT SCHEMA per KORSVAGEN S.R.L.
-- Schema per gestione dinamica del team aziendale
-- Include tutte le funzionalità della versione statica + gestione CV

-- Tabella principale membri del team
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Informazioni base
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    short_description TEXT,
    full_description TEXT,
    placeholder VARCHAR(10) NOT NULL, -- Iniziali per avatar (es. "MR")
    
    -- Esperienza e formazione
    experience VARCHAR(200),
    education TEXT,
    
    -- File CV
    cv_file_name VARCHAR(255), -- Nome originale del file
    cv_file_url TEXT, -- URL Cloudinary del CV
    cv_file_size INTEGER, -- Dimensione file in bytes
    cv_upload_date TIMESTAMPTZ,
    
    -- Immagine profilo (opzionale, per future implementazioni)
    profile_image_url TEXT,
    
    -- Ordinamento e visibilità
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id),
    updated_by UUID REFERENCES admin_users(id),
    
    -- Constraints
    CONSTRAINT check_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT check_role_length CHECK (char_length(role) >= 2),
    CONSTRAINT check_placeholder_format CHECK (placeholder ~ '^[A-Z]{1,4}$')
);

-- Tabella competenze/skills (relazione many-to-many)
CREATE TABLE team_member_skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_member_id UUID NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint per evitare duplicati
    UNIQUE(team_member_id, skill_name)
);

-- Indici per performance
CREATE INDEX idx_team_members_active_order ON team_members(is_active, display_order) WHERE is_active = true;
CREATE INDEX idx_team_members_created_by ON team_members(created_by);
CREATE INDEX idx_team_members_updated_by ON team_members(updated_by);
CREATE INDEX idx_team_member_skills_member_id ON team_member_skills(team_member_id);

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_team_members_updated_at 
    BEFORE UPDATE ON team_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_member_skills ENABLE ROW LEVEL SECURITY;

-- Policy per lettura pubblica (per il sito)
CREATE POLICY "Team members are viewable by everyone" ON team_members
    FOR SELECT USING (is_active = true);

CREATE POLICY "Team member skills are viewable by everyone" ON team_member_skills
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM team_members 
            WHERE team_members.id = team_member_skills.team_member_id 
            AND team_members.is_active = true
        )
    );

-- Policy per admin (tutti i permessi)
CREATE POLICY "Admins can manage team members" ON team_members
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

CREATE POLICY "Admins can manage team member skills" ON team_member_skills
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

-- Inserimento dati esistenti dalla versione statica
INSERT INTO team_members (
    name, role, short_description, full_description, placeholder, 
    experience, education, cv_file_name, display_order, is_active
) VALUES 
(
    'Marco Rossi',
    'Fondatore & CEO',
    'Con oltre 20 anni di esperienza nel settore, Marco guida l''azienda con visione strategica e passione per l''eccellenza.',
    'Marco Rossi è il fondatore e CEO di KORSVAGEN S.R.L., con oltre 20 anni di esperienza nel settore delle costruzioni. Ha iniziato la sua carriera come geometra, specializzandosi progressivamente nella gestione di progetti complessi e nella direzione aziendale. La sua visione strategica e la passione per l''eccellenza hanno portato l''azienda a diventare un punto di riferimento nel settore edilizio. Marco è particolarmente esperto nella pianificazione di progetti residenziali e commerciali di grande scala.',
    'MR',
    '20+ anni nel settore edilizio',
    'Diploma di Geometra, Master in Business Administration',
    'marco-rossi.pdf',
    1,
    true
),
(
    'Elena Bianchi',
    'Direttore Tecnico',
    'Architetto specializzata in progettazione sostenibile, Elena supervisiona tutti gli aspetti tecnici dei progetti.',
    'Elena Bianchi è il Direttore Tecnico di KORSVAGEN S.R.L., con una specializzazione in architettura sostenibile e progettazione eco-compatibile. Laureata in Architettura con lode, ha conseguito un Master in Sustainable Design presso un prestigioso istituto europeo. Elena supervisiona tutti gli aspetti tecnici dei progetti, dalla fase di progettazione preliminare fino alla realizzazione, garantendo sempre l''integrazione di soluzioni innovative e sostenibili.',
    'EB',
    '15+ anni in progettazione architettonica',
    'Laurea in Architettura, Master in Sustainable Design',
    'elena-bianchi.pdf',
    2,
    true
),
(
    'Giuseppe Verdi',
    'Capo Cantiere',
    'Esperto maestro d''opera con 15 anni di esperienza, Giuseppe coordina le attività di cantiere con precisione.',
    'Giuseppe Verdi è il nostro Capo Cantiere, un maestro d''opera con 15 anni di solida esperienza nella gestione e coordinamento delle attività di cantiere. Ha iniziato la sua carriera come muratore specializzato, evolvendosi rapidamente in ruoli di responsabilità. Giuseppe è esperto nella gestione delle squadre di lavoro, nell''organizzazione delle fasi operative e nel controllo qualità delle lavorazioni. La sua competenza tecnica e le sue doti organizzative garantiscono il rispetto dei tempi e la qualità dei lavori.',
    'GV',
    '15+ anni in gestione cantieri',
    'Diploma di Maestro d''Opera, Certificazioni di Sicurezza',
    'giuseppe-verdi.pdf',
    3,
    true
),
(
    'Anna Ferrari',
    'Responsabile Qualità',
    'Ingegnere civile con specializzazione in controllo qualità, Anna garantisce i massimi standard in ogni progetto.',
    'Anna Ferrari è la nostra Responsabile Qualità, ingegnere civile con specializzazione in controllo qualità e testing dei materiali. Laureata in Ingegneria Civile con una tesi sperimentale sui materiali innovativi per l''edilizia, Anna ha sviluppato protocolli di controllo qualità che garantiscono i massimi standard in ogni fase del progetto. La sua attenzione ai dettagli e la conoscenza approfondita delle normative tecniche assicurano che ogni realizzazione rispetti e superi gli standard richiesti.',
    'AF',
    '12+ anni in controllo qualità edilizio',
    'Laurea in Ingegneria Civile, Specializzazione in Materiali da Costruzione',
    'anna-ferrari.pdf',
    4,
    true
),
(
    'Luca Neri',
    'Project Manager',
    'Coordina i progetti dall''inizio alla fine, assicurando il rispetto dei tempi e dei budget concordati.',
    'Luca Neri è il nostro Project Manager senior, specializzato nel coordinamento di progetti edilizi complessi dall''ideazione alla consegna. Con una formazione in Ingegneria Gestionale e certificazioni internazionali in Project Management, Luca eccelle nella pianificazione, nel controllo dei costi e nella gestione delle risorse. La sua metodologia strutturata e l''uso di strumenti di project management all''avanguardia garantiscono il rispetto dei tempi e dei budget concordati, mantenendo sempre alti gli standard qualitativi.',
    'LN',
    '10+ anni in project management',
    'Laurea in Ingegneria Gestionale, Certificazione PMP',
    'luca-neri.pdf',
    5,
    true
),
(
    'Sofia Romano',
    'Interior Designer',
    'Creatività e funzionalità si uniscono nei progetti di Sofia, che cura ogni dettaglio degli interni.',
    'Sofia Romano è la nostra Interior Designer, una professionista che combina creatività artistica e funzionalità pratica nella progettazione degli spazi interni. Laureata in Design dell''Arredamento con specializzazione in spazi residenziali e commerciali, Sofia ha un approccio olistico al design che considera le esigenze specifiche di ogni cliente. La sua capacità di trasformare gli spazi in ambienti accoglienti e funzionali, unita alla conoscenza delle ultime tendenze del design, rende ogni progetto unico e personalizzato.',
    'SR',
    '8+ anni in interior design',
    'Laurea in Design dell''Arredamento, Master in Retail Design',
    'sofia-romano.pdf',
    6,
    true
),
(
    'Mario Conti',
    'Responsabile Sicurezza',
    'Specialista in sicurezza sul lavoro, Mario garantisce il rispetto delle normative in tutti i cantieri.',
    'Mario Conti è il nostro Responsabile Sicurezza, un esperto qualificato nella gestione della sicurezza sui luoghi di lavoro. Con formazione specifica in Ingegneria della Sicurezza e numerose certificazioni nel settore, Mario sviluppa e implementa protocolli di sicurezza rigorosi per tutti i nostri cantieri. La sua esperienza ventennale nel settore e l''aggiornamento costante sulle normative vigenti garantiscono un ambiente di lavoro sicuro per tutti i collaboratori e il pieno rispetto delle disposizioni legislative.',
    'MC',
    '18+ anni in sicurezza cantieri',
    'Laurea in Ingegneria della Sicurezza, Certificazioni RSPP',
    'mario-conti.pdf',
    7,
    true
);

-- Inserimento skills per ogni membro
INSERT INTO team_member_skills (team_member_id, skill_name, display_order)
SELECT id, skill, skill_order FROM (
    SELECT 
        (SELECT id FROM team_members WHERE name = 'Marco Rossi') as id,
        unnest(ARRAY['Gestione Aziendale', 'Pianificazione Strategica', 'Project Management', 'Direzione Lavori']) as skill,
        generate_series(1, 4) as skill_order
    UNION ALL
    SELECT 
        (SELECT id FROM team_members WHERE name = 'Elena Bianchi') as id,
        unnest(ARRAY['Progettazione Architettonica', 'Design Sostenibile', 'BIM Modeling', 'Efficienza Energetica']) as skill,
        generate_series(1, 4) as skill_order
    UNION ALL
    SELECT 
        (SELECT id FROM team_members WHERE name = 'Giuseppe Verdi') as id,
        unnest(ARRAY['Gestione Cantiere', 'Coordinamento Squadre', 'Controllo Qualità', 'Sicurezza Sul Lavoro']) as skill,
        generate_series(1, 4) as skill_order
    UNION ALL
    SELECT 
        (SELECT id FROM team_members WHERE name = 'Anna Ferrari') as id,
        unnest(ARRAY['Controllo Qualità', 'Testing Materiali', 'Normative Tecniche', 'Analisi Strutturali']) as skill,
        generate_series(1, 4) as skill_order
    UNION ALL
    SELECT 
        (SELECT id FROM team_members WHERE name = 'Luca Neri') as id,
        unnest(ARRAY['Project Management', 'Pianificazione', 'Controllo Costi', 'Gestione Risorse']) as skill,
        generate_series(1, 4) as skill_order
    UNION ALL
    SELECT 
        (SELECT id FROM team_members WHERE name = 'Sofia Romano') as id,
        unnest(ARRAY['Interior Design', 'Space Planning', 'Selezione Materiali', 'Trend Analysis']) as skill,
        generate_series(1, 4) as skill_order
    UNION ALL
    SELECT 
        (SELECT id FROM team_members WHERE name = 'Mario Conti') as id,
        unnest(ARRAY['Sicurezza Sul Lavoro', 'Normative di Sicurezza', 'Risk Assessment', 'Formazione Sicurezza']) as skill,
        generate_series(1, 4) as skill_order
) subquery;

-- Vista per ottenere tutti i dati completi (utilizzata dalle API)
CREATE VIEW team_members_complete AS
SELECT 
    tm.*,
    COALESCE(
        json_agg(
            tms.skill_name ORDER BY tms.display_order
        ) FILTER (WHERE tms.skill_name IS NOT NULL), 
        '[]'::json
    ) as skills,
    cu.username as created_by_username,
    uu.username as updated_by_username
FROM team_members tm
LEFT JOIN team_member_skills tms ON tm.id = tms.team_member_id
LEFT JOIN admin_users cu ON tm.created_by = cu.id
LEFT JOIN admin_users uu ON tm.updated_by = uu.id
GROUP BY tm.id, cu.username, uu.username;

-- Commenti per documentazione
COMMENT ON TABLE team_members IS 'Membri del team aziendale con informazioni complete e CV';
COMMENT ON TABLE team_member_skills IS 'Competenze/skills dei membri del team';
COMMENT ON COLUMN team_members.placeholder IS 'Iniziali per avatar placeholder (es. MR per Marco Rossi)';
COMMENT ON COLUMN team_members.cv_file_url IS 'URL Cloudinary del file CV caricato';
COMMENT ON COLUMN team_members.display_order IS 'Ordine di visualizzazione nel sito (1 = primo)';

-- Verifica finale
SELECT 'SUCCESS: Created team_members table with ' || COUNT(*) || ' members' as result FROM team_members;
SELECT 'SUCCESS: Created team_member_skills table with ' || COUNT(*) || ' skills' as result FROM team_member_skills;