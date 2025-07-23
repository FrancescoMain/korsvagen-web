# 🔐 CREDENZIALI DI TEST - SISTEMA LOGIN KORSVAGEN

## 👤 UTENTI AMMINISTRATORI DI TEST

### Utente 1: Amministratore Sistema

- **Username:** `admin`
- **Email:** `admin@korsvagen.it`
- **Password:** `KorsvagenAdmin2024!`
- **Ruolo:** `super_admin`

### Utente 2: Admin Korsvagen

- **Username:** `korsvagen_admin`
- **Email:** `korsvagen@admin.it`
- **Password:** `Korsvagen1234!`
- **Ruolo:** `super_admin`

---

## 🚀 COME TESTARE IL LOGIN

1. **Avvia il backend:**

   ```bash
   cd server
   node index.js
   ```

2. **Avvia il frontend:**

   ```bash
   cd client
   npm start
   ```

3. **Apri il browser:** http://localhost:3000/login

4. **Usa una delle credenziali sopra** per effettuare il login

---

## 📊 DATABASE SETUP

Per utilizzare queste credenziali, assicurati di aver eseguito il file:

```sql
docs/database-schema.sql
```

su Supabase che contiene:

- Schema delle tabelle
- Utenti amministratori di test
- Dati iniziali dell'applicazione
- Funzioni utility

---

## 🔧 CONFIGURAZIONE BACKEND

Assicurati che le seguenti variabili d'ambiente siano configurate nel server:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Server
PORT=3001
NODE_ENV=development
```

---

**✅ SISTEMA PRONTO PER IL TEST!**
