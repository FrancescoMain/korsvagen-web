# Punti di Integrazione API - Korsvagen Web

## Overview

Questo documento definisce i punti strategici dove integrare chiamate API nell'applicazione Korsvagen Web per trasformare i dati statici in contenuti dinamici gestibili.

## Architettura Proposta

### Data Flow Architecture
```
Frontend (React) → API Services → Backend/CMS → Database
                ↓
         Local State Management (Context/Redux)
                ↓
            UI Components
```

## Punti di Integrazione Identificati

### 1. Company Data API

#### Endpoint Proposto
```
GET /api/company/info
```

#### Response Schema
```json
{
  "data": {
    "basic": {
      "name": "KORSVAGEN S.R.L.",
      "tagline": "Costruzioni & Progettazione",
      "sector": "Costruzioni & Progettazione Edilizia"
    },
    "legal": {
      "piva": "09976601212",
      "codiceFiscale": "09976601212",
      "rea": "1071429"
    },
    "address": {
      "street": "Via Santa Maria la Carità 18",
      "cap": "84018",
      "city": "Scafati",
      "province": "SA"
    },
    "contacts": {
      "email": "korsvagensrl@gmail.com",
      "phone": "+39 334 178 4609"
    }
  },
  "lastUpdated": "2025-07-14T09:48:00Z"
}
```

#### Componenti Interessati
- `Header.tsx` - Logo e tagline aziendale
- `Footer.tsx` - Informazioni legali complete
- `ContactsSection.tsx` - Tutti i contatti aziendali

#### Implementazione Tecnica
```typescript
// services/companyService.ts
export const getCompanyInfo = async (): Promise<CompanyInfo> => {
  const response = await axios.get('/api/company/info');
  return response.data;
};

// hooks/useCompanyData.ts
export const useCompanyData = () => {
  const [data, setData] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    getCompanyInfo()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);
  
  return { data, loading, error };
};
```

### 2. Content Management API

#### Endpoint Proposto
```
GET /api/content/sections
POST /api/content/sections (admin only)
PUT /api/content/sections/:id (admin only)
```

#### Response Schema
```json
{
  "data": {
    "heroSection": {
      "id": "hero-1",
      "title": "SITO IN COSTRUZIONE",
      "subtitle": "Stiamo realizzando qualcosa di straordinario",
      "description": "per mostrarvi i nostri progetti",
      "icon": "🏗️",
      "isActive": true,
      "lastModified": "2025-07-14T09:00:00Z"
    },
    "projectsSection": {
      "id": "projects-1", 
      "title": "I Nostri Lavori in Corso",
      "subtitle": "Segui i nostri progetti su Instagram",
      "ctaText": "FOLLOW US ON INSTAGRAM",
      "isActive": true
    }
  }
}
```

#### Componenti Interessati
- `HeroSection.tsx` - Titoli e messaggi principali
- `ProjectsSection.tsx` - Titolo sezione e CTA

#### Implementazione Pattern
```typescript
// context/ContentContext.tsx
interface ContentContextType {
  heroSection: HeroSectionData | null;
  projectsSection: ProjectsSectionData | null;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
}

export const ContentProvider: React.FC<{children: ReactNode}> = ({children}) => {
  // Implementation con useReducer per gestione stato complesso
};
```

### 3. Social Media API

#### Endpoint Proposto
```
GET /api/social/instagram/feed
GET /api/social/config
```

#### Response Schema
```json
{
  "data": {
    "instagram": {
      "username": "korsvagensrl",
      "url": "https://www.instagram.com/korsvagensrl/",
      "embedUrl": "https://www.instagram.com/korsvagensrl/embed/",
      "description": "I nostri progetti edilizi in tempo reale",
      "isActive": true,
      "posts": [
        {
          "id": "post-1",
          "imageUrl": "https://...",
          "caption": "Nuovo progetto in corso...",
          "postUrl": "https://instagram.com/p/...",
          "timestamp": "2025-07-14T08:00:00Z"
        }
      ]
    }
  }
}
```

#### Componenti Interessati
- `InstagramWall.tsx` - Feed Instagram e configurazioni
- `ProjectsSection.tsx` - Link e informazioni Instagram

#### Alternative Implementation
```typescript
// Per gestire limitazioni Instagram API
// Opzione 1: Scraping periodico (backend)
// Opzione 2: Manual feed management (CMS)
// Opzione 3: Widget embed ottimizzato

// hooks/useInstagramFeed.ts
export const useInstagramFeed = () => {
  // Implementazione con fallback strategies
  // 1. Try API call
  // 2. Fallback to cached data
  // 3. Fallback to static embed
};
```

### 4. Configuration API

#### Endpoint Proposto
```
GET /api/config/app
GET /api/config/features
```

