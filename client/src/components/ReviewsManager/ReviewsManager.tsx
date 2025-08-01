/**
 * REVIEWS MANAGER - Gestione Recensioni Dashboard
 *
 * Componente per la gestione completa delle recensioni
 * clienti dall'interfaccia amministrativa.
 *
 * Features:
 * - Lista recensioni con paginazione
 * - Creazione nuove recensioni
 * - Modifica recensioni esistenti
 * - Eliminazione recensioni
 * - Gestione visibilità e ordine
 * - Anteprima stelle rating
 *
 * @author KORSVAGEN S.R.L.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useReviews, Review, ReviewFormData } from "../../hooks/useReviews";
import toast from "react-hot-toast";

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
  margin: 0;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  }
`;

const ReviewsGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReviewCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.h3`
  color: #333;
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
`;

const AuthorCompany = styled.p`
  color: #666;
  margin: 0;
  font-size: 0.9rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' | 'toggle' }>`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  ${props => {
    switch (props.variant) {
      case 'edit':
        return `
          background: #4CAF50;
          color: white;
          &:hover { background: #45a049; }
        `;
      case 'delete':
        return `
          background: #f44336;
          color: white;
          &:hover { background: #da190b; }
        `;
      case 'toggle':
        return `
          background: #2196F3;
          color: white;
          &:hover { background: #0b7dda; }
        `;
      default:
        return `
          background: #666;
          color: white;
          &:hover { background: #555; }
        `;
    }
  }}
`;

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => props.active ? `
    background: #d4edda;
    color: #155724;
  ` : `
    background: #f8d7da;
    color: #721c24;
  `}
`;

const StarRating = styled.div`
  display: flex;
  gap: 0.2rem;
  margin: 0.5rem 0;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? '#ffc107' : '#e0e0e0'};
  font-size: 1.2rem;
`;

const ReviewText = styled.p`
  color: #555;
  line-height: 1.6;
  margin: 1rem 0;
`;

const DisplayOrder = styled.span`
  background: #f5f5f5;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #f5c6cb;
`;

// Modal per form recensioni
const Modal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  
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

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: linear-gradient(135deg, #b8941f, #a67c1a);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background: #5a6268;
  }
`;

const ReviewsManager: React.FC = () => {
  const {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview
  } = useReviews();

  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    author_name: '',
    author_company: '',
    review_text: '',
    rating: 5,
    is_active: true,
    display_order: 0
  });

  // Carica recensioni al mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset form
  const resetForm = () => {
    setFormData({
      author_name: '',
      author_company: '',
      review_text: '',
      rating: 5,
      is_active: true,
      display_order: 0
    });
    setEditingReview(null);
  };

  // Apri modal per nuova recensione
  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  // Apri modal per modifica
  const handleEdit = (review: Review) => {
    setFormData({
      author_name: review.author_name,
      author_company: review.author_company || '',
      review_text: review.review_text,
      rating: review.rating,
      is_active: review.is_active ?? true,
      display_order: review.display_order ?? 0
    });
    setEditingReview(review);
    setShowModal(true);
  };

  // Elimina recensione
  const handleDelete = async (review: Review) => {
    if (window.confirm(`Sei sicuro di voler eliminare la recensione di ${review.author_name}?`)) {
      await deleteReview(review.id);
    }
  };

  // Toggle attivazione
  const handleToggleActive = async (review: Review) => {
    await updateReview(review.id, {
      is_active: !review.is_active
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let success = false;
    if (editingReview) {
      success = await updateReview(editingReview.id, formData);
    } else {
      success = await createReview(formData);
    }
    
    if (success) {
      setShowModal(false);
      resetForm();
    }
  };

  // Render stelle
  const renderStars = (rating: number) => {
    return (
      <StarRating>
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} filled={star <= rating}>
            ★
          </Star>
        ))}
      </StarRating>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <Container>
        <LoadingSpinner>Caricamento recensioni...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Gestione Recensioni</Title>
        <AddButton onClick={handleAddNew}>
          + Nuova Recensione
        </AddButton>
      </Header>

      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}

      <ReviewsGrid>
        {reviews.map(review => (
          <ReviewCard key={review.id}>
            <ReviewHeader>
              <AuthorInfo>
                <AuthorName>{review.author_name}</AuthorName>
                {review.author_company && (
                  <AuthorCompany>{review.author_company}</AuthorCompany>
                )}
              </AuthorInfo>
              <Actions>
                <StatusBadge active={review.is_active ?? true}>
                  {review.is_active ? 'Attiva' : 'Nascosta'}
                </StatusBadge>
                <DisplayOrder>Ordine: {review.display_order || 0}</DisplayOrder>
              </Actions>
            </ReviewHeader>

            {renderStars(review.rating)}
            
            <ReviewText>{review.review_text}</ReviewText>

            <Actions>
              <ActionButton 
                variant="edit" 
                onClick={() => handleEdit(review)}
              >
                Modifica
              </ActionButton>
              <ActionButton 
                variant="toggle" 
                onClick={() => handleToggleActive(review)}
              >
                {review.is_active ? 'Nascondi' : 'Mostra'}
              </ActionButton>
              <ActionButton 
                variant="delete" 
                onClick={() => handleDelete(review)}
              >
                Elimina
              </ActionButton>
            </Actions>
          </ReviewCard>
        ))}
      </ReviewsGrid>

      {reviews.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>Nessuna recensione presente.</p>
          <AddButton onClick={handleAddNew}>
            Crea la prima recensione
          </AddButton>
        </div>
      )}

      {/* Modal Form */}
      <Modal show={showModal}>
        <ModalContent>
          <h2>{editingReview ? 'Modifica Recensione' : 'Nuova Recensione'}</h2>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Nome Autore *</Label>
              <Input
                type="text"
                value={formData.author_name}
                onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                required
                placeholder="Mario Rossi"
              />
            </FormGroup>

            <FormGroup>
              <Label>Azienda / Ruolo</Label>
              <Input
                type="text"
                value={formData.author_company}
                onChange={(e) => setFormData(prev => ({ ...prev, author_company: e.target.value }))}
                placeholder="Architetto, Cliente privato, ecc."
              />
            </FormGroup>

            <FormGroup>
              <Label>Testo Recensione *</Label>
              <TextArea
                value={formData.review_text}
                onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
                required
                placeholder="Scrivi qui il contenuto della recensione..."
              />
            </FormGroup>

            <FormGroup>
              <Label>Valutazione *</Label>
              <Select
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
                required
              >
                <option value={5}>5 stelle - Eccellente</option>
                <option value={4}>4 stelle - Molto buono</option>
                <option value={3}>3 stelle - Buono</option>
                <option value={2}>2 stelle - Discreto</option>
                <option value={1}>1 stella - Insufficiente</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Ordine di visualizzazione</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                min="0"
                placeholder="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  style={{ marginRight: '0.5rem' }}
                />
                Recensione attiva (visibile nel sito)
              </Label>
            </FormGroup>

            <FormActions>
              <CancelButton 
                type="button" 
                onClick={() => setShowModal(false)}
              >
                Annulla
              </CancelButton>
              <SubmitButton 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Salvataggio...' : (editingReview ? 'Aggiorna' : 'Crea')}
              </SubmitButton>
            </FormActions>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ReviewsManager;