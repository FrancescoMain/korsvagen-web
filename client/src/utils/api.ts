import axios from "axios";

// API base URL configuration
// TEMPORARY: Durante il debug, usiamo una configurazione più esplicita
const getApiBaseUrl = () => {
  // Se siamo in development, usa il proxy locale
  if (process.env.NODE_ENV === 'development') {
    return '/api';
  }
  
  // Se siamo in produzione, controlla il dominio attuale
  if (typeof window !== 'undefined') {
    const currentHost = window.location.hostname;
    
    // Se siamo su korsvagen.it, usa il backend dedicato
    if (currentHost === 'korsvagen.it' || currentHost === 'www.korsvagen.it') {
      return 'https://korsvagen-web-be.vercel.app/api';
    }
    
    // Se siamo su Vercel (deployment preview), usa il backend dedicato
    if (currentHost.includes('vercel.app')) {
      return 'https://korsvagen-web-be.vercel.app/api';
    }
  }
  
  // Fallback per produzione
  return 'https://korsvagen-web-be.vercel.app/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log della configurazione API
console.log(`🌐 API Configuration:`, {
  environment: process.env.NODE_ENV,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
  baseURL: API_BASE_URL,
  proxy: process.env.NODE_ENV !== 'production' ? 'http://localhost:3001' : 'N/A'
});

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
  news: {
    // Public endpoints
    list: "/news",
    detail: "/news",
    categories: "/news/categories",
    related: "/news",
    // Admin endpoints
    adminList: "/news/admin/list",
    adminCreate: "/news/admin",
    adminDetail: "/news/admin",
    adminUpdate: "/news/admin",
    adminDelete: "/news/admin",
    adminUploadImage: "/news/admin",
    adminDeleteImage: "/news/admin",
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

  // News endpoints
  news: {
    // Public endpoints
    getList: (params?: { category?: string; limit?: number; page?: number; featured?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.page) query.append('page', params.page.toString());
      if (params?.featured) query.append('featured', 'true');
      
      const queryString = query.toString();
      return apiClient.get(`${endpoints.news.list}${queryString ? `?${queryString}` : ''}`);
    },

    getDetail: (slug: string) =>
      apiClient.get(`${endpoints.news.detail}/${slug}`),

    getCategories: () =>
      apiClient.get(endpoints.news.categories),

    getRelated: (slug: string) =>
      apiClient.get(`${endpoints.news.related}/${slug}/related`),

    // Admin endpoints
    getAdminList: (params?: { category?: string; published?: string; limit?: number; page?: number }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.published) query.append('published', params.published);
      if (params?.limit) query.append('limit', params.limit.toString());
      if (params?.page) query.append('page', params.page.toString());
      
      const queryString = query.toString();
      return apiClient.get(`${endpoints.news.adminList}${queryString ? `?${queryString}` : ''}`);
    },

    create: (data: any) =>
      apiClient.post(endpoints.news.adminCreate, data),

    getAdminDetail: (id: number) =>
      apiClient.get(`${endpoints.news.adminDetail}/${id}`),

    update: (id: number, data: any) =>
      apiClient.put(`${endpoints.news.adminUpdate}/${id}`, data),

    delete: (id: number) =>
      apiClient.delete(`${endpoints.news.adminDelete}/${id}`),

    uploadImage: (id: number, formData: FormData) =>
      apiClient.post(`${endpoints.news.adminUploadImage}/${id}/image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    deleteImage: (id: number) =>
      apiClient.delete(`${endpoints.news.adminDeleteImage}/${id}/image`),
  },
};
