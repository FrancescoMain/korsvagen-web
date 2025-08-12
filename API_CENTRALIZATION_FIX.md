# 🔧 Fix API Centralizzato - Sistema News

## Problema Risolto
Le chiamate API stavano andando a `https://www.korsvagen.it/api/news/admin/list` invece che al backend corretto.

## Soluzione Implementata

### ✅ Sistema API Centralizzato
- **File**: `client/src/utils/api.ts`
- **Configurazione Automatica**:
  - **Development**: `/api` (proxy a localhost:3001)
  - **Production**: `https://korsvagen-be.vercel.app/api`

### ✅ Proxy Configuration
- **File**: `client/package.json`
- **Aggiunto**: `"proxy": "http://localhost:3001"`

### ✅ Endpoints News Centralizzati
```javascript
// Tutti gli endpoint news ora usano il sistema centralizzato
api.news.getAdminList()     // GET /api/news/admin/list
api.news.create(data)       // POST /api/news/admin
api.news.update(id, data)   // PUT /api/news/admin/:id
api.news.delete(id)         // DELETE /api/news/admin/:id
// ... etc
```

### ✅ Componenti Aggiornati
- ✅ `NewsManager.tsx` - Usa `api.news.*`
- ✅ `NewsForm.tsx` - Usa `api.news.*`
- ✅ `NewsPage.tsx` - Usa `api.news.*`
- ✅ `NewsDetailPage.tsx` - Usa `api.news.*`

## 🧪 Come Testare

### 1. Verifica Configurazione
Quando apri la console nel browser dovrai vedere:
```
🌐 API Configuration: {
  environment: "development",
  baseURL: "/api",
  proxy: "http://localhost:3001"
}
```

### 2. Verifica Chiamate
Nelle Developer Tools → Network, le chiamate dovrebbero essere:
- ✅ `GET http://localhost:3000/api/news/admin/list` (proxied a localhost:3001)
- ❌ ~~`GET https://www.korsvagen.it/api/news/admin/list`~~

### 3. Server Backend
Assicurati che il server backend sia in esecuzione:
```bash
cd server && npm run dev
# Dovrebbe mostrare: Server KORSVAGEN avviato su porta 3001
```

## 🚀 Deploy in Produzione
Quando farai il deploy, il sistema automaticamente:
- **Frontend**: userà `https://korsvagen-be.vercel.app/api`
- **Backend**: dovrà essere deployato su Vercel come `korsvagen-be.vercel.app`

## 🔍 Debug
Se hai ancora problemi, controlla:

1. **Console log**: Verifica l'URL base nelle Developer Tools
2. **Network tab**: Verifica che le chiamate vadano al giusto endpoint
3. **Server**: Assicurati che `server/index.js` sia in running
4. **Proxy**: Verifica che `client/package.json` abbia il proxy configurato

## 🎯 Benefici
- ✅ **Centralizzato**: Tutti gli endpoint in un posto
- ✅ **Type-safe**: TypeScript su tutte le chiamate
- ✅ **Auto-config**: Ambiente detection automatico
- ✅ **Error handling**: Gestione errori unificata
- ✅ **Future-proof**: Facile da estendere per nuovi endpoint