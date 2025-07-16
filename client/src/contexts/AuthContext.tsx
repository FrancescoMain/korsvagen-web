import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "admin" | "editor";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(
    localStorage.getItem("refreshToken")
  );
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

  // Configure axios interceptors
  useEffect(() => {
    // Request interceptor to add token
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (refreshTokenValue) {
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              return axios(originalRequest);
            }
          }

          logout();
          toast.error("Session expired. Please login again.");
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshTokenValue]);

  // Check initial authentication status
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data.user);
        } catch (error) {
          // Token invalid, try refresh
          if (refreshTokenValue) {
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials
      );

      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = response.data;

      setToken(newToken);
      setRefreshTokenValue(newRefreshToken);
      setUser(userData);

      // Store tokens
      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      if (credentials.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      toast.success(`Welcome back, ${userData.username}!`);
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshTokenValue(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberMe");

    // Call logout endpoint to invalidate server session
    if (token) {
      axios.post(`${API_BASE_URL}/auth/logout`).catch(() => {
        // Silent fail - we're logging out anyway
      });
    }

    toast.success("Logged out successfully");
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!refreshTokenValue) return false;

    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/refresh`,
        {
          refreshToken: refreshTokenValue,
        }
      );

      const {
        token: newToken,
        refreshToken: newRefreshToken,
        user: userData,
      } = response.data;

      setToken(newToken);
      setRefreshTokenValue(newRefreshToken);
      setUser(userData);

      localStorage.setItem("token", newToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      return true;
    } catch (error) {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
