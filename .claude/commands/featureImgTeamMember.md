# Claude Code - Implementazione Upload Immagini per Membri del Team

## Obiettivo della Feature

Implementare un sistema completo per gestire le immagini dei membri del team:

- 📤 **Upload**: Admin può caricare foto profilo per ogni membro (dashboard)
- 🌐 **Display**: Immagini visibili nella lista team e dettaglio (sezione pubblica)
- ☁️ **Storage**: Immagini salvate su Cloudinary
- 🔄 **CRUD**: Possibilità di aggiornare/eliminare immagini esistenti

## Task da Implementare

### 1. Analisi dell'Esistente

- Esamina la struttura attuale della sezione "Il mio team"
- Identifica il database schema per i membri del team
- Verifica la configurazione Cloudinary esistente (riutilizza quella dei PDF)
- Analizza il flusso di upload dei PDF per replicare il pattern

### 2. Backend - Database Schema

Aggiorna il modello del team member per includere:

```sql
-- Esempio di campi da aggiungere
image_url VARCHAR(500) NULL,
image_public_id VARCHAR(255) NULL, -- Per gestione Cloudinary
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### 3. Backend - API Endpoints

Implementa gli endpoint necessari:

- `POST /api/team/:id/image` - Upload nuova immagine
- `PUT /api/team/:id/image` - Aggiorna immagine esistente
- `DELETE /api/team/:id/image` - Elimina immagine
- `GET /api/team` - Lista con immagini (già esistente, da verificare)
- `GET /api/team/:id` - Dettaglio con immagine (già esistente, da verificare)

### 4. Backend - Cloudinary Integration

- Configura upload per immagini (differente dai PDF)
- Implementa ottimizzazioni: resize automatico, compressione
- Gestisci formati supportati (JPG, PNG, WebP)
- Implementa cleanup: elimina vecchia immagine quando se ne carica una nuova

### 5. Admin Dashboard - UI Upload

Aggiungi alla dashboard admin:

- Campo upload immagine nel form di creazione/modifica membro
- Preview dell'immagine caricata
- Possibilità di rimuovere/sostituire immagine
- Validazione lato client (dimensioni, formato, peso)
- Loading states durante upload

### 6. Frontend Pubblico - Display

Aggiorna la sezione pubblica team:

- **Lista team**: Mostra immagini come thumbnail/avatar
- **Dettaglio membro**: Mostra immagine in dimensione maggiore
- **Fallback**: Immagine placeholder se non presente
- **Responsive**: Immagini ottimizzate per mobile/desktop
- **Performance**: Lazy loading delle immagini

### 7. Ottimizzazioni Cloudinary

Implementa trasformazioni automatiche:

```javascript
// Esempi di ottimizzazioni
- Thumbnail per lista: w_150,h_150,c_fill,g_face
- Dettaglio: w_400,h_400,c_fill,g_face
- Formato automatico: f_auto,q_auto
- Responsive: w_auto,dpr_auto
```

### 8. Error Handling & Validazione

- Validazione formati file supportati
- Limiti dimensione file (es. max 5MB)
- Gestione errori di upload
- Fallback per immagini non disponibili
- Messaggi utente friendly

### 9. Testing & QA

Testa tutti i flussi:

- ✅ Upload immagine da dashboard admin
- ✅ Visualizzazione in lista team pubblica
- ✅ Visualizzazione in dettaglio membro
- ✅ Sostituzione immagine esistente
- ✅ Eliminazione immagine
- ✅ Comportamento senza immagine (placeholder)
- ✅ Performance su dispositivi mobili

## Considerazioni Tecniche

### Security

- Validazione rigorosa dei file upload
- Sanitizzazione nomi file
- Prevenzione upload di file malevoli

### Performance

- Compressione automatica delle immagini
- CDN delivery tramite Cloudinary
- Lazy loading nel frontend
- Caching appropriato

### UX/UI

- Upload drag & drop se possibile
- Preview immediato dopo upload
- Progress indicator durante upload
- Crop/resize tool opzionale per l'admin

## Approccio di Implementazione

1. **Inizia dal backend**: Schema DB + API endpoints
2. **Testa con Postman**: Verifica upload/download via API
3. **Implementa dashboard**: UI per admin
4. **Aggiorna frontend pubblico**: Display delle immagini
5. **Ottimizza e rifinisci**: Performance e UX

## Note Importanti

- Riutilizza il pattern dei PDF dove possibile
- Mantieni consistenza con lo stile esistente del sito
- Implementa sempre fallback per immagini mancanti
- Considera l'accessibilità (alt text per le immagini)

Inizia analizzando la struttura esistente e fammi sapere come è organizzato attualmente il sistema team.
