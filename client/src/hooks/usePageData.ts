import { useState, useEffect } from "react";
import { apiClient } from "../utils/api";

interface PageSection {
  title?: string;
  subtitle?: string;
  content?: string;
}

interface PageData {
  page_id: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image?: string;
  sections: { [key: string]: PageSection };
  meta_title?: string;
  meta_description?: string;
}

interface UsePageDataResult {
  pageData: PageData | null;
  loading: boolean;
  error: string | null;
}

export const usePageData = (pageId: string): UsePageDataResult => {
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/pages/public/${pageId}`);
        
        if (response.data.success && response.data.data) {
          setPageData(response.data.data);
        } else {
          throw new Error("Dati pagina non validi");
        }
      } catch (err: any) {
        console.error(`Errore caricamento pagina ${pageId}:`, err);
        setError(err.message);
        
        // Fallback ai dati di default
        const defaultPages: { [key: string]: PageData } = {
          home: {
            page_id: "home",
            hero_title: "KORSVAGEN",
            hero_subtitle: "Costruzioni di qualità dal 1985",
            hero_image: undefined,
            sections: {
              services: {
                title: "I Nostri Servizi",
                subtitle: "Soluzioni innovative per ogni fase del tuo progetto. Dalla progettazione alla realizzazione, con competenza e tecnologie all'avanguardia."
              },
              projects: {
                title: "I Nostri Progetti",
                subtitle: "Scopri alcuni dei nostri progetti realizzati, esempi concreti di eccellenza architettonica e innovazione tecnologica."
              },
              news: {
                title: "Ultime News",
                subtitle: "Resta aggiornato sulle ultime novità e tendenze dal mondo dell'architettura e costruzioni."
              }
            },
            meta_title: "KORSVAGEN - Costruzioni di qualità",
            meta_description: "Azienda leader nelle costruzioni con oltre 30 anni di esperienza"
          },
          about: {
            page_id: "about",
            hero_title: "La Nostra Storia",
            hero_subtitle: "Oltre 30 anni di eccellenza nelle costruzioni",
            hero_image: undefined,
            sections: {
              story: {
                title: "La Nostra Storia",
                subtitle: "Dal 1985 al vostro servizio", 
                content: "La nostra azienda è stata fondata nel 1985 con l'obiettivo di offrire servizi di costruzione di alta qualità."
              }
            },
            meta_title: "Chi Siamo - KORSVAGEN",
            meta_description: "Scopri la storia di KORSVAGEN e i nostri valori"
          },
          contact: {
            page_id: "contact",
            hero_title: "Contattaci",
            hero_subtitle: "Siamo qui per aiutarti",
            hero_image: undefined,
            sections: {
              info: {
                title: "Informazioni di Contatto",
                subtitle: "I nostri recapiti",
                content: "Puoi contattarci tramite telefono, email o visitando i nostri uffici per un preventivo gratuito."
              }
            },
            meta_title: "Contatti - KORSVAGEN",
            meta_description: "Contatta KORSVAGEN per informazioni e preventivi"
          }
        };

        setPageData(defaultPages[pageId] || defaultPages.home);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [pageId]);

  return { pageData, loading, error };
};