#### Response Schema
```json
{
  "data": {
    "app": {
      "name": "Korsvagen Web",
      "version": "1.0.0",
      "environment": "production"
    },
    "features": {
      "instagramIntegration": true,
      "contactForm": false,
      "projectGallery": false,
      "multiLanguage": false
    },
    "ui": {
      "theme": {
        "primary": "#2C3E50",
        "accent": "#E67E22"
      },
      "animations": {
        "enabled": true,
        "duration": 300
      }
    },
    "seo": {
      "title": "Korsvagen - Costruzioni & Progettazione",
      "description": "Società edilizia specializzata in costruzioni e progettazione",
      "keywords": ["edilizia", "costruzioni", "progettazione", "Scafati"]
    }
  }
}
```

#### Componenti Interessati
- `App.tsx` - Configurazioni globali applicazione
- Tutti i componenti - Feature flags e theming

### 5. Analytics & Monitoring API

#### Endpoint Proposto
```
POST /api/analytics/events
GET /api/health
```

#### Implementation Points
- Page view tracking
- User interaction events
- Performance monitoring
- Error logging

## Strategia di Implementazione

### Fase 1: Foundation Setup (Task 2)
1. **Axios Configuration**
   ```typescript
   // api/client.ts
   const apiClient = axios.create({
     baseURL: process.env.REACT_APP_API_BASE_URL,
     timeout: 10000,
     headers: {
       'Content-Type': 'application/json'
     }
   });
   ```

2. **Error Handling Strategy**
   ```typescript
   // utils/errorHandler.ts
   export const handleApiError = (error: AxiosError) => {
     // Log to monitoring service
     // Show user-friendly message
     // Fallback to cached data if available
   };
   ```

3. **Loading States Management**
   ```typescript
   // hooks/useApiState.ts
   export const useApiState = <T>() => {
     const [data, setData] = useState<T | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);
     
     // Unified API state management
   };
   ```

### Fase 2: Component Integration (Task 3)

#### Header Integration
```typescript
// components/layout/Header.tsx
const Header: React.FC = () => {
  const { data: companyData, loading } = useCompanyData();
  
  if (loading) return <HeaderSkeleton />;
  
  return (
    <HeaderContainer>
      <LogoImage src={companyData?.branding.logo.main} />
      <Tagline>{companyData?.basic.tagline}</Tagline>
    </HeaderContainer>
  );
};
```

#### Content Sections Integration
```typescript
// components/sections/HeroSection.tsx
const HeroSection: React.FC = () => {
  const { heroSection, loading } = useContentData();
  
  return (
    <HeroContainer>
      <ConstructionIcon>{heroSection?.icon}</ConstructionIcon>
      <MainTitle>{heroSection?.title}</MainTitle>
      <HeroSubtitle>{heroSection?.subtitle}</HeroSubtitle>
    </HeroContainer>
  );
};
```

### Fase 3: Advanced Features (Task 4+)

#### Real-time Updates
```typescript
// WebSocket integration for real-time content updates
// Server-Sent Events for live data synchronization
```

#### Caching Strategy
```typescript
// React Query / SWR implementation
// Service Worker for offline support
// Local Storage for user preferences
```

## Error Handling & Fallbacks

### Network Errors
- Retry logic con exponential backoff
- Fallback a dati cached
- Offline mode detection

### Data Validation
```typescript
// schemas/companyData.ts
export const CompanyDataSchema = z.object({
  basic: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1)
  }),
  contacts: z.object({
    email: z.string().email(),
    phone: z.string().regex(/^\+39/)
  })
});
```

### Loading States
- Skeleton loaders per ogni componente
- Progressive loading per contenuti non critici
- Graceful degradation per features avanzate

## Performance Considerations

### API Optimization
- Response caching con appropriate TTL
- Data prefetching per contenuti critici
- Lazy loading per contenuti below-the-fold

### Bundle Optimization
- Code splitting per API services
- Dynamic imports per feature non essenziali
- Tree shaking per librerie unused

### Monitoring
- API response time tracking
- Error rate monitoring
- User experience metrics

## Security Considerations

### API Security
- CORS configuration appropriata
- Rate limiting per endpoint pubblici
- Input validation e sanitization

### Client Security
- Environment variables per API keys
- No sensitive data in client bundle
- CSP headers per XSS protection

## Testing Strategy

### Unit Tests
```typescript
// __tests__/services/companyService.test.ts
describe('companyService', () => {
  it('should fetch company data successfully', async () => {
    // Mock API response
    // Test service function
    // Assert expected data structure
  });
});
```

### Integration Tests
```typescript
// __tests__/components/Header.test.tsx
describe('Header with API integration', () => {
  it('should display company data when loaded', async () => {
    // Mock API call
    // Render component
    // Wait for data load
    // Assert UI updates
  });
});
```

### E2E Tests
- Full user journey con real API calls
- Error scenarios testing
- Performance regression testing

## Deployment Considerations

### Environment Configuration
```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:3001/api

# .env.production
REACT_APP_API_BASE_URL=https://api.korsvagen.com/api
```

### CI/CD Integration
- API health checks prima del deploy
- Rollback strategy in caso di API failures
- Feature flags per gradual rollout

Questa strategia di integrazione garantisce una transizione graduale e sicura da contenuti statici a dinamici, mantenendo sempre la user experience ottimale.