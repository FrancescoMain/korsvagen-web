/**
 * POLICIES MANAGER - Gestione Politiche Aziendali Dashboard
 *
 * Componente per la gestione CRUD delle politiche aziendali
 * Include upload documenti PDF e gestione categorie
 *
 * @author KORSVAGEN S.R.L.
 */

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { usePolicies, type Policy, type PolicyFormData, POLICY_CATEGORIES } from "../../hooks/usePolicies";
import { FileText, Upload, Trash2, Edit, Plus, ExternalLink, Download } from "lucide-react";

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
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h2`
  color: #333;
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const AddButton = styled.button`
  background: #d4af37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const PolicyCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const PolicyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PolicyInfo = styled.div`
  flex: 1;
`;

const CategoryBadge = styled.span<{ category: string }>`
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  ${props => {
    switch(props.category) {
      case 'quality': return 'background: #e3f2fd; color: #1565c0;';
      case 'environment': return 'background: #e8f5e9; color: #2e7d32;';
      case 'safety': return 'background: #fff3e0; color: #ef6c00;';
      case 'anticorruption': return 'background: #fce4ec; color: #c2185b;';
      case 'gender_equality': return 'background: #f3e5f5; color: #7b1fa2;';
      default: return 'background: #eceff1; color: #546e7a;';
    }
  }}
`;

const PolicyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const PolicyDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0.5rem 0;
  font-size: 0.95rem;
`;

const PolicyMeta = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
  font-size: 0.85rem;
  color: #888;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatusBadge = styled.span<{ published: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  ${props => props.published ? `
    background: #e8f5e8;
    color: #2e7d32;
  ` : `
    background: #ffebee;
    color: #d32f2f;
  `}
`;

const DocumentSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
`;

const DocumentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DocumentLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const IconButton = styled.button<{ variant?: 'edit' | 'delete' | 'upload' | 'download' }>`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  ${props => {
    switch(props.variant) {
      case 'edit': return 'background: #e3f2fd; color: #1976d2; &:hover { background: #bbdefb; }';
      case 'delete': return 'background: #ffebee; color: #d32f2f; &:hover { background: #ffcdd2; }';
      case 'upload': return 'background: #e8f5e9; color: #2e7d32; &:hover { background: #c8e6c9; }';
      case 'download': return 'background: #fff3e0; color: #ef6c00; &:hover { background: #ffe0b2; }';
      default: return 'background: #f5f5f5; color: #666; &:hover { background: #e0e0e0; }';
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
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
  gap: 1.25rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: white;

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
  width: 18px;
  height: 18px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;

  ${props => props.variant === 'primary' ? `
    background: #d4af37;
    color: white;
    &:hover { background: #b8941f; }
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

const UploadZone = styled.div<{ isDragging?: boolean }>`
  border: 2px dashed ${props => props.isDragging ? '#d4af37' : '#ccc'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isDragging ? 'rgba(212, 175, 55, 0.1)' : '#fafafa'};

  &:hover {
    border-color: #d4af37;
    background: rgba(212, 175, 55, 0.05);
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const PoliciesManager: React.FC = () => {
  const {
    policies,
    loading,
    error,
    uploading,
    fetchPolicies,
    createPolicy,
    updatePolicy,
    deletePolicy,
    uploadDocument,
    deleteDocument,
  } = usePolicies();

  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [uploadingPolicyId, setUploadingPolicyId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<PolicyFormData>({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: 'general',
    is_published: true,
    display_order: 0,
    effective_date: '',
    revision_date: '',
    revision_number: '',
  });

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: 'general',
      is_published: true,
      display_order: 0,
      effective_date: '',
      revision_date: '',
      revision_number: '',
    });
    setEditingPolicy(null);
  };

  const handleAddPolicy = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditPolicy = (policy: Policy) => {
    setFormData({
      title: policy.title,
      slug: policy.slug,
      description: policy.description || '',
      content: policy.content || '',
      category: policy.category,
      is_published: policy.is_published ?? true,
      display_order: policy.display_order ?? 0,
      effective_date: policy.effective_date || '',
      revision_date: policy.revision_date || '',
      revision_number: policy.revision_number || '',
    });
    setEditingPolicy(policy);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = { ...formData };
    // Rimuovi campi vuoti
    if (!dataToSend.effective_date) delete dataToSend.effective_date;
    if (!dataToSend.revision_date) delete dataToSend.revision_date;

    if (editingPolicy) {
      const success = await updatePolicy(editingPolicy.id, dataToSend);
      if (success) handleCloseModal();
    } else {
      const success = await createPolicy(dataToSend);
      if (success) handleCloseModal();
    }
  };

  const handleDeletePolicy = async (id: string, title: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare la policy "${title}"? Questa azione eliminera anche il documento associato.`)) {
      await deletePolicy(id);
    }
  };

  const handleFileSelect = async (policyId: string, file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Solo file PDF sono permessi');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      alert('Il file non puo superare i 15MB');
      return;
    }

    setUploadingPolicyId(policyId);
    await uploadDocument(policyId, file);
    setUploadingPolicyId(null);
  };

  const handleUploadClick = (policyId: string) => {
    setUploadingPolicyId(policyId);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingPolicyId) {
      await handleFileSelect(uploadingPolicyId, file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteDocument = async (policyId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare il documento?')) {
      await deleteDocument(policyId);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading && policies.length === 0) {
    return <LoadingSpinner>Caricamento politiche aziendali...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>
          <FileText size={24} />
          Politiche Aziendali ({policies.length})
        </Title>
        <AddButton onClick={handleAddPolicy} disabled={loading}>
          <Plus size={18} />
          Aggiungi Policy
        </AddButton>
      </Header>

      {error && (
        <div style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileInputChange}
      />

      <div>
        {policies.map(policy => (
          <PolicyCard key={policy.id}>
            <PolicyHeader>
              <PolicyInfo>
                <CategoryBadge category={policy.category}>
                  {POLICY_CATEGORIES[policy.category] || policy.category}
                </CategoryBadge>
                <PolicyTitle>{policy.title}</PolicyTitle>
                {policy.description && (
                  <PolicyDescription>{policy.description}</PolicyDescription>
                )}
                <PolicyMeta>
                  {policy.revision_number && (
                    <MetaItem>Revisione: {policy.revision_number}</MetaItem>
                  )}
                  {policy.effective_date && (
                    <MetaItem>In vigore dal: {new Date(policy.effective_date).toLocaleDateString('it-IT')}</MetaItem>
                  )}
                  <MetaItem>Ordine: {policy.display_order}</MetaItem>
                </PolicyMeta>
              </PolicyInfo>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <StatusBadge published={policy.is_published ?? true}>
                  {policy.is_published ? 'Pubblicata' : 'Bozza'}
                </StatusBadge>
                <ActionButtons>
                  <IconButton
                    variant="edit"
                    onClick={() => handleEditPolicy(policy)}
                    title="Modifica"
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    variant="upload"
                    onClick={() => handleUploadClick(policy.id)}
                    disabled={uploading && uploadingPolicyId === policy.id}
                    title="Carica documento"
                  >
                    <Upload size={18} />
                  </IconButton>
                  <IconButton
                    variant="delete"
                    onClick={() => handleDeletePolicy(policy.id, policy.title)}
                    disabled={loading}
                    title="Elimina"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </ActionButtons>
              </div>
            </PolicyHeader>

            {policy.document_url && (
              <DocumentSection>
                <DocumentInfo>
                  <DocumentLink href={policy.document_url} target="_blank" rel="noopener noreferrer">
                    <FileText size={18} />
                    Documento PDF
                    <ExternalLink size={14} />
                  </DocumentLink>
                  {policy.file_size && (
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>
                      ({formatFileSize(policy.file_size)})
                    </span>
                  )}
                  <IconButton
                    variant="delete"
                    onClick={() => handleDeleteDocument(policy.id)}
                    disabled={uploading}
                    title="Elimina documento"
                    style={{ marginLeft: 'auto' }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </DocumentInfo>
              </DocumentSection>
            )}

            {!policy.document_url && (
              <DocumentSection>
                <UploadZone
                  onClick={() => handleUploadClick(policy.id)}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) handleFileSelect(policy.id, file);
                  }}
                  isDragging={isDragging}
                >
                  {uploading && uploadingPolicyId === policy.id ? (
                    <span>Caricamento in corso...</span>
                  ) : (
                    <>
                      <Upload size={24} style={{ marginBottom: '0.5rem', color: '#888' }} />
                      <p style={{ margin: 0, color: '#666' }}>
                        Clicca o trascina un PDF per caricare il documento
                      </p>
                    </>
                  )}
                </UploadZone>
              </DocumentSection>
            )}
          </PolicyCard>
        ))}
      </div>

      {policies.length === 0 && !loading && (
        <EmptyState>
          <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <p>Nessuna policy presente.</p>
          <AddButton onClick={handleAddPolicy}>
            Crea la prima policy
          </AddButton>
        </EmptyState>
      )}

      {/* Modal Form */}
      <Modal show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingPolicy ? 'Modifica Policy' : 'Nuova Policy'}
            </ModalTitle>
            <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="title">Titolo *</Label>
              <Input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength={200}
                placeholder="es. Politica della Qualita"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {Object.entries(POLICY_CATEGORIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="revision_number">Numero Revisione</Label>
                <Input
                  type="text"
                  id="revision_number"
                  name="revision_number"
                  value={formData.revision_number}
                  onChange={handleInputChange}
                  placeholder="es. Ed. 1, Rev. 2"
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label htmlFor="description">Descrizione</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={1000}
                placeholder="Breve descrizione della policy..."
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label htmlFor="effective_date">Data Entrata in Vigore</Label>
                <Input
                  type="date"
                  id="effective_date"
                  name="effective_date"
                  value={formData.effective_date}
                  onChange={handleInputChange}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="display_order">Ordine Visualizzazione</Label>
                <Input
                  type="number"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  min={0}
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleInputChange}
                />
                Pubblica (visibile al pubblico)
              </CheckboxLabel>
            </FormGroup>

            <ButtonGroup>
              <Button type="button" onClick={handleCloseModal}>
                Annulla
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Salvataggio...' : editingPolicy ? 'Aggiorna' : 'Crea'}
              </Button>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default PoliciesManager;
