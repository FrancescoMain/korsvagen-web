# Mappatura Dati Statici vs Dinamici

## Panoramica

Questo documento cataloga tutti i dati attualmente hardcodati nell'applicazione e propone la struttura per renderli dinamici tramite API o sistema di gestione contenuti.

## Dati Statici Correnti

### 1. Header Component (`components/layout/Header.tsx`)

#### Dati Statici Attuali
```typescript
// Logo
src: "/LOGO KORSVAGEN.png"
alt: "Korsvagen Logo"

// Tagline
text: "Costruzioni & Progettazione"
```

#### Struttura Dinamica Proposta
```json
{
  "header": {
    "logo": {
      "src": "/LOGO KORSVAGEN.png",
      "alt": "Korsvagen Logo",
      "height": "60px"
    },
    "tagline": "Costruzioni & Progettazione"
  }
}
```

### 2. Footer Component (`components/layout/Footer.tsx`)

#### Dati Statici Attuali
```typescript
// Copyright
"© 2025 KORSVAGEN S.R.L. - Tutti i diritti riservati"

// Informazioni legali
"REA: 1071429 | P.IVA/C.F.: 09976601212 | Via Santa Maria la Carità 18 - 84018 Scafati (SA)"
```

#### Struttura Dinamica Proposta
```json
{
  "footer": {
    "copyright": {
      "year": 2025,
      "companyName": "KORSVAGEN S.R.L.",
      "text": "Tutti i diritti riservati"
    },
    "legalInfo": {
      "rea": "1071429",
      "piva": "09976601212",
      "codiceFiscale": "09976601212",
      "address": {
        "street": "Via Santa Maria la Carità 18",
        "cap": "84018",
        "city": "Scafati",
        "province": "SA"
      }
    }
  }
}
```

### 3. HeroSection Component (`components/sections/HeroSection.tsx`)

#### Dati Statici Attuali
```typescript
// Icona
"🏗️"

// Titolo principale
"SITO IN COSTRUZIONE"

// Sottotitolo
"Stiamo realizzando qualcosa di straordinario per mostrarvi i nostri progetti"
```

#### Struttura Dinamica Proposta
```json
{
  "heroSection": {
    "icon": "🏗️",
    "title": "SITO IN COSTRUZIONE",
    "subtitle": "Stiamo realizzando qualcosa di straordinario",
    "description": "per mostrarvi i nostri progetti",
    "isVisible": true,
    "theme": "construction"
  }
}
```

### 4. ContactsSection Component (`components/sections/ContactsSection.tsx`)

#### Dati Statici Attuali
```typescript
// Email
icon: "📧"
info: "korsvagensrl@gmail.com"

// Telefono
icon: "📞"
info: "+39 334 178 4609"

// Indirizzo
icon: "📍"
info: "Via Santa Maria la Carità 18 - Scafati (SA)"

// P.IVA
icon: "🏢"
info: "P.IVA: 09976601212"
```

#### Struttura Dinamica Proposta
```json
{
  "contactsSection": {
    "contacts": [
      {
        "type": "email",
        "icon": "📧",
        "label": "Email",
        "value": "korsvagensrl@gmail.com",
        "href": "mailto:korsvagensrl@gmail.com"
      },
      {
        "type": "phone",
        "icon": "📞",
        "label": "Telefono",
        "value": "+39 334 178 4609",
        "href": "tel:+393341784609"
      },
      {
        "type": "address",
        "icon": "📍",
        "label": "Indirizzo",
        "value": "Via Santa Maria la Carità 18 - Scafati (SA)",
        "href": "https://maps.google.com/?q=Via+Santa+Maria+la+Carità+18,+Scafati"
      },
      {
        "type": "piva",
        "icon": "🏢",
        "label": "P.IVA",
        "value": "09976601212",
        "href": null
      }
    ]
  }
}
```

### 5. ProjectsSection Component (`components/sections/ProjectsSection.tsx`)

#### Dati Statici Attuali
```typescript
// Titolo sezione
"I Nostri Lavori in Corso"

// Instagram URL
"https://www.instagram.com/korsvagensrl/"

// Call-to-action
"FOLLOW US ON INSTAGRAM"
```

#### Struttura Dinamica Proposta
```json
{
  "projectsSection": {
    "title": "I Nostri Lavori in Corso",
    "instagram": {
      "username": "korsvagensrl",
      "url": "https://www.instagram.com/korsvagensrl/",
      "displayName": "@korsvagensrl"
    },
    "cta": {
      "text": "FOLLOW US ON INSTAGRAM",
      "action": "external_link"
    }
  }
}
```

### 6. InstagramWall Component (`components/common/InstagramWall.tsx`)

