# Task 3: Setup Database e Cloudinary per gestione contenuti e media

## Obiettivo

Implementare il database per la persistenza dei contenuti e configurare Cloudinary per la gestione ottimizzata di immagini e video.

## Azioni specifiche

0. **Analizzare documentazione precedente**

   - Analizzare la documentazione nella cartella /docs
   - Analizzare log nella cartella /logs

1. **Database Setup**

   - Scegliere e configurare database (Supabase)
   - Creare modelli dati per contenuti dinamici
   - Setup connection pooling per Vercel serverless
   - Implementare migrations/seeding iniziale

2. **Cloudinary Integration**

   - Setup account e configurazione API keys
   - Implementare upload endpoint sicuri
   - Configurare trasformazioni automatiche per ottimizzazione
   - Setup folder structure per organizzazione media

3. **Modelli Dati**
   ```javascript
   // Schema Page Content
   {
     pageId: String,
     sections: [{
       id: String,
       type: String, // 'hero', 'about', 'gallery', etc.
       content: {
         title: String,
         description: String,
         images: [{ cloudinaryId: String, url: String, alt: String }],
         videos: [{ cloudinaryId: String, url: String, poster: String }],
         customFields: Object
       },
       order: Number,
       isActive: Boolean
     }],
     metadata: {
       title: String,
       description: String,
       ogImage: String
     }
   }
   ```

## Struttura file da creare

```
api/
├── models/
│   ├── Page.js
│   ├── Section.js
│   ├── Media.js
│   └── User.js
├── utils/
│   ├── database.js
│   ├── cloudinary.js
│   └── migrations.js
└── media/
    ├── upload.js
    ├── delete.js
    └── transform.js
```

## Deliverables

- [ ] Database connection configurato
- [ ] Modelli dati implementati
- [ ] Cloudinary SDK integrato
- [ ] API endpoints per upload media
- [ ] Seeding data iniziale
- [ ] Documentazione schema database

## Configurazioni Cloudinary

- **Upload presets** per diversi tipi di media
- **Transformations** automatiche per responsive images
- **Folder organization**: `/korsvagen/{pageId}/{sectionType}/`
- **Security**: Signed uploads con timestamp validation

## Dependencies da aggiungere

```json
{
  "mongoose": "^7.4.0", // o "pg": "^8.11.0" per PostgreSQL
  "cloudinary": "^1.38.0",
  "multer": "^1.4.5-lts.1",
  "sharp": "^0.32.1",
  "uuid": "^9.0.0"
}
```

## Variabili d'ambiente richieste

```
DATABASE_URL=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_PRESET=
```

## Criteri di completamento

- Database connesso e operativo
- Modelli dati testati con CRUD operations
- Upload media funzionante con Cloudinary
- Transformations automatiche attive
- Seeding data iniziale completato

## Log Requirements

Creare file `logs/task-03-database-cloudinary.md` con:

- Timestamp di inizio/fine
- Configurazione database scelta e motivazioni
- Test upload/download media effettuati
- Performance metrics iniziali
- Problemi risolti durante integrazione
