/**
 * HOOK useAboutContent - Gestione contenuti pagina About
 *
 * Hook personalizzato per gestire i contenuti della pagina About
 * attraverso l'API backend.
 *
 * Features:
 * - Caricamento contenuti pubblici e admin
 * - Aggiornamento contenuti
 * - Stati di loading e errore
 *
 * @author KORSVAGEN S.R.L.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/api";
import toast from "react-hot-toast";

// Tipi TypeScript
export interface AboutContent {
  id?: string;
  // Hero Section
  hero_title?: string;
  hero_subtitle?: string;

  // Storia Section
  storia_title?: string;
  storia_content?: string;

  // Mission Section
  mission_title?: string;
  mission_content?: string;

  // Vision Section
  vision_title?: string;
  vision_content?: string;

  // Perché Sceglierci Section
  why_choose_title?: string;
  why_choose_subtitle?: string;

  // Esperienza Consolidata
  experience_title?: string;
  experience_content?: string;

  // Qualità Garantita
  quality_title?: string;
  quality_content?: string;

  // Approccio Personalizzato
  approach_title?: string;
  approach_content?: string;

  // Meta
  created_at?: string;
  updated_at?: string;
}

interface UseAboutContentReturn {
  // Stati
  content: AboutContent | null;
  loading: boolean;
  error: string | null;

  // Metodi pubblici
  fetchPublicContent: () => Promise<void>;

  // Metodi admin
  fetchContent: () => Promise<void>;
  updateContent: (contentData: Partial<AboutContent>) => Promise<boolean>;

  // Utilità
  refreshContent: () => Promise<void>;
}

export const useAboutContent = (): UseAboutContentReturn => {
  // Stati
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carica contenuti pubblici per la pagina About
   */
  const fetchPublicContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/about-content/public");
      
      if (response.data.success) {
        setContent(response.data.data || null);
      } else {
        throw new Error(response.data.message || "Errore caricamento contenuti About");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento contenuti About";
      setError(errorMessage);
      console.error("Errore fetchPublicContent:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carica contenuti per admin
   */
  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/about-content");
      
      if (response.data.success) {
        setContent(response.data.data || {});
      } else {
        throw new Error(response.data.message || "Errore caricamento contenuti About");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento contenuti About";
      setError(errorMessage);
      console.error("Errore fetchContent:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aggiorna contenuti About
   */
  const updateContent = useCallback(async (contentData: Partial<AboutContent>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put("/about-content", contentData);
      
      if (response.data.success) {
        toast.success("Contenuti About aggiornati con successo!");
        // Ricarica i contenuti
        await fetchContent();
        return true;
      } else {
        throw new Error(response.data.message || "Errore aggiornamento contenuti");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore aggiornamento contenuti";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore updateContent:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchContent]);

  /**
   * Ricarica contenuti
   */
  const refreshContent = useCallback(async () => {
    await Promise.all([
      fetchContent(),
      fetchPublicContent()
    ]);
  }, [fetchContent, fetchPublicContent]);

  /**
   * Carica contenuti pubblici al mount del componente
   */
  useEffect(() => {
    fetchPublicContent();
  }, [fetchPublicContent]);

  return {
    // Stati
    content,
    loading,
    error,

    // Metodi pubblici
    fetchPublicContent,

    // Metodi admin
    fetchContent,
    updateContent,

    // Utilità
    refreshContent,
  };
};