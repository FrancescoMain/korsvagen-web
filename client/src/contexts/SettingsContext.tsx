/**
 * KORSVAGEN WEB APPLICATION - SETTINGS CONTEXT
 *
 * Context centraliinterface CompanyStats {
  years_experience: number;
  projects_completed: number;
  revenue_growth: number; // Changed from satisfied_clients to revenue_growth
  team_members: number;
  last_updated?: string;
}er la gestione delle impostazioni dell'applicazione.
 * Fornisce accesso globale alle configurazioni recuperate dal backend,
 * sostituendo i dati hardcoded in contactData.ts.
 *
 * Features:
 * - Caricamento automatico settings al primo avvio
 * - Stato globale condiviso in tutta l'app
 * - Loading states e error handling
 * - Caching intelligente
 * - Aggiornamento real-time dalla dashboard
 * - Integrazione con sistema di autenticazione
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.1.0 - Added authentication integration
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

/**
 * TIPI E INTERFACCE
 */

// Interfaccia per i dati aziendali (compatibile con contactData.ts)
interface CompanyInfo {
  company: string;
  legal_name: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    region?: string;
  };
  phone: string;
  email: string;
  fax?: string;
  social: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
  };
  business: {
    rea: string;
    vat_number: string;
    tax_code: string;
    chamber_of_commerce?: string;
    founding_year?: number;
  };
}

// Interfaccia per gli orari di apertura
interface BusinessHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// Interfaccia per le statistiche aziendali
interface CompanyStats {
  years_experience: number;
  projects_completed: number;
  revenue_growth: number; // Changed from satisfied_clients to revenue_growth
  team_members: number;
  last_updated: string;
}

// Interfaccia per le configurazioni di sistema
interface SystemConfig {
  site_maintenance_mode: boolean;
  admin_notifications_enabled: boolean;
  contact_form_enabled: boolean;
}

// Interfaccia principale del context
interface SettingsContextType {
  // Dati
  companyInfo: CompanyInfo | null;
  businessHours: BusinessHours | null;
  companyStats: CompanyStats | null;
  systemConfig: SystemConfig | null;

  // Stati
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Metodi
  refreshSettings: () => Promise<void>;
  updateSettings: (
    key: string,
    value: any,
    showNotification?: boolean
  ) => Promise<boolean>;

  // Utilities per compatibilità con contactData.ts
  getContactData: () => CompanyInfo | null;
  isMaintenanceMode: () => boolean;
}

// Interfaccia per la risposta API
interface SettingsApiResponse {
  success: boolean;
  data: {
    categorized: {
      company?: Record<string, any>;
      contact?: Record<string, any>;
      social?: Record<string, any>;
      legal?: Record<string, any>;
      system?: Record<string, any>;
    };
    flat: Record<string, any>;
    count: number;
    last_updated: string;
  };
}

