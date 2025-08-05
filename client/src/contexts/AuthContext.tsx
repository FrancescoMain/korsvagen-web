/**
 * KORSVAGEN WEB APPLICATION - AUTH CONTEXT
 *
 * Context di autenticazione centralizzato per gestire
 * l'autenticazione degli amministratori nell'applicazione.
 *
 * Features:
 * - Gestione stato utente e token
 * - Login/Logout automatizzato
 * - Refresh token automatico
 * - Persistenza locale delle credenziali
 * - Integrazione con toast notifications
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import toast from "react-hot-toast";
import { apiClient } from "../utils/api";

/**
 * TIPI E INTERFACCE
 */

interface User {
  id: string;
  username: string;
  email: string;
  role: "admin" | "editor" | "super_admin";
  profile_data?: {
    firstName?: string;
    lastName?: string;
    preferences?: {
      theme?: string;
      language?: string;
      notifications?: boolean;
    };
  };
  last_login?: string;
}

interface AuthContextType {
  // Stato
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Metodi
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;

  // Utilità
  hasRole: (role: string | string[]) => boolean;
  isLoading: boolean;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      access: string;
      refresh: string;
    };
  };
}

/**
 * CONFIGURAZIONE
 */


/**
 * CONTEXT E PROVIDER
 */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Stati principali
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFailedPermanently, setRefreshFailedPermanently] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [skipMeValidation, setSkipMeValidation] = useState(false);

  // Stati derivati
  const isAuthenticated = !!user && !!token;
  const isLoading = loading;

  /**
   * UTILITY FUNCTIONS
   */

  // Funzione per recuperare token dal storage appropriato
  const getStoredTokens = useCallback(() => {
    // Prova prima localStorage (remember me), poi sessionStorage
    let accessToken = localStorage.getItem("korsvagen_auth_token");
    let refreshToken = localStorage.getItem("korsvagen_refresh_token");
    let rememberMe = localStorage.getItem("korsvagen_remember_me") === "true";
    
    if (!accessToken) {
      accessToken = sessionStorage.getItem("korsvagen_auth_token");
      refreshToken = sessionStorage.getItem("korsvagen_refresh_token");
      rememberMe = sessionStorage.getItem("korsvagen_remember_me") === "true";
    }
    
    return { accessToken, refreshToken, rememberMe };
  }, []);

  // Rimuovi token da entrambi i storage
  const clearTokens = useCallback(() => {
    console.log("🧹 Pulizia token e stato auth");
    
    // Cancella timer di refresh se attivo
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      setRefreshTimer(null);
    }
    
    // Pulisci da entrambi i storage
    localStorage.removeItem("korsvagen_auth_token");
    localStorage.removeItem("korsvagen_refresh_token");
    localStorage.removeItem("korsvagen_remember_me");
    sessionStorage.removeItem("korsvagen_auth_token");
    sessionStorage.removeItem("korsvagen_refresh_token");
    sessionStorage.removeItem("korsvagen_remember_me");
    
    setToken(null);
    setRefreshTokenValue(null);
    setUser(null);
    setIsRefreshing(false);
    setRefreshFailedPermanently(false);
  }, [refreshTimer]);

  // Controlla se l'utente ha un ruolo specifico
  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user) return false;

      if (Array.isArray(role)) {
        return role.includes(user.role);
      }

      return user.role === role;
    },
    [user]
  );

  // Schedula il refresh automatico del token (senza dipendenze circolari)
  const scheduleTokenRefresh = useCallback((accessToken: string) => {
    try {
      // Decodifica il token per ottenere la data di scadenza
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = tokenPayload.exp * 1000; // Converte da secondi a millisecondi
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;
      
      // Programma il refresh 5 minuti prima della scadenza (o immediatamente se mancano meno di 5 minuti)
      const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // minimo 1 minuto
      
      console.log(`⏰ Token refresh programmato tra ${Math.round(refreshTime / 1000 / 60)} minuti`);
      
      // Cancella timer precedente se esiste
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
      
      const timer = setTimeout(async () => {
        console.log("🔄 Esecuzione refresh automatico programmato...");
        // Chiama direttamente l'API senza dipendenza circolare
        try {
          const { refreshToken: storedRefreshToken } = getStoredTokens();
          if (storedRefreshToken) {
            const response = await apiClient.post<AuthResponse>("/auth/refresh", {
              refreshToken: storedRefreshToken,
            });
            if (response.data.success) {
              const { user: userData, tokens } = response.data.data;
              setUser(userData);
              setToken(tokens.access);
              const { rememberMe } = getStoredTokens();
              const storage = rememberMe ? localStorage : sessionStorage;
              storage.setItem("korsvagen_auth_token", tokens.access);
              console.log("✅ Refresh automatico completato");
              // Schedula il prossimo refresh
              scheduleTokenRefresh(tokens.access);
            } else {
              console.log("❌ Refresh automatico fallito");
              toast.error("Sessione in scadenza. Effettua nuovamente il login.");
            }
          }
        } catch (error) {
          console.log("❌ Refresh automatico fallito:", error);
          toast.error("Sessione in scadenza. Effettua nuovamente il login.");
        }
      }, refreshTime);
      
      setRefreshTimer(timer);
    } catch (error) {
      console.warn("⚠️ Impossibile schedulare refresh automatico:", error);
    }
  }, [refreshTimer, getStoredTokens]);

  // Salva token nel storage appropriato (localStorage o sessionStorage)
  const saveTokens = useCallback(
    (accessToken: string, refreshToken: string, rememberMe: boolean = false) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Pulisci tokens dall'altro storage per evitare conflitti
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem("korsvagen_auth_token");
      otherStorage.removeItem("korsvagen_refresh_token");
      otherStorage.removeItem("korsvagen_remember_me");
      
      // Salva nei storage appropriati
      storage.setItem("korsvagen_auth_token", accessToken);
      storage.setItem("korsvagen_refresh_token", refreshToken);
      storage.setItem("korsvagen_remember_me", rememberMe.toString());
      
      setToken(accessToken);
      setRefreshTokenValue(refreshToken);
      
      // Schedula refresh automatico
      scheduleTokenRefresh(accessToken);
    },
    [scheduleTokenRefresh]
  );

  /**
   * AUTH METHODS
   */

  // Funzione di login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setLoading(true);

      try {
        const response = await apiClient.post<AuthResponse>(
          "/auth/login",
          credentials
        );

        if (response.data.success) {
          const { user: userData, tokens } = response.data.data;

          console.log("🔐 Login riuscito, salvataggio token...");
          console.log(
            "🔑 Access token:",
            tokens.access.substring(0, 20) + "..."
          );
          console.log(
            "🔄 Refresh token:",
            tokens.refresh.substring(0, 20) + "..."
          );

          // Salva prima i token, poi l'utente per evitare race condition
          saveTokens(tokens.access, tokens.refresh, credentials.rememberMe || false);
          setUser(userData);
          setRefreshFailedPermanently(false); // Reset flag dopo login riuscito
          setSkipMeValidation(true); // Skip /auth/me validation dopo login riuscito

          console.log("✅ Token salvati, stato aggiornato");

          toast.success(
            response.data.message || "Login effettuato con successo!"
          );

          return true;
        } else {
          toast.error(response.data.message || "Errore durante il login");
          return false;
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Errore durante il login";

        toast.error(errorMessage);
        console.error("Login error:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [saveTokens]
  );

  // Funzione di logout
  const logout = useCallback(async () => {
    setLoading(true);

    try {
      // Notifica il server del logout (opzionale, non bloccare se fallisce)
      if (refreshTokenValue) {
        try {
          await apiClient.post("/auth/logout", {
            refreshToken: refreshTokenValue,
          });
        } catch (error) {
          console.warn("Logout server notification failed:", error);
        }
      }
    } catch (error) {
      console.warn("Logout error:", error);
    } finally {
      // Pulisci sempre lo stato locale
      setUser(null);
      clearTokens();
      setLoading(false);
      toast.success("Logout effettuato con successo");
    }
  }, [refreshTokenValue, clearTokens]);

  // Funzione di refresh token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!refreshTokenValue || isRefreshing || refreshFailedPermanently) {
      console.log("⏹️ Refresh bloccato:", { 
        hasToken: !!refreshTokenValue, 
        isRefreshing, 
        refreshFailedPermanently 
      });
      return false;
    }

    setIsRefreshing(true);
    console.log("🔄 Tentativo refresh token...");

    try {
      const response = await apiClient.post<AuthResponse>("/auth/refresh", {
        refreshToken: refreshTokenValue,
      });

      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;

        setUser(userData);
        setToken(tokens.access);
        // Il refresh token rimane lo stesso - aggiorna solo nel storage appropriato
        const { rememberMe } = getStoredTokens();
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem("korsvagen_auth_token", tokens.access);
        
        // Schedula nuovo refresh automatico
        scheduleTokenRefresh(tokens.access);

        console.log("✅ Refresh token completato con successo");
        return true;
      } else {
        console.log("❌ Refresh token fallito - response not success");
        setRefreshFailedPermanently(true);
        clearTokens();
        return false;
      }
    } catch (error: any) {
      console.error("❌ Token refresh failed:", error);
      
      // Se è un 401, il refresh token è definitivamente invalido
      if (error.response?.status === 401) {
        console.log("🚫 Refresh token definitivamente invalido - blocco tentativi futuri");
        setRefreshFailedPermanently(true);
      }
      
      clearTokens();
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshTokenValue, clearTokens, isRefreshing, refreshFailedPermanently, getStoredTokens, scheduleTokenRefresh]);

  // Aggiorna dati utente
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
  }, []);

  /**
   * EFFECTS
   */

  // Gli interceptors sono gestiti centralmente da apiClient

  // Inizializzazione: verifica token esistente
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      console.log("🔐 Inizializzazione autenticazione...");

      try {
        // Inline getStoredTokens per evitare dipendenze
        let accessToken = localStorage.getItem("korsvagen_auth_token");
        let storedRefreshToken = localStorage.getItem("korsvagen_refresh_token");
        let rememberMe = localStorage.getItem("korsvagen_remember_me") === "true";
        
        if (!accessToken) {
          accessToken = sessionStorage.getItem("korsvagen_auth_token");
          storedRefreshToken = sessionStorage.getItem("korsvagen_refresh_token");
          rememberMe = sessionStorage.getItem("korsvagen_remember_me") === "true";
        }
        
        if (accessToken && storedRefreshToken) {
          console.log("🔑 Token trovati nel storage, validazione...");
          setToken(accessToken);
          setRefreshTokenValue(storedRefreshToken);
          
          try {
            // Sempre decodifica JWT invece di chiamare /auth/me per evitare 404
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            const basicUser = {
              id: tokenPayload.sub || tokenPayload.userId,
              username: tokenPayload.username,
              email: tokenPayload.email,
              role: tokenPayload.role,
            };
            console.log("✅ Utente estratto da token JWT");
            setUser(basicUser);
            
            // Inline scheduleTokenRefresh per evitare dipendenze
            try {
              const expirationTime = tokenPayload.exp * 1000;
              const currentTime = Date.now();
              const timeUntilExpiry = expirationTime - currentTime;
              const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000);
              
              console.log(`⏰ Token refresh programmato tra ${Math.round(refreshTime / 1000 / 60)} minuti`);
              
              if (refreshTimer) {
                clearTimeout(refreshTimer);
              }
              
              const timer = setTimeout(async () => {
                console.log("🔄 Esecuzione refresh automatico programmato...");
                // Logica di refresh inline per evitare dipendenze
                try {
                  const currentRefreshToken = localStorage.getItem("korsvagen_refresh_token") || 
                                              sessionStorage.getItem("korsvagen_refresh_token");
                  if (currentRefreshToken) {
                    const response = await apiClient.post<AuthResponse>("/auth/refresh", {
                      refreshToken: currentRefreshToken,
                    });
                    if (response.data.success) {
                      const { user: userData, tokens } = response.data.data;
                      setUser(userData);
                      setToken(tokens.access);
                      const storage = rememberMe ? localStorage : sessionStorage;
                      storage.setItem("korsvagen_auth_token", tokens.access);
                      console.log("✅ Refresh automatico completato");
                    }
                  }
                } catch (error) {
                  console.log("❌ Refresh automatico fallito:", error);
                }
              }, refreshTime);
              
              setRefreshTimer(timer);
            } catch (error) {
              console.warn("⚠️ Impossibile schedulare refresh automatico:", error);
            }
            
          } catch (decodeError) {
            console.error("❌ Errore decodifica token, pulizia necessaria");
            // Inline clearTokens per evitare dipendenze
            localStorage.removeItem("korsvagen_auth_token");
            localStorage.removeItem("korsvagen_refresh_token");
            localStorage.removeItem("korsvagen_remember_me");
            sessionStorage.removeItem("korsvagen_auth_token");
            sessionStorage.removeItem("korsvagen_refresh_token");
            sessionStorage.removeItem("korsvagen_remember_me");
            setToken(null);
            setRefreshTokenValue(null);
            setUser(null);
          }
        } else {
          console.log("ℹ️ Nessun token trovato, utente non autenticato");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Inline clearTokens per evitare dipendenze
        localStorage.removeItem("korsvagen_auth_token");
        localStorage.removeItem("korsvagen_refresh_token");
        localStorage.removeItem("korsvagen_remember_me");
        sessionStorage.removeItem("korsvagen_auth_token");
        sessionStorage.removeItem("korsvagen_refresh_token");
        sessionStorage.removeItem("korsvagen_remember_me");
        setToken(null);
        setRefreshTokenValue(null);
        setUser(null);
      } finally {
        setLoading(false);
        console.log("🔐 Inizializzazione autenticazione completata");
      }
    };

    initializeAuth();
  }, []); // Esegui SOLO al mount - nessuna dipendenza esterna

  // Event listener per gestire token scaduti
  useEffect(() => {
    const handleTokenExpired = async () => {
      console.log("🔄 Token scaduto, tentativo di refresh...");
      
      // Prova refresh automatico
      const refreshSuccess = await refreshToken();
      if (!refreshSuccess) {
        console.log("❌ Refresh automatico fallito, logout necessario");
        // Non eseguire logout automatico, lascia che l'utente decida
        toast.error("Sessione scaduta. Effettua nuovamente il login.");
      }
    };

    window.addEventListener("auth:token-expired", handleTokenExpired);

    return () => {
      window.removeEventListener("auth:token-expired", handleTokenExpired);
    };
  }, [refreshToken]);

  /**
   * VALORE DEL CONTEXT
   */
  const contextValue: AuthContextType = {
    // Stato
    user,
    token,
    loading,
    isAuthenticated,

    // Metodi
    login,
    logout,
    refreshToken,
    updateUser,

    // Utilità
    hasRole,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
