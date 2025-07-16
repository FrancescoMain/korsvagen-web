// Local storage utilities
export const storage = {
  // Generic get/set functions
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("Error clearing localStorage:", error);
      return false;
    }
  },

  // Specific storage functions
  userPreferences: {
    get: () => storage.get("userPreferences", {}),
    set: (preferences: any) => storage.set("userPreferences", preferences),
    update: (updates: any) => {
      const current = storage.get("userPreferences", {});
      return storage.set("userPreferences", { ...current, ...updates });
    },
  },

  sidebarState: {
    get: () => storage.get("sidebarCollapsed", false),
    set: (collapsed: boolean) => storage.set("sidebarCollapsed", collapsed),
  },

  theme: {
    get: () => storage.get("theme", "light"),
    set: (theme: string) => storage.set("theme", theme),
  },
};

// Session storage utilities
export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error(`Error reading from sessionStorage (${key}):`, error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to sessionStorage (${key}):`, error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing from sessionStorage (${key}):`, error);
      return false;
    }
  },
};
