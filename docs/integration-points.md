# Punti di Integrazione API - KORSVAGEN

## Panoramica

Questo documento identifica tutti i punti del codice dove integrare le chiamate API per sostituire i dati statici, includendo modifiche specifiche ai componenti e strategie di implementazione.

## 1. Header Component

### File: `src/components/layout/Header.tsx`
### Integrazione: Dati di contatto dinamici

**Modifica Richiesta:**
```typescript
// Attuale: Import statico
import { contactData } from '../../data/contactData';

// Futuro: API call
const { data: contactInfo } = useQuery(['company-info'], fetchCompanyInfo);
```

**API Endpoint**: `GET /api/company/info`

---

## 2. Footer Component

### File: `src/components/layout/Footer.tsx`
### Integrazione: Informazioni aziendali + link sociali

**Modifica Richiesta:**
```typescript
// Sostituire dati statici con:
const { data: companyInfo } = useQuery(['company-info'], fetchCompanyInfo);
const { data: socialLinks } = useQuery(['social-links'], fetchSocialLinks);
```

**API Endpoints**: 
- `GET /api/company/info`
- `GET /api/company/social-links`

---

## 3. HomePage - Sezioni Multiple

### File: `src/pages/HomePage.tsx`

#### 3.1 Sezione Servizi
**Linea di codice**: ~1900-2000 (services array)
```typescript
// Attuale: Array hardcoded
const services = [
  { title: "Ristrutturazioni", description: "..." }
];

// Futuro: API call
const { data: services } = useQuery(['services', 'featured'], 
  () => fetchFeaturedServices()
);
```

#### 3.2 Sezione Progetti
**Linea di codice**: ~1726-1750
```typescript
// Attuale: Array hardcoded
const projects = [
  { title: "Villa Moderna", location: "Milano" }
];

// Futuro: API call
const { data: projects } = useQuery(['projects', 'featured'],
  () => fetchFeaturedProjects()
);
```

#### 3.3 Sezione News
**Linea di codice**: ~1750-1780
```typescript
// Attuale: Array hardcoded
const news = [
  { date: "15 Gen 2024", title: "..." }
];

// Futuro: API call
const { data: news } = useQuery(['news', 'recent'],
  () => fetchRecentNews(3) // Ultimi 3 articoli
);
```

#### 3.4 Sezione Recensioni
**Linea di codice**: ~1400-1500
```typescript
// Futuro: Nuova sezione da implementare
const { data: reviews } = useQuery(['reviews', 'featured'],
  () => fetchFeaturedReviews()
);
```

**API Endpoints HomePage**:
- `GET /api/services/featured`
- `GET /api/projects/featured`
- `GET /api/news/recent?limit=3`
- `GET /api/reviews/featured`

---

## 4. AboutPage - Dati Aziendali

### File: `src/pages/AboutPage.tsx`

#### 4.1 Sezione Storia (linea ~940-950)
```typescript
// Attuale: Testo hardcoded
<p>KORSVAGEN S.R.L. nasce dalla passione...</p>

// Futuro: API call
const { data: companyInfo } = useQuery(['company', 'about'],
  fetchCompanyAbout
);
// Utilizzare: companyInfo.history
```

#### 4.2 Mission & Vision (linea ~955-970)
```typescript
// Attuale: Testo hardcoded in JSX
// Futuro: Da companyInfo.mission e companyInfo.vision
```

#### 4.3 Statistiche (linea ~985-995)
```typescript
// Attuale: Numeri hardcoded
<div className="number">15+</div>
<div className="number">200+</div>

// Futuro: API call
const { data: stats } = useQuery(['company', 'stats'],
  fetchCompanyStats
);
```

#### 4.4 Certificazioni (linea ~1020-1100)
```typescript
// Attuale: JSX hardcoded per ogni certificazione
// Futuro: Map dinamico
const { data: certifications } = useQuery(['certifications'],
  fetchCertifications
);

// Render dinamico:
{certifications?.map(cert => (
  <div key={cert.id} className="certification-item">
    <div className="certification-icon">{cert.short_code}</div>
    <h3>{cert.name}</h3>
    <p>{cert.description}</p>
  </div>
))}
```

**API Endpoints AboutPage**:
- `GET /api/company/about`
- `GET /api/company/stats`
- `GET /api/certifications`

---

## 5. ServicesPage - Catalogo Servizi

### File: `src/pages/ServicesPage.tsx`

