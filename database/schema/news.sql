-- KORSVAGEN News Management System
-- Database Schema for Dynamic News Implementation
-- Created: 2024-08-12

-- Drop existing news table if it exists (for clean setup)
DROP TABLE IF EXISTS news CASCADE;

-- Create news table with all required fields
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500), -- Maps to current 'excerpt'
  slug VARCHAR(255) UNIQUE NOT NULL, -- For SEO-friendly URLs
  category VARCHAR(100) NOT NULL, -- Simple string as requested
  content TEXT NOT NULL, -- Full article content (HTML supported)
  excerpt TEXT, -- Optional preview text (can derive from subtitle)
  
  -- Image management
  image_url VARCHAR(500), -- Cloudinary URL
  image_public_id VARCHAR(255), -- Cloudinary reference for deletion
  
  -- Publishing management
  published_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Maps to current 'featured'
  
  -- Analytics (optional)
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_news_published ON news(is_published, published_date DESC);
CREATE INDEX idx_news_category ON news(category, published_date DESC);
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_featured ON news(is_featured, published_date DESC);

-- Trigger function for automatic updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to news table
CREATE TRIGGER update_news_updated_at 
  BEFORE UPDATE ON news
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Seed data from existing static content
INSERT INTO news (title, subtitle, slug, category, content, published_date, is_featured, image_url) VALUES
(
  'KORSVAGEN vince il premio "Innovazione nell''Edilizia 2024"',
  'La nostra azienda è stata riconosciuta per l''utilizzo di tecnologie innovative nella costruzione sostenibile e per l''approccio eco-friendly ai progetti edilizi.',
  'korsvagen-vince-premio-innovazione-edilizia-2024',
  'Premi',
  '<p>KORSVAGEN S.R.L. ha ricevuto il prestigioso premio "Innovazione nell''Edilizia 2024" durante la cerimonia tenutasi presso il Palazzo delle Stelline di Milano.</p>

<p>Il riconoscimento, assegnato dall''Associazione Nazionale Costruttori Edili, premia le aziende che si distinguono per l''utilizzo di tecnologie innovative e sostenibili nel settore delle costruzioni.</p>

<blockquote>"Questo premio rappresenta il riconoscimento del nostro impegno costante verso l''innovazione e la sostenibilità", ha dichiarato il CEO di KORSVAGEN durante la cerimonia. "Continueremo a investire in tecnologie all''avanguardia per offrire ai nostri clienti soluzioni sempre più efficienti e rispettose dell''ambiente."</blockquote>

<p>Tra i progetti che hanno contribuito al riconoscimento, spicca la recente realizzazione di un complesso residenziale a energia zero nel centro di Milano, che utilizza materiali eco-compatibili e sistemi di domotica avanzata.</p>

<p>L''azienda ha inoltre presentato durante la cerimonia il suo nuovo piano quinquennale per la sostenibilità, che prevede l''utilizzo esclusivo di energie rinnovabili entro il 2027 e l''implementazione di processi di economia circolare in tutti i cantieri.</p>',
  '2024-12-15',
  true,
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
),
(
  'Nuovo progetto di riqualificazione urbana a Milano',
  'Iniziati i lavori per il progetto di riqualificazione del quartiere Isola, che prevede la costruzione di edifici residenziali ad alta efficienza energetica.',
  'nuovo-progetto-riqualificazione-urbana-milano',
  'Progetti',
  '<p>KORSVAGEN S.R.L. ha dato il via ai lavori per un ambizioso progetto di riqualificazione urbana nel quartiere Isola di Milano.</p>

<p>Il progetto prevede la costruzione di 150 unità abitative distribuite in tre edifici ad alta efficienza energetica, con certificazione LEED Gold.</p>

<blockquote>"Questo progetto rappresenta il nostro impegno verso lo sviluppo urbano sostenibile", ha spiegato il direttore tecnico. "Ogni edificio sarà dotato di pannelli solari, sistemi di raccolta dell''acqua piovana e giardini pensili per migliorare la qualità dell''aria urbana."</blockquote>

<p>I lavori, che hanno un valore complessivo di 45 milioni di euro, dovrebbero completarsi entro 24 mesi e daranno lavoro a oltre 200 professionisti del settore edile.</p>',
  '2024-12-08',
  false,
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
),
(
  'Partnership con istituti di ricerca per l''edilizia sostenibile',
  'KORSVAGEN S.R.L. ha siglato accordi di collaborazione con il Politecnico di Milano per lo sviluppo di nuove tecnologie costruttive.',
  'partnership-istituti-ricerca-edilizia-sostenibile',
  'Partnership',
  '<p>KORSVAGEN S.R.L. ha siglato un importante accordo di collaborazione con il Politecnico di Milano per lo sviluppo di nuove tecnologie costruttive sostenibili.</p>

<p>La partnership prevede la creazione di un laboratorio di ricerca congiunto dove verranno sviluppati nuovi materiali biocompatibili e sistemi costruttivi innovativi.</p>

<blockquote>"La collaborazione con il mondo accademico è fondamentale per rimanere all''avanguardia nel settore", ha sottolineato il responsabile R&D di KORSVAGEN. "Insieme al Politecnico, vogliamo sviluppare soluzioni che possano rivoluzionare il modo di costruire, sempre nel rispetto dell''ambiente."</blockquote>

<p>Il progetto di ricerca, della durata di tre anni, si concentrerà principalmente su materiali da costruzione a base di canapa e sistemi di isolamento termico innovativi.</p>',
  '2024-12-01',
  false,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
),
(
  'Certificazione ISO 14001 per la gestione ambientale',
  'La nostra azienda ha ottenuto la certificazione ISO 14001, confermando il nostro impegno per la sostenibilità ambientale nei processi costruttivi.',
  'certificazione-iso-14001-gestione-ambientale',
  'Certificazioni',
  '<p>KORSVAGEN S.R.L. ha ottenuto la certificazione ISO 14001:2015 per la gestione ambientale, confermando il proprio impegno verso la sostenibilità.</p>

<p>La certificazione, rilasciata da un ente accreditato internazionale, attesta che l''azienda ha implementato un sistema di gestione ambientale efficace e conforme agli standard internazionali.</p>

<blockquote>"Questa certificazione rappresenta un traguardo importante nel nostro percorso verso la sostenibilità", ha dichiarato il responsabile qualità. "Dimostra che tutti i nostri processi, dalla progettazione alla realizzazione, sono orientati alla riduzione dell''impatto ambientale."</blockquote>

<p>La certificazione copre tutti gli aspetti dell''attività aziendale, dalla gestione dei rifiuti di cantiere all''utilizzo di materiali eco-compatibili, dalla riduzione delle emissioni di CO2 al risparmio energetico.</p>',
  '2024-11-25',
  false,
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
);

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT ALL PRIVILEGES ON TABLE news TO authenticated;
-- GRANT ALL PRIVILEGES ON SEQUENCE news_id_seq TO authenticated;

-- Create RLS (Row Level Security) policies if needed for Supabase
-- ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to published news
-- CREATE POLICY "Published news are viewable by everyone" ON news
--   FOR SELECT USING (is_published = true);

-- Policy for admin full access (adjust role as needed)
-- CREATE POLICY "Admins can manage all news" ON news
--   FOR ALL USING (auth.role() = 'admin');

COMMENT ON TABLE news IS 'Dynamic news management system for KORSVAGEN website';
COMMENT ON COLUMN news.slug IS 'SEO-friendly URL identifier (e.g., "project-title-2024")';
COMMENT ON COLUMN news.category IS 'Simple string category as requested (e.g., "Progetti", "Premi")';
COMMENT ON COLUMN news.is_featured IS 'Featured articles displayed prominently on homepage/news list';
COMMENT ON COLUMN news.views_count IS 'Analytics counter for article views';