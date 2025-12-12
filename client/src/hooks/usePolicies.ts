/**
 * HOOK usePolicies - Gestione politiche aziendali
 *
 * Hook personalizzato per gestire le operazioni CRUD
 * delle politiche aziendali attraverso l'API backend.
 *
 * Features:
 * - Caricamento politiche pubbliche e admin
 * - Creazione, modifica ed eliminazione politiche
 * - Upload/download documenti PDF
 * - Stati di loading e errore
 * - Rivalidazione automatica dopo operazioni
 *
 * @author KORSVAGEN S.R.L.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/api";
import toast from "react-hot-toast";

// Tipi TypeScript
export interface Policy {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  document_url?: string;
  document_public_id?: string;
  file_size?: number;
  category: "quality" | "environment" | "safety" | "anticorruption" | "gender_equality" | "general";
  display_order?: number;
  is_published?: boolean;
  effective_date?: string;
  revision_date?: string;
  revision_number?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PolicyFormData {
  title: string;
  slug?: string;
  description?: string;
  content?: string;
  category?: string;
  is_published?: boolean;
  display_order?: number;
  effective_date?: string;
  revision_date?: string;
  revision_number?: string;
}

interface UsePoliciesReturn {
  // Stati
  policies: Policy[];
  publicPolicies: Policy[];
  loading: boolean;
  error: string | null;
  uploading: boolean;

  // Metodi pubblici
  fetchPublicPolicies: () => Promise<void>;

  // Metodi admin
  fetchPolicies: () => Promise<void>;
  createPolicy: (policyData: PolicyFormData) => Promise<boolean>;
  updatePolicy: (id: string, policyData: Partial<PolicyFormData>) => Promise<boolean>;
  deletePolicy: (id: string) => Promise<boolean>;

  // Gestione documenti
  uploadDocument: (id: string, file: File) => Promise<boolean>;
  deleteDocument: (id: string) => Promise<boolean>;

  // Utilita
  refreshPolicies: () => Promise<void>;
  getPolicyBySlug: (slug: string) => Policy | undefined;
}

// Mapping categorie per display
export const POLICY_CATEGORIES: Record<string, string> = {
  quality: "Qualita",
  environment: "Ambiente",
  safety: "Sicurezza",
  anticorruption: "Anticorruzione",
  gender_equality: "Parita di Genere",
  general: "Generale"
};

export const usePolicies = (): UsePoliciesReturn => {
  // Stati
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [publicPolicies, setPublicPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Carica politiche pubbliche
   */
  const fetchPublicPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/policies/public");

      if (response.data.success) {
        setPublicPolicies(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento politiche");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento politiche";
      setError(errorMessage);
      console.error("Errore fetchPublicPolicies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carica tutte le politiche (admin only)
   */
  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/policies");

      if (response.data.success) {
        setPolicies(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento politiche");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento politiche";
      setError(errorMessage);
      console.error("Errore fetchPolicies:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nuova policy
   */
  const createPolicy = useCallback(async (policyData: PolicyFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/policies", policyData);

      if (response.data.success) {
        toast.success("Policy creata con successo!");
        await fetchPolicies();
        return true;
      } else {
        throw new Error(response.data.message || "Errore creazione policy");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore creazione policy";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore createPolicy:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPolicies]);

  /**
   * Aggiorna una policy esistente
   */
  const updatePolicy = useCallback(async (id: string, policyData: Partial<PolicyFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/policies/${id}`, policyData);

      if (response.data.success) {
        toast.success("Policy aggiornata con successo!");
        await fetchPolicies();
        return true;
      } else {
        throw new Error(response.data.message || "Errore aggiornamento policy");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore aggiornamento policy";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore updatePolicy:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPolicies]);

  /**
   * Elimina una policy
   */
  const deletePolicy = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/policies/${id}`);

      if (response.data.success) {
        toast.success("Policy eliminata con successo!");
        await fetchPolicies();
        return true;
      } else {
        throw new Error(response.data.message || "Errore eliminazione policy");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore eliminazione policy";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deletePolicy:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPolicies]);

  /**
   * Upload documento PDF
   */
  const uploadDocument = useCallback(async (id: string, file: File): Promise<boolean> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("document", file);

      const response = await apiClient.post(`/policies/${id}/document`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        toast.success("Documento caricato con successo!");
        await fetchPolicies();
        return true;
      } else {
        throw new Error(response.data.message || "Errore upload documento");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore upload documento";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore uploadDocument:", err);
      return false;
    } finally {
      setUploading(false);
    }
  }, [fetchPolicies]);

  /**
   * Elimina documento
   */
  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    setUploading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/policies/${id}/document`);

      if (response.data.success) {
        toast.success("Documento eliminato con successo!");
        await fetchPolicies();
        return true;
      } else {
        throw new Error(response.data.message || "Errore eliminazione documento");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore eliminazione documento";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deleteDocument:", err);
      return false;
    } finally {
      setUploading(false);
    }
  }, [fetchPolicies]);

  /**
   * Ricarica tutte le politiche
   */
  const refreshPolicies = useCallback(async () => {
    await Promise.all([
      fetchPolicies(),
      fetchPublicPolicies()
    ]);
  }, [fetchPolicies, fetchPublicPolicies]);

  /**
   * Trova policy per slug
   */
  const getPolicyBySlug = useCallback((slug: string): Policy | undefined => {
    return publicPolicies.find(p => p.slug === slug) || policies.find(p => p.slug === slug);
  }, [publicPolicies, policies]);

  /**
   * Carica politiche pubbliche al mount
   */
  useEffect(() => {
    fetchPublicPolicies();
  }, [fetchPublicPolicies]);

  return {
    // Stati
    policies,
    publicPolicies,
    loading,
    error,
    uploading,

    // Metodi pubblici
    fetchPublicPolicies,

    // Metodi admin
    fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,

    // Gestione documenti
    uploadDocument,
    deleteDocument,

    // Utilita
    refreshPolicies,
    getPolicyBySlug,
  };
};
