# Claude Code - Implementazione Sistema Dinamico News

## Obiettivo del Progetto

Trasformare la sezione news da statica a dinamica con gestione CRUD dalla dashboard admin, mantenendo la semplicità e focalizzandosi sulle funzionalità essenziali.

## Analisi Funzionale

### Frontend Pubblico - Sezione News

**Funzionalità identificate da analizzare:**

- Lista di articoli con preview
- Ogni articolo mostra: data, categoria, titolo, sottotitolo, immagine
- Pulsante "Leggi di più" per ogni articolo
- Pagina dettaglio articolo completa
- Sezione "Articoli correlati" (stessa categoria)
- Possibile paginazione o load more

### Dashboard Admin - Gestione News

**Funzionalità CRUD semplici:**

- ➕ Aggiungere nuovo articolo
- ✏️ Modificare articolo esistente
- 🗑️ Eliminare articolo
- 👁️ Visualizzare lista articoli
- 📅 Gestione date pubblicazione
- 🏷️ Gestione categorie (stringa semplice)

## Task di Implementazione

### 1. Analisi Dettagliata Frontend Statico

#### Mapping Struttura Esistente

**Analizza e documenta:**

- Layout lista news (griglia, cards, lista)
- Struttura preview articolo (card design)
- Pagina dettaglio articolo (layout, tipografia)
- Sistema di navigazione tra articoli
- Responsive behavior
- Stili CSS utilizzati
- Sistema "Articoli correlati" (se presente)

#### Identificazione Componenti

```javascript
// Componenti da mappare:
- NewsList (lista articoli)
- NewsCard (preview singolo articolo)
- NewsDetail (pagina dettaglio completa)
- RelatedNews (articoli correlati)
- NewsFilters (filtri categoria - se presenti)
```

#### Estrazione Dati Esistenti

```javascript
// Per ogni articolo statico esistente, estrai:
- title: "Titolo dell'articolo"
- subtitle: "Sottotitolo o excerpt"
- category: "Categoria (es. Progetti, Azienda, Settore)"
- date: "Data pubblicazione"
- image_url: "URL immagine principale"
- content: "Contenuto completo articolo (HTML/Markdown)"
- slug: "URL-friendly identifier"
```

### 2. Database Schema (SQL per Supabase)

#### Tabella `news`

```sql
-- Schema semplice e diretto per Supabase
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  slug VARCHAR(255) UNIQUE NOT NULL, -- Per URL SEO-friendly
  category VARCHAR(100) NOT NULL, -- Stringa semplice come richiesto
  content TEXT NOT NULL, -- Articolo completo (HTML o Markdown)
  excerpt TEXT, -- Estratto per preview (opzionale, può derivare da subtitle)
  image_url VARCHAR(500),
  image_public_id VARCHAR(255), -- Cloudinary reference
  published_date DATE NOT NULL,
  is_published BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false, -- Per eventuale evidenziazione
  views_count INTEGER DEFAULT 0, -- Contatore visualizzazioni (opzionale)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_news_published ON news(is_published, published_date DESC);
CREATE INDEX idx_news_category ON news(category, published_date DESC);
CREATE INDEX idx_news_slug ON news(slug);

-- Trigger per aggiornamento automatico updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Seed Data di Esempio

```sql
-- Inserimento dati di esempio per testing
INSERT INTO news (title, subtitle, slug, category, content, published_date) VALUES
(
  'Nuovo Progetto Residenziale a Milano',
  'Un innovativo complesso abitativo nel cuore della città',
  'nuovo-progetto-residenziale-milano',
  'Progetti',
  '<p>Contenuto completo dell''articolo...</p>',
  '2024-08-01'
),
(
  'Espansione del Team: Benvenuti ai Nuovi Colleghi',
  'La nostra squadra si allarga con professionisti esperti',
  'espansione-team-nuovi-colleghi',
  'Azienda',
  '<p>Siamo entusiasti di annunciare...</p>',
  '2024-07-15'
);
```

### 3. Backend API - Endpoints

#### API Pubbliche (Frontend)

```javascript
// GET /api/news - Lista articoli pubblici
// Query params: ?category=Progetti&limit=10&page=1&featured=true

// GET /api/news/:slug - Dettaglio articolo per slug
// Include incremento views_count

// GET /api/news/:slug/related - Articoli correlati (stessa categoria, escluso corrente)
// Limit default: 3-4 articoli

// GET /api/news/categories - Lista categorie uniche (per filtri)
```

#### API Admin (Dashboard)

```javascript
// GET /api/admin/news - Lista completa articoli
// POST /api/admin/news - Crea nuovo articolo
// GET /api/admin/news/:id - Dettaglio articolo per modifica
// PUT /api/admin/news/:id - Aggiorna articolo
// DELETE /api/admin/news/:id - Elimina articolo

