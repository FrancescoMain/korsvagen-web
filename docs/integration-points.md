# Korsvagen Web - Punti di Integrazione API

## 🎯 Panoramica Integrazioni

Questo documento definisce tutti i punti di integrazione API necessari per trasformare il sito Korsvagen da contenuti statici a dinamici, con focus su architettura scalabile e performance ottimali.

## 🏗️ Architettura API Proposta

### Base URL Structure
```
Production:  https://api.korsvagen.com/v1
Staging:     https://staging-api.korsvagen.com/v1
Development: http://localhost:3001/api/v1
```

### Authentication Strategy
```typescript
interface AuthConfig {
  type: 'bearer' | 'api-key' | 'none';
  refreshToken?: boolean;
  cacheDuration: number;
}

// Per fase iniziale: API Key semplice
// Per futuro: JWT con refresh token
```

---

## 📡 API Endpoints Specification

### 1. Company Data Service

#### 1.1 Company Profile
```typescript
GET /api/v1/company/profile

Response: {
  success: boolean;
  data: {
    id: string;
    legalName: string;
    brandName: string;
    businessSector: string;
    foundingYear: number;
    employeeCount: number;
    revenue: {
      amount: number;
      currency: string;
      year: number;
    };
    description: string;
    mission: string;
    vision: string;
    lastUpdated: string;
  };
  cached: boolean;
  cacheExpiry: string;
}

// Integration Point: Header, Footer, SEO Meta
// Cache Strategy: 24 hours
// Error Fallback: Static company data
```

#### 1.2 Legal Information
```typescript
GET /api/v1/company/legal

Response: {
  success: boolean;
  data: {
    companyName: string;
    vatNumber: string;
    fiscalCode: string;
    rea: string;
    registrationNumber: string;
    headquarters: {
      street: string;
      city: string;
      province: string;
      postalCode: string;
      country: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
    copyrightYear: number;
    legalText: string;
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
  };
}

// Integration Point: Footer Component
// Cache Strategy: 7 days (raramente cambia)
// Error Fallback: Hardcoded legal data
```

#### 1.3 Contact Information
```typescript
GET /api/v1/company/contacts

Response: {
  success: boolean;
  data: {
    contacts: [
      {
        id: string;
        type: 'email' | 'phone' | 'fax' | 'pec' | 'address';
        category: 'primary' | 'secondary' | 'emergency';
        icon: string;
        label: string;
        value: string;
        displayOrder: number;
        isPublic: boolean;
        officeHours?: {
          timezone: string;
          schedule: {
            [key: string]: { open: string; close: string; };
          };
        };
      }
    ];
    emergencyContact?: string;
    lastVerified: string;
  };
}

// Integration Point: ContactsSection Component
// Cache Strategy: 6 hours
// Error Fallback: Static contact data
```

### 2. Content Management Service

#### 2.1 Hero Section Content
```typescript
GET /api/v1/content/hero
GET /api/v1/content/hero?variant=A|B  // A/B testing

Response: {
  success: boolean;
  data: {
    id: string;
    version: string;
    isActive: boolean;
    content: {
      icon: string;
      title: string;
      subtitle: string;
      description?: string;
      ctaButton?: {
        text: string;
        url: string;
        type: 'internal' | 'external';
        analytics: {
          event: string;
          category: string;
        };
      };
      backgroundImage?: {
        desktop: string;
        tablet: string;
        mobile: string;
        alt: string;
      };
    };
    seo: {
      title: string;
      description: string;
      keywords: string[];
    };
    scheduling?: {
      startDate: string;
      endDate: string;
    };
  };
}

// Integration Point: HeroSection Component
// Cache Strategy: 1 hour
// Error Fallback: Default "Work in Progress" message
```

#### 2.2 Section Content
```typescript
GET /api/v1/content/sections/{sectionId}
// sectionIds: 'projects', 'about', 'services', 'testimonials'

Response: {
  success: boolean;
  data: {
    id: string;
    sectionType: string;
    title: string;
    subtitle?: string;
    description?: string;
    isEnabled: boolean;
    displayOrder: number;
    content: {
      // Contenuto specifico per tipo sezione
      projects?: {
        displayType: 'instagram' | 'gallery' | 'list';
        instagramConfig?: {
          handle: string;
          embedUrl: string;
          ctaText: string;
        };
      };
      customFields: Record<string, any>;
    };
    styling?: {
      backgroundColor: string;
      textColor: string;
      theme: 'light' | 'dark';
    };
  };
}

// Integration Point: ProjectsSection, Future sections
// Cache Strategy: 30 minutes
// Error Fallback: Static section content
```

