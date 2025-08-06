/**
 * HOOK useServices - Gestione Servizi Aziendali
 *
 * Hook personalizzato per gestire i servizi aziendali attraverso l'API backend.
 * Include funzionalità complete CRUD e gestione immagini.
 *
 * Features:
 * - Caricamento servizi pubblici e admin
 * - Creazione, modifica, eliminazione servizi
 * - Upload/eliminazione immagini
 * - Riordinamento servizi
 * - Stati di loading e errore
 * - Statistiche servizi
 *
 * @author KORSVAGEN S.R.L.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/api";
import toast from "react-hot-toast";

// Tipi TypeScript
export interface Service {
  id: string;
  // Informazioni base
  title: string;
  subtitle?: string;
  description: string;
  
  // Immagine servizio
  image_url?: string;
  image_public_id?: string;
  image_upload_date?: string;
  
  // Microservizi
  microservices: string[];
  
  // Ordinamento e visibilità
  display_order: number;
  is_active: boolean;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by_username?: string;
  updated_by_username?: string;
}

export interface CreateServiceData {
  title: string;
  subtitle?: string;
  description: string;
  microservices?: string[];
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateServiceData extends Partial<CreateServiceData> {
  id?: string;
}

export interface ServiceStats {
  total_services: number;
  active_services: number;
  inactive_services: number;
  services_with_images: number;
  average_microservices: number;
}

interface UseServicesReturn {
  // Stati
  services: Service[];
  loading: boolean;
  error: string | null;
  uploading: boolean;
  stats: ServiceStats | null;

  // Metodi pubblici
  fetchPublicServices: () => Promise<void>;

  // Metodi admin
  fetchServices: () => Promise<void>;
  getService: (id: string) => Promise<Service | null>;
  createService: (serviceData: CreateServiceData) => Promise<boolean>;
  updateService: (id: string, serviceData: UpdateServiceData) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
  
  // Gestione Immagini
  uploadImage: (serviceId: string, file: File) => Promise<boolean>;
  deleteImage: (serviceId: string) => Promise<boolean>;
  
  // Riordinamento
  reorderServices: (serviceIds: string[]) => Promise<boolean>;

  // Statistiche
  fetchStats: () => Promise<void>;

  // Utilità
  refreshServices: () => Promise<void>;
}

export const useServices = (): UseServicesReturn => {
  // Stati
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<ServiceStats | null>(null);

  /**
   * Carica servizi pubblici per la pagina Servizi
   */
  const fetchPublicServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/services");
      
      if (response.data.success) {
        setServices(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento servizi");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore caricamento servizi";
      setError(errorMessage);
      console.error("Errore fetchPublicServices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carica servizi per admin (tutti, inclusi non attivi)
   */
  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/services/admin");
      
      if (response.data.success) {
        setServices(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento servizi");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore caricamento servizi";
      setError(errorMessage);
      console.error("Errore fetchServices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recupera singolo servizio
   */
  const getService = useCallback(async (id: string): Promise<Service | null> => {
    try {
      const response = await apiClient.get(`/services/admin/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.error || "Errore caricamento servizio");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore caricamento servizio";
      console.error("Errore getService:", err);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  /**
   * Crea nuovo servizio
   */
  const createService = useCallback(async (serviceData: CreateServiceData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/services/admin", serviceData);
      
      if (response.data.success) {
        toast.success("Servizio creato con successo!");
        // Ricarica i servizi
        await fetchServices();
        return true;
      } else {
        throw new Error(response.data.error || "Errore creazione servizio");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore creazione servizio";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore createService:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  /**
   * Aggiorna servizio
   */
  const updateService = useCallback(async (id: string, serviceData: UpdateServiceData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/services/admin/${id}`, serviceData);
      
      if (response.data.success) {
        toast.success("Servizio aggiornato con successo!");
        // Ricarica i servizi
        await fetchServices();
        return true;
      } else {
        throw new Error(response.data.error || "Errore aggiornamento servizio");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore aggiornamento servizio";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore updateService:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  /**
   * Elimina servizio
   */
  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/services/admin/${id}`);
      
      if (response.data.success) {
        toast.success("Servizio eliminato con successo!");
        // Ricarica i servizi
        await fetchServices();
        return true;
      } else {
        throw new Error(response.data.error || "Errore eliminazione servizio");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore eliminazione servizio";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deleteService:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  /**
   * Upload immagine servizio
   */
  const uploadImage = useCallback(async (serviceId: string, file: File): Promise<boolean> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post(`/services/admin/${serviceId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        toast.success("Immagine caricata con successo!");
        // Ricarica i servizi per aggiornare i dati
        await fetchServices();
        return true;
      } else {
        throw new Error(response.data.error || "Errore upload immagine");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore upload immagine";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore uploadImage:", err);
      return false;
    } finally {
      setUploading(false);
    }
  }, [fetchServices]);

  /**
   * Elimina immagine servizio
   */
  const deleteImage = useCallback(async (serviceId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/services/admin/${serviceId}/image`);
      
      if (response.data.success) {
        toast.success("Immagine eliminata con successo!");
        // Ricarica i servizi
        await fetchServices();
        return true;
      } else {
        throw new Error(response.data.error || "Errore eliminazione immagine");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore eliminazione immagine";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deleteImage:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  /**
   * Riordina servizi
   */
  const reorderServices = useCallback(async (serviceIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put('/services/admin/reorder', {
        serviceIds: serviceIds
      });
      
      if (response.data.success) {
        toast.success("Servizi riordinati con successo!");
        // Ricarica i servizi
        await fetchServices();
        return true;
      } else {
        throw new Error(response.data.error || "Errore riordinamento servizi");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Errore riordinamento servizi";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore reorderServices:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchServices]);

  /**
   * Carica statistiche servizi
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get("/services/admin/stats");
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        console.warn("Errore caricamento statistiche servizi:", response.data.error);
      }
    } catch (err: any) {
      console.warn("Errore fetchStats:", err);
      // Non mostriamo toast per le statistiche, fallisce silenziosamente
    }
  }, []);

  /**
   * Aggiorna servizi e statistiche
   */
  const refreshServices = useCallback(async () => {
    await Promise.all([
      fetchServices(),
      fetchStats()
    ]);
  }, [fetchServices, fetchStats]);

  // Carica statistiche quando i servizi cambiano
  useEffect(() => {
    if (services.length > 0) {
      fetchStats();
    }
  }, [services.length, fetchStats]);

  return {
    // Stati
    services,
    loading,
    error,
    uploading,
    stats,

    // Metodi pubblici
    fetchPublicServices,

    // Metodi admin
    fetchServices,
    getService,
    createService,
    updateService,
    deleteService,
    
    // Gestione Immagini
    uploadImage,
    deleteImage,
    
    // Riordinamento
    reorderServices,

    // Statistiche
    fetchStats,

    // Utilità
    refreshServices
  };
};