# Claude Code - Implementazione Sistema Dinamico "Lavora con Noi"

## Obiettivo del Progetto

Trasformare la sezione "Lavora con Noi" da statica a dinamica con gestione CRUD dalla dashboard admin per posizioni lavorative aperte e candidature.

## Analisi Funzionale

### Frontend Pubblico - Sezione Lavora con Noi

**Funzionalità da analizzare:**

- Lista posizioni lavorative aperte
- Dettaglio singola posizione (requisiti, descrizione, benefits)
- Form di candidatura per ogni posizione
- Possibilità upload CV (PDF)
- Informazioni aziendali generali (cultura, ambiente di lavoro)
- Call-to-action per candidature spontanee

### Dashboard Admin - Gestione Posizioni e Candidature

**Funzionalità CRUD:**

- ➕ Aggiungere nuova posizione lavorativa
- ✏️ Modificare posizione esistente
- 🗑️ Eliminare/disattivare posizione
- 👁️ Visualizzare lista posizioni e loro status
- 📋 Gestione candidature ricevute
- 📄 Download CV candidati
- 📧 Gestione stato candidature (nuovo, valutato, contattato, rifiutato)

## Task di Implementazione

### 1. Analisi Dettagliata Frontend Statico

#### Mapping Struttura Esistente

**Analizza e documenta:**

- Layout sezione lavora con noi
- Lista posizioni (se presenti) o sezione generica
- Form di candidatura esistente
- Campi richiesti per candidatura
- Gestione upload CV
- Responsive behavior
- Stili CSS utilizzati
- Messaggi di conferma/errore

#### Identificazione Componenti

```javascript
// Componenti da mappare:
- JobsList (lista posizioni aperte)
- JobCard (anteprima singola posizione)
- JobDetail (dettaglio posizione con form candidatura)
- ApplicationForm (form candidatura)
- CVUpload (upload curriculum)
- CompanyInfo (informazioni aziendali)
```

#### Estrazione Dati Esistenti

```javascript
// Per ogni posizione lavorativa statica (se presente):
- title: "Nome posizione (es. Sviluppatore Frontend)"
- department: "Dipartimento (es. IT, Design, Marketing)"
- location: "Sede (es. Milano, Remote, Hybrid)"
- type: "Tipologia (es. Full-time, Part-time, Stage)"
- level: "Livello (es. Junior, Senior, Lead)"
- description: "Descrizione completa del ruolo"
- requirements: "Requisiti richiesti"
- nice_to_have: "Requisiti preferenziali"
- benefits: "Benefit offerti"
```

### 2. Database Schema (SQL per Supabase)

#### Tabella `job_positions`

```sql
-- Posizioni lavorative
CREATE TABLE job_positions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  employment_type VARCHAR(50) NOT NULL, -- Full-time, Part-time, Contract, Internship
  experience_level VARCHAR(50) NOT NULL, -- Junior, Mid, Senior, Lead
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  nice_to_have TEXT,
  benefits TEXT,
  salary_range VARCHAR(100), -- es. "€ 30.000 - € 45.000"
  is_active BOOLEAN DEFAULT true,
  applications_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per performance
CREATE INDEX idx_jobs_active ON job_positions(is_active, display_order);
CREATE INDEX idx_jobs_department ON job_positions(department, is_active);
CREATE INDEX idx_jobs_slug ON job_positions(slug);
```

#### Tabella `job_applications`

```sql
-- Candidature ricevute
CREATE TABLE job_applications (
  id SERIAL PRIMARY KEY,
  job_position_id INTEGER REFERENCES job_positions(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  cv_url VARCHAR(500), -- Cloudinary URL
  cv_public_id VARCHAR(255), -- Cloudinary reference
  cover_letter TEXT,
  linkedin_profile VARCHAR(255),
  portfolio_url VARCHAR(255),
  status VARCHAR(50) DEFAULT 'new', -- new, reviewed, contacted, interview, hired, rejected
  admin_notes TEXT, -- Note interne per l'admin
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indici per gestione candidature
CREATE INDEX idx_applications_job ON job_applications(job_position_id, applied_at DESC);
CREATE INDEX idx_applications_status ON job_applications(status, applied_at DESC);
CREATE INDEX idx_applications_email ON job_applications(email);
```

#### Trigger aggiornamento contatori

