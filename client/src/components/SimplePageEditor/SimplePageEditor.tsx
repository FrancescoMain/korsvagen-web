import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Breadcrumb } from "../Dashboard/Breadcrumb";
import { apiClient } from "../../utils/api";

interface PageData {
  id: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  sections: {
    [key: string]: {
      title?: string;
      subtitle?: string;
      content?: string;
    };
  };
}

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const Form = styled.form`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
`;





const Actions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

export const SimplePageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageData, setPageData] = useState<PageData | null>(null);

  // Redirect away from contact page since it's disabled
  useEffect(() => {
    if (pageId === "contact") {
      navigate("/dashboard/pages", { replace: true });
      return;
    }
  }, [pageId, navigate]);

  useEffect(() => {
    const loadPageData = async () => {
      setLoading(true);
      
      try {
        const response = await apiClient.get(`/pages/${pageId || "home"}`);

        if (response.data.success && response.data.data) {
          // Converte i dati del backend al formato del frontend
          const pageData: PageData = {
            id: response.data.data.page_id,
            heroTitle: response.data.data.hero_title || "",
            heroSubtitle: response.data.data.hero_subtitle || "",
            heroImage: response.data.data.hero_image || "",
            sections: response.data.data.sections || {},
            metaTitle: response.data.data.meta_title || "",
            metaDescription: response.data.data.meta_description || "",
          };
          setPageData(pageData);
        } else {
          throw new Error("Errore nel caricamento della pagina");
        }
      } catch (error) {
        console.error("Errore caricamento pagina:", error);
        // Fallback ai dati di default
        const defaultData: PageData = {
          id: pageId || "home",
          heroTitle: pageId === "about" ? "La Nostra Storia" : "KORSVAGEN",
          heroSubtitle: pageId === "about" ? "Oltre 30 anni di eccellenza" : "Costruzioni di qualità dal 1985",
          heroImage: "",
          sections: pageId === "home" ? {
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
          } : {},
          metaTitle: "",
          metaDescription: "",
        };
        setPageData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [pageId]);

  const handleInputChange = (field: string, value: string) => {
    if (!pageData) return;
    
    setPageData({
      ...pageData,
      [field]: value
    });
  };

  const handleSectionChange = (sectionId: string, field: string, value: string) => {
    if (!pageData) return;
    
    setPageData({
      ...pageData,
      sections: {
        ...pageData.sections,
        [sectionId]: {
          ...pageData.sections[sectionId],
          [field]: value
        }
      }
    });
  };


  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pageData) return;
    
    setSaving(true);

    try {
      const saveData = {
        heroImage: pageData.heroImage,
        sections: pageData.sections,
      };

      const response = await apiClient.put(`/pages/${pageData.id}`, saveData);

      if (response.data.success) {
        // Mostra messaggio di successo
        const toast = await import("react-hot-toast");
        toast.default.success("Pagina salvata con successo!");
      } else {
        throw new Error(response.data.message || "Errore durante il salvataggio");
      }
    } catch (error: any) {
      console.error("Errore salvataggio:", error);
      const toast = await import("react-hot-toast");
      toast.default.error(error.message || "Errore durante il salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard/pages");
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
          <LoadingSpinner />
        </div>
      </Container>
    );
  }

  if (!pageData) {
    return (
      <Container>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Pagina non trovata</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Breadcrumb />
      
      <Header>
        <BackButton onClick={handleBack}>
          <ArrowLeft size={16} />
          Torna alle Pagine
        </BackButton>
        <Title>Modifica: {pageData.id === "home" ? "Homepage" : pageData.id === "about" ? "Chi Siamo" : pageData.id}</Title>
      </Header>

      <Form onSubmit={handleSave}>


<Section>
          <SectionTitle>Sezioni Contenuto</SectionTitle>
          
          {/* Sezione Servizi */}
          <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                I Nostri Servizi
              </h3>
            </div>
            
            <FormGroup>
              <Label>Titolo Sezione</Label>
              <Input
                value={pageData.sections?.services?.title || ""}
                onChange={(e) => handleSectionChange("services", "title", e.target.value)}
                placeholder="I Nostri Servizi"
              />
            </FormGroup>

            <FormGroup>
              <Label>Sottotitolo Sezione</Label>
              <Input
                value={pageData.sections?.services?.subtitle || ""}
                onChange={(e) => handleSectionChange("services", "subtitle", e.target.value)}
                placeholder="Soluzioni innovative per ogni esigenza"
              />
            </FormGroup>
          </div>

          {/* Sezione Progetti */}
          <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                I Nostri Progetti
              </h3>
            </div>
            
            <FormGroup>
              <Label>Titolo Sezione</Label>
              <Input
                value={pageData.sections?.projects?.title || ""}
                onChange={(e) => handleSectionChange("projects", "title", e.target.value)}
                placeholder="I Nostri Progetti"
              />
            </FormGroup>

            <FormGroup>
              <Label>Sottotitolo Sezione</Label>
              <Input
                value={pageData.sections?.projects?.subtitle || ""}
                onChange={(e) => handleSectionChange("projects", "subtitle", e.target.value)}
                placeholder="Scopri alcuni dei nostri progetti realizzati"
              />
            </FormGroup>
          </div>

          {/* Sezione News */}
          <div style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "var(--text-primary)", margin: 0 }}>
                Ultime News
              </h3>
            </div>
            
            <FormGroup>
              <Label>Titolo Sezione</Label>
              <Input
                value={pageData.sections?.news?.title || ""}
                onChange={(e) => handleSectionChange("news", "title", e.target.value)}
                placeholder="Ultime News"
              />
            </FormGroup>

            <FormGroup>
              <Label>Sottotitolo Sezione</Label>
              <Input
                value={pageData.sections?.news?.subtitle || ""}
                onChange={(e) => handleSectionChange("news", "subtitle", e.target.value)}
                placeholder="Resta aggiornato sulle ultime novità"
              />
            </FormGroup>
          </div>
        </Section>

        <Actions>
          <Button type="button" variant="secondary" onClick={handleBack}>
            Annulla
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <LoadingSpinner size="small" /> : <Save size={16} />}
            {saving ? "Salvataggio..." : "Salva Modifiche"}
          </Button>
        </Actions>
      </Form>
    </Container>
  );
};