#### 5.1 Grid Servizi (linea ~340-470)
```typescript
// Attuale: JSX hardcoded per ogni service card
<div className="service-card">
  <h3>Progettazione</h3>
  <ul>
    <li>Progettazione Architettonica</li>
    // ... lista hardcoded
  </ul>
</div>

// Futuro: Render dinamico
const { data: services } = useQuery(['services'], fetchAllServices);

{services?.map(service => (
  <div key={service.id} className="service-card">
    <div className="card-header">
      <h3>{service.title}</h3>
      <p className="subtitle">{service.subtitle}</p>
    </div>
    <div className="card-content">
      <p className="description">{service.description}</p>
      <ul>
        {service.features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
    </div>
  </div>
))}
```

**API Endpoints ServicesPage**:
- `GET /api/services`
- `GET /api/services/categories`

---

## 6. TeamPage - Gestione Team

### File: `src/pages/TeamPage.tsx`

#### 6.1 Array Team Members (linea ~15-200)
```typescript
// Attuale: Array hardcoded di 6 membri
const teamMembers = [
  {
    id: "marco-rossi",
    name: "Marco Rossi",
    // ... tutti i dati hardcoded
  }
];

// Futuro: API call
const { data: teamMembers } = useQuery(['team', 'members'],
  fetchTeamMembers
);
```

#### 6.2 Modal Dettagli (linea ~220-250)
```typescript
// Il selectedMember sarà dinamico basato sui dati API
// Nessuna modifica logica necessaria, solo source dati
```

**API Endpoints TeamPage**:
- `GET /api/team/members`
- `GET /api/team/members/{id}` (per dettagli modal)

---

## 7. ProjectsPage & ProjectDetailPage

### File: `src/pages/ProjectsPage.tsx`
### File: `src/pages/ProjectDetailPage.tsx`

#### 7.1 Lista Progetti (ProjectsPage)
```typescript
// Attuale: Mockup o placeholder
// Futuro: API call
const { data: projects } = useQuery(['projects'], fetchAllProjects);
const { data: categories } = useQuery(['project-categories'], fetchProjectCategories);
```

#### 7.2 Dettaglio Progetto (ProjectDetailPage)
```typescript
// Attuale: Mock data (linea ~748+)
const projectImages = [
  { id: 1, title: "Vista frontale", url: "..." }
];

// Futuro: API call basato su projectId da URL
const { projectId } = useParams();
const { data: project } = useQuery(['projects', projectId],
  () => fetchProjectById(projectId)
);
const { data: projectGallery } = useQuery(['projects', projectId, 'gallery'],
  () => fetchProjectGallery(projectId)
);
```

**API Endpoints Projects**:
- `GET /api/projects`
- `GET /api/projects/{id}`
- `GET /api/projects/{id}/gallery`
- `GET /api/project-categories`

---

## 8. NewsPage & NewsDetailPage

### File: `src/pages/NewsPage.tsx`
### File: `src/pages/NewsDetailPage.tsx`

#### 8.1 Lista News (NewsPage)
```typescript
// Attuale: Non implementato completamente
// Futuro: API call
const { data: news } = useQuery(['news'], 
  () => fetchNews({ page: 1, limit: 10 })
);
const { data: categories } = useQuery(['news-categories'], fetchNewsCategories);
```

#### 8.2 Dettaglio News (NewsDetailPage)
```typescript
// Attuale: Mock data (linea ~507+)
const allNews = [
  { id: 1, title: "...", content: "..." }
];

// Futuro: API call basato su newsId da URL
const { newsId } = useParams();
const { data: article } = useQuery(['news', newsId],
  () => fetchNewsById(newsId)
);
const { data: relatedNews } = useQuery(['news', 'related', newsId],
  () => fetchRelatedNews(newsId)
);
```

**API Endpoints News**:
- `GET /api/news`
- `GET /api/news/{id}`
- `GET /api/news/categories`
- `GET /api/news/related/{id}`

---

## 9. CareersPage - Offerte Lavoro

### File: `src/pages/CareersPage.tsx`

#### 9.1 Benefits Aziendali (linea ~962+)
```typescript
// Attuale: Array hardcoded
const benefits = [
  { icon: "💼", title: "Ambiente Stimolante", description: "..." }
];

// Futuro: API call
const { data: benefits } = useQuery(['company', 'benefits'],
  fetchCompanyBenefits
);
```

