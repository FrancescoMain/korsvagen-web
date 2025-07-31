import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { Breadcrumb } from "../Dashboard/Breadcrumb";
import { useVideoUpload } from "../../hooks/useVideoUpload";

interface PageData {
  id: string;
  title: string;
  subtitle?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroVideo?: string;
  heroImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  status: "published" | "draft";
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

const StatusSelect = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
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
      
      // Mock data based on pageId
      const mockData: { [key: string]: PageData } = {
        home: {
          id: "home",
          title: "Homepage",
          subtitle: "La pagina principale del sito",
          heroTitle: "KORSVAGEN",
          heroSubtitle: "Costruzioni di qualità dal 1985",
          heroVideo: "",
          heroImage: "",
          metaTitle: "KORSVAGEN - Costruzioni di qualità",
          metaDescription: "Azienda leader nelle costruzioni con oltre 30 anni di esperienza",
          status: "published",
          sections: {
            services: {
              title: "I Nostri Servizi",
              subtitle: "Soluzioni innovative per ogni esigenza",
              content: "Offriamo servizi completi nel settore delle costruzioni..."
            },
            about: {
              title: "Chi Siamo",
              subtitle: "La nostra storia",
              content: "Con oltre 30 anni di esperienza nel settore..."
            }
          }
        },
        about: {
          id: "about",
          title: "Chi Siamo",
          subtitle: "La nostra storia e i nostri valori",
          heroTitle: "La Nostra Storia",
          heroSubtitle: "Oltre 30 anni di eccellenza nelle costruzioni",
          heroVideo: "",
          heroImage: "",
          metaTitle: "Chi Siamo - KORSVAGEN",
          metaDescription: "Scopri la storia di KORSVAGEN e i nostri valori",
          status: "published",
          sections: {
            story: {
              title: "La Nostra Storia",
              subtitle: "Dal 1985 al vostro servizio",
              content: "La nostra azienda è stata fondata nel 1985..."
            }
          }
        },
        contact: {
          id: "contact",
          title: "Contatti",
          subtitle: "Come raggiungerci",
          heroTitle: "Contattaci",
          heroSubtitle: "Siamo qui per aiutarti",
          heroVideo: "",
          heroImage: "",
          metaTitle: "Contatti - KORSVAGEN",
          metaDescription: "Contatta KORSVAGEN per informazioni e preventivi",
          status: "published",
          sections: {
            info: {
              title: "Informazioni di Contatto",
              subtitle: "I nostri recapiti",
              content: "Puoi contattarci tramite telefono, email o visitando i nostri uffici..."
            }
          }
        }
      };

      setTimeout(() => {
        setPageData(mockData[pageId || "home"] || mockData.home);
        setLoading(false);
      }, 500);
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
    setSaving(true);

    // Mock save operation
    setTimeout(() => {
      console.log("Saving page data:", pageData);
      setSaving(false);
      // Could show success toast here
    }, 1000);
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
        <Title>Modifica: {pageData.title}</Title>
      </Header>

      <Form onSubmit={handleSave}>
        <Section>
          <SectionTitle>Informazioni Generali</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="title">Titolo Pagina</Label>
            <Input
              id="title"
              value={pageData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Inserisci il titolo della pagina"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="subtitle">Sottotitolo</Label>
            <Input
              id="subtitle"
              value={pageData.subtitle || ""}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              placeholder="Sottotitolo della pagina (opzionale)"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status">Stato</Label>
            <StatusSelect
              id="status"
              value={pageData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
            >
              <option value="draft">Bozza</option>
              <option value="published">Pubblicata</option>
            </StatusSelect>
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Hero Section</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="heroTitle">Titolo Hero</Label>
            <Input
              id="heroTitle"
              value={pageData.heroTitle || ""}
              onChange={(e) => handleInputChange("heroTitle", e.target.value)}
              placeholder="Titolo principale della hero section"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="heroSubtitle">Sottotitolo Hero</Label>
            <Input
              id="heroSubtitle"
              value={pageData.heroSubtitle || ""}
              onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
              placeholder="Sottotitolo della hero section"
            />
          </FormGroup>

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
          
          {Object.entries(pageData.sections).map(([sectionId, section]) => (
            <div key={sectionId} style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "1rem", color: "var(--text-primary)" }}>
                Sezione: {sectionId}
              </h3>
              
              <FormGroup>
                <Label>Titolo Sezione</Label>
                <Input
                  value={section.title || ""}
                  onChange={(e) => handleSectionChange(sectionId, "title", e.target.value)}
                  placeholder="Titolo della sezione"
                />
              </FormGroup>

              <FormGroup>
                <Label>Sottotitolo Sezione</Label>
                <Input
                  value={section.subtitle || ""}
                  onChange={(e) => handleSectionChange(sectionId, "subtitle", e.target.value)}
                  placeholder="Sottotitolo della sezione"
                />
              </FormGroup>

              <FormGroup>
                <Label>Contenuto</Label>
                <TextArea
                  value={section.content || ""}
                  onChange={(e) => handleSectionChange(sectionId, "content", e.target.value)}
                  placeholder="Contenuto della sezione"
                />
              </FormGroup>
            </div>
          ))}
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