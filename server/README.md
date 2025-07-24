# KORSVAGEN WEB BACKEND - FASE INIZIALE

Backend Express.js per l'applicazione web KORSVAGEN, sviluppato come sistema monorepo compatibile con Vercel.

## 🎯 Obiettivo Completato

✅ **Backend Express.js operativo** nella cartella `server/`  
✅ **Connessione Supabase** configurata e testata  
✅ **Integrazione Cloudinary** configurata e testata  
✅ **Compatibilità Vercel** per deployment serverless  
✅ **Sistema monorepo** funzionante con il client React  
✅ **Documentazione strutturata** in tutti i file

## 🏗️ Struttura del Progetto

```
korsvagen-web/
├── client/                 # Frontend React esistente
├── server/                 # 🆕 Backend Express.js
│   ├── config/            # Configurazioni Supabase/Cloudinary
│   ├── routes/            # Endpoint API (solo health.js)
│   ├── utils/             # Utility (logging, auth, etc.)
│   ├── index.js          # Server principale
│   └── package.json      # Dipendenze backend
├── .env                   # Variabili d'ambiente
├── vercel.json           # Configurazione deployment Vercel
└── README.md             # Documentazione principale
```

## 🚀 Avvio del Server

### Locale (Development)

```bash
# Dalla directory root del progetto
cd server
npm install
node index.js
```

### Vercel (Production)

Il server è configurato per deployment automatico su Vercel tramite `vercel.json`.

## 📡 Endpoint Disponibili

### Health Check

- **GET** `/api/health` - Stato generale del server
- **GET** `/api/health/detailed` - Diagnostica completa con stato servizi

### Test degli Endpoint

```bash
# Health check base
curl http://localhost:3001/api/health

# Health check dettagliato
curl http://localhost:3001/api/health/detailed
```

## 🔧 Configurazione

### Variabili d'Ambiente Richieste

```env
# Supabase Database
SUPABASE_URL=https://xmkbguocqvhhydinlrwg.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=dpvzuvloe
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# API Configuration
API_BASE_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:3000

# Environment
NODE_ENV=development
LOG_LEVEL=info
```

## 🧪 Test di Funzionamento

Il server include diagnostica automatica all'avvio:

- ✅ Configurazione Supabase validata
- ✅ Configurazione Cloudinary validata
- ✅ Server avviato sulla porta 3001
- ✅ Endpoint health check funzionanti

## 📋 Stato Implementazione

### ✅ Completato (Fase Attuale)

- [x] Setup Express.js server
- [x] Configurazione Supabase
- [x] Configurazione Cloudinary
- [x] Sistema di logging strutturato
- [x] Health check endpoints
- [x] Configurazione Vercel
- [x] Documentazione completa

### 🔄 Prossime Fasi

- [ ] Autenticazione JWT
- [ ] CRUD Utenti
- [ ] Upload Media Cloudinary
- [ ] API Contenuti CMS
- [ ] API Portfolio Progetti
- [ ] API News/Blog
- [ ] Form Contatti

## 🏷️ Versione

**v1.0.0** - Fase Iniziale Backend  
Data: Luglio 2025  
Autore: KORSVAGEN S.R.L.

## 📝 Note Tecniche

### Architettura

- **Framework**: Express.js con ES Modules
- **Database**: Supabase (PostgreSQL)
- **Media Storage**: Cloudinary
- **Deployment**: Vercel Serverless Functions
- **Logging**: Sistema strutturato JSON

### Sicurezza

- CORS configurato per domini autorizzati
- Helmet per headers di sicurezza
- Rate limiting implementato
- Validazione input con express-validator

### Performance

- Middleware ottimizzati
- Gestione errori centralizzata
- Logging strutturato per monitoring
- Timeout configurabili per servizi esterni

---

**🎉 Backend KORSVAGEN operativo e pronto per le prossime fasi di sviluppo!**
