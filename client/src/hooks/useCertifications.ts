/**
 * HOOK useCertifications - Gestione certificazioni e qualifiche
 *
 * Hook personalizzato per gestire le operazioni CRUD
 * delle certificazioni attraverso l'API backend.
 *
 * Features:
 * - Caricamento certificazioni pubbliche e admin
 * - Creazione, modifica ed eliminazione certificazioni
 * - Stati di loading e errore
 * - Rivalidazione automatica dopo operazioni
 *
 * @author KORSVAGEN S.R.L.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/api";
import toast from "react-hot-toast";

// Tipi TypeScript
export interface Certification {
  id: string;
  name: string;
  code: string;
  description: string;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CertificationFormData {
  name: string;
  code: string;
  description: string;
  is_active?: boolean;
  display_order?: number;
}

interface UseCertificationsReturn {
  // Stati
  certifications: Certification[];
  publicCertifications: Certification[];
  loading: boolean;
  error: string | null;

  // Metodi pubblici
  fetchPublicCertifications: () => Promise<void>;

  // Metodi admin
  fetchCertifications: () => Promise<void>;
  createCertification: (certificationData: CertificationFormData) => Promise<boolean>;
  updateCertification: (id: string, certificationData: Partial<CertificationFormData>) => Promise<boolean>;
  deleteCertification: (id: string) => Promise<boolean>;

  // Utilità
  refreshCertifications: () => Promise<void>;
}

export const useCertifications = (): UseCertificationsReturn => {
  // Stati
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [publicCertifications, setPublicCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carica certificazioni pubbliche per la pagina About
   */
  const fetchPublicCertifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/certifications/public");
      
      if (response.data.success) {
        setPublicCertifications(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento certificazioni");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento certificazioni";
      setError(errorMessage);
      console.error("Errore fetchPublicCertifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carica tutte le certificazioni (admin only)
   */
  const fetchCertifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/certifications");
      
      if (response.data.success) {
        setCertifications(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento certificazioni");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento certificazioni";
      setError(errorMessage);
      console.error("Errore fetchCertifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nuova certificazione
   */
  const createCertification = useCallback(async (certificationData: CertificationFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/certifications", certificationData);
      
      if (response.data.success) {
        toast.success("Certificazione creata con successo!");
        // Ricarica le certificazioni
        await fetchCertifications();
        return true;
      } else {
        throw new Error(response.data.message || "Errore creazione certificazione");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore creazione certificazione";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore createCertification:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCertifications]);

  /**
   * Aggiorna una certificazione esistente
   */
  const updateCertification = useCallback(async (id: string, certificationData: Partial<CertificationFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/certifications/${id}`, certificationData);
      
      if (response.data.success) {
        toast.success("Certificazione aggiornata con successo!");
        // Ricarica le certificazioni
        await fetchCertifications();
        return true;
      } else {
        throw new Error(response.data.message || "Errore aggiornamento certificazione");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore aggiornamento certificazione";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore updateCertification:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCertifications]);

  /**
   * Elimina una certificazione
   */
  const deleteCertification = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/certifications/${id}`);
      
      if (response.data.success) {
        toast.success("Certificazione eliminata con successo!");
        // Ricarica le certificazioni
        await fetchCertifications();
        return true;
      } else {
        throw new Error(response.data.message || "Errore eliminazione certificazione");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore eliminazione certificazione";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deleteCertification:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCertifications]);

  /**
   * Ricarica tutte le certificazioni
   */
  const refreshCertifications = useCallback(async () => {
    await Promise.all([
      fetchCertifications(),
      fetchPublicCertifications()
    ]);
  }, [fetchCertifications, fetchPublicCertifications]);

  /**
   * Carica certificazioni pubbliche al mount del componente
   */
  useEffect(() => {
    fetchPublicCertifications();
  }, [fetchPublicCertifications]);

  return {
    // Stati
    certifications,
    publicCertifications,
    loading,
    error,

    // Metodi pubblici
    fetchPublicCertifications,

    // Metodi admin
    fetchCertifications,
    createCertification,
    updateCertification,
    deleteCertification,

    // Utilità
    refreshCertifications,
  };
};