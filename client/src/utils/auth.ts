// Token management utilities
export const tokenStorage = {
  getToken: (): string | null => localStorage.getItem("token"),
  getRefreshToken: (): string | null => localStorage.getItem("refreshToken"),

  setTokens: (token: string, refreshToken: string): void => {
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  },

  removeTokens: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("rememberMe");
  },

  getRememberMe: (): boolean => localStorage.getItem("rememberMe") === "true",
  setRememberMe: (remember: boolean): void => {
    if (remember) {
      localStorage.setItem("rememberMe", "true");
    } else {
      localStorage.removeItem("rememberMe");
    }
  },
};

// JWT token utilities
export const jwtUtils = {
  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Consider invalid tokens as expired
    }
  },

  getTokenPayload: (token: string) => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  },

  getTokenExpiration: (token: string): Date | null => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  },
};

// User role utilities
export const roleUtils = {
  isAdmin: (user: { role: string }): boolean => user.role === "admin",
  isEditor: (user: { role: string }): boolean => user.role === "editor",
  canEdit: (user: { role: string }): boolean =>
    ["admin", "editor"].includes(user.role),
  canDelete: (user: { role: string }): boolean => user.role === "admin",
};

// Session management
export const sessionUtils = {
  clearSession: (): void => {
    tokenStorage.removeTokens();
    // Clear any other session data
    localStorage.removeItem("userPreferences");
    sessionStorage.clear();
  },

  isSessionValid: (): boolean => {
    const token = tokenStorage.getToken();
    if (!token) return false;

    return !jwtUtils.isTokenExpired(token);
  },
};
