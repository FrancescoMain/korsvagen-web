# Claude Code - Standardizzazione e Ottimizzazione Hero Sections

## Problema Identificato

Gli hero delle sezioni principali presentano inconsistenze e problemi di UX:

- 📏 **Dimensioni inconsistenti**: Altezze e sizing diversi tra sezioni
- 🖼️ **Immagini diverse**: Background non standardizzati
- 📱 **Componenti duplicati**: Nessun componente condiviso riutilizzabile
- 🏔️ **Troppo alti**: Hero occupano troppo spazio per contenuto minimo
- 🎨 **Stili inconsistenti**: Typography e spacing non uniformi

## Sezioni da Standardizzare

**⚠️ IMPORTANTE: La Home Page NON va modificata - mantieni l'hero esistente così com'è**

Sezioni target per la standardizzazione:

- 👥 Chi Siamo
- 🤝 Il Nostro Team
- ⚙️ Servizi
- 🚀 Progetti
- 📰 News
- 💼 Lavora con Noi
- 📞 Contatti

**🏠 Home Page = ESCLUSA dal refactoring**

## Task di Refactoring

### 1. Analisi degli Hero Esistenti

Esamina ogni sezione **ECCETTO LA HOME PAGE** per catalogare:

- Altezze attuali (px/vh/rem)
- Struttura HTML/componenti
- Classi CSS utilizzate
- Immagini di background
- Typography (font-size, weight, color)
- Spacing interno (padding/margin)
- Responsive behavior

**🚨 SKIP HOME PAGE**: Non analizzare né modificare l'hero della home page - è da mantenere invariato.

### 2. Progettazione Componente Unificato

#### Struttura Componente Condiviso

Crea un componente `PageHero` riutilizzabile:

```jsx
// Esempio struttura desiderata
<PageHero
  title="Titolo Sezione"
  subtitle="Sottotitolo descrittivo"
  backgroundImage="/path/to/unified-bg.jpg"
  size="compact" // compact | medium | large
/>
```

#### Specifiche Design

Standardizza le dimensioni:

```css
/* Esempio dimensioni target */
.hero-compact {
  height: 200px; /* Molto più compatto dell'attuale */
  min-height: 180px;
}

.hero-medium {
  height: 300px; /* Per sezioni che necessitano più spazio */
  min-height: 250px;
}
```

### 3. Sistema di Background Unificato

#### Strategia Immagine Background

Decidi e implementa:

- **Opzione A**: Singola immagine elegante per tutti gli hero
- **Opzione B**: Gradient/pattern unificato senza immagini
- **Opzione C**: Set limitato di immagini tematiche (2-3 max)

#### Ottimizzazioni Performance

- Compressione immagini background
- Lazy loading se necessario
- WebP format con fallback
- Responsive images per mobile

### 4. Typography System

#### Standardizzazione Testi

Unifica la tipografia:

```css
/* Esempio sistema typography */
.hero-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  color: var(--hero-title-color);
}

.hero-subtitle {
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 400;
  line-height: 1.4;
  color: var(--hero-subtitle-color);
  opacity: 0.9;
}
```

#### Responsive Typography

- Fluid typography con `clamp()`
- Leggibilità su tutti i device
- Contrast ratio accessibile

### 5. Implementazione Componente

#### Props Interface

```typescript
interface PageHeroProps {
  title: string;
  subtitle?: string;
  size?: "compact" | "medium" | "large";
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}
```

#### Varianti Dimensioni

```css
/* Sistema modulare altezze */
.hero-compact {
  height: 200px;
}
.hero-medium {
  height: 300px;
}
.hero-large {
  height: 400px;
} /* Solo se necessario */
```

### 6. Refactoring delle Sezioni

#### Sostituzione Sistematica

Per ogni sezione, sostituisci l'hero esistente:

```jsx
// Prima (esempio)
<div className="custom-hero-chi-siamo">
  <h1 className="big-title">Chi Siamo</h1>
  <p className="subtitle-text">Scopri la nostra storia</p>
</div>

// Dopo
<PageHero
  title="Chi Siamo"
  subtitle="Scopri la nostra storia"
  size="compact"
/>
```

#### Mapping Sezioni

- **Chi Siamo**: `title="Chi Siamo"` `subtitle="La nostra storia e missione"`
- **Team**: `title="Il Nostro Team"` `subtitle="Le persone dietro il successo"`
- **Servizi**: `title="I Nostri Servizi"` `subtitle="Soluzioni su misura per te"`
- **Progetti**: `title="I Nostri Progetti"` `subtitle="Realizzazioni di cui siamo orgogliosi"`
- **News**: `title="News"` `subtitle="Aggiornamenti e novità"`
- **Lavora con Noi**: `title="Lavora con Noi"` `subtitle="Entra a far parte del team"`
- **Contatti**: `title="Contatti"` `subtitle="Raggiungerci è semplice"`

### 7. Ottimizzazioni UX

#### Riduzione Altezza

- Riduci drasticamente l'altezza attuale (target: 60-70% in meno)
- Mantieni impatto visivo con typography e colori
- Lascia più spazio al contenuto principale

#### Accessibilità

- Alt text per background images
- Contrast ratio ottimale per testi
- Focus management appropriato
- Screen reader friendly

#### Performance

- CSS ottimizzato per render veloce
- Evita reflow/repaint
- Lazy loading per immagini pesanti

### 8. Testing Cross-Browser

#### Verifica Responsive

- Mobile (320px - 768px)
- Tablet (768px - 1024px)
- Desktop (1024px+)
- Large screens (1440px+)

#### Browser Compatibility

- Chrome/Edge/Firefox/Safari
- iOS Safari / Android Chrome
- Fallbacks per browser vecchi

### 9. Cleanup del Codice

#### Rimozione Codice Obsoleto

Dopo implementazione:

- Elimina classi CSS non utilizzate
- Rimuovi componenti hero duplicati
- Pulisci imports non necessari
- Aggiorna documentazione componenti

#### Ottimizzazione Bundle

- Tree shaking dei CSS
- Minimizzazione selettori
- Consolidamento media queries

### 10. Documentazione

#### Style Guide

Crea documentazione per:

- Utilizzo del componente PageHero
- Varianti disponibili
- Guidelines per nuove sezioni
- Best practices per contenuti

## Priorità di Implementazione

1. **Analisi** → Catalogare differenze attuali
2. **Design System** → Definire standard e componente
3. **Implementazione** → Componente condiviso riutilizzabile
4. **Migrazione** → Sostituire hero uno per volta
5. **Testing** → Verifica cross-device e cross-browser
6. **Cleanup** → Rimuovere codice obsoleto

## Risultato Atteso

- ✅ Hero consistenti in tutte le sezioni
- ✅ Altezza ridotta del 60-70%
- ✅ Componente unico riutilizzabile
- ✅ Performance migliorate
- ✅ Manutenibilità semplificata
- ✅ Design più pulito e moderno

## Note Importanti

- **🏠 HOME PAGE INTOCCABILE**: Non modificare assolutamente l'hero della home page
- Non modificare tutti gli hero insieme: procedi sezione per sezione
- Testa ogni modifica su dispositivi reali
- Mantieni backup del codice attuale durante la transizione
- Considera l'impatto SEO dei cambiamenti di struttura
- Il componente PageHero è solo per le sezioni interne, non per la home

Inizia analizzando la situazione attuale di tutti gli hero per capire l'entità delle differenze.