#### 9.2 Posizioni Aperte (linea ~975+)
```typescript
// Attuale: Array hardcoded
const positions = [
  { id: 1, title: "Ingegnere Strutturale", type: "Full-time" }
];

// Futuro: API call
const { data: positions } = useQuery(['careers', 'positions'],
  fetchOpenPositions
);
```

**API Endpoints CareersPage**:
- `GET /api/company/benefits`
- `GET /api/careers/positions`

---

## 10. ContactPage - Gestione Contatti

### File: `src/pages/ContactPage.tsx`

#### 10.1 Informazioni di Contatto (linea ~750+)
```typescript
// Attuale: Import da contactData.ts
import { contactData } from "../data/contactData";

// Futuro: API call
const { data: contactInfo } = useQuery(['company', 'contact'],
  fetchContactInfo
);
```

#### 10.2 Form di Contatto
```typescript
// Attuale: Non implementato (placeholder)
// Futuro: Implementare submission
const submitContactForm = useMutation(postContactForm, {
  onSuccess: () => {
    // Show success message
  },
  onError: () => {
    // Show error message
  }
});
```

#### 10.3 Orari di Apertura (linea ~765-775)
```typescript
// Attuale: Hardcoded
// Futuro: Da API contactInfo.opening_hours
{contactInfo?.opening_hours?.map(schedule => (
  <div key={schedule.day} className="hours-item">
    <span className="day">{schedule.day}</span>
    <span className="time">{schedule.hours}</span>
  </div>
))}
```

**API Endpoints ContactPage**:
- `GET /api/company/contact`
- `POST /api/contact/form`

---

## Strategia di Implementazione

### 1. Setup Base (Settimana 1)

#### 1.1 Installare React Query
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

#### 1.2 Setup QueryClient
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minuti
      cacheTime: 10 * 60 * 1000, // 10 minuti
    },
  },
});

// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Existing app */}
    </QueryClientProvider>
  );
}
```

#### 1.3 Creare API Client
```typescript
// src/lib/apiClient.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

export default apiClient;
```

### 2. Creare Hook Personalizzati (Settimana 1-2)

```typescript
// src/hooks/api/useCompanyInfo.ts
export const useCompanyInfo = () => {
  return useQuery(['company', 'info'], fetchCompanyInfo);
};

// src/hooks/api/useTeamMembers.ts
export const useTeamMembers = () => {
  return useQuery(['team', 'members'], fetchTeamMembers);
};

// ... altri hooks per ogni entità
```

### 3. Creare API Functions (Settimana 1-2)

```typescript
// src/api/company.ts
export const fetchCompanyInfo = async (): Promise<CompanyInfo> => {
  const { data } = await apiClient.get('/company/info');
  return data;
};

// src/api/team.ts
export const fetchTeamMembers = async (): Promise<TeamMember[]> => {
  const { data } = await apiClient.get('/team/members');
  return data;
};

// ... altre funzioni API
```

### 4. Implementare Loading States

```typescript
// Pattern comune per tutti i componenti
const { data: teamMembers, isLoading, error } = useTeamMembers();

if (isLoading) return <LoadingSkeleton />;
if (error) return <ErrorMessage error={error} />;
if (!teamMembers) return <EmptyState />;

// Render normale con dati
```

### 5. Error Handling Centralizzato

```typescript
// src/components/common/ErrorBoundary.tsx
// src/components/common/LoadingSkeleton.tsx
// src/components/common/EmptyState.tsx
```

## Priorità di Implementazione

### Fase 1 - Componenti Base (Settimana 1-2)
1. Header/Footer (dati contatto)
2. HomePage servizi
3. AboutPage statistiche

### Fase 2 - Content Management (Settimana 3-4)
4. TeamPage
5. ServicesPage completa
6. News base

### Fase 3 - Advanced Features (Settimana 5-6)
7. ProjectsPage + DetailPage
8. CareersPage
9. ContactPage con form

### Fase 4 - Optimization (Settimana 7-8)
10. Caching avanzato
11. Prefetching
12. Error recovery
13. Offline support

## Considerazioni Performance

### Caching Strategy
- **Company Info**: Cache lungo (1 ora)
- **Team Members**: Cache medio (30 min)
- **News**: Cache breve (5 min)
- **Stats**: Cache lungo (1 ora)

### Loading Strategy
- **Critical path**: Company info, navigation
- **Above fold**: Hero content
- **Below fold**: Lazy load
- **Images**: Progressive loading

### Error Recovery
- **Fallback**: Dati statici come backup
- **Retry**: Automatic retry con exponential backoff
- **User feedback**: Toast notifications per errori