#### Dati Statici Attuali
```typescript
// Profilo
"📸 @korsvagensrl"
"I nostri progetti edilizi in tempo reale"

// URL embed
"https://www.instagram.com/korsvagensrl/embed/"

// Messaggi
"Caricamento profilo Instagram..."
"Visualizza su Instagram"
```

#### Struttura Dinamica Proposta
```json
{
  "instagramWall": {
    "profile": {
      "icon": "📸",
      "username": "korsvagensrl",
      "displayName": "@korsvagensrl",
      "description": "I nostri progetti edilizi in tempo reale"
    },
    "embed": {
      "url": "https://www.instagram.com/korsvagensrl/embed/",
      "title": "Profilo Instagram @korsvagensrl"
    },
    "messages": {
      "loading": "Caricamento profilo Instagram...",
      "viewOnInstagram": "Visualizza su Instagram",
      "errorFallback": "Impossibile caricare il feed Instagram"
    },
    "settings": {
      "loadingDelay": 1500,
      "showOverlay": true,
      "enableHover": true
    }
  }
}
```

## Schema Dati Aziendali Centralizzato

### Struttura Completa Proposta
```json
{
  "company": {
    "basic": {
      "name": "KORSVAGEN S.R.L.",
      "tagline": "Costruzioni & Progettazione",
      "sector": "Costruzioni & Progettazione Edilizia",
      "founded": null,
      "employees": 5,
      "revenue": {
        "amount": 653054,
        "currency": "EUR",
        "year": 2024
      }
    },
    "legal": {
      "piva": "09976601212",
      "codiceFiscale": "09976601212",
      "vatEuropean": "IT09976601212",
      "rea": "1071429"
    },
    "address": {
      "street": "Via Santa Maria la Carità 18",
      "cap": "84018",
      "city": "Scafati",
      "province": "SA",
      "region": "Campania",
      "country": "Italia"
    },
    "contacts": {
      "email": "korsvagensrl@gmail.com",
      "pec": "korsvagensrl@arubapec.it",
      "phone": "+39 334 178 4609",
      "website": "https://korsvagen.com"
    },
    "social": {
      "instagram": {
        "username": "korsvagensrl",
        "url": "https://www.instagram.com/korsvagensrl/",
        "description": "Progetti edilizi e cantieri"
      }
    },
    "branding": {
      "logo": {
        "main": "/LOGO KORSVAGEN.png",
        "alt": "Korsvagen Logo"
      },
      "colors": {
        "primary": "#2C3E50",
        "accent": "#E67E22",
        "neutral": "#FFFFFF",
        "support": "#ECF0F1"
      }
    }
  }
}
```

## Strategie di Implementazione

### Fase 1: Configurazione Locale
- Creare file `config/data.json` con tutti i dati aziendali
- Utilizzare React Context per distribuire dati ai componenti
- Mantenere tipizzazione TypeScript forte

### Fase 2: Environment Configuration
- Separare configurazioni per dev/staging/production
- Utilizzare variabili d'ambiente per URL e chiavi API
- Implementare validation per dati critici

### Fase 3: API Integration
- Creare servizi API per recupero dati
- Implementare caching per performance
- Gestire stati di loading e error

### Fase 4: CMS Integration
- Connessione a headless CMS (Strapi, Contentful, etc.)
- Interface amministrativa per gestione contenuti
- Real-time updates e preview

## Benefici della Ristrutturazione

### Manutenibilità
- ✅ Dati centralizzati in un'unica fonte
- ✅ Componenti puri focalizzati sulla presentazione
- ✅ Facile aggiornamento informazioni aziendali

### Scalabilità
- ✅ Supporto multi-lingua futuro
- ✅ Gestione configurazioni per environment diversi
- ✅ Possibilità di A/B testing sui contenuti

### Performance
- ✅ Lazy loading dei dati non critici
- ✅ Caching intelligente
- ✅ Minimizzazione richieste API

### Esperienza Utente
- ✅ Loading states appropriati
- ✅ Error handling graceful
- ✅ Contenuti sempre aggiornati

## Priorità di Migrazione

### Alta Priorità
1. **Dati aziendali** (company info, contacts)
2. **Configurazioni ambiente** (URLs, API keys)
3. **Contenuti hero section** (messaggi principali)

### Media Priorità
1. **Instagram integration** (feed dinamico)
2. **Meta tags SEO** (title, description dinamici)
3. **Error messages** (localizzazione messaggi)

### Bassa Priorità
1. **Temi e styling** (color palette dinamica)
2. **Analytics configuration** (tracking dinamico)
3. **Feature flags** (abilitazione funzionalità)