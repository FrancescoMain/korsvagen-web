# 🚫 CORS Troubleshooting Guide

## Problema
Errori CORS quando si accede da `korsvagen.it` al backend API.

## ✅ Soluzioni Implementate

### 1. CORS Configuration Potenziata
**File**: `server/index.js`
- ✅ Aggiunto logging dettagliato per ogni richiesta CORS
- ✅ Inclusi domini: `korsvagen.it` e `www.korsvagen.it`
- ✅ Supporto per preview URLs di Vercel

### 2. API Configuration Migliorata
**File**: `client/src/utils/api.ts`
- ✅ Detection automatica del dominio
- ✅ Configurazione specifica per `korsvagen.it`
- ✅ Logging dettagliato della configurazione

### 3. Endpoint di Test
**Aggiunti endpoints**:
- `GET /api/cors-test` - Test specifico CORS
- `GET /api/test` - Test generale con info origin

## 🧪 Come Testare

### Dalla Console del Browser (su korsvagen.it):

1. **Verifica configurazione API**:
   ```javascript
   // Dovrebbe mostrare la configurazione corretta
   console.log(window.location.hostname); // "korsvagen.it" o "www.korsvagen.it"
   ```

2. **Test manuale CORS**:
   ```javascript
   fetch('https://korsvagen-be.vercel.app/api/cors-test', {
     method: 'GET',
     credentials: 'include'
   })
   .then(r => r.json())
   .then(data => console.log('CORS Test:', data))
   .catch(err => console.error('CORS Error:', err));
   ```

3. **Test endpoint news**:
   ```javascript
   fetch('https://korsvagen-be.vercel.app/api/news', {
     method: 'GET',
     credentials: 'include'
   })
   .then(r => r.json())
   .then(data => console.log('News API:', data))
   .catch(err => console.error('News Error:', err));
   ```

## 🔍 Debug Steps

### 1. Controlla Console Log
Su `korsvagen.it`, nella console dovrebbe apparire:
```
🌐 API Configuration: {
  environment: "production",
  hostname: "korsvagen.it",
  baseURL: "https://korsvagen-be.vercel.app/api",
  proxy: "N/A"
}
```

### 2. Verifica Network Tab
Nelle Developer Tools → Network:
- ✅ Le richieste vanno a `https://korsvagen-be.vercel.app/api/*`
- ✅ Status code 200 (non 404 o CORS error)
- ✅ Response headers includono `Access-Control-Allow-Origin`

### 3. Controlla Server Logs
I log del backend dovrebbero mostrare:
```
🌐 CORS request from origin: https://korsvagen.it
✅ CORS allowing allowed origin: https://korsvagen.it
```

## 🚨 Possibili Cause del Problema

### 1. Backend Non Deployato
**Problema**: `korsvagen-be.vercel.app` non esiste o non risponde
**Soluzione**: Deploy del backend su Vercel con il nome giusto

### 2. Cache Browser
**Problema**: Cache del browser con vecchie configurazioni
**Soluzione**: 
- Hard refresh: `Ctrl+F5` o `Cmd+Shift+R`
- Clear cache: Developer Tools → Application → Storage → Clear site data

### 3. Environment Variables
**Problema**: `CORS_ORIGIN` non configurato su Vercel
**Soluzione**: Aggiungi environment variable su Vercel:
```
CORS_ORIGIN=https://korsvagen.it,https://www.korsvagen.it
```

### 4. URL Backend Sbagliato
**Problema**: Il backend è deployato con un nome diverso
**Soluzione**: Aggiorna `API_BASE_URL` nel file `api.ts`

## ⚡ Quick Fix Temporaneo

Se il problema persiste, puoi temporaneamente permettere tutti gli origins:

**File**: `server/index.js`
```javascript
// TEMPORARY FIX - RIMUOVERE IN PRODUZIONE
const corsOptions = {
  origin: true, // Permette tutti gli origins
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  // ... resto della configurazione
};
```

⚠️ **ATTENZIONE**: Questa è una soluzione temporanea solo per debug!

## 🎯 Verifica Finale

1. **Deploy**: Assicurati che il backend sia su `korsvagen-be.vercel.app`
2. **Environment**: Verifica che `CORS_ORIGIN` sia configurato
3. **Cache**: Pulisci la cache del browser
4. **Test**: Usa gli endpoint di test per verificare il CORS
5. **Monitor**: Controlla i log del server per richieste CORS

Se tutto è configurato correttamente, le richieste da `korsvagen.it` dovrebbero funzionare senza errori CORS! 🚀