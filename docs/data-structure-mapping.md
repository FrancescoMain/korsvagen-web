# Korsvagen Web - Mappatura Dati Statici vs Dinamici

## 📊 Overview Mappatura

Questo documento cataloga tutti i dati attualmente hardcoded nel progetto e propone la loro trasformazione in contenuti dinamici gestiti tramite API.

## 🏢 Dati Aziendali Statici

### Header Component (`/src/components/layout/Header.tsx`)

#### Dati Statici Attuali:
```typescript
// Linee 9-10
<LogoImage src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
<Tagline>Costruzioni & Progettazione</Tagline>
```

#### Mapping Dinamico Proposto:
```typescript
interface CompanyBranding {
  logo: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  tagline: string;
  brandColors: {
    primary: string;
    accent: string;
  };
}

// API Endpoint: GET /api/company/branding
```

---

### Footer Component (`/src/components/layout/Footer.tsx`)

#### Dati Statici Attuali:
```typescript
// Linee 8-14
<FooterText>© 2025 KORSVAGEN S.R.L. - Tutti i diritti riservati</FooterText>
<FooterSubtext>
  REA: 1071429 | P.IVA/C.F.: 09976601212 | Via Santa Maria la Carità 18 - 84018 Scafati (SA)
</FooterSubtext>
```

#### Mapping Dinamico Proposto:
```typescript
interface CompanyLegalInfo {
  companyName: string;
  copyrightYear: number;
  rea: string;
  vatNumber: string;
  fiscalCode: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  legalText: string;
}

// API Endpoint: GET /api/company/legal-info
```

---

### ContactsSection Component (`/src/components/sections/ContactsSection.tsx`)

#### Dati Statici Attuali:
```typescript
// Linee 8-24
<ContactInfo>korsvagensrl@gmail.com</ContactInfo>      // Email
<ContactInfo>+39 334 178 4609</ContactInfo>            // Telefono  
<ContactInfo>Via Santa Maria la Carità 18 - Scafati (SA)</ContactInfo> // Indirizzo
<ContactInfo>P.IVA: 09976601212</ContactInfo>          // Partita IVA
```

#### Mapping Dinamico Proposto:
```typescript
interface ContactInfo {
  id: string;
  type: 'email' | 'phone' | 'address' | 'legal';
  icon: string;
  label: string;
  value: string;
  displayOrder: number;
  isPublic: boolean;
  isPrimary: boolean;
}

interface ContactsData {
  contacts: ContactInfo[];
  lastUpdated: string;
}

// API Endpoint: GET /api/company/contacts
```

---

## 🎨 Contenuti Marketing Statici

### HeroSection Component (`/src/components/sections/HeroSection.tsx`)

#### Dati Statici Attuali:
```typescript
// Linee 8-14
<ConstructionIcon>🏗️</ConstructionIcon>
<MainTitle>SITO IN COSTRUZIONE</MainTitle>
<HeroSubtitle>
  Stiamo realizzando qualcosa di straordinario<br />
  per mostrarvi i nostri progetti
</HeroSubtitle>
```

#### Mapping Dinamico Proposto:
```typescript
interface HeroContent {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  isActive: boolean;
  ctaButton?: {
    text: string;
    url: string;
    type: 'internal' | 'external';
  };
  backgroundImage?: string;
  version: string;
}

// API Endpoint: GET /api/content/hero
```

---

### ProjectsSection Component (`/src/components/sections/ProjectsSection.tsx`)

#### Dati Statici Attuali:
```typescript
// Linee 8-16
<SectionTitle>I Nostri Lavori in Corso</SectionTitle>
<InstagramCTA href="https://www.instagram.com/korsvagensrl/" target="_blank">
  FOLLOW US ON INSTAGRAM
</InstagramCTA>
```

#### Mapping Dinamico Proposto:
```typescript
interface ProjectsSection {
  title: string;
  description?: string;
  instagramConfig: {
    profileUrl: string;
    handle: string;
    ctaText: string;
    isEnabled: boolean;
  };
  alternativeProjects?: Project[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  status: 'planning' | 'in-progress' | 'completed';
  location?: string;
  completionDate?: string;
}

// API Endpoints: 
// GET /api/content/projects-section
// GET /api/projects?status=in-progress
```

---

## 📱 Social Media Integration

### InstagramWall Component (`/src/components/common/InstagramWall.tsx`)

