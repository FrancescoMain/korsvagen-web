# Analisi Completa del Progetto KORSVAGEN

## Panoramica Generale

**Progetto**: KORSVAGEN Web Application  
**Tipo**: Single Page Application (SPA) React  
**Framework**: React 19.1.0 + TypeScript  
**Styling**: Styled Components  
**Routing**: React Router DOM v7.6.3

## Architettura del Progetto

### Stack Tecnologico

#### Frontend Framework

- **React**: 19.1.0
- **TypeScript**: 4.9.5
- **React Router DOM**: 7.6.3 per il routing
- **Styled Components**: 6.1.19 per styling CSS-in-JS

#### Librerie di Supporto

- **Axios**: 1.10.0 per chiamate HTTP
- **React Instagram Feed**: 0.1.3-alpha per integrazione Instagram
- **React Social Media Embed**: 2.5.18 per embedding social media

#### Testing e Build

- **React Scripts**: 5.0.1
- **Testing Library**: Jest + React Testing Library
- **Web Vitals**: 2.1.4 per performance monitoring

### Struttura delle Directory

```
client/src/
├── components/           # Componenti riutilizzabili
│   ├── common/          # Componenti comuni
│   ├── layout/          # Header, Footer
│   ├── sections/        # Sezioni specifiche
│   └── ui/              # UI components (vuoto)
├── data/                # Dati statici
├── hooks/               # Custom hooks
├── pages/               # Pagine dell'applicazione
├── styles/              # Stili globali
├── types/               # Type definitions
└── utils/               # Utility functions (vuoto)
```

## Componenti React Identificati

### Layout Components (2)

- `Header.tsx` - Navigazione principale
- `Footer.tsx` - Footer con informazioni aziendali

### Pages (11)

- `HomePage.tsx` - Pagina principale con hero e overview servizi
- `AboutPage.tsx` - Chi siamo, storia, certificazioni
- `ServicesPage.tsx` - Servizi offerti
- `ProjectsPage.tsx` - Portfolio progetti
- `ProjectDetailPage.tsx` - Dettaglio singolo progetto
- `NewsPage.tsx` - Lista news/articoli
- `NewsDetailPage.tsx` - Dettaglio singolo articolo
- `ContactPage.tsx` - Contatti e form
- `CareersPage.tsx` - Offerte lavoro
- `TeamPage.tsx` - Team aziendale
- `WorkInProgressPage.tsx` - Pagina placeholder

### Common Components (7)

- `ContactCTA.tsx` - Call-to-action contatti
- `ProjectsCTA.tsx` - Call-to-action progetti
- `HeroSection.tsx` - Sezione hero generica
- `InstagramWall.tsx` - Muro Instagram
- `InstagramWall-embed.tsx` - Embedding Instagram
- `Link.tsx` - Link personalizzato
- `ScrollToTop.tsx` - Scroll automatico

### Section Components (3)

- `HeroSection.tsx` - Hero section specifica
- `ProjectsSection.tsx` - Sezione progetti
- `ContactsSection.tsx` - Sezione contatti

## Dati Statici Identificati

### 1. Dati di Contatto (`data/contactData.ts`)

```typescript
- Informazioni aziendali (nome, indirizzo)
- Contatti (telefono, email)
- Social media links
- Dati fiscali (REA, P.IVA)
```

### 2. Team Data (in `TeamPage.tsx`)

```typescript
- 6 membri del team con:
  - Informazioni personali
  - Ruoli e descrizioni
  - Competenze e formazione
  - Link ai CV
```

### 3. Servizi (in `ServicesPage.tsx` e `HomePage.tsx`)

```typescript
- Progettazione
- Costruzioni
- Ristrutturazioni
- Facility Management
```

### 4. Progetti (in `ProjectDetailPage.tsx`, `HomePage.tsx`)

```typescript
- Portfolio progetti con:
  - Immagini e gallery
  - Descrizioni tecniche
  - Localizzazioni
  - Specifiche tecniche
```

