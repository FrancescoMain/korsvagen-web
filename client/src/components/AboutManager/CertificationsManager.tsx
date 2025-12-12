/**
 * CERTIFICATIONS MANAGER - Gestione Certificazioni Dashboard
 */

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useCertifications, type Certification, type CertificationFormData } from "../../hooks/useCertifications";
import toast from "react-hot-toast";

// Icone semplici come componenti
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17,8 12,3 7,8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

// Styled Components
const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin: 0;
`;

const AddButton = styled.button`
  background: #d4af37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: #b8941f;
    transform: translateY(-1px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const CertificationCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const CertificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const CertificationInfo = styled.div`
  flex: 1;
`;

const CertificationCode = styled.div`
  background: #d4af37;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 0.5rem;
`;

const CertificationName = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const CertificationDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0.5rem 0;
`;

const CertificationActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  ${props => props.variant === 'edit' ? `
    background: #2196F3;
    color: white;
    &:hover { background: #1976D2; }
  ` : props.variant === 'delete' ? `
    background: #f44336;
    color: white;
    &:hover { background: #d32f2f; }
  ` : `
    background: #e0e0e0;
    color: #333;
    &:hover { background: #d0d0d0; }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  ${props => props.active ? `
    background: #e8f5e8;
    color: #2e7d32;
  ` : `
    background: #ffebee;
    color: #d32f2f;
  `}
`;

const Modal = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  &:hover { color: #333; }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

// Styled components per upload documenti
const DocumentSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed #e0e0e0;
`;

const UploadZone = styled.div<{ isDragging?: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#d4af37' : '#ddd'};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isDragging ? 'rgba(212, 175, 55, 0.05)' : '#fafafa'};

  &:hover {
    border-color: #d4af37;
    background: rgba(212, 175, 55, 0.05);
  }
`;

const UploadText = styled.p`
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 0.9rem;
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #e8f5e9;
  padding: 0.75rem 1rem;
  border-radius: 8px;
`;

const DocumentLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2e7d32;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const DeleteDocButton = styled.button`
  background: #ffebee;
  color: #d32f2f;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;

  &:hover {
    background: #ffcdd2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const CertificationsManager: React.FC = () => {
  const {
    certifications,
    loading,
    error,
    fetchCertifications,
    createCertification,
    updateCertification,
    deleteCertification,
    uploadDocument,
    deleteDocument,
  } = useCertifications();

  // Stati per il modal
  const [showModal, setShowModal] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [formData, setFormData] = useState<CertificationFormData>({
    name: '',
    code: '',
    description: '',
    is_active: true,
    display_order: 0,
  });

  // Stati per upload documenti
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Carica certificazioni al mount
  useEffect(() => {
    fetchCertifications();
  }, [fetchCertifications]);

  // Reset form quando chiude il modal
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true,
      display_order: 0,
    });
    setEditingCertification(null);
  };

  // Apri modal per nuova certificazione
  const handleAddCertification = () => {
    resetForm();
    setShowModal(true);
  };

  // Apri modal per modifica certificazione
  const handleEditCertification = (certification: Certification) => {
    setFormData({
      name: certification.name,
      code: certification.code,
      description: certification.description,
      is_active: certification.is_active ?? true,
      display_order: certification.display_order ?? 0,
    });
    setEditingCertification(certification);
    setShowModal(true);
  };

  // Chiudi modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Gestione input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCertification) {
      // Modifica certificazione esistente
      const success = await updateCertification(editingCertification.id, formData);
      if (success) {
        handleCloseModal();
      }
    } else {
      // Crea nuova certificazione
      const success = await createCertification(formData);
      if (success) {
        handleCloseModal();
      }
    }
  };

  // Elimina certificazione
  const handleDeleteCertification = async (id: string, name: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare la certificazione "${name}"?`)) {
      await deleteCertification(id);
    }
  };

  // Gestione upload documento
  const handleFileSelect = async (certId: string, file: File) => {
    if (!file.type.includes('pdf')) {
      toast.error('Solo file PDF sono permessi');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Il file non può superare i 15MB');
      return;
    }

    setUploadingId(certId);
    await uploadDocument(certId, file);
    setUploadingId(null);
  };

  const handleFileInputChange = (certId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(certId, file);
    }
    // Reset input per permettere di ricaricare lo stesso file
    e.target.value = '';
  };

  const handleDeleteDocument = async (certId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare il documento?')) {
      setUploadingId(certId);
      await deleteDocument(certId);
      setUploadingId(null);
    }
  };

  if (loading && certifications.length === 0) {
    return <LoadingSpinner>Caricamento certificazioni...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>Certificazioni e Qualifiche ({certifications.length})</Title>
        <AddButton onClick={handleAddCertification} disabled={loading}>
          + Aggiungi Certificazione
        </AddButton>
      </Header>

      {error && (
        <div style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div>
        {certifications.map(certification => (
          <CertificationCard key={certification.id}>
            <CertificationHeader>
              <CertificationInfo>
                <CertificationCode>{certification.code}</CertificationCode>
                <CertificationName>{certification.name}</CertificationName>
              </CertificationInfo>
              <div>
                <StatusBadge active={certification.is_active ?? true}>
                  {certification.is_active ? 'Attiva' : 'Inattiva'}
                </StatusBadge>
              </div>
            </CertificationHeader>
            
            <CertificationDescription>{certification.description}</CertificationDescription>
            
            <CertificationActions>
              <ActionButton
                variant="edit"
                onClick={() => handleEditCertification(certification)}
                disabled={loading}
              >
                Modifica
              </ActionButton>
              <ActionButton
                variant="delete"
                onClick={() => handleDeleteCertification(certification.id, certification.name)}
                disabled={loading}
              >
                Elimina
              </ActionButton>
              {certification.display_order !== undefined && (
                <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9rem' }}>
                  Ordine: {certification.display_order}
                </span>
              )}
            </CertificationActions>

            {/* Sezione Documento PDF */}
            <DocumentSection>
              {certification.document_url ? (
                <DocumentInfo>
                  <DocumentLink
                    href={certification.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DocumentIcon />
                    Certificato PDF
                  </DocumentLink>
                  <DeleteDocButton
                    onClick={() => handleDeleteDocument(certification.id)}
                    disabled={uploadingId === certification.id}
                  >
                    <TrashIcon />
                    {uploadingId === certification.id ? 'Eliminazione...' : 'Elimina'}
                  </DeleteDocButton>
                </DocumentInfo>
              ) : (
                <>
                  <HiddenInput
                    type="file"
                    accept=".pdf,application/pdf"
                    ref={el => fileInputRefs.current[certification.id] = el}
                    onChange={(e) => handleFileInputChange(certification.id, e)}
                  />
                  <UploadZone
                    onClick={() => fileInputRefs.current[certification.id]?.click()}
                  >
                    {uploadingId === certification.id ? (
                      <UploadText>Caricamento in corso...</UploadText>
                    ) : (
                      <>
                        <UploadIcon />
                        <UploadText>Clicca per caricare il certificato PDF</UploadText>
                      </>
                    )}
                  </UploadZone>
                </>
              )}
            </DocumentSection>
          </CertificationCard>
        ))}
      </div>

      {certifications.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>Nessuna certificazione presente.</p>
          <AddButton onClick={handleAddCertification}>
            Crea la prima certificazione
          </AddButton>
        </div>
      )}

      {/* Modal per creazione/modifica certificazione */}
      <Modal show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingCertification ? 'Modifica Certificazione' : 'Nuova Certificazione'}
            </ModalTitle>
            <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="name">Nome Certificazione *</Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                maxLength={100}
                placeholder="es. ISO 9001"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="code">Codice *</Label>
              <Input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                required
                maxLength={20}
                placeholder="es. ISO"
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="description">Descrizione *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                maxLength={500}
                placeholder="Descrivi la certificazione..."
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="display_order">Ordine di visualizzazione</Label>
              <Input
                type="number"
                id="display_order"
                name="display_order"
                value={formData.display_order}
                onChange={handleInputChange}
                min={0}
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <Checkbox
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                />
                Certificazione attiva (visibile al pubblico)
              </Label>
            </FormGroup>

            <ButtonGroup>
              <ActionButton type="button" onClick={handleCloseModal}>
                Annulla
              </ActionButton>
              <ActionButton variant="edit" type="submit" disabled={loading}>
                {loading ? 'Salvataggio...' : editingCertification ? 'Aggiorna' : 'Crea'}
              </ActionButton>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default CertificationsManager;