// Gestione immagini:
// POST /api/admin/news/:id/image - Upload immagine articolo
// DELETE /api/admin/news/:id/image - Elimina immagine
```

### 4. Backend Implementation

#### Controller News Pubbliche

```javascript
const getPublicNews = async (req, res) => {
  const { category, limit = 10, page = 1, featured } = req.query;

  let query = supabase
    .from("news")
    .select(
      "id, title, subtitle, slug, category, image_url, published_date, is_featured"
    )
    .eq("is_published", true)
    .order("published_date", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (featured === "true") {
    query = query.eq("is_featured", true);
  }

  // Paginazione
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

const getNewsBySlug = async (req, res) => {
  const { slug } = req.params;

  // Incrementa views_count
  const { data: article, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !article) {
    return res.status(404).json({ error: "Articolo non trovato" });
  }

  // Incrementa visualizzazioni
  await supabase
    .from("news")
    .update({ views_count: article.views_count + 1 })
    .eq("id", article.id);

  res.json(article);
};

const getRelatedNews = async (req, res) => {
  const { slug } = req.params;

  // Prima trova l'articolo corrente per ottenere la categoria
  const { data: currentArticle } = await supabase
    .from("news")
    .select("category")
    .eq("slug", slug)
    .single();

  if (!currentArticle) {
    return res.status(404).json({ error: "Articolo non trovato" });
  }

  // Trova articoli correlati (stessa categoria, escluso quello corrente)
  const { data: related, error } = await supabase
    .from("news")
    .select("id, title, subtitle, slug, category, image_url, published_date")
    .eq("category", currentArticle.category)
    .neq("slug", slug)
    .eq("is_published", true)
    .order("published_date", { ascending: false })
    .limit(4);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(related);
};
```

#### Controller Admin

```javascript
const createNews = async (req, res) => {
  const {
    title,
    subtitle,
    slug,
    category,
    content,
    published_date,
    is_published = true,
    is_featured = false,
  } = req.body;

  // Validazione slug univoco
  const { data: existing } = await supabase
    .from("news")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return res.status(400).json({ error: "Slug già esistente" });
  }

  const { data, error } = await supabase
    .from("news")
    .insert({
      title,
      subtitle,
      slug,
      category,
      content,
      published_date,
      is_published,
      is_featured,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
};

const updateNews = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const { data, error } = await supabase
    .from("news")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

const deleteNews = async (req, res) => {
  const { id } = req.params;

  // Prima recupera info per cleanup immagini
  const { data: article } = await supabase
    .from("news")
    .select("image_public_id")
    .eq("id", id)
    .single();

  // Elimina da database
  const { error } = await supabase.from("news").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Cleanup immagine Cloudinary se presente
  if (article?.image_public_id) {
    try {
      await cloudinary.uploader.destroy(article.image_public_id);
    } catch (cloudinaryError) {
      console.error("Errore eliminazione immagine:", cloudinaryError);
    }
  }

  res.status(204).send();
};
```

### 5. Dashboard Admin - UI Implementation

#### Lista News Management

```jsx
const NewsManagement = () => {
  const [news, setNews] = useState([]);
  const [filters, setFilters] = useState({ category: "", published: "all" });

  return (
    <div className="news-management">
      <div className="header">
        <h2>Gestione News</h2>
        <button onClick={() => setShowCreateModal(true)}>Nuovo Articolo</button>
      </div>

      {/* Filtri semplici */}
      <div className="filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">Tutte le categorie</option>
          <option value="Progetti">Progetti</option>
          <option value="Azienda">Azienda</option>
          <option value="Settore">Settore</option>
        </select>

        <select
          value={filters.published}
          onChange={(e) =>
            setFilters({ ...filters, published: e.target.value })
          }
        >
          <option value="all">Tutti</option>
          <option value="published">Pubblicati</option>
          <option value="draft">Bozze</option>
        </select>
      </div>

      {/* Lista articoli */}
      <div className="news-list">
        {news.map((article) => (
          <NewsAdminCard
            key={article.id}
            article={article}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onTogglePublish={handleTogglePublish}
          />
        ))}
      </div>
    </div>
  );
};
```

#### Form Articolo Completo

```jsx
const NewsForm = ({ article, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: article?.title || "",
    subtitle: article?.subtitle || "",
    slug: article?.slug || "",
    category: article?.category || "",
    content: article?.content || "",
    published_date:
      article?.published_date || new Date().toISOString().split("T")[0],
    is_published: article?.is_published ?? true,
    is_featured: article?.is_featured ?? false,
  });

  // Auto-generate slug da title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim("-");
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  return (
    <form className="news-form" onSubmit={handleSubmit}>
      {/* Informazioni Base */}
      <section className="basic-info">
        <div className="form-group">
          <label>Titolo *</label>
          <input
            type="text"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Titolo dell'articolo"
            required
          />
        </div>

        <div className="form-group">
          <label>Slug URL *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="url-articolo"
            required
          />
          <small>URL: /news/{formData.slug}</small>
        </div>

        <div className="form-group">
          <label>Sottotitolo</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) =>
              setFormData({ ...formData, subtitle: e.target.value })
            }
            placeholder="Breve descrizione dell'articolo"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoria *</label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">Seleziona categoria</option>
              <option value="Progetti">Progetti</option>
              <option value="Azienda">Azienda</option>
              <option value="Settore">Settore</option>
              <option value="Eventi">Eventi</option>
              <option value="Novità">Novità</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data Pubblicazione *</label>
            <input
              type="date"
              value={formData.published_date}
              onChange={(e) =>
                setFormData({ ...formData, published_date: e.target.value })
              }
              required
            />
          </div>
        </div>
      </section>

      {/* Immagine */}
      <section className="image-upload">
        <NewsImageUpload
          articleId={article?.id}
          currentImage={formData.image_url}
          onImageChange={(url, publicId) =>
            setFormData({
              ...formData,
              image_url: url,
              image_public_id: publicId,
            })
          }
        />
      </section>

      {/* Contenuto */}
      <section className="content-editor">
        <label>Contenuto Articolo *</label>
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="Scrivi qui il contenuto completo dell'articolo..."
          rows={15}
          required
        />
        <small>Supporta HTML base per formattazione</small>
      </section>

      {/* Opzioni Pubblicazione */}
      <section className="publish-options">
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) =>
                setFormData({ ...formData, is_published: e.target.checked })
              }
            />
            Pubblica articolo
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) =>
                setFormData({ ...formData, is_featured: e.target.checked })
              }
            />
            Articolo in evidenza
          </label>
        </div>
      </section>

      {/* Azioni */}
      <div className="form-actions">
        <button type="button" onClick={onCancel}>
          Annulla
        </button>
        <button type="submit">
          {article ? "Aggiorna Articolo" : "Crea Articolo"}
        </button>
      </div>
    </form>
  );
};
```

#### Upload Immagine News

```jsx
const NewsImageUpload = ({ articleId, currentImage, onImageChange }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);

  const handleImageUpload = async (file) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(`/api/admin/news/${articleId}/image`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { image_url, image_public_id } = await response.json();
        setPreview(image_url);
        onImageChange(image_url, image_public_id);
      }
    } catch (error) {
      console.error("Errore upload:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="image-upload">
      <label>Immagine Articolo</label>

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
          <button
            type="button"
            onClick={() => {
              setPreview(null);
              onImageChange(null, null);
            }}
          >
            Rimuovi
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) handleImageUpload(file);
        }}
        disabled={uploading}
      />

      {uploading && <p>Caricamento in corso...</p>}
    </div>
  );
};
```

### 6. Frontend Pubblico - Refactoring

#### Lista News Dinamica

```jsx
const NewsSection = () => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory]);

  const fetchNews = async (category = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append("category", category);

      const response = await fetch(`/api/news?${params}`);
      const data = await response.json();
      setNews(data);
    } catch (error) {
      console.error("Errore caricamento news:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-section">
      {/* Filtri Categoria */}
      {categories.length > 1 && (
        <div className="news-filters">
          <button
            className={activeCategory === "" ? "active" : ""}
            onClick={() => setActiveCategory("")}
          >
            Tutte
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Lista Articoli */}
      <div className="news-grid">
        {news.map((article) => (
          <NewsCard
            key={article.id}
            article={article}
            onClick={() => navigateToArticle(article.slug)}
          />
        ))}
      </div>

      {loading && <div className="loading">Caricamento...</div>}
    </div>
  );
};
```

#### Card News

```jsx
const NewsCard = ({ article, onClick }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="news-card" onClick={onClick}>
      {article.image_url && (
        <div className="news-image">
          <img src={article.image_url} alt={article.title} />
          <div className="news-category">{article.category}</div>
        </div>
      )}

      <div className="news-content">
        <div className="news-meta">
          <time>{formatDate(article.published_date)}</time>
          {article.is_featured && (
            <span className="featured-badge">In evidenza</span>
          )}
        </div>

        <h3 className="news-title">{article.title}</h3>

        {article.subtitle && (
          <p className="news-subtitle">{article.subtitle}</p>
        )}

        <button className="read-more">Leggi di più</button>
      </div>
    </article>
  );
};
```

#### Dettaglio Articolo

```jsx
const NewsDetail = ({ slug }) => {
  const [article, setArticle] = useState(null);
  const [relatedNews, setRelatedNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const [articleRes, relatedRes] = await Promise.all([
        fetch(`/api/news/${slug}`),
        fetch(`/api/news/${slug}/related`),
      ]);

      const articleData = await articleRes.json();
      const relatedData = await relatedRes.json();

      setArticle(articleData);
      setRelatedNews(relatedData);
    } catch (error) {
      console.error("Errore caricamento articolo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Caricamento...</div>;
  if (!article) return <div className="error">Articolo non trovato</div>;

  return (
    <div className="news-detail">
      {/* Header Articolo */}
      <header className="article-header">
        <div className="article-meta">
          <span className="category">{article.category}</span>
          <time>{formatDate(article.published_date)}</time>
        </div>

        <h1>{article.title}</h1>

        {article.subtitle && (
          <p className="article-subtitle">{article.subtitle}</p>
        )}
      </header>

      {/* Immagine Principale */}
      {article.image_url && (
        <div className="article-image">
          <img src={article.image_url} alt={article.title} />
        </div>
      )}

      {/* Contenuto */}
      <div className="article-content">
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      </div>

      {/* Articoli Correlati */}
      {relatedNews.length > 0 && (
        <section className="related-news">
          <h3>Articoli correlati</h3>
          <div className="related-grid">
            {relatedNews.map((related) => (
              <NewsCard
                key={related.id}
                article={related}
                onClick={() => navigateToArticle(related.slug)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
```

### 7. Cloudinary Integration

#### Upload Immagini News

```javascript
// Configurazione specifica per news
const uploadNewsImage = async (file, newsId) => {
  return cloudinary.uploader.upload(file, {
    folder: "news",
    public_id: `news_${newsId}_${Date.now()}`,
    transformation: [
      { width: 800, height: 500, crop: "fill", quality: "auto" },
      { fetch_format: "auto" },
    ],
  });
};

// Trasformazioni per diversi usi
const newsImageTransformations = {
  card: "w_400,h_250,c_fill,q_auto,f_auto",
  detail: "w_800,h_500,c_fill,q_auto,f_auto",
  thumbnail: "w_150,h_100,c_fill,q_auto,f_auto",
};
```

### 8. Migrazione Dati Esistenti

#### Script Migrazione

```javascript
const migrateStaticNews = async () => {
  // Analizza contenuto statico esistente
  const staticNews = [
    {
      title: "Titolo dal contenuto statico",
      subtitle: "Sottotitolo esistente",
      category: "Categoria identificata",
      content: "Contenuto completo estratto",
      published_date: "2024-08-01", // Data stimata
      slug: generateSlug("Titolo dal contenuto statico"),
    },
    // ... altri articoli
  ];

  // Inserimento batch in Supabase
  const { error } = await supabase.from("news").insert(staticNews);

  if (error) {
    console.error("Errore migrazione:", error);
  } else {
    console.log(`Migrati ${staticNews.length} articoli`);
  }
};
```

### 9. Validazioni

#### Frontend Validation

```javascript
const validateNewsForm = (formData) => {
  const errors = {};

  if (!formData.title?.trim()) errors.title = "Titolo obbligatorio";
  if (!formData.slug?.trim()) errors.slug = "Slug obbligatorio";
  if (!formData.category?.trim()) errors.category = "Categoria obbligatoria";
  if (!formData.content?.trim()) errors.content = "Contenuto obbligatorio";
  if (!formData.published_date)
    errors.published_date = "Data pubblicazione obbligatoria";

  // Validazione slug formato
  if (formData.slug && !/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.slug =
      "Slug deve contenere solo lettere minuscole, numeri e trattini";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

## Implementazione Step-by-Step

### Fase 1: Analisi e Setup

1. **Analisi frontend statico esistente**
2. **Creazione schema database Supabase** (manuale come richiesto)
3. **Setup API routes base**

### Fase 2: Backend Development

1. **Controller per API pubbliche**
2. **Controller admin CRUD**
3. **Integrazione Cloudinary immagini**
4. **Sistema articoli correlati**

### Fase 3: Dashboard Admin

1. **Lista news con filtri**
2. **Form CRUD completo**
3. **Upload immagini**
4. **Gestione pubblicazione**

### Fase 4: Frontend Pubblico

1. **Lista news dinamica**
2. **Dettaglio articolo**
3. **Articoli correlati**
4. **Filtri categoria**

### Fase 5: Migrazione e Testing

1. **Script migrazione dati esistenti**
2. **Testing completo funzionalità**
3. **SEO optimization**
4. **Performance check**

## Note Importanti

- **Semplicità**: Mantieni le categorie come stringhe semplici come richiesto
- **SEO**: Usa slug per URL friendly e meta tags appropriati
- **Performance**: Implementa paginazione se ci sono molti articoli
- **Responsive**: Assicurati che tutto funzioni su mobile
- **Backup**: Backup contenuti statici prima della migrazione
- **Content**: Supporta HTML base nel contenuto per formattazione

Inizia analizzando in dettaglio la struttura esistente della sezione news per capire esattamente come è organizzata attualmente.
