/**
 * SERVICE FORM - Form per creazione/modifica servizio
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Service } from "../../hooks/useServices";
import { X, Save, Plus, Trash2, GripVertical } from "lucide-react";
import MicroservicesManager from "./MicroservicesManager";

const Overlay = styled.div`
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
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #666;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #333;
  }
`;

const Body = styled.div`
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#ddd'};
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(220, 53, 69, 0.2)' : 'rgba(212, 175, 55, 0.2)'};
  }

  &::placeholder {
    color: #aaa;
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.hasError ? '#dc3545' : '#ddd'};
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#d4af37'};
    box-shadow: 0 0 0 2px ${props => props.hasError ? 'rgba(220, 53, 69, 0.2)' : 'rgba(212, 175, 55, 0.2)'};
  }

  &::placeholder {
    color: #aaa;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Checkbox = styled.input`
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-weight: 500;
  cursor: pointer;
  margin: 0;
`;

const NumberInput = styled(Input)`
  width: 100px;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const HelpText = styled.div`
  color: #666;
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const Footer = styled.div`
  padding: 1rem 2rem 2rem 2rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover:not(:disabled) {
      background: #b8941f;
      transform: translateY(-1px);
    }
  ` : `
    background: #f8f9fa;
    color: #333;
    border: 1px solid #e0e0e0;
    &:hover:not(:disabled) {
      background: #e9ecef;
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

interface ServiceFormProps {
  service?: Service | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  title: string;
  subtitle: string;
  description: string;
  microservices: string[];
  is_active: boolean;
  display_order: number;
}

interface FormErrors {
  title?: string;
  description?: string;
  microservices?: string;
}

const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subtitle: '',
    description: '',
    microservices: [],
    is_active: true,
    display_order: 1,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Popola il form se stiamo modificando un servizio esistente
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        subtitle: service.subtitle || '',
        description: service.description || '',
        microservices: service.microservices || [],
        is_active: service.is_active !== false,
        display_order: service.display_order || 1,
      });
    }
  }, [service]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validazione titolo
    if (!formData.title.trim()) {
      newErrors.title = 'Il titolo è obbligatorio';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Il titolo deve essere di almeno 3 caratteri';
    } else if (formData.title.trim().length > 255) {
      newErrors.title = 'Il titolo non può superare 255 caratteri';
    }

    // Validazione descrizione
    if (!formData.description.trim()) {
      newErrors.description = 'La descrizione è obbligatoria';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'La descrizione deve essere di almeno 10 caratteri';
    }

    // Validazione microservizi
    if (formData.microservices.length > 20) {
      newErrors.microservices = 'Massimo 20 micro-servizi consentiti';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepara i dati per l'invio
    const submitData = {
      ...formData,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim() || null,
      description: formData.description.trim(),
      microservices: formData.microservices.filter(ms => ms.trim().length > 0),
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Rimuovi errore se l'utente sta correggendo
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleMicroservicesChange = (microservices: string[]) => {
    handleInputChange('microservices', microservices);
  };

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <Title>
            {service ? 'Modifica Servizio' : 'Nuovo Servizio'}
          </Title>
          <CloseButton onClick={onCancel}>
            <X size={20} />
          </CloseButton>
        </Header>

        <Body>
          <Form onSubmit={handleSubmit}>
            {/* Titolo */}
            <FormGroup>
              <Label htmlFor="title">
                Titolo del Servizio *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="es. Progettazione Architettonica"
                hasError={!!errors.title}
                maxLength={255}
              />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>

            {/* Sottotitolo */}
            <FormGroup>
              <Label htmlFor="subtitle">
                Sottotitolo (opzionale)
              </Label>
              <Input
                id="subtitle"
                type="text"
                value={formData.subtitle}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                placeholder="es. Dall'idea al progetto definitivo"
                maxLength={500}
              />
              <HelpText>
                Un breve sottotitolo descrittivo (massimo 500 caratteri)
              </HelpText>
            </FormGroup>

            {/* Descrizione */}
            <FormGroup>
              <Label htmlFor="description">
                Descrizione del Servizio *
              </Label>
              <TextArea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrivi dettagliatamente il servizio offerto..."
                hasError={!!errors.description}
                rows={4}
              />
              {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              <HelpText>
                Descrizione dettagliata che apparirà nella pagina pubblica
              </HelpText>
            </FormGroup>

            {/* Micro-servizi */}
            <FormGroup>
              <Label>
                Micro-Servizi
              </Label>
              <MicroservicesManager
                microservices={formData.microservices}
                onChange={handleMicroservicesChange}
                error={errors.microservices}
              />
              <HelpText>
                Lista delle sotto-attività o specializzazioni del servizio (massimo 20)
              </HelpText>
            </FormGroup>

            {/* Ordine di visualizzazione */}
            <FormGroup>
              <Label htmlFor="display_order">
                Ordine di Visualizzazione
              </Label>
              <NumberInput
                id="display_order"
                type="number"
                min="1"
                max="999"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 1)}
              />
              <HelpText>
                Ordine di comparsa nella pagina servizi (1 = primo)
              </HelpText>
            </FormGroup>

            {/* Stato pubblicazione */}
            <FormGroup>
              <CheckboxGroup>
                <Checkbox
                  id="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                />
                <CheckboxLabel htmlFor="is_active">
                  Pubblica immediatamente questo servizio
                </CheckboxLabel>
              </CheckboxGroup>
              <HelpText>
                Se deselezionato, il servizio sarà salvato come bozza e non apparirà nel sito pubblico
              </HelpText>
            </FormGroup>
          </Form>
        </Body>

        <Footer>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annulla
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? 'Salvataggio...' : 'Salva Servizio'}
          </Button>
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default ServiceForm;