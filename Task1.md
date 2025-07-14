# Task 2: Setup Backend Express.js per Vercel

## Obiettivo

Creare la struttura backend Express.js ottimizzata per il deployment su Vercel con supporto per API serverless.

## Azioni specifiche

0. **Analizzare documentazione precedente**

   - Analizzare la documentazione nella cartella /docs
   - Analizzare log nella cartella /logs

1. **Struttura backend**

   - Creare directory `api/` per le route Vercel
   - Setup Express.js con middleware essenziali
   - Configurare CORS per frontend
   - Implementare error handling globale

2. **Configurazione Vercel**

   - Creare `vercel.json` con configurazioni API
   - Setup variabili d'ambiente per production
   - Configurare rewrite rules per SPA + API

3. **Setup base delle route**
   - `/api/auth/*` - Route autenticazione
   - `/api/content/*` - Route gestione contenuti
   - `/api/health` - Health check endpoint
   - Middleware di logging e validazione

## Struttura file da creare

```
api/
├── auth/
│   ├── login.js
│   ├── logout.js
│   └── verify.js
├── content/
│   ├── pages.js
│   ├── sections.js
│   └── media.js
├── utils/
│   ├── db.js
│   ├── auth.js
│   └── validation.js
└── health.js
```

## Deliverables

- [x] `vercel.json` - Configurazione deployment
- [x] `api/health.js` - Health check endpoint
- [x] `api/utils/` - Utilities condivise
- [x] `package.json` aggiornato con dependencies backend
- [x] `.env.example` - Template variabili d'ambiente

## Criteri di completamento

- Backend deployabile su Vercel
- Endpoint health check funzionante
- CORS configurato correttamente
- Error handling implementato
- Logging strutturato attivo

## Dependencies da aggiungere

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "helmet": "^7.0.0",
  "morgan": "^1.10.0",
  "dotenv": "^16.3.1",
  "joi": "^17.9.2"
}
```

## Log Requirements

Creare file `logs/task-02-backend-setup.md` con:

- Timestamp di inizio/fine
- Configurazioni implementate
- Test endpoint effettuati
- Problemi risolti durante setup
