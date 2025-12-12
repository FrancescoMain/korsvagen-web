-- MIGRAZIONE: Aggiunta campi documento alle certificazioni e creazione tabella policies
-- Data: 2025-12-12
-- Autore: KORSVAGEN S.R.L.

-- ==============================================
-- 1. AGGIUNTA CAMPI DOCUMENTO A CERTIFICATIONS
-- ==============================================

-- Aggiungi campo document_url per il PDF del certificato
ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS document_url VARCHAR(500) NULL;

-- Aggiungi campo document_public_id per Cloudinary
ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS document_public_id VARCHAR(255) NULL;

-- Aggiungi campo expiry_date per la scadenza del certificato
ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS expiry_date DATE NULL;

-- Aggiungi campo issue_date per la data di emissione
ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS issue_date DATE NULL;

-- Aggiungi campo issuing_body per l'ente certificatore
ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS issuing_body VARCHAR(200) NULL;

-- Aggiungi campo certificate_number per il numero del certificato
ALTER TABLE certifications
ADD COLUMN IF NOT EXISTS certificate_number VARCHAR(100) NULL;

-- ==============================================
-- 2. CREAZIONE TABELLA COMPANY_POLICIES
-- ==============================================

CREATE TABLE IF NOT EXISTS company_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Informazioni base
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,

    -- Contenuto
    content TEXT, -- Contenuto HTML/markdown della policy

    -- Documento PDF
    document_url VARCHAR(500),
    document_public_id VARCHAR(255),
    file_size INTEGER, -- dimensione in bytes

    -- Categorizzazione
    category VARCHAR(50) DEFAULT 'general', -- quality, environment, safety, anticorruption, gender_equality, general

    -- Metadati visualizzazione
    display_order INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,

    -- Date policy
    effective_date DATE, -- Data di entrata in vigore
    revision_date DATE, -- Data ultima revisione
    revision_number VARCHAR(20), -- es. "Ed. 1", "Rev. 2"

    -- Audit trail
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_policies_slug ON company_policies(slug);
CREATE INDEX IF NOT EXISTS idx_policies_category ON company_policies(category);
CREATE INDEX IF NOT EXISTS idx_policies_published ON company_policies(is_published);
CREATE INDEX IF NOT EXISTS idx_policies_display_order ON company_policies(display_order);

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_policies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_policies_updated_at ON company_policies;
CREATE TRIGGER trigger_policies_updated_at
    BEFORE UPDATE ON company_policies
    FOR EACH ROW
    EXECUTE FUNCTION update_policies_updated_at();

-- ==============================================
-- 3. INSERIMENTO DATI INIZIALI POLICIES
-- ==============================================

-- Politica della Qualita (ISO 9001)
INSERT INTO company_policies (title, slug, description, category, effective_date, revision_number, is_published, display_order)
VALUES (
    'Politica della Qualita',
    'politica-qualita',
    'La Politica della Qualita della KORSVAGEN SRL definisce gli obiettivi e gli impegni aziendali per garantire la soddisfazione del cliente, l''eccellenza dei risultati e il miglioramento continuo secondo la norma ISO 9001:2015.',
    'quality',
    '2025-05-31',
    'Ed. 1',
    true,
    1
) ON CONFLICT (slug) DO NOTHING;

-- Politica Parita di Genere (UNI PDR 125)
INSERT INTO company_policies (title, slug, description, category, effective_date, revision_number, is_published, display_order)
VALUES (
    'Politica Aziendale Parita di Genere',
    'politica-parita-genere',
    'KORSVAGEN S.R.L. si impegna a garantire un ambiente lavorativo in cui ogni persona puo esprimere il proprio potenziale, promuovendo iniziative per le pari opportunita, la valorizzazione dei talenti e l''inclusione secondo la norma UNI PDR 125:2022.',
    'gender_equality',
    '2025-03-03',
    'Ed. 00',
    true,
    2
) ON CONFLICT (slug) DO NOTHING;

-- ==============================================
-- 4. VERIFICA STRUTTURA
-- ==============================================

-- Verifica colonne certifications
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'certifications'
ORDER BY ordinal_position;

-- Verifica tabella policies
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'company_policies'
ORDER BY ordinal_position;
