# Korsvagen Web

**Sito vetrina moderno ed elegante per Korsvagen - Società di Costruzioni & Sviluppo Edilizio**

## 🏗️ Sprint 1 - Pre-fase: Work in Progress + Instagram Wall

### ✅ Completato

- [x] Setup repository con branch `main` e `dev`
- [x] Configurazione React TypeScript
- [x] Design moderno per società edilizia con palette professionale
- [x] Header con logo aziendale e brand positioning
- [x] Pagina "Sito in Costruzione" tematizzata
- [x] Instagram Wall con progetti edilizi realistici
- [x] Sezione contatti per lead generation
- [x] Design mobile responsive ottimizzato
- [x] Integrazione styled-components con tema edilizio

## 🛠 Tecnologie

- **React** 18.3.1 with TypeScript
- **Styled Components** per styling avanzato
- **Axios** per chiamate API
- **Create React App** per setup rapido

## 📁 Struttura Progetto

```
korsvagen-web/
├── public/
│   ├── index.html          # HTML template con meta SEO
│   └── ...
├── src/
│   ├── App.tsx             # App principale
│   ├── WorkInProgressPage.tsx  # Pagina Work in Progress
│   ├── InstagramWall.tsx   # Componente Instagram gallery
│   ├── index.css           # Stili globali
│   └── ...
└── package.json
```

## 🎨 Design Features per Edilizia

- **Color Palette Professionale**: Grigio antracite (#2C3E50) + Arancione edilizio (#E67E22)
- **Typography Moderna**: Montserrat (headings) + Open Sans (body text)
- **Layout Pulito**: Design minimalista con focus su progetti
- **Construction Theme**: Iconografia e terminologia del settore edilizio
- **Call-to-Action Efficaci**: Orientati alla lead generation
- **Sezione Contatti Prominente**: Per acquisizione clienti immediata

## 📱 Responsive Design

- Desktop: Layout a griglia ottimizzato
- Tablet: Adattamento automatico
- Mobile: Design mobile-first con typography scalabile

## 🚀 Getting Started

### Prerequisiti

- Node.js 16+
- npm o yarn

### Installazione

```bash
# Clone del repository
git clone <repository-url>
cd korsvagen-web

# Switch al branch dev
git checkout dev

# Installazione dipendenze
npm install

# Avvio server di sviluppo
npm start
```

Il sito sarà disponibile su [http://localhost:3000](http://localhost:3000)

## 📋 Scripts Disponibili

```bash
npm start      # Avvia server di sviluppo
npm test       # Esegue i test
npm run build  # Build per produzione
npm run eject  # Eject configurazione (non reversibile)
```

## � Instagram Integration Edilizia

Attualmente utilizza **immagini realistiche di progetti edilizi** da Unsplash per la demo.

### Per l'integrazione con Instagram reale:

1. **Instagram Basic Display API** (Raccomandato)

   ```bash
   # Setup per account aziendale @korsvagen
   - Registra app su Facebook Developers
   - Ottieni Long-Lived Access Token
   - Configura webhook per auto-refresh
   ```

2. **Instagram Graph API** (Per account business)

   - Accesso completo a media e insights
   - Perfetto per aziende con account verificato

3. **Servizi Third-party**
   - **LightWidget**: Embed widget professionale
   - **SnapWidget**: Gratis con watermark
   - **Instafeed.js**: Libreria JavaScript custom

### Content Strategy Suggerita:

- 📸 **Progetti completati**: Before/After
- 🏗️ **Cantieri in corso**: Progress updates
- 👷 **Team al lavoro**: Behind the scenes
- 🏢 **Edifici finiti**: Portfolio showcase

## 🚀 Deployment

### Build di produzione

```bash
npm run build
```

### Deploy Options

- **Netlify**: Drag & drop della cartella `build/`
- **Vercel**: Connessione diretta al repository GitHub
- **GitHub Pages**: Setup con GitHub Actions
- **Server tradizionale**: Upload cartella `build/`

## 🔄 Branching Strategy

- `main`: Branch di produzione (deployment)
- `dev`: Branch di sviluppo (feature development)

## 📞 Next Steps

### Fase A: Infrastruttura

- [ ] Setup dominio e DNS
- [ ] Configurazione SSL
- [ ] Deploy iniziale

### Fase B: Instagram Integration

- [ ] Integrazione API Instagram reale
- [ ] Test con account cliente
- [ ] Ottimizzazione performance

### Sprint Successivi

- [ ] Sezioni aggiuntive (Chi siamo, Catalogo, Contatti)
- [ ] CMS integration
- [ ] E-commerce features
- [ ] SEO avanzato

## 📄 License

© 2025 Korsvagen. Tutti i diritti riservati.