### 3. Social Media Service

#### 3.1 Social Media Configuration
```typescript
GET /api/v1/social-media/config

Response: {
  success: boolean;
  data: {
    platforms: [
      {
        platform: 'instagram' | 'facebook' | 'linkedin' | 'youtube';
        handle: string;
        profileUrl: string;
        embedUrl?: string;
        displayName: string;
        description: string;
        isActive: boolean;
        priority: number;
        config: {
          showFeed: boolean;
          maxPosts: number;
          refreshInterval: number;
        };
      }
    ];
    defaultSettings: {
      loadingText: string;
      errorMessage: string;
      ctaText: string;
    };
  };
}

// Integration Point: InstagramWall, Future social components
// Cache Strategy: 2 hours
// Error Fallback: Static Instagram config
```

#### 3.2 Social Media Feed (Future)
```typescript
GET /api/v1/social-media/feed/{platform}?limit=10

Response: {
  success: boolean;
  data: {
    posts: [
      {
        id: string;
        platform: string;
        url: string;
        thumbnailUrl: string;
        caption: string;
        publishedAt: string;
        metrics: {
          likes: number;
          comments: number;
          shares: number;
        };
      }
    ];
    pagination: {
      nextCursor?: string;
      hasMore: boolean;
    };
    lastSync: string;
  };
}

// Integration Point: Enhanced InstagramWall
// Cache Strategy: 15 minutes
// Error Fallback: Iframe embed
```

### 4. Projects & Portfolio Service

#### 4.1 Projects List
```typescript
GET /api/v1/projects?status=in-progress&limit=10

Response: {
  success: boolean;
  data: {
    projects: [
      {
        id: string;
        title: string;
        description: string;
        status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
        category: 'residential' | 'commercial' | 'renovation' | 'infrastructure';
        location: {
          city: string;
          province?: string;
          coordinates?: { lat: number; lng: number; };
        };
        timeline: {
          startDate: string;
          estimatedCompletion: string;
          actualCompletion?: string;
        };
        images: [
          {
            url: string;
            alt: string;
            type: 'thumbnail' | 'gallery' | 'before' | 'progress' | 'after';
            order: number;
          }
        ];
        client?: {
          name: string;
          isPublic: boolean;
        };
        budget?: {
          range: string;
          isPublic: boolean;
        };
        tags: string[];
      }
    ];
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasNext: boolean;
    };
  };
}

// Integration Point: Future ProjectsGallery Component
// Cache Strategy: 1 hour
// Error Fallback: Instagram feed
```

### 5. Branding & Assets Service

#### 5.1 Brand Assets
```typescript
GET /api/v1/branding/assets

Response: {
  success: boolean;
  data: {
    logo: {
      primary: string;
      white: string;
      dark: string;
      favicon: string;
      sizes: {
        small: string;
        medium: string;
        large: string;
      };
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      neutral: string[];
    };
    typography: {
      headingFont: string;
      bodyFont: string;
      fallbacks: string[];
    };
    tagline: string;
    slogans: string[];
    version: string;
  };
}

// Integration Point: Header, Global Styling
// Cache Strategy: 24 hours
// Error Fallback: Hardcoded brand assets
```

---

## 🔌 Integration Implementation

### React Integration Strategy

#### 1. API Service Layer
```typescript
// services/api.ts
class KorsvagenApiService {
  private baseURL: string;
  private apiKey?: string;
  private cache: Map<string, CacheEntry>;

  constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.cache = new Map();
  }

  // Generic request method con caching
  private async request<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
    const cached = this.getFromCache<T>(cacheKey);
    
    if (cached && !this.isCacheExpired(cached)) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey }),
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new ApiError(response.status, await response.text());
      }

      const data = await response.json();
      this.setCache(cacheKey, data, options?.cacheDuration);
      
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Specific API methods
  async getCompanyProfile() {
    return this.request<CompanyProfile>('/company/profile', { cacheDuration: 24 * 60 * 60 * 1000 });
  }

  async getContactInfo() {
    return this.request<ContactsData>('/company/contacts', { cacheDuration: 6 * 60 * 60 * 1000 });
  }

  async getHeroContent() {
    return this.request<HeroContent>('/content/hero', { cacheDuration: 60 * 60 * 1000 });
  }

  // ... altri metodi
}
```

