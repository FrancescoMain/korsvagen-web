/**
 * KORSVAGEN WEB APPLICATION - SETTINGS PAGE
 *
 * Pagina di gestione delle impostazioni generali dell'applicazione.
 * Permette agli amministratori di modificare i dati aziendali,
 * informazioni di contatto, social media e altre configurazioni.
 *
 * Features:
 * - Form organizzato per sezioni (Azienda, Contatti, Social, ecc.)
 * - Validazione in tempo reale
 * - Loading states fluidi
 * - Auto-save opzionale
 * - Anteprima cambiamenti
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import toast from "react-hot-toast";
import { Breadcrumb } from "../components/Dashboard/Breadcrumb";
import { useSettings } from "../contexts/SettingsContext";

/**
 * STYLED COMPONENTS
 */

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  /* Commento: Container principale con design responsivo */
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;

  /* Commento: Header della pagina con breadcrumb e titolo */
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 1rem 0 0.5rem 0;

  /* Commento: Titolo principale della pagina settings */
`;

const Description = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;

  /* Commento: Descrizione introduttiva della sezione settings */
`;

const LoadingCard = styled.div`
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  border: 1px solid #e5e7eb;

  /* Commento: Card mostrata durante il caricamento iniziale */
`;

const SettingsContainer = styled.div`
  display: grid;
  gap: 2rem;

  /* Commento: Container principale per le sezioni di settings */
`;

const Section = styled.div`
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);

  /* Commento: Singola sezione di settings (Azienda, Contatti, ecc.) */
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e5e7eb;

  /* Commento: Titolo di ogni sezione di settings */
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;

  /* Commento: Griglia responsiva per i campi del form */
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;

  /* Commento: Container per singolo campo del form */
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;

  /* Commento: Label per i campi del form */
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Commento: Styling per input text standard */
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Commento: Styling per textarea (descrizioni lunghe) */
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;

  /* Commento: Gruppo di bottoni per azioni (Salva, Reset, ecc.) */
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${(props) =>
    props.variant === "primary" &&
    `
    background-color: #4f46e5;
    border-color: #4f46e5;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #4338ca;
      border-color: #4338ca;
    }
  `}

  ${(props) =>
    props.variant === "secondary" &&
    `
    background-color: transparent;
    border-color: #d1d5db;
    color: var(--text-primary);
    
    &:hover:not(:disabled) {
      background-color: #f9fafb;
    }
  `}
  
  ${(props) =>
    props.variant === "danger" &&
    `
    background-color: #dc2626;
    border-color: #dc2626;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #b91c1c;
      border-color: #b91c1c;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Commento: Bottoni con varianti di colore per diverse azioni */
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Commento: Spinner di caricamento per i bottoni */
`;

const ErrorMessage = styled.div`
  background-color: #fef2f2;
  border: 1px solid #fca5a5;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;

  /* Commento: Messaggio di errore per problemi di caricamento */
`;

const SuccessMessage = styled.div`
  background-color: #f0fdf4;
  border: 1px solid #86efac;
  color: #16a34a;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;

  /* Commento: Messaggio di successo per conferma salvataggio */
