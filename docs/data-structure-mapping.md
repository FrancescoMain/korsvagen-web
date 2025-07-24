# Mappatura Dati Statici vs Dinamici - KORSVAGEN

## Panoramica

Questo documento identifica tutti i dati attualmente hardcoded nel progetto e propone la struttura per renderli dinamici tramite API.

## 1. Dati di Contatto

### Stato Attuale (Statico)

**File**: `src/data/contactData.ts`

```typescript
{
  company: "KORSVAGEN S.R.L.",
  address: { street: "Via Santa Maria la Carità 18", city: "Scafati (SA)" },
  phone: "+39 349 429 8547",
  email: "korsvagensrl@gmail.com",
  social: { instagram: "...", linkedin: "..." },
  business: { rea: "1071429", piva: "09976601212" }
}
```

### Struttura API Proposta

```typescript
interface CompanyInfo {
  id: string;
  company_name: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  contacts: {
    phone: string;
    email: string;
    fax?: string;
  };
  social_media: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  };
  business_info: {
    rea: string;
    vat_number: string;
    tax_code: string;
  };
  opening_hours: Array<{
    day: string;
    hours: string;
  }>;
}
```

**Endpoint**: `GET /api/company/info`

---

## 2. Team/Staff

### Stato Attuale (Statico)

**File**: `src/pages/TeamPage.tsx` (array hardcoded)

```typescript
// 6 membri con dati completi embedded nel componente
const teamMembers = [
  {
    id: "marco-rossi",
    name: "Marco Rossi",
    role: "Fondatore & CEO",
    // ... dati completi hardcoded
  },
];
```

### Struttura API Proposta

```typescript
interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  short_description: string;
  full_description: string;
  skills: string[];
  experience: string;
  education: string;
  photo_url?: string;
  cv_download_url?: string;
  contact_email?: string;
  linkedin_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
```

**Endpoints**:

- `GET /api/team/members` - Lista completa
- `GET /api/team/members/{id}` - Dettaglio singolo membro
- `POST /api/team/members` - Aggiungi membro (admin)
- `PUT /api/team/members/{id}` - Modifica membro (admin)
- `DELETE /api/team/members/{id}` - Rimuovi membro (admin)

---

## 3. Servizi

### Stato Attuale (Statico)

**File**: `src/pages/ServicesPage.tsx`, `src/pages/HomePage.tsx`

```typescript
// Hardcoded in JSX
<div className="service-card">
  <h3>Progettazione</h3>
  <p>Dall'idea al progetto definitivo</p>
  <ul>
    <li>Progettazione Architettonica</li>
    // ... lista hardcoded
  </ul>
</div>
```

### Struttura API Proposta

```typescript
interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  icon_url?: string;
  image_url?: string;
  video_url?: string;
  category: string;
  is_featured: boolean;
  display_order: number;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
}
```

**Endpoints**:

- `GET /api/services` - Lista servizi
- `GET /api/services/categories` - Categorie servizi
- `GET /api/services/{id}` - Dettaglio servizio
- `GET /api/services/featured` - Servizi in evidenza

---

## 4. Progetti/Portfolio

### Stato Attuale (Statico)

**File**: `src/pages/ProjectDetailPage.tsx`, `src/pages/HomePage.tsx`

```typescript
// Mock data progetti
const projects = [
  {
    title: "Villa Moderna",
    location: "Milano, Lombardia",
    description: "...",
    image: "unsplash URL",
  },
];
```

### Struttura API Proposta

```typescript
interface Project {
  id: string;
  title: string;
  subtitle?: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  description: string;
  client_name?: string;
  project_type: string;
  status: "planning" | "in_progress" | "completed";
  start_date: string;
  end_date?: string;
  budget_range?: string;
  square_meters?: number;
  team_members: string[]; // Team member IDs
  services_used: string[]; // Service IDs
  gallery: ProjectImage[];
  technical_specs: {
    key: string;
    value: string;
  }[];
  is_featured: boolean;
  is_public: boolean;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectImage {
  id: string;
  url: string;
  title: string;
  alt_text: string;
  display_order: number;
  is_cover: boolean;
}
```

**Endpoints**:

- `GET /api/projects` - Lista progetti (pubblici)
- `GET /api/projects/{id}` - Dettaglio progetto
- `GET /api/projects/featured` - Progetti in evidenza
- `GET /api/projects/{id}/gallery` - Gallery progetto

---

## 5. News/Articoli

### Stato Attuale (Statico)

**File**: `src/pages/NewsPage.tsx`, `src/pages/NewsDetailPage.tsx`

