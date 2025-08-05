# Claude Code - Fix Sistema Autenticazione e Remember Me

## Problema Identificato

Il sistema di autenticazione presenta diversi bug critici:

- 🔄 **Logout su refresh**: Utenti vengono sloggati ad ogni refresh della pagina
- 🏠 **Comportamento differente**: Dashboard vs sezione pubblica hanno comportamenti diversi
- 🧠 **Remember Me**: Non è chiaro se funziona correttamente
- 🔑 **Token management**: I token vengono cancellati in modo inaspettato

## Task di Analisi e Risoluzione

### 1. Analisi Completa del Flusso Auth Attuale

#### Frontend - Storage e Persistenza

- Esamina come vengono salvati i token (localStorage, sessionStorage, cookies)
- Verifica la logica di recupero token al page load
- Controlla l'implementazione del "Remember Me"
- Analizza differenze tra gestione auth in dashboard vs sezione pubblica

#### Backend - Token Management

- Verifica configurazione JWT (expiration, refresh tokens)
- Controlla middleware di autenticazione
- Analizza la logica di validazione token
- Verifica se esistono refresh token o solo access token

#### Router/Route Guards

- Esamina i route guards per dashboard
- Controlla la logica di redirect
- Verifica come viene gestita la sessione su route protette

### 2. Diagnosi Specifica dei Bug

#### Bug 1: Logout su Refresh Dashboard

Analizza:

```javascript
// Possibili cause da verificare:
- Token non persistito correttamente
- Middleware auth che fallisce il refresh
- Route guard che non aspetta la verifica token
- State management che si resetta
```

#### Bug 2: Token Cancellato su Sezione Pubblica

Analizza:

```javascript
// Possibili cause:
- Logic di cleanup inappropriata
- Interferenza tra auth contexts
- Event listeners che cancellano token
- Routing che triggera logout
```

#### Bug 3: Remember Me Non Funzionante

Verifica:

```javascript
// Controlla implementazione:
- Checkbox remember me collegato correttamente
- Differenza storage basata su remember me
- Expiration time diversa per remember me
- Persistenza attraverso browser restart
```

### 3. Implementazione delle Correzioni

#### Strategia Token Persistenza

Implementa una strategia robusta:

```javascript
// Esempio approccio consigliato:
if (rememberMe) {
  // localStorage per persistenza lunga
  localStorage.setItem("authToken", token);
  localStorage.setItem("rememberMe", "true");
} else {
  // sessionStorage per sessione corrente
  sessionStorage.setItem("authToken", token);
}
```

#### Fix Route Guards

Correggi i route guards per:

- Aspettare la verifica token prima di redirect
- Gestire correttamente gli stati di loading
- Differenziare comportamento dashboard vs pubblico

#### Token Refresh Strategy

Implementa se necessario:

- Auto-refresh dei token prima della scadenza
- Gestione graceful degli errori di refresh
- Logout automatico solo quando necessario

### 4. Testing Sistematico

#### Test Remember Me

- ✅ Login con remember me checked → chiudi browser → riapri → dovrebbe essere loggato
- ✅ Login senza remember me → chiudi browser → riapri → dovrebbe richiedere login
- ✅ Login con remember me → refresh pagina → dovrebbe rimanere loggato

#### Test Refresh Behavior

- ✅ Dashboard: refresh → dovrebbe rimanere loggato e in dashboard
- ✅ Sezione pubblica: refresh → token dovrebbe rimanere (se remember me)
- ✅ Mix navigation: dashboard → sezione pubblica → dashboard → token consistent

#### Test Token Lifecycle

- ✅ Login → token presente
- ✅ Refresh → token persistente
- ✅ Logout esplicito → token rimosso
- ✅ Token scaduto → redirect a login

### 5. Punti Critici da Verificare

#### Storage Management

```javascript
// Verifica implementazione corrente:
- Dove vengono salvati i token?
- Come viene gestito il retrieve al page load?
- Esistono race conditions?
- Come viene gestito il cleanup?
```

#### State Management

```javascript
// Se usi Redux/Context/Zustand:
- Lo state auth si resetta al refresh?
- La rehydration funziona correttamente?
- Gli initializers sono configurati bene?
```

#### API Calls

```javascript
// Verifica interceptors:
- I token vengono aggiunti automaticamente?
- Come vengono gestiti errori 401/403?
- C'è auto-retry su token refresh?
```

### 6. Possibili Soluzioni Quick-Win

#### Implementazione Robusta Auth Context

```javascript
// Pattern consigliato:
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica token al mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = getStoredToken(); // localStorage o sessionStorage
    if (token) {
      try {
        const userData = await verifyToken(token);
        setUser(userData);
      } catch (error) {
        removeStoredToken();
      }
    }
    setLoading(false);
  };
};
```

### 7. Debug Tools

Implementa logging temporaneo per capire il flusso:

```javascript
// Aggiungi console.log strategici:
- Token storage operations
- Auth state changes
- Route transitions
- API calls with auth headers
```

## Approccio di Risoluzione

1. **Prima**: Analisi completa senza modifiche (capire il problema)
2. **Poi**: Fix incrementali partendo dal più critico
3. **Infine**: Testing sistematico di tutti gli scenari
4. **Cleanup**: Rimozione debug logs e ottimizzazioni

## Note Importanti

- Non modificare tutto insieme: fix incrementali
- Mantieni backward compatibility se possibile
- Documenta le modifiche per future reference
- Considera security implications di ogni modifica

Inizia con l'analisi completa del flusso auth attuale e fammi sapere cosa trovi.
