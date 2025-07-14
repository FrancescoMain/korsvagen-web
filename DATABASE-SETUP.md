🗄️ **DATABASE SETUP REQUIRED**

Le tabelle del database non esistono ancora. Devi crearle manualmente nel dashboard di Supabase.

## 🔗 Vai al SQL Editor di Supabase:
https://supabase.com/dashboard/project/xmkbguocqvhhydinlrwg/sql

## 📝 Copia e incolla questo SQL:

```sql
-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  og_image VARCHAR(500),
  is_published BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id VARCHAR(100) UNIQUE NOT NULL,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  content JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_id VARCHAR(255) UNIQUE NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  secure_url VARCHAR(500) NOT NULL,
  format VARCHAR(20),
  resource_type VARCHAR(20) DEFAULT 'image',
  width INTEGER,
  height INTEGER,
  bytes INTEGER,
  alt_text VARCHAR(255),
  folder VARCHAR(255),
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_sections_page_id ON sections(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_order ON sections(order_index);
CREATE INDEX IF NOT EXISTS idx_media_public_id ON media(public_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## 🚀 Dopo aver eseguito l'SQL:

1. Clicca "Run" nel SQL Editor
2. Verifica che tutte le tabelle siano state create nella sezione "Tables"
3. Torna qui e esegui: `node test-full-database.js`

## 📊 Dati di esempio (opzionale):

Se vuoi aggiungere alcuni dati di test, esegui anche questo SQL:

```sql
-- Insert test user
INSERT INTO users (email, name, role) VALUES 
('admin@korsvagen.it', 'Admin User', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert test page
INSERT INTO pages (page_id, title, slug, description) VALUES 
('home', 'Home Page', 'home', 'Homepage del sito KORSVAGEN')
ON CONFLICT (page_id) DO NOTHING;

-- Insert test section
INSERT INTO sections (section_id, page_id, type, title, content, order_index) 
SELECT 'hero-home', p.id, 'hero', 'Hero Section', '{"subtitle": "Architettura e Design"}', 1
FROM pages p WHERE p.page_id = 'home'
ON CONFLICT (section_id) DO NOTHING;
```