```typescript
// Mock data news
const allNews = [
  {
    id: 1,
    title: "...",
    content: "...",
    // dati hardcoded
  },
];
```

### Struttura API Proposta

```typescript
interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  featured_image_url?: string;
  category: string;
  tags: string[];
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  published_at: string;
  meta_description?: string;
  reading_time_minutes?: number;
  view_count?: number;
  created_at: string;
  updated_at: string;
}

interface NewsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
}
```

**Endpoints**:

- `GET /api/news` - Lista articoli (pubblicati)
- `GET /api/news/{id}` - Dettaglio articolo
- `GET /api/news/featured` - Articoli in evidenza
- `GET /api/news/categories` - Categorie news

---

## 6. Offerte Lavoro/Careers

### Stato Attuale (Statico)

**File**: `src/pages/CareersPage.tsx`

```typescript
// Benefits e positions hardcoded
const benefits = [{ icon: "💼", title: "...", description: "..." }];
const positions = [{ id: 1, title: "...", type: "...", description: "..." }];
```

### Struttura API Proposta

```typescript
interface JobPosition {
  id: string;
  title: string;
  department: string;
  employment_type: "full_time" | "part_time" | "contract" | "internship";
  location: string;
  remote_allowed: boolean;
  experience_level: "entry" | "mid" | "senior" | "lead";
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  salary_range?: {
    min: number;
    max: number;
    currency: string;
  };
  application_deadline?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CompanyBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  display_order: number;
}
```

**Endpoints**:

- `GET /api/careers/positions` - Posizioni aperte
- `GET /api/careers/benefits` - Benefici aziendali
- `POST /api/careers/applications` - Invio candidatura

---

## 7. Certificazioni e Qualifiche

### Stato Attuale (Statico)

**File**: `src/pages/AboutPage.tsx`

```typescript
// Hardcoded nel JSX della sezione certificazioni
<div className="certification-item">
  <div className="certification-icon">ISO</div>
  <h3>ISO 9001</h3>
  <p>Certificazione di qualità...</p>
</div>
```

### Struttura API Proposta

```typescript
interface Certification {
  id: string;
  name: string;
  short_code: string;
  description: string;
  issuing_authority: string;
  issue_date: string;
  expiry_date?: string;
  certificate_number?: string;
  certificate_url?: string;
  icon_code: string;
  is_active: boolean;
  display_order: number;
}
```

**Endpoints**:

- `GET /api/certifications` - Lista certificazioni attive

---

## 8. Dati Aziendali Generali

### Stato Attuale (Statico)

**File**: Vari (AboutPage, HomePage, etc.)

```typescript
// Statistiche hardcoded
<div className="stat-card">
  <div className="number">15+</div>
  <div className="label">Anni di Esperienza</div>
</div>
```

### Struttura API Proposta

```typescript
interface CompanyStats {
  years_experience: number;
  projects_completed: number;
  satisfied_clients: number;
  team_members: number;
  // Aggiornato automaticamente o manualmente
}

interface CompanyInfo {
  mission: string;
  vision: string;
  history: string;
  founding_year: number;
  headquarters_location: string;
}
```

**Endpoints**:

- `GET /api/company/stats` - Statistiche aziendali
- `GET /api/company/about` - Informazioni aziendali

---

## Piano di Migrazione Prioritizzato

### Fase 1 - Dati Critici (Settimana 1-2)

1. **Dati di contatto** - Più frequentemente aggiornati
2. **Team members** - Gestione HR

### Fase 2 - Contenuti Marketing (Settimana 3-4)

3. **Servizi** - Per aggiornamenti marketing
4. **News/Articoli** - Content management

### Fase 3 - Portfolio (Settimana 5-6)

5. **Progetti** - Showcase aziendale
6. **Certificazioni** - Credibilità

### Fase 4 - HR (Settimana 7-8)

7. **Offerte lavoro** - Gestione HR
8. **Statistiche aziendali** - Dashboard admin

## Considerazioni Tecniche

### Backend Requirements

- **Database**: PostgreSQL o MongoDB
- **File Storage**: AWS S3 o CloudFlare R2
- **Image Processing**: Sharp o Cloudinary
- **Authentication**: JWT per admin panel

### Frontend Adaptations

- **State Management**: Context API + React Query
- **Loading States**: Skeleton components
- **Error Handling**: Error boundaries
- **Caching**: React Query cache
- **Admin Panel**: Separare applicazione o sezione protetta

### API Design Principles

- **RESTful**: Standard REST endpoints
- **Pagination**: Per liste lunghe
- **Filtering**: Query parameters per filtraggio
- **Versioning**: /api/v1/ prefix
- **Documentation**: OpenAPI/Swagger