#### Dati Statici Attuali:
```typescript
// Linee 17-22, 36-38, 44-54
const profileUrl = "https://www.instagram.com/korsvagensrl/";
<ProfileTitle>📸 @korsvagensrl</ProfileTitle>
<ProfileSubtitle>I nostri progetti edilizi in tempo reale</ProfileSubtitle>
<LoadingText>Caricamento profilo Instagram...</LoadingText>
<InstagramIframe src="https://www.instagram.com/korsvagensrl/embed/" />
<OverlayText>Visualizza su Instagram</OverlayText>
<OverlaySubtext>@korsvagensrl</OverlaySubtext>
```

#### Mapping Dinamico Proposto:
```typescript
interface SocialMediaConfig {
  platform: 'instagram' | 'facebook' | 'linkedin';
  handle: string;
  profileUrl: string;
  embedUrl: string;
  displayName: string;
  description: string;
  isActive: boolean;
  loadingText: string;
  ctaText: string;
  fallbackContent?: {
    title: string;
    description: string;
    imageUrl: string;
  };
}

// API Endpoint: GET /api/social-media/config
```

---

## 🎯 Dati da File Esterni

### Company Data (`COMPANY-DATA.md`)

#### Dati Centralizzati per API:
```typescript
interface CompanyProfile {
  // Informazioni Generali
  legalName: string;
  businessSector: string;
  foundingYear: number;
  employeeCount: number;
  revenue: {
    amount: number;
    currency: string;
    year: number;
  };
  
  // Dati Fiscali
  vatNumber: string;
  fiscalCode: string;
  europeanVat: string;
  rea: string;
  
  // Sede Legale
  headquarters: {
    street: string;
    postalCode: string;
    city: string;
    province: string;
    region: string;
    country: string;
  };
  
  // Contatti
  contacts: {
    pec: string;
    email: string;
    phone: string;
  };
  
  // Social Media
  socialMedia: {
    instagram: string;
    profileDescription: string;
  };
  
  // Meta Information
  lastUpdated: string;
  dataSource: string;
  isVerified: boolean;
}

// API Endpoint: GET /api/company/profile
```

---

## 🔄 Strategia di Migrazione

### Fase 1: Core Company Data
1. **Company Profile API** - Dati aziendali base
2. **Legal Info API** - Informazioni legali footer
3. **Contact Info API** - Informazioni contatto

### Fase 2: Content Management  
1. **Hero Content API** - Messaging principale
2. **Section Content API** - Contenuti sezioni
3. **Social Media Config API** - Configurazione social

### Fase 3: Advanced Features
1. **Projects/Portfolio API** - Gestione progetti
2. **Media Gallery API** - Galleria immagini
3. **SEO/Meta API** - Contenuti SEO dinamici

---

## 📋 Priority Mapping

### 🔴 Alta Priorità (Dati business-critical)
- Company legal information (Footer)
- Contact information (ContactsSection)  
- Company branding (Header)

### 🟡 Media Priorità (Contenuti marketing)
- Hero section messaging
- Projects section content
- Social media configuration

### 🟢 Bassa Priorità (Enhancement)
- Dynamic styling/theming
- A/B testing content variants
- Analytics integration data

---

## 🛠️ Implementazione Consigliata

### Data Layer Architecture
```typescript
// Context per dati aziendali
interface CompanyDataContext {
  profile: CompanyProfile;
  contacts: ContactsData;
  legalInfo: CompanyLegalInfo;
  branding: CompanyBranding;
}

// Context per contenuti CMS
interface ContentContext {
  hero: HeroContent;
  sections: SectionContent[];
  socialMedia: SocialMediaConfig[];
}

// Hooks per data fetching
const useCompanyData = () => CompanyDataContext;
const useContent = (sectionId: string) => ContentContext;
```

### API Service Layer
```typescript
class ApiService {
  async getCompanyProfile(): Promise<CompanyProfile>
  async getContactInfo(): Promise<ContactsData>
  async getHeroContent(): Promise<HeroContent>
  async getSocialMediaConfig(): Promise<SocialMediaConfig[]>
}
```

## ✅ Risultati Attesi

Dopo l'implementazione della mappatura dinamica:

1. **Gestione Centralizzata**: Tutti i dati in un CMS/admin panel
2. **Aggiornamenti Real-time**: Modifiche immediate senza deploy
3. **Multilingua Ready**: Supporto internazionalizzazione
4. **A/B Testing**: Test contenuti diversi
5. **Analytics**: Tracking engagement contenuti
6. **Scalabilità**: Facile aggiunta nuovi contenuti

La mappatura consente una transizione graduale dal statico al dinamico mantenendo la UX esistente.