### 5. News/Articoli (in `NewsPage.tsx`, `NewsDetailPage.tsx`)

```typescript
- Articoli con:
  - Titoli e date
  - Contenuti
  - Immagini
  - Excerpt/riassunti
```

### 6. Offerte Lavoro (in `CareersPage.tsx`)

```typescript
- Posizioni aperte con:
  - Titoli e tipologie
  - Descrizioni
  - Requisiti
  - Benefici aziendali
```

### 7. Certificazioni (in `AboutPage.tsx`)

```typescript
- Lista certificazioni con:
  - ISO 9001
  - SOA Costruzioni
  - Edilizia Sostenibile
  - Impianti Elettrici
  - Progettazione
  - Sicurezza
```

## Routing Structure

### Percorsi Principali

- `/` - HomePage
- `/chi-siamo` - AboutPage
- `/servizi` - ServicesPage
- `/progetti` - ProjectsPage
- `/progetti/:projectId` - ProjectDetailPage
- `/news` - NewsPage
- `/news/:newsId` - NewsDetailPage
- `/il-nostro-team` - TeamPage
- `/contatti` - ContactPage
- `/lavora-con-noi` - CareersPage
- `/work-in-progress` - WorkInProgressPage

## State Management

**Attuale**: Nessun state management globale  
**Pattern**: Local state con useState in ogni componente  
**Navigazione**: Custom hook `useNavigateWithScroll`

## Styling Approach

**Primary**: Styled Components CSS-in-JS  
**Responsive**: Mobile-first design con breakpoints  
**Fonts**: Custom font "Korsvagen Brand"  
**Color Scheme**: Dark theme (#1a1a1a) con accenti

## Asset Management

### Immagini

- **Esterne**: Principalmente Unsplash URLs
- **Locali**: Logo, favicon, video hero
- **CV**: PDF files in `/public/cv/`

### Media

- Video hero (`korsvagen-hero.mp4`)
- Font personalizzato (`00209.ttf`)

## Integrazione Esterna Attuale

### Social Media

- Instagram feed integration
- Social media embeds
- Links a social platforms

### Servizi Esterni

- Google Maps (potenziale)
- Email forms (statici)

## Performance e Build

### Build Output

- **Static assets**: CSS, JS chunks
- **Code splitting**: Automatico con React
- **Asset optimization**: Gestito da React Scripts

### Bundle Analysis

- Main chunk: `main.31089a2d.js`
- Async chunk: `453.cc81dbdb.chunk.js`
- CSS: `main.955b0559.css`

## Identificazione Criticità

### 1. Dati Hardcoded

- Tutto il contenuto è hardcoded nei componenti
- Nessuna separazione tra logica e dati
- Difficile manutenzione e aggiornamento

### 2. Scalabilità

- Nessun CMS o gestione dinamica contenuti
- Team data embedded nel codice
- News e progetti statici

### 3. Performance

- Immagini esterne (Unsplash) non ottimizzate
- Nessun lazy loading implementato
- Bundle size non ottimizzato

### 4. SEO

- Contenuto statico può limitare SEO dinamico
- Meta tags non dinamici
- Sitemap non generata automaticamente

## Raccomandazioni Immediate

### 1. Separazione Dati

- Creare strutture dati JSON separate
- Implementare data layer astratto
- Preparare per integrazione API

### 2. Gestione State

- Implementare Context API per dati globali
- Considerare Redux Toolkit per state complesso
- Cacheing per performance

### 3. Asset Optimization

- Ottimizzazione immagini
- Implementazione lazy loading
- CDN per asset statici

### 4. Architettura API-Ready

- Preparazione per backend integration
- Error handling robusto
- Loading states

## Metriche Attuali

- **Componenti**: 21 componenti React
- **Pagine**: 11 pagine principali
- **Routes**: 10+ route definite
- **Dati statici**: 7 categorie principali
- **Dependencies**: 20 dipendenze principali
- **Bundle size**: ~500KB (stimato)
