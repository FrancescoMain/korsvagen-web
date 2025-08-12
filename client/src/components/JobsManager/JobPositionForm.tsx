/**
 * JOB POSITION FORM - Form per creare/modificare posizioni lavorative
 *
 * Componente form completo per la gestione delle posizioni lavorative
 * con validazione, anteprima e generazione automatica slug.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { X, Save, Eye, RefreshCw, Briefcase, MapPin, Building } from "lucide-react";

interface JobPosition {
  id?: number;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  experience_level: string;
  description: string;
  requirements: string;
  nice_to_have?: string;
  benefits?: string;
  salary_range?: string;
  is_active: boolean;
  display_order?: number;
}

interface Props {
  job?: JobPosition | null;
  departments: string[];
  onSave: (jobData: Partial<JobPosition>) => Promise<void>;
  onCancel: () => void;
}

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h2`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Subtitle = styled.p`
  margin: 0;
  color: #666;
  font-size: 1rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 8px;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
    color: #333;
  }
`;

const FormContainer = styled.form`
  padding: 2rem;
`;

const FormSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
  font-size: 0.95rem;
`;

const RequiredMark = styled.span`
  color: #dc3545;
  margin-left: 0.25rem;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
  }

  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  line-height: 1.5;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
  }

  &::placeholder {
    color: #999;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const HelpText = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const SlugPreview = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  font-family: monospace;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  color: #333;
  cursor: pointer;
  font-weight: 500;
  margin: 0;
`;

const ModalFooter = styled.div`
  padding: 2rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover {
      background: #b8941f;
      transform: translateY(-1px);
    }
  ` : `
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e0e0e0;
    &:hover {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EMPLOYMENT_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship'
];

const EXPERIENCE_LEVELS = [
  'Junior',
  'Mid',
  'Senior',
  'Lead',
  'Executive'
];

const JobPositionForm: React.FC<Props> = ({ job, departments, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<JobPosition>>({
    title: job?.title || '',
    slug: job?.slug || '',
    department: job?.department || '',
    location: job?.location || '',
    employment_type: job?.employment_type || 'Full-time',
    experience_level: job?.experience_level || 'Mid',
    description: job?.description || '',
    requirements: job?.requirements || '',
    nice_to_have: job?.nice_to_have || '',
    benefits: job?.benefits || '',
    salary_range: job?.salary_range || '',
    is_active: job?.is_active ?? true,
    display_order: job?.display_order || 0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  useEffect(() => {
    if (formData.title && (!formData.slug || !job)) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  }, [formData.title, job]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    }

    if (!formData.slug?.trim()) {
      newErrors.slug = 'Lo slug è obbligatorio';
    }

    if (!formData.department?.trim()) {
      newErrors.department = 'Il dipartimento è obbligatorio';
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'La sede è obbligatoria';
    }

    if (!formData.employment_type?.trim()) {
      newErrors.employment_type = 'Il tipo di contratto è obbligatorio';
    }

    if (!formData.experience_level?.trim()) {
      newErrors.experience_level = 'Il livello di esperienza è obbligatorio';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    } else if (formData.description.trim().length < 100) {
      newErrors.description = 'La descrizione deve essere di almeno 100 caratteri';
    }

    if (!formData.requirements?.trim()) {
      newErrors.requirements = 'I requisiti sono obbligatori';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRegenerateSlug = () => {
    if (formData.title) {
      const newSlug = generateSlug(formData.title);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  return (
    <Modal onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <ModalContent>
        <ModalHeader>
          <HeaderLeft>
            <Title>
              <Briefcase />
              {job ? 'Modifica Posizione' : 'Nuova Posizione Lavorativa'}
            </Title>
            <Subtitle>
              {job ? 'Aggiorna i dettagli della posizione lavorativa' : 'Crea una nuova posizione lavorativa'}
            </Subtitle>
          </HeaderLeft>
          <CloseButton onClick={onCancel}>
            <X size={24} />
          </CloseButton>
        </ModalHeader>

        <FormContainer onSubmit={handleSubmit}>
          {/* Basic Information */}
          <FormSection>
            <SectionTitle>
              <Briefcase size={18} />
              Informazioni Generali
            </SectionTitle>

            <FormGroup>
              <Label>
                Titolo Posizione <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                placeholder="es. Sviluppatore Frontend React"
                hasError={!!errors.title}
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                Slug URL <RequiredMark>*</RequiredMark>
              </Label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Input
                  type="text"
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleInputChange}
                  placeholder="sviluppatore-frontend-react"
                  hasError={!!errors.slug}
                  style={{ flex: 1 }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleRegenerateSlug}
                  title="Rigenera slug dal titolo"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>
              {formData.slug && (
                <SlugPreview>
                  URL: /lavora-con-noi/{formData.slug}
                </SlugPreview>
              )}
              {errors.slug && <ErrorMessage>{errors.slug}</ErrorMessage>}
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>
                  Dipartimento <RequiredMark>*</RequiredMark>
                </Label>
                <Select
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  hasError={!!errors.department}
                >
                  <option value="">Seleziona dipartimento</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </Select>
                {errors.department && <ErrorMessage>{errors.department}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>
                  Sede <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  placeholder="es. Milano / Remote"
                  hasError={!!errors.location}
                />
                {errors.location && <ErrorMessage>{errors.location}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>
                  Tipo Contratto <RequiredMark>*</RequiredMark>
                </Label>
                <Select
                  name="employment_type"
                  value={formData.employment_type || ''}
                  onChange={handleInputChange}
                  hasError={!!errors.employment_type}
                >
                  {EMPLOYMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
                {errors.employment_type && <ErrorMessage>{errors.employment_type}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>
                  Livello Esperienza <RequiredMark>*</RequiredMark>
                </Label>
                <Select
                  name="experience_level"
                  value={formData.experience_level || ''}
                  onChange={handleInputChange}
                  hasError={!!errors.experience_level}
                >
                  {EXPERIENCE_LEVELS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
                {errors.experience_level && <ErrorMessage>{errors.experience_level}</ErrorMessage>}
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Range Salariale</Label>
              <Input
                type="text"
                name="salary_range"
                value={formData.salary_range || ''}
                onChange={handleInputChange}
                placeholder="es. € 30.000 - € 45.000"
              />
              <HelpText>Opzionale - Range salariale per la posizione</HelpText>
            </FormGroup>
          </FormSection>

          {/* Job Description */}
          <FormSection>
            <SectionTitle>Descrizione e Requisiti</SectionTitle>

            <FormGroup>
              <Label>
                Descrizione Posizione <RequiredMark>*</RequiredMark>
              </Label>
              <TextArea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Descrivi il ruolo, le responsabilità principali e cosa la persona farà quotidianamente..."
                rows={4}
                hasError={!!errors.description}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              <HelpText>Minimo 100 caratteri - Descrizione che apparirà nella pagina pubblica</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>
                Requisiti Richiesti <RequiredMark>*</RequiredMark>
              </Label>
              <TextArea
                name="requirements"
                value={formData.requirements || ''}
                onChange={handleInputChange}
                placeholder="Elenca i requisiti obbligatori, uno per riga..."
                rows={5}
                hasError={!!errors.requirements}
              />
              {errors.requirements && <ErrorMessage>{errors.requirements}</ErrorMessage>}
              <HelpText>Un requisito per riga - Questi sono i requisiti obbligatori</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Requisiti Preferenziali</Label>
              <TextArea
                name="nice_to_have"
                value={formData.nice_to_have || ''}
                onChange={handleInputChange}
                placeholder="Elenca i requisiti preferenziali, uno per riga..."
                rows={4}
              />
              <HelpText>Requisiti non obbligatori ma apprezzati</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Benefits e Vantaggi</Label>
              <TextArea
                name="benefits"
                value={formData.benefits || ''}
                onChange={handleInputChange}
                placeholder="Smart working, formazione, benefit aziendali..."
                rows={3}
              />
              <HelpText>Benefits e vantaggi offerti dall'azienda</HelpText>
            </FormGroup>
          </FormSection>

          {/* Settings */}
          <FormSection>
            <CheckboxContainer>
              <Checkbox
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active || false}
                onChange={handleInputChange}
              />
              <CheckboxLabel htmlFor="is_active">
                Posizione attiva (visibile sul sito e accetta candidature)
              </CheckboxLabel>
            </CheckboxContainer>
          </FormSection>
        </FormContainer>

        <ModalFooter>
          <Button type="button" onClick={onCancel}>
            Annulla
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save size={16} />
                {job ? 'Aggiorna Posizione' : 'Crea Posizione'}
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default JobPositionForm;