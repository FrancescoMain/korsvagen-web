# Claude Code - Implementazione Sistema Dinamico Servizi

## Obiettivo del Progetto

Trasformare la sezione servizi da statica a completamente dinamica con gestione CRUD dalla dashboard admin.

## Analisi Funzionale

### Frontend Pubblico - Sezione Servizi

**Cosa deve mostrare:**

- Lista di tutti i servizi attivi
- Per ogni servizio: titolo, sottotitolo, immagine, descrizione, microservizi
- Pulsante "Richiedi Preventivo" → redirect a sezione contatti
- Design responsive e ottimizzato

### Dashboard Admin - Gestione Servizi

**Funzionalità CRUD:**

- ➕ Aggiungere nuovo servizio
- ✏️ Modificare servizio esistente
- 🗑️ Eliminare servizio
- 👁️ Visualizzare lista servizi con preview
- 🔄 Riordinare servizi (drag & drop opzionale)

## Task di Implementazione

### 1. Analisi Struttura Esistente

**Prima di iniziare, analizza:**

- Struttura HTML/CSS attuale della sezione servizi
- Contenuto statico esistente (per mappare i campi)
- Stile e layout da mantenere
- Immagini utilizzate attualmente
- Responsive behavior esistente

### 2. Database Schema

#### Tabella `services`

```sql
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  image_public_id VARCHAR(255), -- Cloudinary
  microservices JSON, -- Array di stringhe
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Struttura JSON per microservices

```json
{
  "microservices": [
    "Consulenza strategica",
    "Analisi di mercato",
    "Implementazione soluzioni",
    "Supporto post-vendita"
  ]
}
```

### 3. Backend API - Endpoints

#### API Routes per Frontend Pubblico

```javascript
// GET /api/services - Lista servizi pubblici
// Response: servizi attivi ordinati per display_order
```

#### API Routes per Dashboard Admin

```javascript
// GET /api/admin/services - Lista completa servizi
// POST /api/admin/services - Crea nuovo servizio
// GET /api/admin/services/:id - Dettaglio servizio
// PUT /api/admin/services/:id - Aggiorna servizio
// DELETE /api/admin/services/:id - Elimina servizio
// PUT /api/admin/services/reorder - Riordina servizi
```

#### Upload Immagini

```javascript
// POST /api/admin/services/:id/image - Upload immagine servizio
// DELETE /api/admin/services/:id/image - Elimina immagine
// Utilizza Cloudinary (pattern esistente PDF/team images)
```

### 4. Backend - Implementazione Endpoints

#### Controller per Frontend Pubblico

```javascript
// Endpoint GET /api/services
const getPublicServices = async (req, res) => {
  // Ritorna solo servizi attivi
  // Ordinati per display_order
  // Include tutti i campi necessari per la visualizzazione
};
```

#### Controller per Dashboard Admin

```javascript
const createService = async (req, res) => {
  // Validazione input
  // Upload immagine se presente
  // Salvataggio database
  // Response con servizio creato
};

const updateService = async (req, res) => {
  // Gestione upload nuova immagine
  // Update database
  // Cleanup vecchia immagine se sostituita
};