```sql
-- Trigger per aggiornare contatore candidature
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

CREATE TRIGGER trigger_update_applications_count
  AFTER INSERT OR DELETE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_applications_count();

-- Trigger updated_at per entrambe le tabelle
CREATE TRIGGER update_job_positions_updated_at
  BEFORE UPDATE ON job_positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Seed Data di Esempio

```sql
-- Posizioni di esempio
INSERT INTO job_positions (title, slug, department, location, employment_type, experience_level, description, requirements, benefits) VALUES
(
  'Sviluppatore Frontend React',
  'sviluppatore-frontend-react',
  'IT',
  'Milano / Remote',
  'Full-time',
  'Mid',
  'Cerchiamo uno sviluppatore frontend esperto in React per unirsi al nostro team di sviluppo...',
  'Esperienza 2+ anni con React, JavaScript ES6+, HTML5, CSS3. Conoscenza Git e metodologie Agile.',
  'Smart working, buoni pasto, formazione continua, ambiente giovane e dinamico'
),
(
  'UX/UI Designer',
  'ux-ui-designer',
  'Design',
  'Milano',
  'Full-time',
  'Junior',
  'Stiamo cercando un designer creativo per migliorare l''esperienza utente dei nostri prodotti...',
  'Laurea in Design o campo correlato. Conoscenza Figma, Adobe Creative Suite. Portfolio richiesto.',
  'Formazione, ambiente creativo, progetti innovativi, crescita professionale'
);
```

### 3. Backend API - Endpoints

#### API Pubbliche (Frontend)

```javascript
// GET /api/jobs - Lista posizioni attive
// Query params: ?department=IT&type=Full-time&location=Milano

// GET /api/jobs/:slug - Dettaglio posizione per candidatura

// POST /api/jobs/:slug/apply - Invio candidatura
// Include upload CV e dati candidato

// GET /api/jobs/departments - Lista dipartimenti per filtri
// GET /api/jobs/locations - Lista sedi per filtri
```

#### API Admin (Dashboard)

```javascript
// Gestione Posizioni:
// GET /api/admin/jobs - Lista completa posizioni
// POST /api/admin/jobs - Crea nuova posizione
// GET /api/admin/jobs/:id - Dettaglio posizione per modifica
// PUT /api/admin/jobs/:id - Aggiorna posizione
// DELETE /api/admin/jobs/:id - Elimina posizione
// PUT /api/admin/jobs/reorder - Riordina posizioni

// Gestione Candidature:
// GET /api/admin/applications - Lista candidature con filtri
// GET /api/admin/applications/:id - Dettaglio candidatura
// PUT /api/admin/applications/:id/status - Aggiorna status candidatura
// DELETE /api/admin/applications/:id - Elimina candidatura
// GET /api/admin/applications/:id/cv - Download CV candidato
```

### 4. Backend Implementation

#### Controller Posizioni Pubbliche

```javascript
const getActiveJobs = async (req, res) => {
  const { department, employment_type, location } = req.query;

  let query = supabase
    .from("job_positions")
    .select(
      "id, title, slug, department, location, employment_type, experience_level, description, benefits, applications_count"
    )
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (department) query = query.eq("department", department);
  if (employment_type) query = query.eq("employment_type", employment_type);
  if (location) query = query.ilike("location", `%${location}%`);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

const getJobBySlug = async (req, res) => {
  const { slug } = req.params;

  const { data: job, error } = await supabase
    .from("job_positions")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !job) {
    return res.status(404).json({ error: "Posizione non trovata" });
  }

  res.json(job);
};

