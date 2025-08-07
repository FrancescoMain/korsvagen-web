/**
 * PROJECTS CACHE HOOK - Sistema di cache per progetti
 *
 * Hook per la gestione del cache dei progetti con:
 * - Cache in memoria con TTL
 * - Invalidazione automatica
 * - Background refresh
 * - Ottimizzazioni performance
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Project, ProjectLabel } from './useProjects';

// Types
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface ProjectsCacheState {
  projects: CacheItem<Project[]> | null;
  projectDetails: Map<string, CacheItem<Project>>;
  labels: CacheItem<ProjectLabel[]> | null;
}

// Cache configuration
const CACHE_CONFIG = {
  PROJECTS_TTL: 5 * 60 * 1000, // 5 minutes
  PROJECT_DETAIL_TTL: 10 * 60 * 1000, // 10 minutes  
  LABELS_TTL: 30 * 60 * 1000, // 30 minutes
  MAX_CACHED_DETAILS: 50, // Maximum cached project details
};

// Global cache state
let globalCache: ProjectsCacheState = {
  projects: null,
  projectDetails: new Map(),
  labels: null,
};

// Cache invalidation listeners
const cacheListeners = new Set<() => void>();

export const useProjectsCache = () => {
  const [, forceUpdate] = useState({});
  const listenersRef = useRef<Set<() => void>>(new Set());

  // Force re-render when cache updates
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Subscribe to cache updates
  useEffect(() => {
    cacheListeners.add(triggerUpdate);
    return () => {
      cacheListeners.delete(triggerUpdate);
    };
  }, [triggerUpdate]);

  // Check if cache item is valid
  const isCacheValid = useCallback(<T>(item: CacheItem<T> | null): boolean => {
    if (!item) return false;
    return Date.now() - item.timestamp < item.ttl;
  }, []);

  // Notify all listeners of cache updates
  const notifyListeners = useCallback(() => {
    cacheListeners.forEach(listener => listener());
  }, []);

  // Set cache item
  const setCacheItem = useCallback(<T>(
    key: keyof ProjectsCacheState,
    data: T,
    ttl: number
  ) => {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };

    if (key === 'projectDetails') {
      // Handle Map-based cache differently
      return;
    }

    (globalCache as any)[key] = cacheItem;
    notifyListeners();
  }, [notifyListeners]);

  // Set cached project detail
  const setCachedProjectDetail = useCallback((id: string, project: Project) => {
    // Clean up old entries if we exceed max cache size
    if (globalCache.projectDetails.size >= CACHE_CONFIG.MAX_CACHED_DETAILS) {
      // Remove oldest entries (simple LRU)
      const entries = Array.from(globalCache.projectDetails.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, Math.floor(CACHE_CONFIG.MAX_CACHED_DETAILS / 2));
      toRemove.forEach(([key]) => globalCache.projectDetails.delete(key));
    }

    const cacheItem: CacheItem<Project> = {
      data: project,
      timestamp: Date.now(),
      ttl: CACHE_CONFIG.PROJECT_DETAIL_TTL,
    };

    globalCache.projectDetails.set(id, cacheItem);
    notifyListeners();
  }, [notifyListeners]);

  // Get cached projects
  const getCachedProjects = useCallback((filters?: {
    label?: string;
    status?: string;
    limit?: number;
    page?: number;
  }): Project[] | null => {
    if (!isCacheValid(globalCache.projects)) {
      return null;
    }

    let projects = globalCache.projects!.data;

    // Apply filters if provided
    if (filters) {
      if (filters.label && filters.label !== 'tutti') {
        projects = projects.filter(p => p.label === filters.label);
      }
      
      if (filters.status) {
        projects = projects.filter(p => p.status === filters.status);
      }

      // Apply pagination
      if (filters.limit && filters.page) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit;
        projects = projects.slice(start, end);
      }
    }

    return projects;
  }, [isCacheValid]);

  // Get cached project detail
  const getCachedProjectDetail = useCallback((id: string): Project | null => {
    const cached = globalCache.projectDetails.get(id);
    return isCacheValid(cached) ? cached!.data : null;
  }, [isCacheValid]);

  // Get cached labels
  const getCachedLabels = useCallback((): ProjectLabel[] | null => {
    return isCacheValid(globalCache.labels) ? globalCache.labels!.data : null;
  }, [isCacheValid]);

  // Set cached projects
  const setCachedProjects = useCallback((projects: Project[]) => {
    setCacheItem('projects', projects, CACHE_CONFIG.PROJECTS_TTL);
  }, [setCacheItem]);

  // Set cached labels
  const setCachedLabels = useCallback((labels: ProjectLabel[]) => {
    setCacheItem('labels', labels, CACHE_CONFIG.LABELS_TTL);
  }, [setCacheItem]);

  // Invalidate specific cache
  const invalidateCache = useCallback((type?: 'projects' | 'details' | 'labels' | 'all') => {
    switch (type) {
      case 'projects':
        globalCache.projects = null;
        break;
      case 'details':
        globalCache.projectDetails.clear();
        break;
      case 'labels':
        globalCache.labels = null;
        break;
      case 'all':
      default:
        globalCache.projects = null;
        globalCache.projectDetails.clear();
        globalCache.labels = null;
        break;
    }
    notifyListeners();
  }, [notifyListeners]);

  // Preload projects in background
  const preloadProjects = useCallback(async (fetchFn: () => Promise<any>) => {
    if (isCacheValid(globalCache.projects)) {
      return; // Already cached and valid
    }

    try {
      const result = await fetchFn();
      if (result && result.projects) {
        setCachedProjects(result.projects);
      }
    } catch (error) {
      console.warn('Background preload failed:', error);
    }
  }, [isCacheValid, setCachedProjects]);

  // Get cache statistics
  const getCacheStats = useCallback(() => {
    return {
      projects: {
        cached: !!globalCache.projects,
        valid: isCacheValid(globalCache.projects),
        timestamp: globalCache.projects?.timestamp,
        age: globalCache.projects ? Date.now() - globalCache.projects.timestamp : 0,
      },
      details: {
        count: globalCache.projectDetails.size,
        valid: Array.from(globalCache.projectDetails.values()).filter(item => isCacheValid(item)).length,
      },
      labels: {
        cached: !!globalCache.labels,
        valid: isCacheValid(globalCache.labels),
        timestamp: globalCache.labels?.timestamp,
        age: globalCache.labels ? Date.now() - globalCache.labels.timestamp : 0,
      },
    };
  }, [isCacheValid]);

  // Clear expired cache items
  const cleanupExpiredCache = useCallback(() => {
    // Clean projects cache
    if (globalCache.projects && !isCacheValid(globalCache.projects)) {
      globalCache.projects = null;
    }

    // Clean details cache
    const expiredDetails: string[] = [];
    globalCache.projectDetails.forEach((item, key) => {
      if (!isCacheValid(item)) {
        expiredDetails.push(key);
      }
    });
    expiredDetails.forEach(key => globalCache.projectDetails.delete(key));

    // Clean labels cache
    if (globalCache.labels && !isCacheValid(globalCache.labels)) {
      globalCache.labels = null;
    }

    if (expiredDetails.length > 0 || 
        (!globalCache.projects || !globalCache.labels)) {
      notifyListeners();
    }
  }, [isCacheValid, notifyListeners]);

  // Cleanup expired items periodically
  useEffect(() => {
    const interval = setInterval(cleanupExpiredCache, 60000); // Every minute
    return () => clearInterval(interval);
  }, [cleanupExpiredCache]);

  return {
    // Cache getters
    getCachedProjects,
    getCachedProjectDetail,
    getCachedLabels,
    
    // Cache setters
    setCachedProjects,
    setCachedProjectDetail,
    setCachedLabels,
    
    // Cache management
    invalidateCache,
    preloadProjects,
    getCacheStats,
    
    // Cache status
    isCacheValid: (type: 'projects' | 'labels') => {
      switch (type) {
        case 'projects':
          return isCacheValid(globalCache.projects);
        case 'labels':
          return isCacheValid(globalCache.labels);
        default:
          return false;
      }
    },
  };
};