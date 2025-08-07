/**
 * PROJECTS PERFORMANCE HOOK - Ottimizzazioni performance per progetti
 *
 * Hook avanzato per ottimizzazioni performance del sistema progetti:
 * - Lazy loading e paginazione
 * - Prefetch intelligente  
 * - Monitoring performance
 * - Background sync
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useProjects, Project } from './useProjects';
import { useProjectsCache } from './useProjectsCache';

// Types
interface PerformanceMetrics {
  loadTime: number;
  cacheHitRate: number;
  apiCallCount: number;
  errorRate: number;
}

interface LazyLoadConfig {
  enabled: boolean;
  threshold: number; // Pixels from bottom to trigger load
  itemsPerPage: number;
  preloadPages: number;
}

export const useProjectsPerformance = () => {
  const projects = useProjects();
  const cache = useProjectsCache();
  
  // State
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    cacheHitRate: 0,
    apiCallCount: 0,
    errorRate: 0
  });
  
  const [lazyConfig] = useState<LazyLoadConfig>({
    enabled: true,
    threshold: 200,
    itemsPerPage: 12,
    preloadPages: 1
  });

  // Refs for performance tracking
  const performanceRef = useRef({
    startTime: 0,
    apiCalls: 0,
    cacheHits: 0,
    errors: 0,
    totalRequests: 0
  });

  // Performance tracking functions
  const startPerformanceTracking = useCallback(() => {
    performanceRef.current.startTime = Date.now();
  }, []);

  const recordApiCall = useCallback(() => {
    performanceRef.current.apiCalls++;
    performanceRef.current.totalRequests++;
  }, []);

  const recordCacheHit = useCallback(() => {
    performanceRef.current.cacheHits++;
    performanceRef.current.totalRequests++;
  }, []);

  const recordError = useCallback(() => {
    performanceRef.current.errors++;
  }, []);

  // Enhanced fetch with performance tracking
  const fetchProjectsWithTracking = useCallback(async (params?: {
    label?: string;
    status?: string;
    limit?: number;
    page?: number;
  }) => {
    startPerformanceTracking();

    try {
      // Check cache first
      const cachedData = cache.getCachedProjects(params);
      if (cachedData) {
        recordCacheHit();
        const loadTime = Date.now() - performanceRef.current.startTime;
        
        setMetrics(prev => ({
          ...prev,
          loadTime,
          cacheHitRate: performanceRef.current.cacheHits / performanceRef.current.totalRequests * 100
        }));

        return { projects: cachedData, fromCache: true };
      }

      // Fetch from API
      recordApiCall();
      const result = await projects.fetchPublicProjects(params);
      
      const loadTime = Date.now() - performanceRef.current.startTime;
      setMetrics(prev => ({
        ...prev,
        loadTime,
        apiCallCount: performanceRef.current.apiCalls,
        cacheHitRate: performanceRef.current.cacheHits / performanceRef.current.totalRequests * 100
      }));

      return { ...result, fromCache: false };
    } catch (error) {
      recordError();
      setMetrics(prev => ({
        ...prev,
        errorRate: performanceRef.current.errors / performanceRef.current.totalRequests * 100
      }));
      throw error;
    }
  }, [projects, cache, startPerformanceTracking, recordApiCall, recordCacheHit, recordError]);

  // Intelligent prefetch
  const prefetchRelatedProjects = useCallback(async (currentProject: Project) => {
    try {
      // Prefetch projects of the same label
      const sameLabel = cache.getCachedProjects({ label: currentProject.label });
      if (!sameLabel) {
        // Background fetch without showing loading
        projects.fetchPublicProjects({ label: currentProject.label }).catch(() => {
          // Silent fail for prefetch
        });
      }

      // Prefetch projects of the same status
      const sameStatus = cache.getCachedProjects({ status: currentProject.status });
      if (!sameStatus) {
        projects.fetchPublicProjects({ status: currentProject.status }).catch(() => {
          // Silent fail for prefetch
        });
      }
    } catch (error) {
      // Silent fail for prefetch
      console.warn('Prefetch failed:', error);
    }
  }, [cache, projects]);

  // Lazy loading with intersection observer
  const createLazyLoader = useCallback((callback: (page: number) => void) => {
    if (!lazyConfig.enabled) return null;

    const observerRef = useRef<IntersectionObserver | null>(null);
    const currentPage = useRef(1);

    const observe = (element: Element | null) => {
      if (!element || !window.IntersectionObserver) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              currentPage.current++;
              callback(currentPage.current);
            }
          });
        },
        {
          rootMargin: `${lazyConfig.threshold}px`,
          threshold: 0.1
        }
      );

      observerRef.current.observe(element);
    };

    const disconnect = () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };

    return { observe, disconnect };
  }, [lazyConfig]);

  // Background sync for cache refresh
  useEffect(() => {
    const backgroundSync = async () => {
      try {
        // Check if cache is getting stale (older than 3 minutes)
        const stats = cache.getCacheStats();
        const projectsCacheAge = stats.projects.age;
        
        if (projectsCacheAge > 3 * 60 * 1000 && projectsCacheAge < 5 * 60 * 1000) {
          // Background refresh
          await projects.fetchPublicProjects();
        }
      } catch (error) {
        // Silent background sync
        console.warn('Background sync failed:', error);
      }
    };

    // Background sync every 2 minutes
    const interval = setInterval(backgroundSync, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cache, projects]);

  // Memoized performance recommendations
  const performanceRecommendations = useMemo(() => {
    const recommendations: string[] = [];
    
    if (metrics.cacheHitRate < 50) {
      recommendations.push('Consider implementing more aggressive caching');
    }
    
    if (metrics.loadTime > 2000) {
      recommendations.push('Load time is high - consider pagination or lazy loading');
    }
    
    if (metrics.errorRate > 5) {
      recommendations.push('High error rate detected - check network stability');
    }
    
    if (metrics.apiCallCount > 10) {
      recommendations.push('Consider reducing API calls with better caching');
    }

    return recommendations;
  }, [metrics]);

  // Cache health check
  const checkCacheHealth = useCallback(() => {
    const stats = cache.getCacheStats();
    
    return {
      healthy: stats.projects.valid && stats.labels.valid,
      projects: {
        status: stats.projects.valid ? 'healthy' : 'stale',
        age: stats.projects.age,
        ageString: Math.round(stats.projects.age / 1000 / 60) + ' minutes'
      },
      details: {
        count: stats.details.count,
        valid: stats.details.valid
      },
      labels: {
        status: stats.labels.valid ? 'healthy' : 'stale',
        age: stats.labels.age,
        ageString: Math.round(stats.labels.age / 1000 / 60) + ' minutes'
      }
    };
  }, [cache]);

  return {
    // Enhanced fetch methods
    fetchProjectsWithTracking,
    prefetchRelatedProjects,
    
    // Lazy loading utilities
    createLazyLoader,
    lazyConfig,
    
    // Performance metrics
    metrics,
    performanceRecommendations,
    
    // Cache health
    checkCacheHealth,
    
    // Manual performance controls
    clearMetrics: () => {
      performanceRef.current = {
        startTime: 0,
        apiCalls: 0,
        cacheHits: 0,
        errors: 0,
        totalRequests: 0
      };
      setMetrics({
        loadTime: 0,
        cacheHitRate: 0,
        apiCallCount: 0,
        errorRate: 0
      });
    },
    
    // Cache controls
    warmCache: async () => {
      await projects.fetchPublicProjects();
      await projects.fetchProjectLabels();
    },
    
    // Performance utilities
    reportPerformance: () => ({
      ...metrics,
      cacheHealth: checkCacheHealth(),
      recommendations: performanceRecommendations
    })
  };
};