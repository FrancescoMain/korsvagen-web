# Task 5: API RESTful per gestione contenuti CMS

## Obiettivo

Implementare API complete per CRUD operations sui contenuti dinamici delle pagine, con supporto per media Cloudinary e validazione robusta.

## Azioni specifiche

0. **Analizzare documentazione precedente**

   - Analizzare la documentazione nella cartella /docs
   - Analizzare log nella cartella /logs

1. **Pages API**

   - GET /api/content/pages - Lista tutte le pagine
   - GET /api/content/pages/:pageId - Dettagli pagina specifica
   - PUT /api/content/pages/:pageId - Aggiorna contenuti pagina
   - POST /api/content/pages - Crea nuova pagina

2. **Sections API**

   - GET /api/content/sections/:pageId - Sezioni di una pagina
   - POST /api/content/sections/:pageId - Aggiungi sezione
   - PUT /api/content/sections/:sectionId - Aggiorna sezione
   - DELETE /api/content/sections/:sectionId - Elimina sezione
   - PUT /api/content/sections/:sectionId/reorder - Riordina sezioni

3. **Media API (integrata con Cloudinary)**
   - POST /api/media/upload - Upload immagini/video
   - DELETE /api/media/:mediaId - Elimina media
   - GET /api/media/gallery - Gallery media esistenti
   - POST /api/media/optimize - Ottimizza media esistenti

## Struttura API Response

```javascript
// GET /api/content/pages/home
{
  "success": true,
  "data": {
    "pageId": "home",
    "metadata": {
      "title": "Homepage",
      "description": "Welcome to our site",
      "ogImage": "https://res.cloudinary.com/..."
    },
    "sections": [
      {
        "id": "hero-1",
        "type": "hero",
        "order": 1,
        "isActive": true,
        "content": {
          "title": "Welcome",
          "description": "Our amazing site",
          "images": [
            {
              "cloudinaryId": "hero_image_abc123",
              "url": "https://res.cloudinary.com/...",
              "alt": "Hero image",
              "transformations": {
                "thumbnail": "c_thumb,w_300,h_200",
                "mobile": "c_scale,w_768",
                "desktop": "c_scale,w_1920"
              }
            }
          ],
          "customFields": {
            "buttonText": "Learn More",
            "buttonLink": "/about"
          }
        }
      }
    ]
  }
}
```

## Struttura file da creare

```
api/
├── content/
│   ├── pages/
│   │   ├── index.js         // Lista pagine
│   │   ├── [pageId].js      // CRUD singola pagina
│   │   └── create.js        // Crea nuova pagina
│   ├── sections/
│   │   ├── [pageId].js      // Sezioni per pagina
│   │   ├── create.js        // Crea sezione
│   │   ├── update.js        // Aggiorna sezione
│   │   ├── delete.js        // Elimina sezione
│   │   └── reorder.js       // Riordina sezioni
│   └── media/
│       ├── upload.js        // Upload media
│       ├── delete.js        // Elimina media
│       ├── gallery.js       // Lista media
│       └── optimize.js      // Ottimizza media
├── validators/
│   ├── pageValidator.js
│   ├── sectionValidator.js
│   └── mediaValidator.js
└── controllers/
    ├── pageController.js
    ├── sectionController.js
    └── mediaController.js
```

## Deliverables

- [ ] CRUD completo per Pages
- [ ] CRUD completo per Sections
- [ ] API Media con Cloudinary
- [ ] Validazione input robusta
- [ ] Error handling standardizzato
- [ ] Documentazione API (Postman/Swagger)
- [ ] Test API con dati reali

## Validation Rules

```javascript
// Page validation
const pageSchema = {
  pageId: { required: true, type: "string", pattern: /^[a-z0-9-]+$/ },
  metadata: {
    title: { required: true, type: "string", maxLength: 100 },
    description: { required: true, type: "string", maxLength: 300 },
  },
};

// Section validation
const sectionSchema = {
  type: { required: true, enum: ["hero", "about", "gallery", "contact"] },
  content: { required: true, type: "object" },
  order: { required: true, type: "number", min: 0 },
};
```

## Security Features

- [ ] Autenticazione JWT richiesta per tutte le operations
- [ ] Validazione input sanitization
- [ ] Rate limiting su upload endpoints
- [ ] File type validation per media
- [ ] Size limits per upload
- [ ] CSRF protection

## Criteri di completamento

- Tutte le API endpoint funzionanti
- Validazione completa implementata
- Upload media integrato con Cloudinary
- Error handling standardizzato
- Documentazione API completa
- Test coverage > 80%

## Log Requirements

Creare file `logs/task-05-content-api.md` con:

- Timestamp di inizio/fine
- Endpoint implementati e testati
- Performance tests risultati
- Integrazione Cloudinary verificata
- Problemi riscontrati e soluzioni
