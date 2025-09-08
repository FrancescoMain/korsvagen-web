import { useState, useEffect } from "react";
import { api } from "../utils/api";

interface ProjectImage {
  id: number;
  image_url: string;
  title?: string;
  alt_text?: string;
  is_cover: boolean;
  display_order: number;
}

interface Project {
  id: number;
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
  features?: string[];
  slug?: string;
  cover_image?: string;
  images?: ProjectImage[];
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface UseHomeProjectsResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export const useHomeProjects = (limit: number = 6): UseHomeProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.projects.getList({ 
          limit,
          status: "Completato" // Solo progetti completati per la homepage
        });
        
        if (response.data.success && response.data.data) {
          setProjects(response.data.data.projects || []);
        } else {
          throw new Error("Dati progetti non validi");
        }
      } catch (err: any) {
        console.error("Errore caricamento progetti homepage:", err);
        setError(err.message);
        
        // Fallback ai dati di default per evitare homepage vuota
        const fallbackProjects = [
          {
            id: 1,
            title: "Villa Moderna",
            year: 2024,
            location: "Milano, Lombardia",
            status: "Completato",
            label: "Residenziale",
            description: "Villa unifamiliare con design contemporaneo e soluzioni eco-sostenibili.",
            cover_image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80",
            is_active: true,
            display_order: 1,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Stabilimento Industriale",
            year: 2023,
            location: "Torino, Piemonte",
            status: "Completato",
            label: "Industriale",
            description: "Impianto produttivo all'avanguardia con tecnologie Industry 4.0. Ottimizzazione dei flussi logistici e massima efficienza energetica.",
            cover_image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
            is_active: true,
            display_order: 2,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "Centro Commerciale",
            year: 2023,
            location: "Roma, Lazio",
            status: "Completato",
            label: "Commerciale",
            description: "Complesso commerciale moderno con focus sulla sostenibilità ambientale.",
            cover_image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            is_active: true,
            display_order: 3,
            created_at: new Date().toISOString()
          }
        ];
        setProjects(fallbackProjects.slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [limit]);

  return { projects, loading, error };
};