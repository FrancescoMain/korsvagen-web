# Claude Code - Implementazione Sistema Dinamico Progetti

## Obiettivo del Progetto

Trasformare la sezione progetti da statica a completamente dinamica con gestione CRUD dalla dashboard admin e gallery di immagini complete.

## Analisi Struttura Dati

### Struttura Progetto Completa

```javascript
{
  id: 1,
  title: "Villa Moderna Toscana",
  subtitle: "Progetto residenziale di lusso",
  year: 2024,
  location: "Firenze, Italia",
  status: "Completato", // Completato, In corso, Progettazione
  label: "Residenziale", // Residenziale, Commerciale, Industriale, ecc.
  description: "Descrizione dettagliata del progetto...",
  client: "Famiglia Rossi",
  surface: "450 mq",
  budget: "€ 850.000",
  duration: "18 mesi",
  features: [
    "Design sostenibile",
    "Domotica avanzata",
    "Piscina infinity",
    "Giardino panoramico"
  ],
  images: [
    {
      id: 1,
      url: "https://cloudinary.../image1.jpg",
      title: "Vista frontale della villa",
      order: 1,
      is_cover: true
    },
    {
      id: 2,
      url: "https://cloudinary.../image2.jpg",
      title: "Soggiorno con vista panoramica",
      order: 2,
      is_cover: false
    }
  ],
  is_active: true,
  display_order: 1,
  created_at: "2024-01-15",
  updated_at: "2024-01-15"
}
```

## Task di Implementazione

### 1. Analisi Frontend Statico Esistente

#### Mapping Contenuto Attuale

**Analizza e documenta:**

- Layout sezione progetti (griglia, lista, cards)
- Struttura singolo progetto (dettaglio)
- Gallery di immagini esistente (slider, lightbox, grid)
- Filtri per categorie/label se presenti
- Responsive behavior
- Stili CSS utilizzati
- Navigazione tra progetti

#### Identificazione Componenti

```javascript
// Componenti da mappare:
- ProjectsList/ProjectsGrid (lista progetti)
- ProjectCard (anteprima singolo progetto)
- ProjectDetail (pagina dettaglio)
- ProjectGallery (gallery immagini)
- ProjectFilters (filtri per categoria)
```

### 2. Database Schema

#### Tabella `projects`

```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  year YEAR NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('Completato', 'In corso', 'Progettazione') NOT NULL,
  label VARCHAR(100) NOT NULL, -- Residenziale, Commerciale, etc.
  description TEXT NOT NULL,
  client VARCHAR(255),
  surface VARCHAR(100),
  budget VARCHAR(100),
  duration VARCHAR(100),
  features JSON, -- Array di stringhe
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Tabella `project_images`

```sql
CREATE TABLE project_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_public_id VARCHAR(255) NOT NULL, -- Cloudinary
  title VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_cover (project_id, is_cover),
  INDEX idx_project_order (project_id, display_order)
);
```

#### Configurazioni Label/Status

```sql
-- Opzionale: tabella per gestire dinamicamente le label
CREATE TABLE project_labels (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7), -- HEX color per UI
  is_active BOOLEAN DEFAULT true
);

-- Seed data iniziali
INSERT INTO project_labels (name, color) VALUES
('Residenziale', '#3B82F6'),
('Commerciale', '#EF4444'),
('Industriale', '#10B981'),
('Ristrutturazione', '#F59E0B');
```

### 3. Backend API - Endpoints

#### API Pubbliche (Frontend)

```javascript
// GET /api/projects - Lista progetti pubblici
// Query params: ?label=Residenziale&status=Completato&limit=12&page=1

// GET /api/projects/:id - Dettaglio progetto con gallery
// Include tutte le immagini ordinate per display_order

// GET /api/projects/labels - Lista label disponibili per filtri
```

#### API Admin (Dashboard)

```javascript
// GET /api/admin/projects - Lista completa progetti
// POST /api/admin/projects - Crea nuovo progetto
// GET /api/admin/projects/:id - Dettaglio progetto per modifica
// PUT /api/admin/projects/:id - Aggiorna progetto
// DELETE /api/admin/projects/:id - Elimina progetto
// PUT /api/admin/projects/reorder - Riordina progetti

