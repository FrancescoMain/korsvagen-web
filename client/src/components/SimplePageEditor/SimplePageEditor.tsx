import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Breadcrumb } from "../Dashboard/Breadcrumb";
import { useVideoUpload } from "../../hooks/useVideoUpload";
import { apiClient } from "../../utils/api";

interface PageData {
  id: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroVideo?: string;
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;


const VideoUploadArea = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: border-color 0.2s;
  cursor: pointer;
  position: relative;

  &:hover {
    border-color: var(--primary);
  }

  &.has-video {
    border-color: var(--primary);
    background: rgba(59, 130, 246, 0.05);
  }

  &.uploading {
    border-color: var(--primary);
    background: rgba(59, 130, 246, 0.1);
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div<{ progress: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 0 0 8px 8px;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${({ progress }) => progress}%;
    background: var(--primary);
    transition: width 0.3s ease;
    border-radius: 0 0 8px 8px;
  }
`;

const VideoPreview = styled.div`
  position: relative;
  margin-top: 1rem;
`;

const RemoveVideoButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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
  const { uploadVideo, deleteVideo, uploading, progress } = useVideoUpload();

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
            heroVideo: response.data.data.hero_video || "",
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
          heroTitle: pageId === "about" ? "La Nostra Storia" : pageId === "contact" ? "Contattaci" : "KORSVAGEN",
          heroSubtitle: pageId === "about" ? "Oltre 30 anni di eccellenza" : pageId === "contact" ? "Siamo qui per aiutarti" : "Costruzioni di qualità dal 1985",
          heroVideo: "",
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

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = await uploadVideo(file);
    if (result) {
      handleInputChange("heroVideo", result.secure_url);
    }
    
    // Reset the input value so the same file can be selected again
    event.target.value = "";
  };

  const handleRemoveVideo = () => {
    handleInputChange("heroVideo", "");
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pageData) return;
    
    setSaving(true);

    try {
      const saveData = {
        heroVideo: pageData.heroVideo,
        heroImage: pageData.heroImage,
        sections: pageData.sections,
        metaTitle: pageData.metaTitle,
        metaDescription: pageData.metaDescription,
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
        <Title>Modifica: {pageData.id === "home" ? "Homepage" : pageData.id === "about" ? "Chi Siamo" : "Contatti"}</Title>
      </Header>

      <Form onSubmit={handleSave}>

        <Section>
          <SectionTitle>Hero Video</SectionTitle>
          
          <FormGroup>
            <Label>Video Hero</Label>
            <VideoUploadArea 
              className={
                uploading 
                  ? "uploading" 
                  : pageData.heroVideo 
                    ? "has-video" 
                    : ""
              }
            >
              {uploading ? (
                <>
                  <LoadingSpinner />
                  <p style={{ margin: "1rem 0 0", color: "#6b7280" }}>
                    Caricamento video... {progress}%
                  </p>
                  <ProgressBar progress={progress} />
                </>
              ) : pageData.heroVideo ? (
                <VideoPreview>
                  <video
                    src={pageData.heroVideo}
                    controls
                    style={{ width: "100%", maxHeight: "200px" }}
                  />
                  <RemoveVideoButton onClick={handleRemoveVideo}>
                    <X size={16} />
                  </RemoveVideoButton>
                </VideoPreview>
              ) : (
                <>
                  <Upload size={48} color="#9ca3af" />
                  <p style={{ margin: "1rem 0 0", color: "#6b7280" }}>
                    Clicca per caricare un video o trascinalo qui
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    style={{ display: "none" }}
                    id="video-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="video-upload"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      cursor: uploading ? "not-allowed" : "pointer"
                    }}
                  />
                </>
              )}
            </VideoUploadArea>
          </FormGroup>
        </Section>

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

        <Section>
          <SectionTitle>SEO</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={pageData.metaTitle || ""}
              onChange={(e) => handleInputChange("metaTitle", e.target.value)}
              placeholder="Titolo per i motori di ricerca"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <TextArea
              id="metaDescription"
              value={pageData.metaDescription || ""}
              onChange={(e) => handleInputChange("metaDescription", e.target.value)}
              placeholder="Descrizione per i motori di ricerca"
              style={{ minHeight: "80px" }}
            />
          </FormGroup>
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