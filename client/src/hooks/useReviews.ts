import { useState, useEffect } from "react";

interface Review {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UseReviewsResult {
  reviews: Review[];
  loading: boolean;
  error: string | null;
}

export const useReviews = (): UseReviewsResult => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Per ora usiamo dati mock, ma l'endpoint potrebbe essere /api/reviews/public
        // const response = await fetch("/api/reviews/public");
        
        // Mock reviews con dati realistici
        const defaultReviews: Review[] = [
          {
            id: "1",
            name: "Mario Rossi",
            role: "Proprietario di Casa",
            content: "Servizio eccellente! KORSVAGEN ha trasformato la nostra casa in un sogno. Professionalità e attenzione ai dettagli incredibili.",
            rating: 5,
            visible: true,
            createdAt: "2024-01-15T10:00:00Z",
            updatedAt: "2024-01-15T10:00:00Z",
          },
          {
            id: "2", 
            name: "Giulia Bianchi",
            role: "Architetto",
            content: "Collaborazione fantastica. La loro competenza nelle costruzioni ha permesso di realizzare progetti complessi con risultati straordinari.",
            rating: 5,
            visible: true,
            createdAt: "2024-01-10T15:30:00Z",
            updatedAt: "2024-01-10T15:30:00Z",
          },
          {
            id: "3",
            name: "Andrea Verdi", 
            role: "Imprenditore",
            content: "KORSVAGEN ha costruito la sede della mia azienda. Tempi rispettati, qualità eccellente. Consigliatissimi!",
            rating: 4,
            visible: true,
            createdAt: "2024-01-08T09:15:00Z",
            updatedAt: "2024-01-08T09:15:00Z",
          },
          {
            id: "4",
            name: "Laura Neri",
            role: "Direzione Lavori",
            content: "Esperienza pluriennale e grande affidabilità. Un partner solido per qualsiasi progetto di costruzione.",
            rating: 5,
            visible: true,
            createdAt: "2024-01-05T14:20:00Z", 
            updatedAt: "2024-01-05T14:20:00Z",
          }
        ];

        // Simula un piccolo delay per realismo
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Filtra solo le recensioni visibili per la homepage
        const visibleReviews = defaultReviews.filter(review => review.visible);
        setReviews(visibleReviews);
        
      } catch (err: any) {
        console.error("Errore caricamento recensioni:", err);
        setError(err.message);
        setReviews([]); // Array vuoto in caso di errore
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  return { reviews, loading, error };
};