`;

/**
 * INTERFACCE PER IL FORM
 */

interface SettingsFormData {
  // Dati aziendali
  company_name: string;
  company_legal_name: string;
  company_description: string;
  company_mission: string;
  company_vision: string;

  // Contatti
  contact_email: string;
  contact_phone: string;
  contact_fax: string;

  // Indirizzo
  address_street: string;
  address_city: string;
  address_postal_code: string;
  address_country: string;
  address_region: string;

  // Social Media
  social_instagram: string;
  social_linkedin: string;
  social_facebook: string;
  social_twitter: string;
  social_youtube: string;

  // Dati legali
  business_rea: string;
  business_vat_number: string;
  business_tax_code: string;
  business_chamber: string;
  business_founding_year: string;

  // Statistiche
  stats_years_experience: string;
  stats_projects_completed: string;
  stats_revenue_growth: string; // Changed from stats_satisfied_clients
  stats_team_members: string;
}

/**
 * COMPONENTE PRINCIPALE
 */

export const Settings: React.FC = () => {
  // Context settings per dati e operazioni
  const {
    companyInfo,
    companyStats,
    loading: settingsLoading,
    error: settingsError,
    refreshSettings,
    updateSettings,
  } = useSettings();

  // Stati del form
  const [formData, setFormData] = useState<SettingsFormData>({
    company_name: "",
    company_legal_name: "",
    company_description: "",
    company_mission: "",
    company_vision: "",
    contact_email: "",
    contact_phone: "",
    contact_fax: "",
    address_street: "",
    address_city: "",
    address_postal_code: "",
    address_country: "",
    address_region: "",
    social_instagram: "",
    social_linkedin: "",
    social_facebook: "",
    social_twitter: "",
    social_youtube: "",
    business_rea: "",
    business_vat_number: "",
    business_tax_code: "",
    business_chamber: "",
    business_founding_year: "",
    stats_years_experience: "",
    stats_projects_completed: "",
    stats_revenue_growth: "", // Changed from stats_satisfied_clients
    stats_team_members: "",
  });

  // Stati di gestione
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Effetto per popolare il form quando i dati sono caricati
   * Commento: Trasforma i dati dal context nel formato del form
   */
  useEffect(() => {
    if (companyInfo && companyStats) {
      setFormData({
        company_name: companyInfo.company || "",
        company_legal_name: companyInfo.legal_name || "",
        company_description: "", // Questo verrà caricato separatamente
        company_mission: "", // Questo verrà caricato separatamente
        company_vision: "", // Questo verrà caricato separatamente
        contact_email: companyInfo.email || "",
        contact_phone: companyInfo.phone || "",
        contact_fax: companyInfo.fax || "",
        address_street: companyInfo.address.street || "",
        address_city: companyInfo.address.city || "",
        address_postal_code: companyInfo.address.postal_code || "",
        address_country: companyInfo.address.country || "",
        address_region: companyInfo.address.region || "",
        social_instagram: companyInfo.social.instagram || "",
        social_linkedin: companyInfo.social.linkedin || "",
        social_facebook: companyInfo.social.facebook || "",
        social_twitter: companyInfo.social.twitter || "",
        social_youtube: companyInfo.social.youtube || "",
        business_rea: companyInfo.business.rea || "",
        business_vat_number: companyInfo.business.vat_number || "",
        business_tax_code: companyInfo.business.tax_code || "",
        business_chamber: companyInfo.business.chamber_of_commerce || "",
        business_founding_year:
          companyInfo.business.founding_year?.toString() || "",
        stats_years_experience: companyStats.years_experience.toString() || "",
        stats_projects_completed:
          companyStats.projects_completed.toString() || "",
        stats_revenue_growth: companyStats.revenue_growth.toString() || "", // Changed from satisfied_clients
        stats_team_members: companyStats.team_members.toString() || "",
      });
    }
  }, [companyInfo, companyStats]);

  /**
   * Handler per il cambio di valori nei campi
   * Commento: Gestisce i cambiamenti del form e traccia le modifiche
   */
  const handleInputChange = (field: keyof SettingsFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);

    // Rimuovi messaggi di successo quando si inizia a modificare
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  /**
   * Handler per il salvataggio delle modifiche
   * Commento: Salva tutte le modifiche del form utilizzando bulk update
   */
  const handleSave = async () => {
    try {
      setSaving(true);

      // Prepara i dati per il bulk update
      const settingsToUpdate = [
        { key: "company_name", value: formData.company_name },
        { key: "company_legal_name", value: formData.company_legal_name },
        { key: "contact_email", value: formData.contact_email },
        { key: "contact_phone", value: formData.contact_phone },
        { key: "contact_fax", value: formData.contact_fax || null },

        // Indirizzo come oggetto JSON
        {
          key: "company_address",
          value: {
            street: formData.address_street,
            city: formData.address_city,
            postal_code: formData.address_postal_code,
            country: formData.address_country,
            region: formData.address_region,
          },
        },

        // Social media come oggetto JSON
        {
          key: "social_media",
          value: {
            instagram: formData.social_instagram || null,
            linkedin: formData.social_linkedin || null,
            facebook: formData.social_facebook || null,
            twitter: formData.social_twitter || null,
            youtube: formData.social_youtube || null,
          },
        },

        // Informazioni business come oggetto JSON
        {
          key: "business_info",
          value: {
            rea: formData.business_rea,
            vat_number: formData.business_vat_number,
            tax_code: formData.business_tax_code,
            chamber_of_commerce: formData.business_chamber || null,
            founding_year: formData.business_founding_year
              ? parseInt(formData.business_founding_year)
              : null,
          },
        },

        // Statistiche come oggetto JSON
        {
          key: "company_stats",
          value: {
            years_experience: parseInt(formData.stats_years_experience) || 0,
            projects_completed:
              parseInt(formData.stats_projects_completed) || 0,
            revenue_growth: parseInt(formData.stats_revenue_growth) || 35, // Changed from satisfied_clients
            team_members: parseInt(formData.stats_team_members) || 0,
            last_updated: new Date().toISOString(),
          },
        },
      ];

      // Esegui il bulk update usando le API del context
      let allSuccess = true;
      for (const setting of settingsToUpdate) {
        const success = await updateSettings(setting.key, setting.value, false); // Disable individual notifications
        if (!success) {
          allSuccess = false;
        }
      }

      if (allSuccess) {
        // Refresh settings once after all updates are complete
        await refreshSettings();

        setHasChanges(false);
        setSuccessMessage(
          "Tutte le impostazioni sono state salvate con successo!"
        );
        toast.success("Impostazioni salvate con successo");
      } else {
        toast.error("Alcune impostazioni non sono state salvate correttamente");
      }
    } catch (error) {
      console.error("Errore nel salvataggio:", error);
      toast.error("Errore nel salvataggio delle impostazioni");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handler per ricaricare i dati
   * Commento: Ricarica i dati dal server annullando le modifiche locali
   */
  const handleRefresh = async () => {
    try {
      await refreshSettings();
      setHasChanges(false);
      setSuccessMessage(null);
      toast.success("Dati ricaricati dal server");
    } catch (error) {
      toast.error("Errore nel ricaricamento dei dati");
    }
  };

  /**
   * Handler per il reset del form
   * Commento: Annulla tutte le modifiche locali non salvate
   */
  const handleReset = () => {
    // Ripristina dai dati originali
    if (companyInfo && companyStats) {
      setFormData({
        company_name: companyInfo.company || "",
        company_legal_name: companyInfo.legal_name || "",
        company_description: "",
        company_mission: "",
        company_vision: "",
        contact_email: companyInfo.email || "",
        contact_phone: companyInfo.phone || "",
        contact_fax: companyInfo.fax || "",
        address_street: companyInfo.address.street || "",
        address_city: companyInfo.address.city || "",
        address_postal_code: companyInfo.address.postal_code || "",
        address_country: companyInfo.address.country || "",
        address_region: companyInfo.address.region || "",
        social_instagram: companyInfo.social.instagram || "",
        social_linkedin: companyInfo.social.linkedin || "",
        social_facebook: companyInfo.social.facebook || "",
        social_twitter: companyInfo.social.twitter || "",
        social_youtube: companyInfo.social.youtube || "",
        business_rea: companyInfo.business.rea || "",
        business_vat_number: companyInfo.business.vat_number || "",
        business_tax_code: companyInfo.business.tax_code || "",
        business_chamber: companyInfo.business.chamber_of_commerce || "",
        business_founding_year:
          companyInfo.business.founding_year?.toString() || "",
        stats_years_experience: companyStats.years_experience.toString() || "",
        stats_projects_completed:
          companyStats.projects_completed.toString() || "",
        stats_revenue_growth: companyStats.revenue_growth.toString() || "", // Changed from satisfied_clients
        stats_team_members: companyStats.team_members.toString() || "",
      });
      setHasChanges(false);
      setSuccessMessage(null);
      toast.success("Modifiche annullate");
    }
  };

  /**
   * Rendering condizionale per loading e errori
   * Commento: Mostra stati di caricamento e errore prima del form principale
   */
  if (settingsLoading) {
    return (
      <Container>
        <PageHeader>
          <Breadcrumb />
          <Title>Impostazioni Generali</Title>
        </PageHeader>
        <LoadingCard>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <LoadingSpinner />
            <span>Caricamento impostazioni...</span>
          </div>
        </LoadingCard>
      </Container>
    );
  }

  if (settingsError) {
    return (
      <Container>
        <PageHeader>
          <Breadcrumb />
          <Title>Impostazioni Generali</Title>
        </PageHeader>
        <ErrorMessage>
          <strong>Errore nel caricamento:</strong> {settingsError}
          <div style={{ marginTop: "1rem" }}>
            <Button variant="secondary" onClick={handleRefresh}>
              Riprova
            </Button>
          </div>
        </ErrorMessage>
      </Container>
    );
  }

  /**
   * RENDER PRINCIPALE
   * Commento: Interfaccia principale con form organizzato per sezioni
   */
  return (
    <Container>
      <PageHeader>
        <Breadcrumb />
        <Title>Impostazioni Generali</Title>
        <Description>
          Gestisci le informazioni generali dell'applicazione che vengono
          utilizzate in tutto il sito web. Le modifiche verranno applicate
          immediatamente al sito pubblico.
        </Description>
      </PageHeader>

      {/* Messaggio di successo */}
      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <SettingsContainer>
        {/* SEZIONE: Informazioni Aziendali */}
        <Section>
          <SectionTitle>📊 Informazioni Aziendali</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Nome Azienda</Label>
              <Input
                type="text"
                value={formData.company_name}
                onChange={(e) =>
                  handleInputChange("company_name", e.target.value)
                }
                placeholder="es. KORSVAGEN S.R.L."
              />
            </FormField>
            <FormField>
              <Label>Ragione Sociale</Label>
              <Input
                type="text"
                value={formData.company_legal_name}
                onChange={(e) =>
                  handleInputChange("company_legal_name", e.target.value)
                }
                placeholder="es. KORSVAGEN S.R.L."
              />
            </FormField>
          </FormGrid>
        </Section>

        {/* SEZIONE: Contatti */}
        <Section>
          <SectionTitle>📞 Informazioni di Contatto</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Email Principale</Label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) =>
                  handleInputChange("contact_email", e.target.value)
                }
                placeholder="es. info@korsvagen.it"
              />
            </FormField>
            <FormField>
              <Label>Telefono</Label>
              <Input
                type="tel"
                value={formData.contact_phone}
                onChange={(e) =>
                  handleInputChange("contact_phone", e.target.value)
                }
                placeholder="es. +39 349 429 8547"
              />
            </FormField>
            <FormField>
              <Label>Fax (opzionale)</Label>
              <Input
                type="tel"
                value={formData.contact_fax}
                onChange={(e) =>
                  handleInputChange("contact_fax", e.target.value)
                }
                placeholder="es. +39 081 123 4567"
              />
            </FormField>
          </FormGrid>
        </Section>

        {/* SEZIONE: Indirizzo */}
        <Section>
          <SectionTitle>🏢 Indirizzo Aziendale</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Via/Indirizzo</Label>
              <Input
                type="text"
                value={formData.address_street}
                onChange={(e) =>
                  handleInputChange("address_street", e.target.value)
                }
                placeholder="es. Via Santa Maria la Carità 18"
              />
            </FormField>
            <FormField>
              <Label>Città</Label>
              <Input
                type="text"
                value={formData.address_city}
                onChange={(e) =>
                  handleInputChange("address_city", e.target.value)
                }
                placeholder="es. Scafati (SA)"
              />
            </FormField>
            <FormField>
              <Label>CAP</Label>
              <Input
                type="text"
                value={formData.address_postal_code}
                onChange={(e) =>
                  handleInputChange("address_postal_code", e.target.value)
                }
                placeholder="es. 84018"
              />
            </FormField>
            <FormField>
              <Label>Paese</Label>
              <Input
                type="text"
                value={formData.address_country}
                onChange={(e) =>
                  handleInputChange("address_country", e.target.value)
                }
                placeholder="es. Italia"
              />
            </FormField>
            <FormField>
              <Label>Regione</Label>
              <Input
                type="text"
                value={formData.address_region}
                onChange={(e) =>
                  handleInputChange("address_region", e.target.value)
                }
                placeholder="es. Campania"
              />
            </FormField>
          </FormGrid>
        </Section>

        {/* SEZIONE: Social Media */}
        <Section>
          <SectionTitle>🌐 Social Media</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Instagram</Label>
              <Input
                type="url"
                value={formData.social_instagram}
                onChange={(e) =>
                  handleInputChange("social_instagram", e.target.value)
                }
                placeholder="es. https://instagram.com/korsvagensrl"
              />
            </FormField>
            <FormField>
              <Label>LinkedIn</Label>
              <Input
                type="url"
                value={formData.social_linkedin}
                onChange={(e) =>
                  handleInputChange("social_linkedin", e.target.value)
                }
                placeholder="es. https://linkedin.com/company/korsvagen"
              />
            </FormField>
            <FormField>
              <Label>Facebook</Label>
              <Input
                type="url"
                value={formData.social_facebook}
                onChange={(e) =>
                  handleInputChange("social_facebook", e.target.value)
                }
                placeholder="es. https://facebook.com/korsvagen"
              />
            </FormField>
            <FormField>
              <Label>Twitter</Label>
              <Input
                type="url"
                value={formData.social_twitter}
                onChange={(e) =>
                  handleInputChange("social_twitter", e.target.value)
                }
                placeholder="es. https://twitter.com/korsvagen"
              />
            </FormField>
            <FormField>
              <Label>YouTube</Label>
              <Input
                type="url"
                value={formData.social_youtube}
                onChange={(e) =>
                  handleInputChange("social_youtube", e.target.value)
                }
                placeholder="es. https://youtube.com/korsvagen"
              />
            </FormField>
          </FormGrid>
        </Section>

        {/* SEZIONE: Dati Legali */}
        <Section>
          <SectionTitle>⚖️ Informazioni Legali</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>REA</Label>
              <Input
                type="text"
                value={formData.business_rea}
                onChange={(e) =>
                  handleInputChange("business_rea", e.target.value)
                }
                placeholder="es. 1071429"
              />
            </FormField>
            <FormField>
              <Label>Partita IVA</Label>
              <Input
                type="text"
                value={formData.business_vat_number}
                onChange={(e) =>
                  handleInputChange("business_vat_number", e.target.value)
                }
                placeholder="es. 09976601212"
              />
            </FormField>
            <FormField>
              <Label>Codice Fiscale</Label>
              <Input
                type="text"
                value={formData.business_tax_code}
                onChange={(e) =>
                  handleInputChange("business_tax_code", e.target.value)
                }
                placeholder="es. 09976601212"
              />
            </FormField>
            <FormField>
              <Label>Camera di Commercio</Label>
              <Input
                type="text"
                value={formData.business_chamber}
                onChange={(e) =>
                  handleInputChange("business_chamber", e.target.value)
                }
                placeholder="es. Camera di Commercio di Salerno"
              />
            </FormField>
            <FormField>
              <Label>Anno di Fondazione</Label>
              <Input
                type="number"
                value={formData.business_founding_year}
                onChange={(e) =>
                  handleInputChange("business_founding_year", e.target.value)
                }
                placeholder="es. 2018"
                min="1900"
                max={new Date().getFullYear()}
              />
            </FormField>
          </FormGrid>
        </Section>

        {/* SEZIONE: Statistiche Aziendali */}
        <Section>
          <SectionTitle>📈 Statistiche Aziendali</SectionTitle>
          <FormGrid>
            <FormField>
              <Label>Anni di Esperienza</Label>
              <Input
                type="number"
                value={formData.stats_years_experience}
                onChange={(e) =>
                  handleInputChange("stats_years_experience", e.target.value)
                }
                placeholder="es. 7"
                min="0"
              />
            </FormField>
            <FormField>
              <Label>Progetti Completati</Label>
              <Input
                type="number"
                value={formData.stats_projects_completed}
                onChange={(e) =>
                  handleInputChange("stats_projects_completed", e.target.value)
                }
                placeholder="es. 150"
                min="0"
              />
            </FormField>
            <FormField>
              <Label>Incremento Fatturato (%)</Label>
              <Input
                type="number"
                value={formData.stats_revenue_growth}
                onChange={(e) =>
                  handleInputChange("stats_revenue_growth", e.target.value)
                }
                placeholder="es. 35"
                min="0"
              />
            </FormField>
            <FormField>
              <Label>Membri del Team</Label>
              <Input
                type="number"
                value={formData.stats_team_members}
                onChange={(e) =>
                  handleInputChange("stats_team_members", e.target.value)
                }
                placeholder="es. 5"
                min="1"
              />
            </FormField>
          </FormGrid>
        </Section>

        {/* BOTTONI DI AZIONE */}
        <ButtonGroup>
          <Button variant="secondary" onClick={handleRefresh}>
            🔄 Ricarica
          </Button>

          {hasChanges && (
            <Button variant="secondary" onClick={handleReset}>
              ↩️ Annulla Modifiche
            </Button>
          )}

          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <>
                <LoadingSpinner />
                Salvataggio...
              </>
            ) : (
              <>💾 Salva Modifiche</>
            )}
          </Button>
        </ButtonGroup>
      </SettingsContainer>
    </Container>
  );
};
