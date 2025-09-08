import { useState, useEffect } from "react";
import { api } from "../utils/api";

interface Service {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  icon?: string;
  image_url?: string;
  features?: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
}

interface UseHomeServicesResult {
  services: Service[];
  loading: boolean;
  error: string | null;
}

export const useHomeServices = (): UseHomeServicesResult => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.services.getList();
        
        if (response.data.success && response.data.data) {
          // Map API data to match expected structure
          const mappedServices = response.data.data.map((service: any) => ({
            ...service,
            // If description is empty, use short_description
            description: service.description || service.short_description || "Servizio di qualità",
          }));
          setServices(mappedServices);
        } else {
          throw new Error("Dati servizi non validi");
        }
      } catch (err: any) {
        console.error("Errore caricamento servizi homepage:", err);
        setError(err.message);
        
        // Fallback ai dati di default per evitare homepage vuota
        const fallbackServices = [
          {
            id: 1,
            title: "Progettazione",
            description: "Progettazione completa e consulenza specializzata per trasformare le tue idee in progetti concreti e realizzabili.",
            image_url: "https://www.techbau.it/wp-content/uploads/2024/06/Site-Selection_v3.webm",
            is_active: true,
            display_order: 1,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "Costruzioni",
            description: "Realizzazione di progetti edilizi con le più moderne tecnologie e materiali di alta qualità per garantire risultati duraturi.",
            image_url: "https://www.techbau.it/wp-content/uploads/2024/06/Construction_v3.webm",
            is_active: true,
            display_order: 2,
            created_at: new Date().toISOString()
          },
          {
            id: 3,
            title: "Ristrutturazioni",
            description: "Servizi di ristrutturazione completa per ambienti residenziali e commerciali, con attenzione al design e alla funzionalità.",
            image_url: "https://www.techbau.it/wp-content/uploads/2024/06/Renovation_v3.webm",
            is_active: true,
            display_order: 3,
            created_at: new Date().toISOString()
          }
        ];
        setServices(fallbackServices);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return { services, loading, error };
};