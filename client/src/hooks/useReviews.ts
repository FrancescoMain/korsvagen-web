/**
 * HOOK useReviews - Gestione recensioni clienti
 *
 * Hook personalizzato per gestire le operazioni CRUD
 * delle recensioni attraverso l'API backend.
 *
 * Features:
 * - Caricamento recensioni pubbliche e admin
 * - Creazione, modifica ed eliminazione recensioni
 * - Stati di loading e errore
 * - Rivalidazione automatica dopo operazioni
 *
 * @author KORSVAGEN S.R.L.
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "../utils/api";
import toast from "react-hot-toast";

// Tipi TypeScript
export interface Review {
  id: string;
  author_name: string;
  author_company?: string;
  review_text: string;
  rating: number;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ReviewFormData {
  author_name: string;
  author_company?: string;
  review_text: string;
  rating: number;
  is_active?: boolean;
  display_order?: number;
}

interface UseReviewsReturn {
  // Stati
  reviews: Review[];
  publicReviews: Review[];
  loading: boolean;
  error: string | null;

  // Metodi pubblici
  fetchPublicReviews: () => Promise<void>;

  // Metodi admin
  fetchReviews: () => Promise<void>;
  createReview: (reviewData: ReviewFormData) => Promise<boolean>;
  updateReview: (id: string, reviewData: Partial<ReviewFormData>) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;

  // Utilità
  refreshReviews: () => Promise<void>;
}

export const useReviews = (): UseReviewsReturn => {
  // Stati
  const [reviews, setReviews] = useState<Review[]>([]);
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carica recensioni pubbliche per la homepage
   */
  const fetchPublicReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/reviews/public");
      
      if (response.data.success) {
        setPublicReviews(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento recensioni");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento recensioni";
      setError(errorMessage);
      console.error("Errore fetchPublicReviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Carica tutte le recensioni (admin only)
   */
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get("/reviews");
      
      if (response.data.success) {
        setReviews(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Errore caricamento recensioni");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore caricamento recensioni";
      setError(errorMessage);
      console.error("Errore fetchReviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea una nuova recensione
   */
  const createReview = useCallback(async (reviewData: ReviewFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/reviews", reviewData);
      
      if (response.data.success) {
        toast.success("Recensione creata con successo!");
        // Ricarica le recensioni
        await fetchReviews();
        return true;
      } else {
        throw new Error(response.data.message || "Errore creazione recensione");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore creazione recensione";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore createReview:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchReviews]);

  /**
   * Aggiorna una recensione esistente
   */
  const updateReview = useCallback(async (id: string, reviewData: Partial<ReviewFormData>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.put(`/reviews/${id}`, reviewData);
      
      if (response.data.success) {
        toast.success("Recensione aggiornata con successo!");
        // Ricarica le recensioni
        await fetchReviews();
        return true;
      } else {
        throw new Error(response.data.message || "Errore aggiornamento recensione");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore aggiornamento recensione";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore updateReview:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchReviews]);

  /**
   * Elimina una recensione
   */
  const deleteReview = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/reviews/${id}`);
      
      if (response.data.success) {
        toast.success("Recensione eliminata con successo!");
        // Ricarica le recensioni
        await fetchReviews();
        return true;
      } else {
        throw new Error(response.data.message || "Errore eliminazione recensione");
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Errore eliminazione recensione";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Errore deleteReview:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchReviews]);

  /**
   * Ricarica tutte le recensioni
   */
  const refreshReviews = useCallback(async () => {
    await Promise.all([
      fetchReviews(),
      fetchPublicReviews()
    ]);
  }, [fetchReviews, fetchPublicReviews]);

  /**
   * Carica recensioni pubbliche al mount del componente
   */
  useEffect(() => {
    fetchPublicReviews();
  }, [fetchPublicReviews]);

  return {
    // Stati
    reviews,
    publicReviews,
    loading,
    error,

    // Metodi pubblici
    fetchPublicReviews,

    // Metodi admin
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,

    // Utilità
    refreshReviews,
  };
};