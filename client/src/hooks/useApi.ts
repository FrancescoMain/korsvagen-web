/**
 * KORSVAGEN WEB APPLICATION - API HOOK
 *
 * Hook personalizzato per gestione API centralizzata con
 * caching, retry logic, loading states e error handling.
 *
 * Features:
 * - Axios client configurato con interceptors
 * - Cache integrata con TTL configurabile
 * - Retry automatico su failure
 * - Loading e error states unificati
 * - Abort controller per cancellazione requests
 * - TypeScript completo con generics
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import { useState, useCallback, useEffect, useRef } from "react";
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { useAuth } from "./useAuth";

/**
 * TYPES E INTERFACES
 */

interface ApiHookOptions {
  cache?: boolean;
  cacheTTL?: number; // milliseconds
  retries?: number;
  retryDelay?: number; // milliseconds
  timeout?: number; // milliseconds
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface ApiHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiHookReturn<T> extends ApiHookState<T> {
  get: (url: string, params?: any, options?: ApiHookOptions) => Promise<T>;
  post: (url: string, data?: any, options?: ApiHookOptions) => Promise<T>;
  put: (url: string, data?: any, options?: ApiHookOptions) => Promise<T>;
  patch: (url: string, data?: any, options?: ApiHookOptions) => Promise<T>;
  delete: (url: string, options?: ApiHookOptions) => Promise<T>;
  clearCache: () => void;
  abort: () => void;
  reset: () => void;
}

/**
 * CACHE GLOBALE
 */
const apiCache = new Map<string, CacheEntry<any>>();

/**
 * CONFIGURAZIONE AXIOS
 */
const createApiClient = (token?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor per token
  client.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor per error handling
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired - handled by AuthContext
        window.dispatchEvent(new CustomEvent("auth:token-expired"));
      }
      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * UTILITY FUNCTIONS
 */

const generateCacheKey = (
  method: string,
  url: string,
  params?: any
): string => {
  return `${method}:${url}:${JSON.stringify(params || {})}`;
};

const getCachedData = <T>(key: string): T | null => {
  const entry = apiCache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    apiCache.delete(key);
    return null;
  }

  return entry.data;
};

const setCachedData = <T>(key: string, data: T, ttl: number): void => {
  apiCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * HOOK PRINCIPALE
 */

export const useApi = <T = any>(): ApiHookReturn<T> => {
  const { token } = useAuth();
  const [state, setState] = useState<ApiHookState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const apiClientRef = useRef<AxiosInstance | null>(null);

  // Crea client API quando cambia il token
  useEffect(() => {
    apiClientRef.current = createApiClient(token || undefined);
  }, [token]);

  // Cleanup abort controller
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Abort current request
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    apiCache.clear();
  }, []);

  // Generic request handler
  const makeRequest = useCallback(
    async <TResponse = T>(
      method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      url: string,
      payload?: any,
      options: ApiHookOptions = {}
    ): Promise<TResponse> => {
      const {
        cache = false,
        cacheTTL = 300000, // 5 minutes default
        retries = 3,
        retryDelay = 1000,
        timeout = 30000,
      } = options;

      // Check cache for GET requests
      if (method === "GET" && cache) {
        const cacheKey = generateCacheKey(method, url, payload);
        const cachedData = getCachedData<TResponse>(cacheKey);
        if (cachedData) {
          setState((prev) => ({ ...prev, data: cachedData as unknown as T }));
          return cachedData;
        }
      }

      // Set loading state
      setState((prev) => ({ ...prev, loading: true, error: null }));

      // Create abort controller
      abortControllerRef.current = new AbortController();

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          if (!apiClientRef.current) {
            throw new Error("API client not initialized");
          }

          const config: AxiosRequestConfig = {
            signal: abortControllerRef.current.signal,
            timeout,
          };

          let response: AxiosResponse<TResponse>;

          switch (method) {
            case "GET":
              response = await apiClientRef.current.get(url, {
                ...config,
                params: payload,
              });
              break;
            case "POST":
              response = await apiClientRef.current.post(url, payload, config);
              break;
            case "PUT":
              response = await apiClientRef.current.put(url, payload, config);
              break;
            case "PATCH":
              response = await apiClientRef.current.patch(url, payload, config);
              break;
            case "DELETE":
              response = await apiClientRef.current.delete(url, config);
              break;
            default:
              throw new Error(`Unsupported method: ${method}`);
          }

          const responseData = response.data;

          // Cache successful GET requests
          if (method === "GET" && cache) {
            const cacheKey = generateCacheKey(method, url, payload);
            setCachedData(cacheKey, responseData, cacheTTL);
          }

          // Update state with successful response
          setState({
            data: responseData as unknown as T,
            loading: false,
            error: null,
          });

          return responseData;
        } catch (error: any) {
          lastError = error;

          // Don't retry if aborted or on certain error codes
          if (
            error.name === "AbortError" ||
            error.code === "ERR_CANCELED" ||
            error.response?.status === 401 ||
            error.response?.status === 403 ||
            error.response?.status === 404
          ) {
            break;
          }

          // Wait before retry (except on last attempt)
          if (attempt < retries) {
            await sleep(retryDelay * Math.pow(2, attempt)); // Exponential backoff
          }
        }
      }

      // All retries failed
      const errorMessage =
        (lastError as any)?.response?.data?.error ||
        lastError?.message ||
        "Errore di rete sconosciuto";

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });

      throw new Error(errorMessage);
    },
    [token]
  );

  // HTTP method wrappers
  const get = useCallback(
    (url: string, params?: any, options?: ApiHookOptions) =>
      makeRequest<T>("GET", url, params, options),
    [makeRequest]
  );

  const post = useCallback(
    (url: string, data?: any, options?: ApiHookOptions) =>
      makeRequest<T>("POST", url, data, options),
    [makeRequest]
  );

  const put = useCallback(
    (url: string, data?: any, options?: ApiHookOptions) =>
      makeRequest<T>("PUT", url, data, options),
    [makeRequest]
  );

  const patch = useCallback(
    (url: string, data?: any, options?: ApiHookOptions) =>
      makeRequest<T>("PATCH", url, data, options),
    [makeRequest]
  );

  const deleteMethod = useCallback(
    (url: string, options?: ApiHookOptions) =>
      makeRequest<T>("DELETE", url, undefined, options),
    [makeRequest]
  );

  return {
    ...state,
    get,
    post,
    put,
    patch,
    delete: deleteMethod,
    clearCache,
    abort,
    reset,
  };
};

export default useApi;
