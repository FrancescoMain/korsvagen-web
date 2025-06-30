# Korsvagen Web

**Sito vetrina editoriale elegante e moderno per Korsvagen - Editore di Libri d'Arte e Letteratura**

## 🚀 Sprint 1 - Pre-fase: Work in Progress + Instagram Wall

### ✅ Completato
- [x] Setup repository con branch `main` e `dev`
- [x] Configurazione React TypeScript
- [x] Pagina "Work in Progress" con design elegante e moderno
- [x] Instagram Wall con gallery responsive
- [x] Design mobile responsive
- [x] Integrazione styled-components
- [x] Loading states e animazioni

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

## 🎨 Design Features

- **Dark Theme elegante** con gradient backgrounds
- **Typography editoriale** con font serif
- **Color palette premium** (oro #d4af37 su sfondo scuro)
- **Animazioni fluide** e hover effects
- **Layout responsive** ottimizzato per mobile
- **Loading states** con spinner animato

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

## 🌟 Instagram Integration

Attualmente usa **mock data** per la demo. Per l'integrazione reale:

1. **Opzione 1: Instagram Basic Display API**
   - Registra app su Facebook Developers
   - Ottieni access token
   - Sostituisci mock data in `InstagramWall.tsx`

2. **Opzione 2: Third-party services**
   - SnapWidget
   - LightWidget  
   - Instafeed.js

3. **Opzione 3: Instagram Graph API** (per account business)

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