// Gestione immagini:
// POST /api/admin/projects/:id/images - Upload multiple immagini
// PUT /api/admin/projects/:id/images/:imageId - Aggiorna singola immagine
// DELETE /api/admin/projects/:id/images/:imageId - Elimina immagine
// PUT /api/admin/projects/:id/images/reorder - Riordina immagini
// PUT /api/admin/projects/:id/images/:imageId/cover - Imposta come cover
```

### 4. Backend Implementation

#### Controller Progetti Pubblici

```javascript
const getPublicProjects = async (req, res) => {
  const { label, status, limit = 12, page = 1 } = req.query;

  // Query con filtri opzionali
  // Include immagine cover per ogni progetto
  // Paginazione
  // Ordinamento per display_order
};

const getProjectDetail = async (req, res) => {
  const { id } = req.params;

  // Progetto completo con tutte le immagini
  // Ordinate per display_order
  // Include tutti i dettagli
};
```

#### Controller Admin

```javascript
const createProject = async (req, res) => {
  // Crea progetto base
  // Gestisce upload immagini multiple
  // Imposta prima immagine come cover automaticamente
  // Validazione completa dati
};

const updateProject = async (req, res) => {
  // Aggiorna dati progetto
  // Gestisce modifiche immagini
  // Mantiene integrità relazioni
};

