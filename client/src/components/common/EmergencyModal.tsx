/**
 * KORSVAGEN WEB APPLICATION - EMERGENCY MODAL COMPONENT
 *
 * Modal for emergency requests with form validation and submission.
 * Features:
 * - Form validation with error states
 * - Loading states and success feedback
 * - Accessible modal implementation
 * - Mobile responsive design
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  first_name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  first_name?: string;
  phone?: string;
  message?: string;
  submit?: string;
}

// Animations
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const checkmark = keyframes`
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
`;

// Styled components
const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 20px;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalContainer = styled.div<{ isOpen: boolean }>`
  background: white;
  border-radius: 20px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: ${props => props.isOpen ? slideIn : 'none'} 0.4s ease-out;
  position: relative;

  @media (max-width: 768px) {
    margin: 10px;
    max-width: none;
    border-radius: 15px;
  }
`;

const ModalHeader = styled.div`
  background: #dc2626;
  color: white;
  padding: 24px 30px;
  border-radius: 20px 20px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 768px) {
    padding: 20px 25px;
    border-radius: 15px 15px 0 0;
  }

  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;

    @media (max-width: 768px) {
      font-size: 1.3rem;
    }
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalBody = styled.div`
  padding: 30px;

  @media (max-width: 768px) {
    padding: 25px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#dc2626'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  padding: 12px 16px;
  border: 2px solid ${props => props.hasError ? '#ef4444' : '#e5e7eb'};
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  min-height: 100px;
  resize: vertical;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#ef4444' : '#dc2626'};
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(220, 38, 38, 0.1)'};
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ErrorText = styled.span`
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
`;

const CallbackInfo = styled.div`
  background: #fef3c7;
  color: #92400e;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
  font-size: 14px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', sans-serif;

  ${props => props.variant === 'primary' ? `
    background: #dc2626;
    color: white;
    border: 2px solid #dc2626;
    
    &:hover:not(:disabled) {
      background: #b91c1c;
      border-color: #b91c1c;
    }
    
    &:disabled {
      background: #9ca3af;
      border-color: #9ca3af;
      cursor: not-allowed;
    }
  ` : `
    background: transparent;
    color: #6b7280;
    border: 2px solid #e5e7eb;
    
    &:hover:not(:disabled) {
      background: #f9fafb;
      border-color: #d1d5db;
    }
  `}

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.2);
  }

  @media (max-width: 480px) {
    padding: 14px 20px;
  }
`;

const SuccessContainer = styled.div`
  text-align: center;
  padding: 40px 30px;
  
  @media (max-width: 768px) {
    padding: 30px 25px;
  }
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  color: #10b981;
  margin-bottom: 20px;
  animation: ${checkmark} 0.6s ease-out;
`;

const SuccessTitle = styled.h3`
  color: #065f46;
  margin: 0 0 12px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

const SuccessMessage = styled.p`
  color: #047857;
  margin: 0 0 8px 0;
  font-size: 16px;
  line-height: 1.5;
`;

const SuccessNote = styled.p`
  color: #059669;
  font-weight: 500;
  margin: 0;
  font-size: 14px;
`;

const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset after animation completes
      const timer = setTimeout(() => {
        setFormData({ first_name: '', email: '', phone: '', message: '' });
        setErrors({});
        setSuccess(false);
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Auto-close success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Nome è obbligatorio';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefono è obbligatorio';
    } else if (!/^[\+]?[0-9\s\-\(\)]{8,}$/.test(formData.phone)) {
      newErrors.phone = 'Formato telefono non valido';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Descrizione emergenza è obbligatoria';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Descrizione troppo breve (minimo 10 caratteri)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/contact/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setErrors({ submit: result.message || 'Errore durante l\'invio della richiesta' });
      }
    } catch (error) {
      console.error('Emergency request error:', error);
      setErrors({ submit: 'Errore di connessione. Contatta direttamente il numero telefonico.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContainer isOpen={isOpen} role="dialog" aria-modal="true" aria-labelledby="emergency-modal-title">
        <ModalHeader>
          <h3 id="emergency-modal-title">
            <span>🚨</span>
            Centralino Emergenze
          </h3>
          <CloseButton onClick={onClose} aria-label="Chiudi modal">
            ×
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {success ? (
            <SuccessContainer>
              <SuccessIcon>✓</SuccessIcon>
              <SuccessTitle>Richiesta Inviata!</SuccessTitle>
              <SuccessMessage>
                Ti richiameremo entro 24 ore per gestire la tua emergenza.
              </SuccessMessage>
              <SuccessNote>
                Mantieni il telefono acceso e disponibile.
              </SuccessNote>
            </SuccessContainer>
          ) : (
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="first_name">Nome *</Label>
                <Input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Il tuo nome"
                  hasError={!!errors.first_name}
                  autoComplete="given-name"
                />
                {errors.first_name && <ErrorText>{errors.first_name}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Telefono *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+39 333 123 4567"
                  hasError={!!errors.phone}
                  autoComplete="tel"
                />
                {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email (opzionale)</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tua@email.com"
                  autoComplete="email"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="message">Descrizione Emergenza *</Label>
                <TextArea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Descrivi brevemente la situazione di emergenza..."
                  hasError={!!errors.message}
                />
                {errors.message && <ErrorText>{errors.message}</ErrorText>}
              </FormGroup>

              <CallbackInfo>
                <span>📞</span>
                Ti richiameremo entro 24 ore
              </CallbackInfo>

              {errors.submit && (
                <ErrorText style={{ textAlign: 'center', fontSize: '14px' }}>
                  {errors.submit}
                </ErrorText>
              )}

              <FormActions>
                <Button type="button" onClick={onClose} disabled={loading}>
                  Annulla
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Invio...' : 'Invia Richiesta'}
                </Button>
              </FormActions>
            </Form>
          )}
        </ModalBody>
      </ModalContainer>
    </Overlay>
  );
};

export default EmergencyModal;