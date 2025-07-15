Task 4: Implementazione Sistema di Autenticazione Sicuro

## Obiettivo

Implementare un sistema di autenticazione robusto con JWT, protezione CSRF, rate limiting e gestione sessioni per l'accesso alla dashboard CMS.

## Azioni specifiche

0. **Analizzare documentazione precedente**

   - Analizzare la documentazione nella cartella /docs
   - Analizzare log nella cartella /logs

1. **JWT Authentication**

   - Implementare login con email/password
   - Generazione e validazione JWT tokens
   - Refresh token mechanism per sicurezza
   - Middleware di autenticazione per route protette

2. **Security Features**

   - Password hashing con bcrypt
   - Rate limiting per login attempts
   - CSRF protection
   - Session management sicuro
   - Logout con token blacklisting

3. **User Management**
   - Modello User con ruoli (admin, editor)
   - Password reset via email (opzionale per MVP)
   - Account lockout dopo tentativi falliti
   - Audit log per accessi

## Struttura API Endpoints

```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
POST /api/auth/change-password
```

## Middleware di sicurezza

```javascript
// authMiddleware.js
const authenticateToken = (req, res, next) => {
  // Verifica JWT token
};

const requireAdmin = (req, res, next) => {
  // Verifica ruolo admin
};

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 5, // max 5 tentativi login
});
```

## Struttura file da creare

```
api/
├── auth/
│   ├── login.js
│   ├── logout.js
│   ├── refresh.js
│   ├── me.js
│   └── change-password.js
├── middleware/
│   ├── auth.js
│   ├── rateLimiter.js
│   └── validation.js
└── utils/
    ├── jwt.js
    ├── password.js
    └── security.js
```

## Deliverables

- [ ] JWT authentication implementato
- [ ] Login/logout endpoints funzionanti
- [ ] Middleware di autenticazione
- [ ] Rate limiting configurato
- [ ] Password hashing sicuro
- [ ] Refresh token mechanism
- [ ] Documentazione API auth

## Dependencies da aggiungere

```json
{
  "jsonwebtoken": "^9.0.1",
  "bcryptjs": "^2.4.3",
  "express-rate-limit": "^6.7.1",
  "express-validator": "^7.0.1",
  "cookie-parser": "^1.4.6",
  "express-session": "^1.17.3"
}
```

## Variabili d'ambiente richieste

```
JWT_SECRET=your_super_secret_jwt_key_256_bits
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret
```

## Security Checklist

- [ ] Password strength validation
- [ ] JWT secret sufficientemente complesso
- [ ] Rate limiting su login endpoint
- [ ] Secure cookie settings (httpOnly, secure, sameSite)
- [ ] CORS configurato correttamente
- [ ] Input validation su tutti i campi
- [ ] Error messages che non rivelano info sensibili

## Criteri di completamento

- Login funzionante con credenziali valide
- Token JWT generato e validato correttamente
- Middleware di auth protegge route sensibili
- Rate limiting previene brute force attacks
- Logout invalida correttamente i token
- Refresh token mechanism operativo

## Log Requirements

Creare file `logs/task-04-authentication.md` con:

- Timestamp di inizio/fine
- Test di sicurezza effettuati
- Configurazioni JWT implementate
- Rate limiting testato
- Problemi di sicurezza identificati e risolti