const uploadProjectImages = async (req, res) => {
  // Upload multiple su Cloudinary
  // Salvataggio in database
  // Gestione ordering automatico
  // Response con URLs generate
};
```

### 5. Dashboard Admin - UI Implementation

#### Lista Progetti

```jsx
const ProjectsManagement = () => {
  return (
    <div className="projects-management">
      <div className="header">
        <h2>Gestione Progetti</h2>
        <button onClick={() => setShowCreateModal(true)}>Nuovo Progetto</button>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>
    </div>
  );
};
```

#### Form Progetto Completo

```jsx
const ProjectForm = ({ project, onSave, onCancel }) => {
  return (
    <form className="project-form">
      {/* Informazioni Base */}
      <section className="basic-info">
        <input name="title" placeholder="Titolo progetto" required />
        <input name="subtitle" placeholder="Sottotitolo" />
        <input name="year" type="number" placeholder="Anno" required />
        <input name="location" placeholder="Luogo" required />
        <select name="status" required>
          <option value="Completato">Completato</option>
          <option value="In corso">In corso</option>
          <option value="Progettazione">Progettazione</option>
        </select>
        <select name="label" required>
          <option value="Residenziale">Residenziale</option>
          <option value="Commerciale">Commerciale</option>
          {/* Dinamico da database */}
        </select>
      </section>

      {/* Descrizione */}
      <section className="description">
        <textarea
          name="description"
          placeholder="Descrizione dettagliata del progetto"
          required
        />
      </section>

      {/* Dettagli Progetto */}
      <section className="project-details">
        <input name="client" placeholder="Cliente" />
        <input name="surface" placeholder="Superficie (es. 450 mq)" />
        <input name="budget" placeholder="Budget (es. € 850.000)" />
        <input name="duration" placeholder="Durata (es. 18 mesi)" />
      </section>

      {/* Caratteristiche */}
      <section className="features">
        <FeaturesManager
          features={project?.features || []}
          onChange={handleFeaturesChange}
        />
      </section>

      {/* Gallery Immagini */}
      <section className="images-gallery">
        <ProjectImageManager
          projectId={project?.id}
          images={project?.images || []}
          onChange={handleImagesChange}
        />
      </section>
    </form>
  );
};
```

#### Gestione Immagini Avanzata

```jsx
const ProjectImageManager = ({ projectId, images, onChange }) => {
  return (
    <div className="image-manager">
      <div className="upload-area">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
        />
        <div className="drop-zone">
          Trascina immagini qui o clicca per selezionare
        </div>
      </div>

      <div className="images-list">
        {images.map((image, index) => (
          <div key={image.id} className="image-item">
            <img src={image.url} alt={image.title} />
            <input
              value={image.title}
              onChange={(e) => handleImageTitleChange(image.id, e.target.value)}
              placeholder="Titolo immagine"
            />
            <div className="image-actions">
              <button
                className={image.is_cover ? "active" : ""}
                onClick={() => handleSetCover(image.id)}
              >
                Copertina
              </button>
              <button onClick={() => handleDeleteImage(image.id)}>
                Elimina
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Gestione Caratteristiche

```jsx
const FeaturesManager = ({ features, onChange }) => {
  const [currentFeatures, setCurrentFeatures] = useState(features);

  const addFeature = () => {
    setCurrentFeatures([...currentFeatures, ""]);
  };

  const updateFeature = (index, value) => {
    const updated = [...currentFeatures];
    updated[index] = value;
    setCurrentFeatures(updated);
    onChange(updated.filter((f) => f.trim()));
  };

  const removeFeature = (index) => {
    const updated = currentFeatures.filter((_, i) => i !== index);
    setCurrentFeatures(updated);
    onChange(updated);
  };

  return (
    <div className="features-manager">
      <label>Caratteristiche del Progetto</label>
      {currentFeatures.map((feature, index) => (
        <div key={index} className="feature-item">
          <input
            value={feature}
            onChange={(e) => updateFeature(index, e.target.value)}
            placeholder="Inserisci caratteristica"
          />
          <button onClick={() => removeFeature(index)}>Rimuovi</button>
        </div>
      ))}
      <button type="button" onClick={addFeature}>
        + Aggiungi Caratteristica
      </button>
    </div>
  );
};
```

### 6. Frontend Pubblico - Refactoring

#### Lista Progetti Dinamica

```jsx
const ProjectsSection = () => {
  const [projects, setProjects] = useState([]);
  const [filters, setFilters] = useState({ label: "", status: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects(filters);
  }, [filters]);

  return (
    <div className="projects-section">
      {/* Filtri */}
      <ProjectFilters filters={filters} onFilterChange={setFilters} />

      {/* Griglia Progetti */}
      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={() => navigateToProject(project.id)}
          />
        ))}
      </div>
    </div>
  );
};
```

#### Card Progetto con Cover

```jsx
const ProjectCard = ({ project, onClick }) => {
  const coverImage =
    project.images.find((img) => img.is_cover) || project.images[0];

  return (
    <div className="project-card" onClick={onClick}>
      <div className="project-image">
        <img src={coverImage?.url} alt={project.title} />
        <div className="project-label">{project.label}</div>
        <div className="project-status">{project.status}</div>
      </div>

      <div className="project-info">
        <h3>{project.title}</h3>
        <p className="subtitle">{project.subtitle}</p>
        <div className="project-meta">
          <span>{project.year}</span>
          <span>{project.location}</span>
        </div>
      </div>
    </div>
  );
};
```

#### Dettaglio Progetto con Gallery

```jsx
const ProjectDetail = ({ projectId }) => {
  const [project, setProject] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="project-detail">
      {/* Gallery Principale */}
      <section className="project-gallery">
        <div className="main-image">
          <img
            src={project.images[selectedImage]?.url}
            alt={project.images[selectedImage]?.title}
          />
        </div>
        <div className="thumbnails">
          {project.images.map((image, index) => (
            <img
              key={image.id}
              src={image.url}
              alt={image.title}
              className={selectedImage === index ? "active" : ""}
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>
      </section>

      {/* Informazioni Progetto */}
      <section className="project-info">
        <div className="project-header">
          <h1>{project.title}</h1>
          <p className="subtitle">{project.subtitle}</p>
          <div className="project-badges">
            <span className="label">{project.label}</span>
            <span className="status">{project.status}</span>
          </div>
        </div>

        <div className="project-details">
          <div className="detail-item">
            <strong>Anno:</strong> {project.year}
          </div>
          <div className="detail-item">
            <strong>Luogo:</strong> {project.location}
          </div>
          <div className="detail-item">
            <strong>Cliente:</strong> {project.client}
          </div>
          <div className="detail-item">
            <strong>Superficie:</strong> {project.surface}
          </div>
          <div className="detail-item">
            <strong>Budget:</strong> {project.budget}
          </div>
          <div className="detail-item">
            <strong>Durata:</strong> {project.duration}
          </div>
        </div>

        <div className="project-description">
          <h3>Descrizione</h3>
          <p>{project.description}</p>
        </div>

        <div className="project-features">
          <h3>Caratteristiche</h3>
          <ul>
            {project.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
```

### 7. Cloudinary Integration

#### Gestione Gallery Immagini

```javascript
// Upload multiplo per progetti
const uploadProjectImages = async (files, projectId) => {
  const uploadPromises = files.map((file, index) =>
    cloudinary.uploader.upload(file, {
      folder: `projects/${projectId}`,
      public_id: `${projectId}_${Date.now()}_${index}`,
      transformation: [
        { width: 1200, height: 800, crop: "fill", quality: "auto" },
        { fetch_format: "auto" },
      ],
    })
  );

  return Promise.all(uploadPromises);
};

// Trasformazioni per diverse visualizzazioni
const getImageTransformations = {
  cover: "w_600,h_400,c_fill,q_auto,f_auto",
  thumbnail: "w_150,h_100,c_fill,q_auto,f_auto",
  detail: "w_1200,h_800,c_fill,q_auto,f_auto",
  fullsize: "w_1920,q_auto,f_auto",
};
```

### 8. Validazioni e Security

#### Validazioni Frontend

```javascript
const validateProject = (project) => {
  const errors = {};

  if (!project.title?.trim()) errors.title = "Titolo obbligatorio";
  if (!project.year || project.year < 1900) errors.year = "Anno non valido";
  if (!project.location?.trim()) errors.location = "Luogo obbligatorio";
  if (!project.status) errors.status = "Status obbligatorio";
  if (!project.label) errors.label = "Categoria obbligatoria";
  if (!project.description?.trim())
    errors.description = "Descrizione obbligatoria";

  return { isValid: Object.keys(errors).length === 0, errors };
};
```

#### Validazioni Backend

```javascript
const validateProjectData = (data) => {
  // Sanitizzazione input
  // Validazione campi obbligatori
  // Controllo lunghezza stringhe
  // Validazione anno/budget/superficie se numerici
  // Controllo formato immagini
};
```

### 9. Performance Optimizations

#### Lazy Loading e Caching

```javascript
// Lazy loading immagini gallery
const ImageGallery = ({ images }) => {
  return (
    <div className="gallery">
      {images.map((image) => (
        <img key={image.id} src={image.url} loading="lazy" decoding="async" />
      ))}
    </div>
  );
};

// Cache API responses
const useProjects = (filters) => {
  return useSWR(["projects", filters], () => fetchProjects(filters), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};
```

### 10. Migrazione Dati Esistenti

#### Script Migrazione

```javascript
const migrateStaticProjects = async () => {
  // Analizza contenuto statico esistente
  // Estrai dati strutturati
  // Crea progetti in database
  // Migra immagini su Cloudinary
  // Verifica integrità migrazione
};
```

## Implementazione Step-by-Step

### Fase 1: Analisi e Planning

1. Analisi dettagliata frontend statico esistente
2. Mapping di tutti i progetti presenti
3. Definizione schema database definitivo
4. Setup Cloudinary per gallery progetti

### Fase 2: Backend Development

1. Database schema e migrations
2. API endpoints completi
3. Sistema upload multiplo immagini
4. Validazioni e security

### Fase 3: Dashboard Admin

1. Lista progetti con preview
2. Form CRUD completo
3. Gestione gallery immagini avanzata
4. Sistema caratteristiche dinamico

### Fase 4: Frontend Pubblico

1. Lista progetti dinamica
2. Sistema filtri per categoria/status
3. Dettaglio progetto con gallery
4. Ottimizzazioni performance

### Fase 5: Migrazione e Testing

1. Script migrazione dati esistenti
2. Testing completo tutti i flussi
3. Performance optimization
4. SEO verification

## Note Critiche

- **Gallery**: Gestione copertina automatica (prima immagine se non specificata)
- **Performance**: Lazy loading per gallery con molte immagini
- **Responsive**: Gallery deve funzionare perfettamente su mobile
- **SEO**: Mantenere URLs friendly e meta tags appropriate
- **Backup**: Backup completo prima della migrazione
- **Ordering**: Possibilità di riordinare sia progetti che immagini

Inizia analizzando in dettaglio la struttura esistente per capire esattamente come sono organizzati i progetti statici attuali.
