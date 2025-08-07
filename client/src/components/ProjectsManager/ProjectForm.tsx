/**
 * PROJECT FORM - Form per creazione/modifica progetti
 *
 * Componente form modale per la gestione completa dei dati del progetto
 * con validazione, gestione errori e preview delle modifiche.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Project, CreateProjectData } from "../../hooks/useProjects";
import { useProjects } from "../../hooks/useProjects";
import {
  X,
  Save,
  Plus,
  Minus,
  Calendar,
  MapPin,
  User,
  Target,
  DollarSign,
  Clock,
  AlertCircle,
  Check,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

interface ProjectFormProps {
  project?: Project | null;
  onSave: (data: CreateProjectData) => Promise<void>;
  onCancel: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;

  h2 {
    margin: 0;
    color: #333;
    font-size: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 8px;
    color: #666;
    transition: all 0.2s ease;

    &:hover {
      background: #e9ecef;
      color: #333;
    }
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }

  h3 {
    margin: 0 0 1rem 0;
    color: #333;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f0f0f0;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  &.full-width {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.required label::after {
    content: ' *';
    color: #dc3545;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .icon {
    color: #d4af37;
  }

  .help-text {
    font-weight: normal;
    color: #666;
    font-size: 0.8rem;
    margin-left: auto;
  }
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(212, 175, 55, 0.1)'};
  }

  &:disabled {
    background: #f8f9fa;
    color: #666;
    cursor: not-allowed;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(212, 175, 55, 0.1)'};
  }

  &:disabled {
    background: #f8f9fa;
    color: #666;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  background: white;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(220, 53, 69, 0.1)' : 'rgba(212, 175, 55, 0.1)'};
  }

  &:disabled {
    background: #f8f9fa;
    color: #666;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.span`
  color: #dc3545;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const HelpText = styled.span`
  color: #666;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const FeaturesContainer = styled.div`
  .features-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    input {
      flex: 1;
    }

    button {
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #c82333;
      }
    }
  }

  .add-feature {
    background: #28a745;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background: #218838;
    }
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    margin: 0;
    cursor: pointer;
    font-weight: normal;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const Footer = styled.div`
  padding: 1rem 2rem 2rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: #f8f9fa;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
  min-width: 120px;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover:not(:disabled) {
      background: #b8941f;
      transform: translateY(-1px);
    }
  ` : `
    background: #6c757d;
    color: white;
    &:hover:not(:disabled) {
      background: #5a6268;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSave,
  onCancel,
}) => {
  const { fetchProjectLabels } = useProjects();

  // Form state
  const [formData, setFormData] = useState<CreateProjectData>({
    title: "",
    subtitle: "",
    year: new Date().getFullYear(),
    location: "",
    status: "In corso",
    label: "residenziale",
    description: "",
    long_description: "",
    client: "",
    surface: "",
    budget: "",
    duration: "",
    features: [],
    is_active: true,
    display_order: 0,
    meta_title: "",
    meta_description: "",
  });

  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [labels, setLabels] = useState<Array<{ name: string; display_name: string }>>([]);

  // Load project data if editing
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        subtitle: project.subtitle || "",
        year: project.year,
        location: project.location,
        status: project.status,
        label: project.label,
        description: project.description,
        long_description: project.long_description || "",
        client: project.client || "",
        surface: project.surface || "",
        budget: project.budget || "",
        duration: project.duration || "",
        features: project.features,
        is_active: project.is_active,
        display_order: project.display_order,
        meta_title: project.meta_title || "",
        meta_description: project.meta_description || "",
      });
      setFeatures(project.features);
    }
  }, [project]);

  // Load labels
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const labelsData = await fetchProjectLabels();
        setLabels(labelsData);
      } catch (error) {
        console.warn("Failed to load project labels");
        // Fallback labels
        setLabels([
          { name: 'residenziale', display_name: 'Residenziale' },
          { name: 'commerciale', display_name: 'Commerciale' },
          { name: 'industriale', display_name: 'Industriale' },
          { name: 'ristrutturazione', display_name: 'Ristrutturazione' },
        ]);
      }
    };

    loadLabels();
  }, [fetchProjectLabels]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Il titolo è obbligatorio";
    }

    if (!formData.year || formData.year < 1900 || formData.year > 2100) {
      newErrors.year = "Inserire un anno valido (1900-2100)";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Il luogo è obbligatorio";
    }

    if (!formData.status) {
      newErrors.status = "Lo stato è obbligatorio";
    }

    if (!formData.label) {
      newErrors.label = "La categoria è obbligatoria";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descrizione è obbligatoria";
    }

    if (formData.description.length < 50) {
      newErrors.description = "La descrizione deve essere di almeno 50 caratteri";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (field: keyof CreateProjectData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      const updatedFeatures = [...features, newFeature.trim()];
      setFeatures(updatedFeatures);
      setFormData(prev => ({ ...prev, features: updatedFeatures }));
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = features.filter((_, i) => i !== index);
    setFeatures(updatedFeatures);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Correggi gli errori nel form");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error: any) {
      toast.error(error.message || "Errore nel salvataggio");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Overlay onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <Modal onKeyDown={handleKeyPress}>
        <Header>
          <h2>
            {project ? <Save size={20} /> : <Plus size={20} />}
            {project ? "Modifica Progetto" : "Nuovo Progetto"}
          </h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </Header>

        <Content>
          <form onSubmit={handleSubmit}>
            {/* Informazioni Base */}
            <FormSection>
              <h3>
                <Info size={18} />
                Informazioni Base
              </h3>
              
              <FormGrid>
                <FormGroup className="required">
                  <Label>
                    <Target className="icon" size={16} />
                    Titolo Progetto
                  </Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Es. Villa Moderna Toscana"
                    hasError={!!errors.title}
                  />
                  {errors.title && (
                    <ErrorText>
                      <AlertCircle size={14} />
                      {errors.title}
                    </ErrorText>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Sottotitolo</Label>
                  <Input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => handleInputChange('subtitle', e.target.value)}
                    placeholder="Es. Progetto residenziale di lusso"
                  />
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup className="required">
                  <Label>
                    <Calendar className="icon" size={16} />
                    Anno
                  </Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 0)}
                    placeholder="2024"
                    min="1900"
                    max="2100"
                    hasError={!!errors.year}
                  />
                  {errors.year && (
                    <ErrorText>
                      <AlertCircle size={14} />
                      {errors.year}
                    </ErrorText>
                  )}
                </FormGroup>

                <FormGroup className="required">
                  <Label>
                    <MapPin className="icon" size={16} />
                    Luogo
                  </Label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Es. Milano, Italia"
                    hasError={!!errors.location}
                  />
                  {errors.location && (
                    <ErrorText>
                      <AlertCircle size={14} />
                      {errors.location}
                    </ErrorText>
                  )}
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup className="required">
                  <Label>Stato Progetto</Label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    hasError={!!errors.status}
                  >
                    <option value="Progettazione">In Progettazione</option>
                    <option value="In corso">In Corso</option>
                    <option value="Completato">Completato</option>
                  </Select>
                  {errors.status && (
                    <ErrorText>
                      <AlertCircle size={14} />
                      {errors.status}
                    </ErrorText>
                  )}
                </FormGroup>

                <FormGroup className="required">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.label}
                    onChange={(e) => handleInputChange('label', e.target.value)}
                    hasError={!!errors.label}
                  >
                    {labels.map(label => (
                      <option key={label.name} value={label.name}>
                        {label.display_name}
                      </option>
                    ))}
                  </Select>
                  {errors.label && (
                    <ErrorText>
                      <AlertCircle size={14} />
                      {errors.label}
                    </ErrorText>
                  )}
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Descrizioni */}
            <FormSection>
              <h3>Descrizioni</h3>
              
              <FormGroup className="required">
                <Label>
                  Descrizione Breve
                  <span className="help-text">Per card anteprima</span>
                </Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrizione concisa del progetto per le card di anteprima..."
                  hasError={!!errors.description}
                  rows={3}
                />
                <HelpText>
                  {formData.description.length}/500 caratteri. Minimo 50 caratteri richiesti.
                </HelpText>
                {errors.description && (
                  <ErrorText>
                    <AlertCircle size={14} />
                    {errors.description}
                  </ErrorText>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  Descrizione Dettagliata
                  <span className="help-text">Per pagina progetto</span>
                </Label>
                <TextArea
                  value={formData.long_description}
                  onChange={(e) => handleInputChange('long_description', e.target.value)}
                  placeholder="Descrizione completa e dettagliata del progetto per la pagina di dettaglio..."
                  rows={5}
                />
                <HelpText>
                  Descrizione estesa visibile nella pagina dettaglio del progetto.
                </HelpText>
              </FormGroup>
            </FormSection>

            {/* Dettagli Progetto */}
            <FormSection>
              <h3>Dettagli Progetto</h3>
              
              <FormGrid>
                <FormGroup>
                  <Label>
                    <User className="icon" size={16} />
                    Cliente
                  </Label>
                  <Input
                    type="text"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    placeholder="Es. Famiglia Rossi"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <Target className="icon" size={16} />
                    Superficie
                  </Label>
                  <Input
                    type="text"
                    value={formData.surface}
                    onChange={(e) => handleInputChange('surface', e.target.value)}
                    placeholder="Es. 450 mq"
                  />
                </FormGroup>
              </FormGrid>

              <FormGrid>
                <FormGroup>
                  <Label>
                    <DollarSign className="icon" size={16} />
                    Budget
                  </Label>
                  <Input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    placeholder="Es. € 850.000"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>
                    <Clock className="icon" size={16} />
                    Durata
                  </Label>
                  <Input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="Es. 18 mesi"
                  />
                </FormGroup>
              </FormGrid>
            </FormSection>

            {/* Caratteristiche */}
            <FormSection>
              <h3>Caratteristiche</h3>
              
              <FeaturesContainer>
                <div className="features-list">
                  {features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <Input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Inserisci caratteristica"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        title="Rimuovi caratteristica"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  ))}
                  
                  <div className="feature-item">
                    <Input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Nuova caratteristica"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      disabled={!newFeature.trim()}
                      className="add-feature"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <HelpText>
                  Aggiungi le caratteristiche principali del progetto (es. "Design sostenibile", "Piscina infinity", ecc.)
                </HelpText>
              </FeaturesContainer>
            </FormSection>

            {/* Impostazioni */}
            <FormSection>
              <h3>Impostazioni</h3>
              
              <FormGrid>
                <CheckboxGroup>
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  />
                  <label htmlFor="is_active">
                    <Check size={16} />
                    Progetto attivo (visibile pubblicamente)
                  </label>
                </CheckboxGroup>

                <FormGroup>
                  <Label>Ordine di visualizzazione</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                  <HelpText>
                    Numeri più bassi appaiono prima. 0 = ordine automatico.
                  </HelpText>
                </FormGroup>
              </FormGrid>
            </FormSection>
          </form>
        </Content>

        <Footer>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Annulla
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>Salvataggio...</>
            ) : (
              <>
                <Save size={16} />
                {project ? "Salva Modifiche" : "Crea Progetto"}
              </>
            )}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default ProjectForm;