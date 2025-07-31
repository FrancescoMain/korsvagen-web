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
import axios from "axios";
import toast from "react-hot-toast";

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

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Configurazione Axios per autenticazione
const authApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

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
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("korsvagen_auth_token")
  );
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    localStorage.getItem("korsvagen_refresh_token")
  );
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshFailedPermanently, setRefreshFailedPermanently] = useState(false);

  // Stati derivati
  const isAuthenticated = !!user && !!token;
  const isLoading = loading;

  /**
   * UTILITY FUNCTIONS
   */

  // Salva token nel localStorage
  const saveTokens = useCallback(
    (accessToken: string, refreshToken: string) => {
      localStorage.setItem("korsvagen_auth_token", accessToken);
      localStorage.setItem("korsvagen_refresh_token", refreshToken);
      setToken(accessToken);
      setRefreshTokenValue(refreshToken);
    },
    []
  );

  // Rimuovi token dal localStorage
  const clearTokens = useCallback(() => {
    console.log("🧹 Pulizia token e stato auth");
    localStorage.removeItem("korsvagen_auth_token");
    localStorage.removeItem("korsvagen_refresh_token");
    setToken(null);
    setRefreshTokenValue(null);
    setUser(null);
    setIsRefreshing(false);
    setRefreshFailedPermanently(false);
  }, []);

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

  /**
   * AUTH METHODS
   */

  // Funzione di login
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setLoading(true);

      try {
        const response = await authApi.post<AuthResponse>(
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

          // Salva dati utente e token
          setUser(userData);
          saveTokens(tokens.access, tokens.refresh);
          setRefreshFailedPermanently(false); // Reset flag dopo login riuscito

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
          await authApi.post("/auth/logout", {
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
      const response = await authApi.post<AuthResponse>("/auth/refresh", {
        refreshToken: refreshTokenValue,
      });

      if (response.data.success) {
        const { user: userData, tokens } = response.data.data;

        setUser(userData);
        setToken(tokens.access);
        // Il refresh token rimane lo stesso
        localStorage.setItem("korsvagen_auth_token", tokens.access);

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
  }, [refreshTokenValue, clearTokens, isRefreshing, refreshFailedPermanently]);

  // Aggiorna dati utente
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
  }, []);

  /**
   * EFFECTS
   */

  // Configurazione interceptors Axios
  useEffect(() => {
    // Request interceptor per aggiungere token
    const requestInterceptor = authApi.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor per gestire refresh automatico
    const responseInterceptor = authApi.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing && !refreshFailedPermanently) {
          originalRequest._retry = true;

          console.log("📡 Interceptor: ricevuto 401, tentativo refresh...");
          const refreshSuccess = await refreshToken();
          if (refreshSuccess) {
            console.log("📡 Interceptor: refresh riuscito, riprovo richiesta originale");
            return authApi(originalRequest);
          } else {
            // Refresh fallito, redirect al login
            console.log("📡 Interceptor: refresh fallito, eseguo logout");
            logout();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );

    // Cleanup
    return () => {
      authApi.interceptors.request.eject(requestInterceptor);
      authApi.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshToken, logout, isRefreshing, refreshFailedPermanently]);

  // Inizializzazione: verifica token esistente
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);

      try {
        if (token && refreshTokenValue) {
          // Prova a ottenere i dati utente correnti
          try {
            const response = await authApi.get("/auth/me");
            if (response.data.success) {
              setUser(response.data.data.user);
            } else {
              // Token non valido, prova refresh
              const refreshSuccess = await refreshToken();
              if (!refreshSuccess) {
                clearTokens();
                setUser(null);
              }
            }
          } catch (error: any) {
            // Se /me non esiste (404), salta il refresh e pulisci i token
            if (error.response?.status === 404) {
              console.log("📡 Endpoint /auth/me non trovato - pulizia token");
              clearTokens();
              setUser(null);
            } else {
              // Se /me fallisce per altri motivi, prova refresh
              const refreshSuccess = await refreshToken();
              if (!refreshSuccess) {
                clearTokens();
                setUser(null);
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        clearTokens();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []); // Esegui solo al mount

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
