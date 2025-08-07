/**
 * PROJECTS HOOK - Gestione progetti
 *
 * Hook personalizzato per la gestione completa dei progetti:
 * - Fetching dati pubblici e admin
 * - CRUD operations
 * - Gestione stato loading/error
 * - Cache e aggiornamenti real-time
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProjectsCache } from './useProjectsCache';
import toast from 'react-hot-toast';

// Types
export interface Project {
  id: number;
  title: string;
  subtitle?: string;
  year: number;
  location: string;
  status: 'Completato' | 'In corso' | 'Progettazione';
  label: string;
  description: string;
  long_description?: string;
  client?: string;
  surface?: string;
  budget?: string;
  duration?: string;
  features: string[];
  is_active: boolean;
  display_order: number;
  slug?: string;
  meta_title?: string;
  meta_description?: string;
  cover_image_url?: string;
  cover_image_public_id?: string;
  cover_image_title?: string;
  cover_image_alt?: string;
  images?: ProjectImage[];
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: number;
  project_id: number;
  image_url: string;
  image_public_id: string;
  title: string;
  alt_text?: string;
  display_order: number;
  is_cover: boolean;
  width?: number;
  height?: number;
  uploaded_at: string;
}

export interface ProjectLabel {
  name: string;
  display_name: string;
  color?: string;
}

export interface CreateProjectData {
  title: string;
  subtitle?: string;
  year: number;
  location: string;
  status: string;
  label: string;
  description: string;
  long_description?: string;
  client?: string;
  surface?: string;
  budget?: string;
  duration?: string;
  features: string[];
  is_active?: boolean;
  display_order?: number;
  meta_title?: string;
  meta_description?: string;
}

// Hook
export const useProjects = () => {
  const { token } = useAuth();
  const cache = useProjectsCache();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Base API URL
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

  // Helper function to make authenticated requests
  const makeRequest = useCallback(async (
    url: string, 
    options: RequestInit = {}
  ) => {
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE}${url}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }, [token, API_BASE]);

  // Fetch public projects (for frontend)
  const fetchPublicProjects = useCallback(async (params?: {
    label?: string;
    status?: string;
    limit?: number;
    page?: number;
  }) => {
    try {
      // Check cache first
      const cachedData = cache.getCachedProjects(params);
      if (cachedData) {
        return { projects: cachedData };
      }

      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.label) searchParams.append('label', params.label);
      if (params?.status) searchParams.append('status', params.status);
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.page) searchParams.append('page', params.page.toString());

      const response = await makeRequest(
        `/api/projects?${searchParams.toString()}`
      );

      if (response.success) {
        // Cache the result if no specific filters (full dataset)
        if (!params?.label && !params?.status) {
          cache.setCachedProjects(response.data.projects);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch projects');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, cache]);

  // Fetch single project by ID or slug
  const fetchProject = useCallback(async (idOrSlug: string | number) => {
    try {
      // Check cache first
      const cacheKey = idOrSlug.toString();
      const cachedProject = cache.getCachedProjectDetail(cacheKey);
      if (cachedProject) {
        return cachedProject;
      }

      setLoading(true);
      setError(null);

      const response = await makeRequest(`/api/projects/${idOrSlug}`);

      if (response.success) {
        // Cache the project detail
        cache.setCachedProjectDetail(cacheKey, response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Project not found');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, cache]);

  // Fetch admin projects (all projects)
  const fetchAdminProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeRequest('/api/projects/admin');

      if (response.success) {
        setProjects(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch projects');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeRequest]);

  // Create new project
  const createProject = useCallback(async (data: CreateProjectData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeRequest('/api/projects/admin', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success) {
        // Add to local state
        setProjects(prev => [...prev, response.data]);
        // Invalidate cache
        cache.invalidateCache('projects');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, cache]);

  // Update project
  const updateProject = useCallback(async (id: number, data: Partial<CreateProjectData>) => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeRequest(`/api/projects/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success) {
        // Update in local state
        setProjects(prev => 
          prev.map(project => 
            project.id === id ? { ...project, ...response.data } : project
          )
        );
        // Invalidate cache
        cache.invalidateCache('projects');
        cache.invalidateCache('details');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update project');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, cache]);

  // Delete project
  const deleteProject = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await makeRequest(`/api/projects/admin/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Remove from local state
        setProjects(prev => prev.filter(project => project.id !== id));
        // Invalidate cache
        cache.invalidateCache('projects');
        cache.invalidateCache('details');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete project');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, cache]);

  // Toggle project status
  const toggleProjectStatus = useCallback(async (id: number, isActive: boolean) => {
    try {
      const response = await makeRequest(`/api/projects/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: isActive }),
      });

      if (response.success) {
        // Update in local state
        setProjects(prev => 
          prev.map(project => 
            project.id === id ? { ...project, is_active: isActive } : project
          )
        );
        // Invalidate cache
        cache.invalidateCache('projects');
        cache.invalidateCache('details');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update project status');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest, cache]);

  // Reorder projects
  const reorderProjects = useCallback(async (projectOrders: Array<{ id: number; display_order: number }>) => {
    try {
      const response = await makeRequest('/api/projects/admin/reorder', {
        method: 'PUT',
        body: JSON.stringify({ projectOrders }),
      });

      if (response.success) {
        // Update local state
        setProjects(prev => {
          const updated = [...prev];
          projectOrders.forEach(({ id, display_order }) => {
            const index = updated.findIndex(p => p.id === id);
            if (index !== -1) {
              updated[index] = { ...updated[index], display_order };
            }
          });
          return updated.sort((a, b) => a.display_order - b.display_order);
        });
        // Invalidate cache
        cache.invalidateCache('projects');
        return true;
      } else {
        throw new Error(response.message || 'Failed to reorder projects');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest, cache]);

  // Upload project images
  const uploadProjectImages = useCallback(async (projectId: number, files: FileList) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${API_BASE}/api/projects/admin/${projectId}/images`, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        // Invalidate cache since project images changed
        cache.invalidateCache('details');
        return result.data;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [makeRequest, token, API_BASE, cache]);

  // Update single image
  const updateProjectImage = useCallback(async (
    projectId: number, 
    imageId: number, 
    data: { title?: string; alt_text?: string }
  ) => {
    try {
      const response = await makeRequest(`/api/projects/admin/${projectId}/images/${imageId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success) {
        // Invalidate cache since image data changed
        cache.invalidateCache('details');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update image');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest, cache]);

  // Delete project image
  const deleteProjectImage = useCallback(async (projectId: number, imageId: number) => {
    try {
      const response = await makeRequest(`/api/projects/admin/${projectId}/images/${imageId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // Invalidate cache since image was deleted
        cache.invalidateCache('details');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete image');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest, cache]);

  // Set cover image
  const setCoverImage = useCallback(async (projectId: number, imageId: number) => {
    try {
      const response = await makeRequest(`/api/projects/admin/${projectId}/images/${imageId}/cover`, {
        method: 'PUT',
      });

      if (response.success) {
        // Invalidate cache since cover image changed
        cache.invalidateCache('details');
        cache.invalidateCache('projects');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to set cover image');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest, cache]);

  // Reorder project images
  const reorderProjectImages = useCallback(async (
    projectId: number, 
    imageOrders: Array<{ id: number; display_order: number }>
  ) => {
    try {
      const response = await makeRequest(`/api/projects/admin/${projectId}/images/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ imageOrders }),
      });

      if (response.success) {
        // Invalidate cache since image order changed
        cache.invalidateCache('details');
        return true;
      } else {
        throw new Error(response.message || 'Failed to reorder images');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest, cache]);

  // Fetch project labels
  const fetchProjectLabels = useCallback(async (): Promise<ProjectLabel[]> => {
    try {
      // Check cache first
      const cachedLabels = cache.getCachedLabels();
      if (cachedLabels) {
        return cachedLabels;
      }

      const response = await makeRequest('/api/projects/labels');

      if (response.success) {
        // Cache the labels
        cache.setCachedLabels(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch labels');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [makeRequest, cache]);

  // Refresh projects (alias for fetchAdminProjects)
  const refreshProjects = useCallback(() => {
    return fetchAdminProjects();
  }, [fetchAdminProjects]);

  return {
    // State
    projects,
    loading,
    error,

    // Public methods
    fetchPublicProjects,
    fetchProject,
    fetchProjectLabels,

    // Admin methods
    fetchAdminProjects,
    createProject,
    updateProject,
    deleteProject,
    toggleProjectStatus,
    reorderProjects,
    refreshProjects,

    // Image methods
    uploadProjectImages,
    updateProjectImage,
    deleteProjectImage,
    setCoverImage,
    reorderProjectImages,

    // Utility
    clearError: () => setError(null),
  };
};