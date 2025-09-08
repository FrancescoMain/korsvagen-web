import { useState, useEffect } from "react";
import { api } from "../utils/api";

interface NewsItem {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  category: string;
  content: string;
  image_url?: string;
  published_date: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
}

interface UseHomeNewsResult {
  news: NewsItem[];
  loading: boolean;
  error: string | null;
}

export const useHomeNews = (limit: number = 3): UseHomeNewsResult => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.news.getList({ 
          limit, 
          featured: true // Prendi le news in evidenza per la homepage
        });
        
        if (response.data.success && response.data.data) {
          setNews(response.data.data);
        } else {
          throw new Error("Dati news non validi");
        }
      } catch (err: any) {
        console.error("Errore caricamento news homepage:", err);
        setError(err.message);
        
        // Fallback ai dati di default per evitare homepage vuota
        const fallbackNews = [
          {
            id: 1,
            title: "Nuove Tecnologie BIM per l'Edilizia Sostenibile",
            slug: "tecnologie-bim-edilizia-sostenibile",
            category: "Innovazione",
            content: "Korsvagen adotta le più moderne tecnologie BIM per garantire progetti sempre più sostenibili e efficienti dal punto di vista energetico.",
            image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            published_date: "15 Gen 2024",
            is_featured: true,
            views_count: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Inaugurazione Nuovo Stabilimento a Milano",
            slug: "inaugurazione-stabilimento-milano",
            category: "Azienda",
            content: "Aperta la nuova sede operativa a Milano: 5.000 mq di spazi moderni dedicati alla progettazione e alla gestione cantieri.",
            image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            published_date: "8 Gen 2024",
            is_featured: true,
            views_count: 0,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "Certificazione ISO 14001: Impegno per l'Ambiente",
            slug: "certificazione-iso-14001-ambiente",
            category: "Sostenibilità",
            content: "Korsvagen ottiene la certificazione ISO 14001 per la gestione ambientale, confermando il nostro impegno verso la sostenibilità.",
            image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
            published_date: "22 Dic 2023",
            is_featured: true,
            views_count: 0,
            created_at: new Date().toISOString()
          }
        ];
        setNews(fallbackNews.slice(0, limit));
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [limit]);

  return { news, loading, error };
};