#### 2. React Hooks per Data Fetching
```typescript
// hooks/useApi.ts
export const useCompanyData = () => {
  const [data, setData] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCompanyProfile();
        setData(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        // Fallback to static data
        setData(FALLBACK_COMPANY_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};

export const useHeroContent = () => {
  // Similar implementation
};

export const useContactInfo = () => {
  // Similar implementation
};
```

#### 3. Component Integration Example
```typescript
// components/layout/Header.tsx
const Header: React.FC = () => {
  const { data: brandingData, loading } = useBrandingAssets();
  
  if (loading) {
    return <HeaderSkeleton />;
  }

  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <LogoImage 
            src={brandingData?.logo.primary || "/LOGO KORSVAGEN.png"} 
            alt={`${brandingData?.companyName || "Korsvagen"} Logo`} 
          />
          <Tagline>{brandingData?.tagline || "Costruzioni & Progettazione"}</Tagline>
        </LogoSection>
      </HeaderContent>
    </HeaderContainer>
  );
};
```

### Error Handling & Fallbacks

#### Error Boundary per API
```typescript
class ApiErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('API Error Boundary caught an error:', error, errorInfo);
    // Send to analytics/monitoring service
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

#### Fallback Data Strategy
```typescript
// constants/fallbacks.ts
export const FALLBACK_DATA = {
  companyProfile: {
    legalName: "KORSVAGEN S.R.L.",
    tagline: "Costruzioni & Progettazione",
    // ... other static data
  },
  heroContent: {
    icon: "🏗️",
    title: "SITO IN COSTRUZIONE",
    subtitle: "Stiamo realizzando qualcosa di straordinario per mostrarvi i nostri progetti",
  },
  // ... altri fallback
};
```

---

## 🚀 Deployment & Monitoring

### API Health Checks
```typescript
GET /api/v1/health

Response: {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    cache: 'up' | 'down';
    external_apis: 'up' | 'down';
  };
  version: string;
}
```

### Performance Monitoring
- Response time tracking per endpoint
- Cache hit/miss ratios
- Error rate monitoring
- Fallback usage tracking

### Analytics Integration
```typescript
// Track API usage and content engagement
interface AnalyticsEvent {
  event: 'api_call' | 'content_view' | 'cta_click' | 'error_fallback';
  endpoint?: string;
  component: string;
  timestamp: string;
  userAgent: string;
  performance?: {
    loadTime: number;
    cacheHit: boolean;
  };
}
```

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Setup API service layer
- [ ] Implement caching strategy
- [ ] Create error boundaries
- [ ] Add fallback data system

### Phase 2: Core Integration (Week 3-4)
- [ ] Integrate company profile API
- [ ] Connect contact information API
- [ ] Implement branding assets API
- [ ] Add legal information API

### Phase 3: Content Management (Week 5-6)
- [ ] Hero content API integration
- [ ] Section content management
- [ ] Social media configuration API
- [ ] Add A/B testing capability

### Phase 4: Advanced Features (Week 7-8)
- [ ] Projects/portfolio API
- [ ] Social media feed integration
- [ ] SEO metadata API
- [ ] Analytics and monitoring

### Phase 5: Optimization (Week 9-10)
- [ ] Performance optimization
- [ ] Advanced caching strategies
- [ ] Monitoring and alerting
- [ ] Documentation completion

---

## ✅ Success Criteria

### Technical KPIs
- API response time < 200ms (95th percentile)
- Cache hit ratio > 80%
- Error rate < 1%
- Fallback usage < 5%

### Business KPIs
- Content update time reduced from days to minutes
- Zero downtime during content changes
- Improved SEO scores with dynamic meta data
- Enhanced user engagement metrics

La strategia di integrazione API garantisce scalabilità, performance e maintainability per la crescita futura del progetto Korsvagen Web.