/**
 * useJobs Hook - Custom hook per gestione Jobs API
 *
 * Hook personalizzato per gestire tutte le operazioni relative
 * alle posizioni lavorative e alle candidature.
 */

import { useState, useCallback } from 'react';
import { API_BASE_URL } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export interface JobPosition {
  id: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  requirements: string;
  nice_to_have?: string;
  benefits?: string;
  salary_range?: string;
  is_active: boolean;
  applications_count: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: number;
  job_position_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  cv_url?: string;
  cv_public_id?: string;
  cover_letter?: string;
  linkedin_profile?: string;
  portfolio_url?: string;
  status: 'new' | 'reviewed' | 'contacted' | 'interview' | 'hired' | 'rejected';
  admin_notes?: string;
  applied_at: string;
  updated_at: string;
  job_title?: string;
  job_department?: string;
  job_location?: string;
  job_employment_type?: string;
}

export interface JobsStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
}

export const useJobs = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<JobPosition[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<JobsStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0
  });
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all jobs (admin)
  const fetchJobs = useCallback(async (filters?: {
    department?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.department) params.append('department', filters.department);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/jobs/admin?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data || []);
        
        // Calculate stats
        const totalJobs = data.data?.length || 0;
        const activeJobs = data.data?.filter((job: JobPosition) => job.is_active).length || 0;
        
        setStats(prev => ({
          ...prev,
          totalJobs,
          activeJobs
        }));

        // Extract unique departments
        const departments = data.data?.map((job: JobPosition) => job.department) || [];
        const uniqueDepartments = departments
          .filter((dept: string, index: number, array: string[]) => array.indexOf(dept) === index)
          .sort();
        setDepartments(uniqueDepartments);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch public jobs
  const fetchPublicJobs = useCallback(async (filters?: {
    department?: string;
    location?: string;
    employment_type?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.department) params.append('department', filters.department);
      if (filters?.location) params.append('location', filters.location);
      if (filters?.employment_type) params.append('employment_type', filters.employment_type);

      const response = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data || []);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(errorMessage);
      console.error('Error fetching public jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch single job by slug
  const fetchJobBySlug = useCallback(async (slug: string): Promise<JobPosition | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job';
      setError(errorMessage);
      console.error('Error fetching job by slug:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Create new job
  const createJob = useCallback(async (jobData: Partial<JobPosition>): Promise<JobPosition | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Add new job to local state
        setJobs(prev => [data.data, ...prev]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalJobs: prev.totalJobs + 1,
          activeJobs: data.data.is_active ? prev.activeJobs + 1 : prev.activeJobs
        }));

        return data.data;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create job';
      setError(errorMessage);
      console.error('Error creating job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Update job
  const updateJob = useCallback(async (id: number, jobData: Partial<JobPosition>): Promise<JobPosition | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/admin/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Update job in local state
        setJobs(prev => prev.map(job => 
          job.id === id ? data.data : job
        ));

        return data.data;
      }

      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update job';
      setError(errorMessage);
      console.error('Error updating job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Delete job
  const deleteJob = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/admin/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove job from local state
        const deletedJob = jobs.find(job => job.id === id);
        setJobs(prev => prev.filter(job => job.id !== id));
        
        // Update stats
        if (deletedJob) {
          setStats(prev => ({
            ...prev,
            totalJobs: prev.totalJobs - 1,
            activeJobs: deletedJob.is_active ? prev.activeJobs - 1 : prev.activeJobs
          }));
        }

        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete job';
      setError(errorMessage);
      console.error('Error deleting job:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [jobs]);

  // Reorder jobs
  const reorderJobs = useCallback(async (positions: { id: number; display_order: number }[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/admin/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: 'include',
        body: JSON.stringify({ positions }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state with new order
        setJobs(prev => {
          const updated = [...prev];
          positions.forEach(pos => {
            const jobIndex = updated.findIndex(job => job.id === pos.id);
            if (jobIndex !== -1) {
              updated[jobIndex] = { ...updated[jobIndex], display_order: pos.display_order };
            }
          });
          return updated.sort((a, b) => a.display_order - b.display_order);
        });

        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reorder jobs';
      setError(errorMessage);
      console.error('Error reordering jobs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch applications
  const fetchApplications = useCallback(async (filters?: {
    job_id?: string;
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters?.job_id) params.append('job_id', filters.job_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`${API_BASE_URL}/jobs/applications?${params.toString()}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setApplications(data.data || []);
        
        // Calculate application stats
        const totalApplications = data.data?.length || 0;
        const newApplications = data.data?.filter((app: Application) => app.status === 'new').length || 0;
        
        setStats(prev => ({
          ...prev,
          totalApplications,
          newApplications
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications';
      setError(errorMessage);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Submit application (public)
  const submitApplication = useCallback(async (
    slug: string, 
    applicationData: FormData
  ): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/jobs/${slug}/apply`, {
        method: 'POST',
        body: applicationData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success || false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit application';
      setError(errorMessage);
      console.error('Error submitting application:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch metadata (departments, locations)
  const fetchDepartments = useCallback(async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/meta/departments`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      }

      return [];
    } catch (err) {
      console.error('Error fetching departments:', err);
      return [];
    }
  }, [token]);

  const fetchLocations = useCallback(async (): Promise<string[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/jobs/meta/locations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        return data.data || [];
      }

      return [];
    } catch (err) {
      console.error('Error fetching locations:', err);
      return [];
    }
  }, [token]);

  return {
    // State
    jobs,
    applications,
    stats,
    departments,
    loading,
    error,

    // Jobs operations
    fetchJobs,
    fetchPublicJobs,
    fetchJobBySlug,
    createJob,
    updateJob,
    deleteJob,
    reorderJobs,

    // Applications operations
    fetchApplications,
    submitApplication,

    // Metadata operations
    fetchDepartments,
    fetchLocations,
  };
};