const submitApplication = async (req, res) => {
  const { slug } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    cover_letter,
    linkedin_profile,
    portfolio_url,
  } = req.body;

  // Trova posizione
  const { data: job } = await supabase
    .from("job_positions")
    .select("id")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!job) {
    return res.status(404).json({ error: "Posizione non trovata" });
  }

  // Controlla candidatura duplicata
  const { data: existing } = await supabase
    .from("job_applications")
    .select("id")
    .eq("job_position_id", job.id)
    .eq("email", email)
    .single();

  if (existing) {
    return res
      .status(400)
      .json({ error: "Hai già candidato per questa posizione" });
  }

  // Gestisci upload CV se presente
  let cv_url = null;
  let cv_public_id = null;

  if (req.file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "job_applications",
        resource_type: "auto",
        public_id: `cv_${email}_${Date.now()}`,
      });

      cv_url = uploadResult.secure_url;
      cv_public_id = uploadResult.public_id;
    } catch (uploadError) {
      return res.status(500).json({ error: "Errore upload CV" });
    }
  }

  // Salva candidatura
  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      job_position_id: job.id,
      first_name,
      last_name,
      email,
      phone,
      cv_url,
      cv_public_id,
      cover_letter,
      linkedin_profile,
      portfolio_url,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Invia email di conferma (opzionale)
  // await sendApplicationConfirmationEmail(email, first_name, job.title);

  res.status(201).json({
    message: "Candidatura inviata con successo",
    application_id: data.id,
  });
};
```

#### Controller Admin

```javascript
const getAdminJobs = async (req, res) => {
  const { department, status } = req.query;

  let query = supabase
    .from("job_positions")
    .select("*")
    .order("display_order", { ascending: true });

  if (department) query = query.eq("department", department);
  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

const createJob = async (req, res) => {
  const {
    title,
    slug,
    department,
    location,
    employment_type,
    experience_level,
    description,
    requirements,
    nice_to_have,
    benefits,
    salary_range,
  } = req.body;

  // Validazione slug univoco
  const { data: existing } = await supabase
    .from("job_positions")
    .select("id")
    .eq("slug", slug)
    .single();

  if (existing) {
    return res.status(400).json({ error: "Slug già esistente" });
  }

  const { data, error } = await supabase
    .from("job_positions")
    .insert({
      title,
      slug,
      department,
      location,
      employment_type,
      experience_level,
      description,
      requirements,
      nice_to_have,
      benefits,
      salary_range,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data);
};

const getApplications = async (req, res) => {
  const { job_id, status, page = 1, limit = 20 } = req.query;

  let query = supabase
    .from("job_applications")
    .select(
      `
      *,
      job_positions:job_position_id (
        title,
        department
      )
    `
    )
    .order("applied_at", { ascending: false });

  if (job_id) query = query.eq("job_position_id", job_id);
  if (status) query = query.eq("status", status);

  // Paginazione
  const offset = (page - 1) * limit;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

const updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;

  const { data, error } = await supabase
    .from("job_applications")
    .update({ status, admin_notes })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};
```

### 5. Dashboard Admin - UI Implementation

#### Gestione Posizioni Lavorative

```jsx
const JobsManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({ department: "", status: "all" });

  return (
    <div className="jobs-management">
      <div className="header">
        <h2>Gestione Posizioni Lavorative</h2>
        <button onClick={() => setShowCreateModal(true)}>
          Nuova Posizione
        </button>
      </div>

      {/* Filtri */}
      <div className="filters">
        <select
          value={filters.department}
          onChange={(e) =>
            setFilters({ ...filters, department: e.target.value })
          }
        >
          <option value="">Tutti i dipartimenti</option>
          <option value="IT">IT</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Sales">Sales</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Tutte</option>
          <option value="active">Attive</option>
          <option value="inactive">Inattive</option>
        </select>
      </div>

      {/* Lista Posizioni */}
      <div className="jobs-list">
        {jobs.map((job) => (
          <JobAdminCard
            key={job.id}
            job={job}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onViewApplications={() => navigateToApplications(job.id)}
          />
        ))}
      </div>

      {showCreateModal && (
        <JobForm
          onSave={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
```

#### Form Posizione Lavorativa

```jsx
const JobForm = ({ job, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: job?.title || "",
    slug: job?.slug || "",
    department: job?.department || "",
    location: job?.location || "",
    employment_type: job?.employment_type || "Full-time",
    experience_level: job?.experience_level || "Mid",
    description: job?.description || "",
    requirements: job?.requirements || "",
    nice_to_have: job?.nice_to_have || "",
    benefits: job?.benefits || "",
    salary_range: job?.salary_range || "",
    is_active: job?.is_active ?? true,
  });

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
    <div className="modal-overlay">
      <div className="modal-content">
        <form className="job-form" onSubmit={handleSubmit}>
          <h3>{job ? "Modifica Posizione" : "Nuova Posizione"}</h3>

          {/* Informazioni Base */}
          <section className="basic-info">
            <div className="form-group">
              <label>Titolo Posizione *</label>
              <input
                type="text"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="es. Sviluppatore Frontend React"
                required
              />
            </div>

            <div className="form-group">
              <label>Slug URL *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="sviluppatore-frontend-react"
                required
              />
              <small>URL: /lavora-con-noi/{formData.slug}</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Dipartimento *</label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  required
                >
                  <option value="">Seleziona dipartimento</option>
                  <option value="IT">IT</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div className="form-group">
                <label>Sede *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="es. Milano / Remote"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo Contratto *</label>
                <select
                  value={formData.employment_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employment_type: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Stage</option>
                </select>
              </div>

              <div className="form-group">
                <label>Livello Esperienza *</label>
                <select
                  value={formData.experience_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experience_level: e.target.value,
                    })
                  }
                  required
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid">Mid</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Range Salariale</label>
              <input
                type="text"
                value={formData.salary_range}
                onChange={(e) =>
                  setFormData({ ...formData, salary_range: e.target.value })
                }
                placeholder="es. € 30.000 - € 45.000"
              />
            </div>
          </section>

          {/* Descrizioni */}
          <section className="descriptions">
            <div className="form-group">
              <label>Descrizione Posizione *</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrivi il ruolo, le responsabilità principali..."
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label>Requisiti Richiesti *</label>
              <textarea
                value={formData.requirements}
                onChange={(e) =>
                  setFormData({ ...formData, requirements: e.target.value })
                }
                placeholder="Elenca i requisiti obbligatori..."
                rows={4}
                required
              />
            </div>

            <div className="form-group">
              <label>Requisiti Preferenziali</label>
              <textarea
                value={formData.nice_to_have}
                onChange={(e) =>
                  setFormData({ ...formData, nice_to_have: e.target.value })
                }
                placeholder="Requisiti non obbligatori ma apprezzati..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Benefits e Vantaggi</label>
              <textarea
                value={formData.benefits}
                onChange={(e) =>
                  setFormData({ ...formData, benefits: e.target.value })
                }
                placeholder="Smart working, formazione, benefit aziendali..."
                rows={3}
              />
            </div>
          </section>

          {/* Opzioni */}
          <section className="options">
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                />
                Posizione attiva (visibile sul sito)
              </label>
            </div>
          </section>

          {/* Azioni */}
          <div className="form-actions">
            <button type="button" onClick={onCancel}>
              Annulla
            </button>
            <button type="submit">
              {job ? "Aggiorna Posizione" : "Crea Posizione"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
```

#### Gestione Candidature

```jsx
const ApplicationsManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    job_id: "",
    status: "all",
    page: 1,
  });
  const [selectedApplication, setSelectedApplication] = useState(null);

  return (
    <div className="applications-management">
      <div className="header">
        <h2>Gestione Candidature</h2>
        <div className="stats">
          <span>Nuove: {getCountByStatus("new")}</span>
          <span>In valutazione: {getCountByStatus("reviewed")}</span>
          <span>Contattate: {getCountByStatus("contacted")}</span>
        </div>
      </div>

      {/* Filtri */}
      <div className="filters">
        <select
          value={filters.job_id}
          onChange={(e) => setFilters({ ...filters, job_id: e.target.value })}
        >
          <option value="">Tutte le posizioni</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">Tutti gli stati</option>
          <option value="new">Nuove</option>
          <option value="reviewed">Valutate</option>
          <option value="contacted">Contattate</option>
          <option value="interview">Colloquio</option>
          <option value="hired">Assunte</option>
          <option value="rejected">Rifiutate</option>
        </select>
      </div>

      {/* Lista Candidature */}
      <div className="applications-list">
        {applications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onClick={() => setSelectedApplication(application)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {/* Dettaglio Candidatura */}
      {selectedApplication && (
        <ApplicationDetail
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onStatusChange={handleStatusChange}
          onDownloadCV={handleDownloadCV}
        />
      )}
    </div>
  );
};
```

#### Card Candidatura

```jsx
const ApplicationCard = ({ application, onClick, onStatusChange }) => {
  const getStatusColor = (status) => {
    const colors = {
      new: "#3B82F6",
      reviewed: "#F59E0B",
      contacted: "#10B981",
      interview: "#8B5CF6",
      hired: "#059669",
      rejected: "#EF4444",
    };
    return colors[status] || "#6B7280";
  };

  return (
    <div className="application-card" onClick={onClick}>
      <div className="applicant-info">
        <h4>
          {application.first_name} {application.last_name}
        </h4>
        <p>{application.email}</p>
        <span className="job-title">{application.job_positions.title}</span>
      </div>

      <div className="application-meta">
        <div className="applied-date">
          {new Date(application.applied_at).toLocaleDateString("it-IT")}
        </div>

        <div className="status-section">
          <select
            value={application.status}
            onChange={(e) => {
              e.stopPropagation();
              onStatusChange(application.id, e.target.value);
            }}
            style={{ borderColor: getStatusColor(application.status) }}
          >
            <option value="new">Nuova</option>
            <option value="reviewed">Valutata</option>
            <option value="contacted">Contattata</option>
            <option value="interview">Colloquio</option>
            <option value="hired">Assunta</option>
            <option value="rejected">Rifiutata</option>
          </select>
        </div>

        {application.cv_url && <div className="cv-indicator">📄 CV</div>}
      </div>
    </div>
  );
};
```

### 6. Frontend Pubblico - Refactoring

#### Lista Posizioni

```jsx
const JobsSection = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    department: '',
    employment_type: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  return (
    <div className="jobs-section">
      {/* Intro Aziendale */}
      <section className="company-intro">
        <h1>Lavora con Noi</h1>
        <p>Unisciti al nostro team e costruisci il futuro insieme a noi...</p>
      </section>

      {/* Filt
```