/**
 * CONFIGURAZIONE
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Configurazione Axios per settings
const settingsApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

/**
 * CONTEXT E PROVIDER
 */

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  // Hook di autenticazione per accesso al token
  // Commento: useAuth fornisce il token JWT necessario per chiamate API autenticate
  // Settings pubblici sono disponibili anche senza autenticazione
  const { token, isAuthenticated } = useAuth();

  console.log("⚙️ SettingsProvider render - Auth state:", {
    isAuthenticated,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : "NO TOKEN",
  });

  // Stati principali
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [businessHours, setBusinessHours] = useState<BusinessHours | null>(
    null
  );
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);

  // Stati di gestione
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  /**
   * Funzione per trasformare i dati API in strutture utilizzabili
   */
  const transformApiData = useCallback((apiData: Record<string, any>): void => {
    try {
      // Trasforma i dati aziendali
      const companyData: CompanyInfo = {
        company: apiData.company_name || "KORSVAGEN S.R.L.",
        legal_name: apiData.company_legal_name || "KORSVAGEN S.R.L.",
        address: {
          street:
            apiData.company_address?.street || "Via Santa Maria la Carità 18",
          city: apiData.company_address?.city || "Scafati (SA)",
          postal_code: apiData.company_address?.postal_code || "84018",
          country: apiData.company_address?.country || "Italia",
          region: apiData.company_address?.region || "Campania",
        },
        phone: apiData.contact_phone || "+39 349 429 8547",
        email: apiData.contact_email || "korsvagensrl@gmail.com",
        fax: apiData.contact_fax || undefined,
        social: {
          instagram: apiData.social_media?.instagram || undefined,
          linkedin: apiData.social_media?.linkedin || undefined,
          facebook: apiData.social_media?.facebook || undefined,
          twitter: apiData.social_media?.twitter || undefined,
          youtube: apiData.social_media?.youtube || undefined,
        },
        business: {
          rea: apiData.business_info?.rea || "1071429",
          vat_number: apiData.business_info?.vat_number || "09976601212",
          tax_code: apiData.business_info?.tax_code || "09976601212",
          chamber_of_commerce:
            apiData.business_info?.chamber_of_commerce || undefined,
          founding_year: apiData.business_info?.founding_year || undefined,
        },
      };

      // Trasforma gli orari di apertura
      const hoursData: BusinessHours = {
        monday: apiData.business_hours?.monday || "09:00-18:00",
        tuesday: apiData.business_hours?.tuesday || "09:00-18:00",
        wednesday: apiData.business_hours?.wednesday || "09:00-18:00",
        thursday: apiData.business_hours?.thursday || "09:00-18:00",
        friday: apiData.business_hours?.friday || "09:00-18:00",
        saturday: apiData.business_hours?.saturday || "09:00-13:00",
        sunday: apiData.business_hours?.sunday || "Chiuso",
      };

      // Trasforma le statistiche aziendali
      const statsData: CompanyStats = {
        years_experience: apiData.company_stats?.years_experience || 7,
        projects_completed: apiData.company_stats?.projects_completed || 150,
        revenue_growth: apiData.company_stats?.revenue_growth || 35, // Changed from satisfied_clients
        team_members: apiData.company_stats?.team_members || 5,
        last_updated:
          apiData.company_stats?.last_updated || new Date().toISOString(),
      };

      // Trasforma le configurazioni di sistema
      const systemData: SystemConfig = {
        site_maintenance_mode: apiData.site_maintenance_mode || false,
        admin_notifications_enabled:
          apiData.admin_notifications_enabled || true,
        contact_form_enabled: apiData.contact_form_enabled || true,
      };

      // Aggiorna gli stati
      setCompanyInfo(companyData);
      setBusinessHours(hoursData);
      setCompanyStats(statsData);
      setSystemConfig(systemData);
    } catch (err) {
      console.error("Errore trasformazione dati API:", err);
      throw new Error("Errore nella trasformazione dei dati");
    }
  }, []);

  /**
   * Carica i settings dal backend
   */
  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      console.log("📡 Caricamento settings dell'applicazione...");
      setLoading(true);
      setError(null);

      // Chiamata per settings pubblici (non richiedono autenticazione)
      const response = await settingsApi.get<SettingsApiResponse>(
        "/settings/public"
      );

      if (response.data.success) {
        transformApiData(response.data.data.flat);
        setLastUpdated(response.data.data.last_updated);
        console.log("✅ Settings caricati con successo");
      } else {
        throw new Error("Risposta API non valida");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Errore nel caricamento settings";
      console.error("❌ Errore caricamento settings:", errorMessage);
      setError(errorMessage);

      // Mostra toast di errore solo se non siamo in modalità sviluppo
      if (process.env.NODE_ENV !== "development") {
        toast.error("Errore nel caricamento delle configurazioni");
      }

      // Fallback ai dati di default (compatibilità con contactData.ts)
      setCompanyInfo({
        company: "KORSVAGEN S.R.L.",
        legal_name: "KORSVAGEN S.R.L.",
        address: {
          street: "Via Santa Maria la Carità 18",
          city: "Scafati (SA)",
          postal_code: "84018",
          country: "Italia",
        },
        phone: "+39 349 429 8547",
        email: "korsvagensrl@gmail.com",
        social: {
          instagram: "https://instagram.com/korsvagensrl",
          linkedin: "https://www.linkedin.com/company/korsvagen",
        },
        business: {
          rea: "1071429",
          vat_number: "09976601212",
          tax_code: "09976601212",
        },
      });
    } finally {
      setLoading(false);
    }
  }, [transformApiData]);

  /**
   * Ricarica i settings (per aggiornamenti dalla dashboard)
   */
  const refreshSettings = useCallback(async (): Promise<void> => {
    await loadSettings();
  }, [loadSettings]);

  /**
   * Aggiorna un singolo setting (per uso dalla dashboard)
   * Commento: Richiede autenticazione admin, usa il token JWT
   */
  const updateSettings = useCallback(
    async (
      key: string,
      value: any,
      showNotification: boolean = true
    ): Promise<boolean> => {
      try {
        // Verifica che l'utente sia autenticato
        if (!isAuthenticated || !token) {
          if (showNotification) {
            toast.error("Accesso richiesto per modificare le impostazioni");
          }
          return false;
        }

        console.log(`📝 Aggiornamento setting: ${key}`);
        console.log(
          "🔑 Token utilizzato:",
          token ? `${token.substring(0, 20)}...` : "NESSUN TOKEN"
        );

        // Configura header di autenticazione
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        console.log("📡 Configurazione headers:", config.headers);

        const response = await settingsApi.put(
          `/settings/${key}`,
          {
            value,
            description: `Setting ${key} aggiornato via frontend`,
          },
          config
        );

        if (response.data.success) {
          // For bulk updates, we'll refresh after all updates are complete
          // For individual updates, refresh immediately
          if (showNotification) {
            await refreshSettings();
            toast.success("Impostazione aggiornata con successo");
          }
          return true;
        } else {
          throw new Error(response.data.message || "Errore nell'aggiornamento");
        }
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Errore nell'aggiornamento";
        console.error("❌ Errore aggiornamento setting:", errorMessage);
        if (showNotification) {
          toast.error(errorMessage);
        }
        return false;
      }
    },
    [refreshSettings, isAuthenticated, token]
  );

  /**
   * Compatibilità con contactData.ts - ritorna i dati in formato compatibile
   */
  const getContactData = useCallback((): CompanyInfo | null => {
    return companyInfo;
  }, [companyInfo]);

  /**
   * Controlla se il sito è in modalità manutenzione
   */
  const isMaintenanceMode = useCallback((): boolean => {
    return systemConfig?.site_maintenance_mode || false;
  }, [systemConfig]);

  /**
   * Effetto per il caricamento iniziale
   */
  useEffect(() => {
    // Carica settings solo se autenticato o se siamo sulla homepage
    const currentPath = window.location.pathname;
    const isHomePage = currentPath === '/' || currentPath === '/home';
    
    if (isAuthenticated || isHomePage) {
      loadSettings();
    } else {
      console.log("⏭️ Skipping settings load - not authenticated and not on homepage");
    }
  }, [loadSettings, isAuthenticated]);

  /**
   * Valore del context
   */
  const contextValue: SettingsContextType = {
    // Dati
    companyInfo,
    businessHours,
    companyStats,
    systemConfig,

    // Stati
    loading,
    error,
    lastUpdated,

    // Metodi
    refreshSettings,
    updateSettings,

    // Utilities
    getContactData,
    isMaintenanceMode,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * HOOK PERSONALIZZATO
 */

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error(
      "useSettings deve essere utilizzato all'interno di un SettingsProvider"
    );
  }
  return context;
};

/**
 * HOOK PER COMPATIBILITÀ CON contactData.ts
 *
 * Questo hook mantiene la compatibilità con il codice esistente
 * che importa direttamente contactData.ts
 */
export const useContactData = () => {
  const { companyInfo, loading } = useSettings();

  // Ritorna i dati in formato compatibile con contactData.ts
  return {
    contactData: companyInfo
      ? {
          company: companyInfo.company,
          address: {
            street: companyInfo.address.street,
            city: companyInfo.address.city,
          },
          phone: companyInfo.phone,
          email: companyInfo.email,
          social: companyInfo.social,
          business: {
            rea: companyInfo.business.rea,
            piva: companyInfo.business.vat_number,
          },
        }
      : null,
    loading,
  };
};

export default SettingsContext;
