/**
 * ABOUT MANAGER - Gestione Contenuti Pagina About Dashboard
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAboutContent, type AboutContent } from "../../hooks/useAboutContent";
import { useCertifications } from "../../hooks/useCertifications";
import CertificationsManager from "./CertificationsManager";
import toast from "react-hot-toast";

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  color: #666;
  margin: 0;
`;

const TabsContainer = styled.div`
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 2rem;
`;

const TabsList = styled.div`
  display: flex;
  gap: 1rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 600;
  color: ${props => props.active ? '#d4af37' : '#666'};
  border-bottom: 3px solid ${props => props.active ? '#d4af37' : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    color: #d4af37;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ContentSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #d4af37;
    box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover {
      background: #b8941f;
      transform: translateY(-1px);
    }
  ` : `
    background: #e0e0e0;
    color: #333;
    &:hover {
      background: #d0d0d0;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const GridRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AboutManager: React.FC = () => {
  const { content, loading, error, fetchContent, updateContent } = useAboutContent();
  const [activeTab, setActiveTab] = useState<'content' | 'certifications'>('content');
  const [formData, setFormData] = useState<AboutContent>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Carica contenuti al mount
  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Aggiorna form quando cambiano i contenuti
  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  // Gestione input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await updateContent(formData);
      if (success) {
        toast.success("Contenuti salvati con successo!");
      }
    } catch (error) {
      console.error("Errore salvataggio:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !content) {
    return (
      <Container>
        <LoadingSpinner>Caricamento contenuti About...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestione Pagina About</Title>
        <Subtitle>Modifica i contenuti della pagina "Chi Siamo"</Subtitle>
      </Header>

      <TabsContainer>
        <TabsList>
          <Tab 
            active={activeTab === 'content'} 
            onClick={() => setActiveTab('content')}
          >
            Contenuti Testo
          </Tab>
          <Tab 
            active={activeTab === 'certifications'} 
            onClick={() => setActiveTab('certifications')}
          >
            Certificazioni
          </Tab>
        </TabsList>
      </TabsContainer>

      {error && (
        <div style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {activeTab === 'content' && (
        <Form onSubmit={handleSubmit}>
          {/* Hero Section */}
          <ContentSection>
            <SectionTitle>Sezione Hero</SectionTitle>
            <GridRow>
              <FormGroup>
                <Label htmlFor="hero_title">Titolo Principale</Label>
                <Input
                  type="text"
                  id="hero_title"
                  name="hero_title"
                  value={formData.hero_title || ''}
                  onChange={handleInputChange}
                  placeholder="Chi Siamo"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="hero_subtitle">Sottotitolo</Label>
                <Input
                  type="text"
                  id="hero_subtitle"
                  name="hero_subtitle"
                  value={formData.hero_subtitle || ''}
                  onChange={handleInputChange}
                  placeholder="Esperienza, professionalità e passione..."
                />
              </FormGroup>
            </GridRow>
          </ContentSection>

          {/* Storia Section */}
          <ContentSection>
            <SectionTitle>La Nostra Storia</SectionTitle>
            <FormGroup>
              <Label htmlFor="storia_title">Titolo Sezione</Label>
              <Input
                type="text"
                id="storia_title"
                name="storia_title"
                value={formData.storia_title || ''}
                onChange={handleInputChange}
                placeholder="La Nostra Storia"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="storia_content">Contenuto</Label>
              <Textarea
                id="storia_content"
                name="storia_content"
                value={formData.storia_content || ''}
                onChange={handleInputChange}
                placeholder="Racconta la storia dell'azienda..."
                rows={6}
              />
            </FormGroup>
          </ContentSection>

          {/* Mission & Vision */}
          <GridRow>
            <ContentSection>
              <SectionTitle>Mission</SectionTitle>
              <FormGroup>
                <Label htmlFor="mission_title">Titolo</Label>
                <Input
                  type="text"
                  id="mission_title"
                  name="mission_title"
                  value={formData.mission_title || ''}
                  onChange={handleInputChange}
                  placeholder="Mission"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="mission_content">Contenuto</Label>
                <Textarea
                  id="mission_content"
                  name="mission_content"
                  value={formData.mission_content || ''}
                  onChange={handleInputChange}
                  placeholder="La mission aziendale..."
                  rows={4}
                />
              </FormGroup>
            </ContentSection>

            <ContentSection>
              <SectionTitle>Vision</SectionTitle>
              <FormGroup>
                <Label htmlFor="vision_title">Titolo</Label>
                <Input
                  type="text"
                  id="vision_title"
                  name="vision_title"
                  value={formData.vision_title || ''}
                  onChange={handleInputChange}
                  placeholder="Vision"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="vision_content">Contenuto</Label>
                <Textarea
                  id="vision_content"
                  name="vision_content"
                  value={formData.vision_content || ''}
                  onChange={handleInputChange}
                  placeholder="La vision aziendale..."
                  rows={4}
                />
              </FormGroup>
            </ContentSection>
          </GridRow>

          {/* Perché Sceglierci */}
          <ContentSection>
            <SectionTitle>Perché Sceglierci</SectionTitle>
            <GridRow>
              <FormGroup>
                <Label htmlFor="why_choose_title">Titolo Principale</Label>
                <Input
                  type="text"
                  id="why_choose_title"
                  name="why_choose_title"
                  value={formData.why_choose_title || ''}
                  onChange={handleInputChange}
                  placeholder="Perché Sceglierci"
                />
              </FormGroup>
              <FormGroup>
                <Label htmlFor="why_choose_subtitle">Sottotitolo</Label>
                <Input
                  type="text"
                  id="why_choose_subtitle"
                  name="why_choose_subtitle"
                  value={formData.why_choose_subtitle || ''}
                  onChange={handleInputChange}
                  placeholder="I vantaggi che ci distinguono..."
                />
              </FormGroup>
            </GridRow>

            {/* Tre sezioni del "Perché Sceglierci" */}
            <GridRow style={{ marginTop: '1.5rem' }}>
              <div>
                <FormGroup>
                  <Label htmlFor="experience_title">Esperienza Consolidata - Titolo</Label>
                  <Input
                    type="text"
                    id="experience_title"
                    name="experience_title"
                    value={formData.experience_title || ''}
                    onChange={handleInputChange}
                    placeholder="Esperienza Consolidata"
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="experience_content">Esperienza Consolidata - Contenuto</Label>
                  <Textarea
                    id="experience_content"
                    name="experience_content"
                    value={formData.experience_content || ''}
                    onChange={handleInputChange}
                    placeholder="Descrivi l'esperienza dell'azienda..."
                    rows={3}
                  />
                </FormGroup>
              </div>

              <div>
                <FormGroup>
                  <Label htmlFor="quality_title">Qualità Garantita - Titolo</Label>
                  <Input
                    type="text"
                    id="quality_title"
                    name="quality_title"
                    value={formData.quality_title || ''}
                    onChange={handleInputChange}
                    placeholder="Qualità Garantita"
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor="quality_content">Qualità Garantita - Contenuto</Label>
                  <Textarea
                    id="quality_content"
                    name="quality_content"
                    value={formData.quality_content || ''}
                    onChange={handleInputChange}
                    placeholder="Descrivi la qualità offerta..."
                    rows={3}
                  />
                </FormGroup>
              </div>
            </GridRow>

            <FormGroup style={{ marginTop: '1.5rem' }}>
              <Label htmlFor="approach_title">Approccio Personalizzato - Titolo</Label>
              <Input
                type="text"
                id="approach_title"
                name="approach_title"
                value={formData.approach_title || ''}
                onChange={handleInputChange}
                placeholder="Approccio Personalizzato"
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="approach_content">Approccio Personalizzato - Contenuto</Label>
              <Textarea
                id="approach_content"
                name="approach_content"
                value={formData.approach_content || ''}
                onChange={handleInputChange}
                placeholder="Descrivi l'approccio personalizzato..."
                rows={3}
              />
            </FormGroup>
          </ContentSection>

          <ButtonGroup>
            <Button type="button" variant="secondary" onClick={() => setFormData(content || {})}>
              Ripristina
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
            </Button>
          </ButtonGroup>
        </Form>
      )}

      {activeTab === 'certifications' && (
        <CertificationsManager />
      )}
    </Container>
  );
};

export default AboutManager;