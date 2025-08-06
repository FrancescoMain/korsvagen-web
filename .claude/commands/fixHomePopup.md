# Claude Code - Fix Popup "Sessione Scaduta" nelle Sezioni Pubbliche

## Problema Identificato

Nelle sezioni pubbliche del sito compare un popup fastidioso "Sessione scaduta - Effettua di nuovo il login", ma:

- ❌ **Comportamento errato**: Le sezioni pubbliche NON dovrebbero mostrare messaggi di autenticazione
- ✅ **Comportamento corretto**: Solo la dashboard admin dovrebbe gestire/mostrare stati di autenticazione
- 🎯 **Obiettivo**: Gli utenti pubblici non devono mai sapere se c'è una sessione admin attiva o scaduta

## Analisi del Problema

### Possibili Cause Root

1. **Auth Context globale**: Sistema di autenticazione che monitora tutto il sito
2. **API Interceptors**: Interceptors che mostrano popup su errori 401/403 ovunque
3. **Route Guards**: Protezioni che si attivano anche su rotte pubbliche
4. **Event Listeners globali**: Listener che reagiscono a token expired su tutto il sito
5. **State Management**: Redux/Context che propaga stati auth anche al pubblico

## Task di Investigazione e Risoluzione

### 1. Identificazione Origine del Popup

#### Cerca il Codice del Popup

```javascript
// Cerca nel codebase:
- "Sessione scaduta"
- "Effettua di nuovo il login"
- "Session expired"
- "Please login again"
- Modal/Toast components con questi messaggi
```

#### Traccia il Call Stack

```javascript
// Aggiungi breakpoint o console.trace() quando appare il popup:
console.trace("Popup sessione scaduta triggered from:");

// Identifica da dove viene chiamato:
- Componente che mostra il popup
- Funzione che lo triggera
- Event/state che lo causa
```

### 2. Analisi API Interceptors

#### Axios/Fetch Interceptors

```javascript
// Controlla interceptors globali:
// Esempio di interceptor problematico:
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ❌ QUESTO È IL PROBLEMA: si attiva ovunque
      showSessionExpiredPopup();
    }
    return Promise.reject(error);
  }
);

// ✅ SOLUZIONE: Condizionale basata su rotta/contesto
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo se siamo in dashboard admin
      if (isAdminRoute() || isAuthenticatedContext()) {
        showSessionExpiredPopup();
      }
    }
    return Promise.reject(error);
  }
);
```

### 3. Analisi Auth Context/State

#### Auth Provider Scope

```javascript
// Verifica se AuthProvider avvolge tutto il sito:
// ❌ PROBLEMA: AuthProvider globale
<AuthProvider>
  <Router>
    <PublicRoutes /> {/* Non dovrebbe avere auth logic */}
    <AdminRoutes />  {/* Solo qui serve auth logic */}
  </Router>
</AuthProvider>

// ✅ SOLUZIONE: AuthProvider solo per admin
<Router>
  <PublicRoutes /> {/* Nessun auth context */}
  <AuthProvider>
    <AdminRoutes /> {/* Auth logic solo qui */}
  </AuthProvider>
</Router>
```

#### State Management Analysis

```javascript
// Se usi Redux/Zustand/Context:
// Verifica che gli stati auth non vengano ascoltati nelle sezioni pubbliche
// Le sezioni pubbliche dovrebbero essere completamente isolate dall'auth
```

### 4. Implementazione della Soluzione

#### Strategia A: Context Condizionale

```javascript
// Crea helper per identificare se siamo in admin
const isAdminRoute = () => {
  return (
    window.location.pathname.startsWith("/admin") ||
    window.location.pathname.startsWith("/dashboard")
  );
};

const isPublicRoute = () => {
  return !isAdminRoute();
};

// Usa nelle condizioni per mostrare popup
const handleAuthError = (error) => {
  if (error.response?.status === 401 && isAdminRoute()) {
    showSessionExpiredPopup();
  }
  // Per rotte pubbliche: silenzioso, nessun popup
};
```

#### Strategia B: Route-Based Auth Provider

```javascript
// Componente wrapper che applica auth solo dove necessario
const ConditionalAuthProvider = ({ children }) => {
  const isAdmin = useLocation().pathname.startsWith("/admin");

  if (isAdmin) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return <>{children}</>;
};
```

#### Strategia C: Interceptor Intelligente

