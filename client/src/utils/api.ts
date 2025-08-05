import axios from "axios";

// API base URL configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for authentication
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from storage (localStorage or sessionStorage) using the correct key
    let token = localStorage.getItem("korsvagen_auth_token");
    if (!token) {
      token = sessionStorage.getItem("korsvagen_auth_token");
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired - dispatch custom event
      window.dispatchEvent(new CustomEvent("auth:token-expired"));
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh",
    me: "/auth/me",
    changePassword: "/auth/change-password",
  },
  content: {
    pages: "/content/pages",
    sections: "/content/sections",
  },
  media: {
    upload: "/media/upload",
    gallery: "/media/gallery",
    delete: "/media/delete",
    optimize: "/media/optimize",
  },
};

// Helper functions for API calls
export const api = {
  // Auth endpoints
  auth: {
    login: (credentials: { username: string; password: string }) =>
      apiClient.post(endpoints.auth.login, credentials),

    logout: () => apiClient.post(endpoints.auth.logout),

    refresh: (refreshToken: string) =>
      apiClient.post(endpoints.auth.refresh, { refreshToken }),

    me: () => apiClient.get(endpoints.auth.me),

    changePassword: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.post(endpoints.auth.changePassword, data),
  },

  // Content endpoints
  content: {
    getPages: () => apiClient.get(endpoints.content.pages),

    getPage: (pageId: string) =>
      apiClient.get(`${endpoints.content.pages}?pageId=${pageId}`),

    updatePage: (pageId: string, data: any) =>
      apiClient.put(`${endpoints.content.pages}?pageId=${pageId}`, data),

    createPage: (data: any) => apiClient.post(endpoints.content.pages, data),

    deletePage: (pageId: string) =>
      apiClient.delete(`${endpoints.content.pages}?pageId=${pageId}`),

    getSections: (pageId: string) =>
      apiClient.get(`${endpoints.content.sections}?pageId=${pageId}`),

    createSection: (pageId: string, data: any) =>
      apiClient.post(`${endpoints.content.sections}?pageId=${pageId}`, data),

    updateSection: (sectionId: string, data: any) =>
      apiClient.put(
        `${endpoints.content.sections}?sectionId=${sectionId}`,
        data
      ),

    deleteSection: (sectionId: string) =>
      apiClient.delete(`${endpoints.content.sections}?sectionId=${sectionId}`),
  },

  // Media endpoints
  media: {
    upload: (formData: FormData) =>
      apiClient.post(endpoints.media.upload, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    getGallery: () => apiClient.get(endpoints.media.gallery),

    delete: (mediaId: string) =>
      apiClient.delete(`${endpoints.media.delete}?mediaId=${mediaId}`),

    optimize: (data: any) => apiClient.post(endpoints.media.optimize, data),
  },
};
