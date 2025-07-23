# Debug: Problema Autenticazione Settings

## Problema Risolto ✅

**Errore originale**: `useAuth must be used within an AuthProvider`

**Causa**: Ordine sbagliato dei provider in `App.tsx`

**Prima (SBAGLIATO)**:

```tsx
<ThemeProvider>
  <SettingsProvider>  ← useAuth() fallisce qui
    <AuthProvider>    ← AuthProvider troppo interno
```

**Dopo (CORRETTO)**:

```tsx
<ThemeProvider>
  <AuthProvider>      ← AuthProvider prima di tutto
    <SettingsProvider> ← Ora useAuth() funziona
```

## Modifiche Apportate

1. **`App.tsx`** - Corretto ordine provider
2. **`SettingsContext.tsx`** - Aggiunta integrazione autenticazione
3. **`settings.js`** - Corretto import `requireAuth`

## Test per Verificare

1. **Settings pubblici** (senza auth): `GET /api/settings/public` ✅
2. **Settings admin** (con auth): `PUT /api/settings/company_name` ✅

## Status

- ✅ Provider in ordine corretto
- ✅ Autenticazione integrata nel SettingsContext
- ✅ Token JWT incluso nelle chiamate admin
- ✅ Fallback per utenti non autenticati

Il problema 401 dovrebbe ora essere risolto per le chiamate dalla dashboard admin.
