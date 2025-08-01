-- =====================================================
-- KORSVAGEN WEB - REVIEWS SCHEMA
-- Schema per la gestione delle recensioni dinamiche
-- =====================================================

-- Tabella reviews
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    author_company VARCHAR(150),
    review_text TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_reviews_active ON reviews(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_display_order ON reviews(display_order);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Dati di esempio per il popolamento iniziale
INSERT INTO reviews (
    author_name,
    author_company,
    review_text,
    rating,
    is_active,
    display_order
) VALUES 
(
    'Mario Rossi',
    'Imprenditore edile',
    'Eccezionale! Korsvagen ha realizzato la casa dei nostri sogni con professionalità e attenzione ai dettagli incredibili.',
    5,
    true,
    1
),
(
    'Giulia Verdi',
    'Architetto',
    'Ottima esperienza, team competente e disponibile. Consigliatissimi per chi cerca qualità e affidabilità.',
    5,
    true,
    2
),
(
    'Laura Bianchi',
    'Cliente privato',
    'Hanno trasformato la mia visione in realtà. Ogni fase del progetto è stata gestita con cura e precisione.',
    5,
    true,
    3
),
(
    'Alessandro Neri',
    'Sviluppatore immobiliare',
    'Partnership di successo su più progetti. Korsvagen è sinonimo di qualità e rispetto dei tempi.',
    5,
    true,
    4
),
(
    'Francesca Blu',
    'Interior Designer',
    'Collaborazione perfetta. La loro attenzione ai dettagli architettonici è straordinaria.',
    5,
    true,
    5
)
ON CONFLICT DO NOTHING;

-- Commenti per documentazione
COMMENT ON TABLE reviews IS 'Recensioni clienti per la homepage';
COMMENT ON COLUMN reviews.author_name IS 'Nome completo del recensore';
COMMENT ON COLUMN reviews.author_company IS 'Azienda o ruolo del recensore (opzionale)';
COMMENT ON COLUMN reviews.review_text IS 'Testo della recensione';
COMMENT ON COLUMN reviews.rating IS 'Valutazione da 1 a 5 stelle';
COMMENT ON COLUMN reviews.is_active IS 'Se la recensione è attiva e visibile';
COMMENT ON COLUMN reviews.display_order IS 'Ordine di visualizzazione (minore = prima)';