```javascript
// Interceptor che distingue tra rotte pubbliche e admin
const createSmartInterceptor = () => {
  return axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const isAdminApi =
        error.config?.url?.includes("/admin/") ||
        error.config?.headers?.["X-Admin-Request"];
      const isAdminRoute = window.location.pathname.startsWith("/admin");

      if (error.response?.status === 401 && (isAdminApi || isAdminRoute)) {
        showSessionExpiredPopup();
      }

      return Promise.reject(error);
    }
  );
};
```

### 5. Refactoring Auth Architecture

#### Separazione Concerns

```javascript
// File: PublicApp.jsx - Nessuna logica auth
const PublicApp = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chi-siamo" element={<AboutPage />} />
        <Route path="/servizi" element={<ServicesPage />} />
        {/* ... altre rotte pubbliche */}
      </Routes>
    </Router>
  );
};

// File: AdminApp.jsx - Con logica auth completa
const AdminApp = () => {
  return (
    <AuthProvider>
      <AdminRouter>
        <Routes>
          <Route path="/admin/*" element={<Dashboard />} />
        </Routes>
      </AdminRouter>
    </AuthProvider>
  );
};

// File: App.jsx - Combina le due app
const App = () => {
  const isAdminRoute = window.location.pathname.startsWith("/admin");

  return isAdminRoute ? <AdminApp /> : <PublicApp />;
};
```

### 6. Testing della Soluzione

#### Scenario Testing

```javascript
// Test Cases:
// ✅ Naviga sezioni pubbliche → nessun popup auth mai
// ✅ Login admin → entra dashboard → logout → popup solo in dashboard
// ✅ Token scade mentre in sezione pubblica → nessun popup
// ✅ Token scade mentre in dashboard → popup corretto
// ✅ API call fallisce (401) da sezione pubblica → nessun popup
// ✅ API call fallisce (401) da dashboard → popup appropriato
```

#### Cross-Route Testing

```javascript
// Testa transizioni:
// Dashboard admin → sezione pubblica → dashboard
// Sezione pubblica → login → dashboard → logout → sezione pubblica
// Token expiry durante navigazione tra pubblico e admin
```

### 7. Cleanup e Ottimizzazioni

#### Rimozione Codice Obsoleto

- Rimuovi auth logic dalle componenti pubbliche
- Pulisci imports auth non necessari nelle rotte pubbliche
- Elimina listeners/effects auth dalle pagine pubbliche

#### Performance Improvements

- Lazy loading del AuthProvider solo quando necessario
- Evita inizializzazioni auth su rotte pubbliche
- Riduci bundle size separando auth logic

### 8. Implementazione Logging per Debug

#### Debug Temporaneo

```javascript
// Aggiungi logging per capire il flusso:
const logAuthEvent = (event, context) => {
  console.log(`[AUTH DEBUG] ${event}`, {
    currentPath: window.location.pathname,
    isAdminRoute: isAdminRoute(),
    context: context,
    timestamp: new Date().toISOString(),
  });
};

// Usa nei punti critici:
logAuthEvent("Token expired", { source: "interceptor" });
logAuthEvent("Popup triggered", { component: "AuthModal" });
```

## Soluzione Prioritaria Consigliata

### Quick Fix (Immediato)

```javascript
// Modifica il popup per non mostrarsi su rotte pubbliche:
const showSessionExpiredPopup = () => {
  // Guard clause per rotte pubbliche
  if (isPublicRoute()) {
    console.log("Skipping auth popup on public route");
    return;
  }

  // Mostra popup solo per admin
  setShowAuthModal(true);
};
```

### Long Term Fix (Architetturale)

1. Separare completamente auth logic tra pubblico e admin
2. AuthProvider solo per dashboard admin
3. API interceptors intelligenti che distinguono contesto
4. Testing completo separazione concerns

## Note Critiche

- **PRIVACY**: Gli utenti pubblici non devono mai vedere riferimenti all'admin
- **UX**: Le sezioni pubbliche devono funzionare sempre, indipendentemente dallo stato auth
- **SECURITY**: Non esporre informazioni sui stati di autenticazione al pubblico
- **TESTING**: Testa sempre come utente anonimo per verificare che non ci siano leak di logica admin

Inizia cercando dove viene generato il popup "Sessione scaduta" e traccia da dove viene chiamato.