const deleteService = async (req, res) => {
  // Soft delete (is_active = false) o hard delete
  // Cleanup immagini Cloudinary
};
```

### 5. Dashboard Admin - UI Implementation

#### Lista Servizi

```jsx
// Componente ServicesManagement
- Tabella/Cards con tutti i servizi
- Azioni: Modifica, Elimina, Toggle Attivo
- Pulsante "Aggiungi Nuovo Servizio"
- Search/Filter opzionale
- Drag & drop per riordinare (opzionale)
```

#### Form Servizio (Crea/Modifica)

```jsx
// Componente ServiceForm
const ServiceForm = ({ serviceId, onSave, onCancel }) => {
  // Campi:
  // - Title (required)
  // - Subtitle (optional)
  // - Description (textarea, required)
  // - Image Upload (drag & drop)
  // - Microservices (array dinamico)
  // - Is Active (toggle)
  // - Display Order (numero)
};
```

#### Gestione Microservizi

```jsx
// Componente MicroservicesManager
const MicroservicesManager = ({ microservices, onChange }) => {
  // Lista dinamica con:
  // - Add new microservice
  // - Remove microservice
  // - Edit in-place
  // - Reorder (drag & drop)
};
```

### 6. Frontend Pubblico - Refactoring

#### Componente Servizi Dinamico

```jsx
// Trasforma la sezione statica in:
const ServicesSection = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicServices();
  }, []);

  // Mantieni lo stesso design/stile esistente
  // Ma popola con dati da API
};
```

#### Card/Item Servizio

```jsx
const ServiceCard = ({ service }) => {
  return (
    <div className="service-card">
      <img src={service.image_url} alt={service.title} />
      <h3>{service.title}</h3>
      <p className="subtitle">{service.subtitle}</p>
      <p className="description">{service.description}</p>

      {service.microservices && (
        <ul className="microservices">
          {service.microservices.map((micro) => (
            <li key={micro}>{micro}</li>
          ))}
        </ul>
      )}

      <button className="cta-button" onClick={() => navigateToContacts()}>
        Richiedi Preventivo
      </button>
    </div>
  );
};
```

### 7. Integrazione Cloudinary

#### Upload Immagini Servizi

- Riutilizza il pattern esistente (PDF/team images)
- Folder dedicato: `/services/`
- Ottimizzazioni automatiche per web
- Resize/crop per consistency
- Cleanup immagini obsolete

#### Trasformazioni Cloudinary

```javascript
// Ottimizzazioni per immagini servizi:
- Thumbnail per dashboard: w_300,h_200,c_fill
- Display pubblico: w_600,h_400,c_fill,q_auto,f_auto
- Mobile: w_300,dpr_auto,q_auto
```

### 8. Migrazione Dati Esistenti

#### Script di Migrazione

```javascript
// Crea script per migrare contenuti statici esistenti:
const migrateStaticServices = async () => {
  const existingServices = [
    {
      title: "Titolo dal contenuto statico attuale",
      subtitle: "Sottotitolo esistente",
      description: "Descrizione attuale",
      microservices: ["Micro1", "Micro2"],
      // ... altri dati
    },
    // ... altri servizi esistenti
  ];

  // Insert in database
};
```

### 9. Validazioni e Security

#### Frontend Validation

```javascript
// Form validation:
- Title: required, max 255 chars
- Subtitle: max 500 chars
- Description: required
- Microservices: max 10 items, max 100 chars each
- Image: format, size limits
```

#### Backend Validation

```javascript
// Server-side validation:
- Sanitize input
- Validate image uploads
- Check permissions (admin only)
- Rate limiting
```

### 10. Testing Strategy

#### Functional Testing

- ✅ CRUD operazioni funzionano correttamente
- ✅ Upload/eliminazione immagini
- ✅ Frontend pubblico mostra dati aggiornati
- ✅ Responsive design mantenuto
- ✅ Performance accettabili

#### Integration Testing

- ✅ Dashboard ↔ Backend API
- ✅ Frontend pubblico ↔ Backend API
- ✅ Cloudinary integration
- ✅ Database operations

#### User Experience Testing

- ✅ Admin può gestire servizi facilmente
- ✅ Utenti vedono servizi aggiornati immediatamente
- ✅ Pulsante "Richiedi Preventivo" funziona
- ✅ Loading states appropriati

### 11. Performance Optimizations

#### Caching Strategy

- Cache API responses lato frontend
- Database query optimization
- CDN per immagini (Cloudinary)

#### Loading Strategy

- Lazy loading immagini
- Skeleton loading per migliore UX
- Error boundaries per gestione errori

## Implementazione Step-by-Step

### Fase 1: Backend Foundation

1. Database schema e migrations
2. API endpoints implementation
3. Cloudinary integration
4. Basic validation e security

### Fase 2: Dashboard Admin

1. Lista servizi con CRUD operations
2. Form di creazione/modifica
3. Upload immagini
4. Gestione microservizi

### Fase 3: Frontend Pubblico

1. API integration
2. Refactoring da statico a dinamico
3. Mantenimento design esistente
4. Implementazione "Richiedi Preventivo"

### Fase 4: Migrazione e Testing

1. Script migrazione dati esistenti
2. Testing completo
3. Performance optimization
4. Deploy e monitoring

## Note Importanti

- Mantieni esattamente il design e UX esistente della sezione pubblica
- La dashboard deve essere intuitiva per gli admin
- Implementa sempre fallback per errori di caricamento
- Considera SEO impact del passaggio a dinamico
- Backup dei contenuti statici prima della migrazione

Inizia analizzando la struttura esistente per capire esattamente come sono organizzati i servizi statici attuali.
