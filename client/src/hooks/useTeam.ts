/**
 * HOOK useTeam - Gestione membri del team
 *
 * Hook personalizzato per gestire i membri del team attraverso l'API backend.
 * Include funzionalità complete CRUD e gestione CV.
 *
 * Features:
 * - Caricamento membri pubblici e admin
 * - Creazione, modifica, eliminazione membri
 * - Upload/download/eliminazione CV
 * - Riordinamento membri
 * - Stati di loading e errore
 *
 * @author KORSVAGEN S.R.L.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/api";
import toast from "react-hot-toast";

// Tipi TypeScript
export interface TeamMember {
  id: string;
  // Informazioni base
  name: string;
  role: string;
  short_description?: string;
  full_description?: string;
  placeholder: string; // Iniziali per avatar
  
  // Esperienza e formazione
  experience?: string;
  education?: string;
  
  // Skills
  skills: string[];
  
  // CV
  cv_file_name?: string;
  cv_file_url?: string;
  cv_file_size?: number;
  cv_upload_date?: string;
  has_cv?: boolean; // Per versione pubblica
  
  // Immagine profilo (futuro)
  profile_image_url?: string;
  
  // Ordinamento e visibilità
  display_order: number;
  is_active: boolean;
  
  // Metadata
  created_at?: string;
  updated_at?: string;
  created_by_username?: string;
  updated_by_username?: string;
}

export interface CreateTeamMemberData {
  name: string;
  role: string;
  short_description?: string;
  full_description?: string;
  placeholder: string;
  experience?: string;
  education?: string;
  skills?: string[];
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateTeamMemberData extends Partial<CreateTeamMemberData> {
  id?: string;
}

interface UseTeamReturn {
  // Stati
  members: TeamMember[];
  loading: boolean;
  error: string | null;
  uploading: boolean;

  // Metodi pubblici
  fetchPublicMembers: () => Promise<void>;

  // Metodi admin
  fetchMembers: () => Promise<void>;
  getMember: (id: string) => Promise<TeamMember | null>;
  createMember: (memberData: CreateTeamMemberData) => Promise<boolean>;
  updateMember: (id: string, memberData: UpdateTeamMemberData) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  
  // Gestione CV
  uploadCV: (memberId: string, file: File) => Promise<boolean>;
  deleteCV: (memberId: string) => Promise<boolean>;
  getCVDownloadUrl: (memberId: string) => string;
  
  // Riordinamento
  reorderMembers: (memberIds: string[]) => Promise<boolean>;

  // Utilità
  refreshMembers: () => Promise<void>;
}

export const useTeam = (): UseTeamReturn => {
  // Stati
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Carica membri pubblici per la pagina Team
   */
  const fetchPublicMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/team/public");
      
      if (response.data.success) {
        setMembers(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento membri team");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento membri team";
      setError(errorMessage);
      console.error("Errore fetchPublicMembers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carica membri per admin (tutti, inclusi non attivi)
   */
  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/team");
      
      if (response.data.success) {
        setMembers(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento membri team");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento membri team";
      setError(errorMessage);
      console.error("Errore fetchMembers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recupera singolo membro
   */
  const getMember = useCallback(async (id: string): Promise<TeamMember | null> => {
    try {
      const response = await apiClient.get(`/team/${id}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Errore caricamento membro");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento membro";
      console.error("Errore getMember:", err);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  /**
   * Crea nuovo membro del team
   */
  const createMember = useCallback(async (memberData: CreateTeamMemberData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/team", memberData);
      
      if (response.data.success) {
        toast.success("Membro del team creato con successo!");
        // Ricarica i membri
        await fetchMembers();
        return true;
      } else {
        throw new Error(response.data.message || "Errore creazione membro");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore creazione membro";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore createMember:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  /**
   * Aggiorna membro del team
   */
  const updateMember = useCallback(async (id: string, memberData: UpdateTeamMemberData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/team/${id}`, memberData);
      
      if (response.data.success) {
        toast.success("Membro del team aggiornato con successo!");
        // Ricarica i membri
        await fetchMembers();
        return true;
      } else {
        throw new Error(response.data.message || "Errore aggiornamento membro");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore aggiornamento membro";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore updateMember:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  /**
   * Elimina membro del team
   */
  const deleteMember = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/team/${id}`);
      
      if (response.data.success) {
        toast.success("Membro del team eliminato con successo!");
        // Ricarica i membri
        await fetchMembers();
        return true;
      } else {
        throw new Error(response.data.message || "Errore eliminazione membro");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore eliminazione membro";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deleteMember:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  /**
   * Carica CV per membro del team
   */
  const uploadCV = useCallback(async (memberId: string, file: File): Promise<boolean> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("cv", file);

      const response = await apiClient.post(`/team/${memberId}/cv`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.success) {
        toast.success("CV caricato con successo!");
        // Ricarica i membri per aggiornare i dati CV
        await fetchMembers();
        return true;
      } else {
        throw new Error(response.data.message || "Errore caricamento CV");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento CV";
      setError(errorMessage);
      
      // Gestisci diversi tipi di errore
      if (err.response?.status === 404) {
        toast.error("Membro del team non trovato. Ricarica la pagina e riprova.");
      } else if (err.response?.status === 400) {
        toast.error("File non valido. Assicurati di caricare un PDF valido.");
      } else {
        toast.error(errorMessage);
      }
      
      console.error("Errore uploadCV:", err);
      return false;
    } finally {
      setUploading(false);
    }
  }, [fetchMembers]);

  /**
   * Elimina CV di un membro
   */
  const deleteCV = useCallback(async (memberId: string): Promise<boolean> => {
    setUploading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/team/${memberId}/cv`);
      
      if (response.data.success) {
        toast.success("CV eliminato con successo!");
        // Ricarica i membri per aggiornare i dati CV
        await fetchMembers();
        return true;
      } else {
        throw new Error(response.data.message || "Errore eliminazione CV");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore eliminazione CV";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deleteCV:", err);
      return false;
    } finally {
      setUploading(false);
    }
  }, [fetchMembers]);

  /**
   * Ottieni URL per download CV
   */
  const getCVDownloadUrl = useCallback((memberId: string): string => {
    return `${apiClient.defaults.baseURL}/team/${memberId}/cv`;
  }, []);

  /**
   * Riordina membri del team
   */
  const reorderMembers = useCallback(async (memberIds: string[]): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put("/team/reorder", {
        memberIds
      });
      
      if (response.data.success) {
        toast.success("Ordine membri aggiornato con successo!");
        // Ricarica i membri per vedere il nuovo ordine
        await fetchMembers();
        return true;
      } else {
        throw new Error(response.data.message || "Errore riordinamento membri");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore riordinamento membri";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore reorderMembers:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  /**
   * Ricarica membri (admin)
   */
  const refreshMembers = useCallback(async () => {
    await fetchMembers();
  }, [fetchMembers]);

  /**
   * NON caricare automaticamente i membri pubblici
   * Lascia che ogni componente chiami esplicitamente fetchPublicMembers() o fetchMembers()
   */
  // useEffect(() => {
  //   fetchPublicMembers();
  // }, [fetchPublicMembers]);

  return {
    // Stati
    members,
    loading,
    error,
    uploading,

    // Metodi pubblici
    fetchPublicMembers,

    // Metodi admin
    fetchMembers,
    getMember,
    createMember,
    updateMember,
    deleteMember,
    
    // Gestione CV
    uploadCV,
    deleteCV,
    getCVDownloadUrl,
    
    // Riordinamento
    reorderMembers,

    // Utilità
    refreshMembers,
  };
};