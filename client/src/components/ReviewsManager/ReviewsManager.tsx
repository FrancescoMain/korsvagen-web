/**
 * REVIEWS MANAGER - Gestione Recensioni Dashboard
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useReviews, type Review, type ReviewFormData } from "../../hooks/useReviews";
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
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
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

const ReviewCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ReviewInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.h3`
  margin: 0 0 0.25rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const Company = styled.p`
  margin: 0;
  color: #666;
  font-size: 0.9rem;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0.5rem 0;
`;

const Star = styled.span<{ filled: boolean }>`
  color: ${props => props.filled ? '#d4af37' : '#ddd'};
  font-size: 1.2rem;
`;

const ReviewText = styled.p`
  color: #555;
  line-height: 1.6;
  margin: 1rem 0;
`;

const ReviewActions = styled.div`
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

const Select = styled.select`
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

const ReviewsManager: React.FC = () => {
  const {
    reviews,
    loading,
    error,
    fetchReviews,
    createReview,
    updateReview,
    deleteReview,
  } = useReviews();

  // Stati per il modal
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState<ReviewFormData>({
    author_name: '',
    author_company: '',
    review_text: '',
    rating: 5,
    is_active: true,
    display_order: 0,
  });

  // Carica recensioni al mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Reset form quando chiude il modal
  const resetForm = () => {
    setFormData({
      author_name: '',
      author_company: '',
      review_text: '',
      rating: 5,
      is_active: true,
      display_order: 0,
    });
    setEditingReview(null);
  };

  // Apri modal per nuova recensione
  const handleAddReview = () => {
    resetForm();
    setShowModal(true);
  };

  // Apri modal per modifica recensione
  const handleEditReview = (review: Review) => {
    setFormData({
      author_name: review.author_name,
      author_company: review.author_company || '',
      review_text: review.review_text,
      rating: review.rating,
      is_active: review.is_active ?? true,
      display_order: review.display_order ?? 0,
    });
    setEditingReview(review);
    setShowModal(true);
  };

  // Chiudi modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Gestione input form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    
    if (editingReview) {
      // Modifica recensione esistente
      const success = await updateReview(editingReview.id, formData);
      if (success) {
        handleCloseModal();
      }
    } else {
      // Crea nuova recensione
      const success = await createReview(formData);
      if (success) {
        handleCloseModal();
      }
    }
  };

  // Elimina recensione
  const handleDeleteReview = async (id: string, authorName: string) => {
    if (window.confirm(`Sei sicuro di voler eliminare la recensione di ${authorName}?`)) {
      await deleteReview(id);
    }
  };

  // Render stelle rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} filled={i < rating}>★</Star>
    ));
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
        <Title>Gestione Recensioni ({reviews.length})</Title>
        <AddButton onClick={handleAddReview} disabled={loading}>
          + Aggiungi Recensione
        </AddButton>
      </Header>

      {error && (
        <div style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div>
        {reviews.map(review => (
          <ReviewCard key={review.id}>
            <ReviewHeader>
              <ReviewInfo>
                <AuthorName>{review.author_name}</AuthorName>
                {review.author_company && <Company>{review.author_company}</Company>}
                <Rating>{renderStars(review.rating)}</Rating>
              </ReviewInfo>
              <div>
                <StatusBadge active={review.is_active ?? true}>
                  {review.is_active ? 'Attiva' : 'Inattiva'}
                </StatusBadge>
              </div>
            </ReviewHeader>
            
            <ReviewText>{review.review_text}</ReviewText>
            
            <ReviewActions>
              <ActionButton 
                variant="edit" 
                onClick={() => handleEditReview(review)}
                disabled={loading}
              >
                Modifica
              </ActionButton>
              <ActionButton 
                variant="delete" 
                onClick={() => handleDeleteReview(review.id, review.author_name)}
                disabled={loading}
              >
                Elimina
              </ActionButton>
              {review.display_order !== undefined && (
                <span style={{ marginLeft: 'auto', color: '#666', fontSize: '0.9rem' }}>
                  Ordine: {review.display_order}
                </span>
              )}
            </ReviewActions>
          </ReviewCard>
        ))}
      </div>

      {reviews.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>Nessuna recensione presente.</p>
          <AddButton onClick={handleAddReview}>
            Crea la prima recensione
          </AddButton>
        </div>
      )}

      {/* Modal per creazione/modifica recensione */}
      <Modal show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingReview ? 'Modifica Recensione' : 'Nuova Recensione'}
            </ModalTitle>
            <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
          </ModalHeader>

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="author_name">Nome Autore *</Label>
              <Input
                type="text"
                id="author_name"
                name="author_name"
                value={formData.author_name}
                onChange={handleInputChange}
                required
                maxLength={100}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="author_company">Azienda (opzionale)</Label>
              <Input
                type="text"
                id="author_company"
                name="author_company"
                value={formData.author_company}
                onChange={handleInputChange}
                maxLength={150}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="review_text">Testo Recensione *</Label>
              <Textarea
                id="review_text"
                name="review_text"
                value={formData.review_text}
                onChange={handleInputChange}
                required
                maxLength={1000}
                placeholder="Scrivi qui la recensione..."
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="rating">Valutazione *</Label>
              <Select
                id="rating"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                required
              >
                <option value={5}>5 stelle - Eccellente</option>
                <option value={4}>4 stelle - Molto buono</option>
                <option value={3}>3 stelle - Buono</option>
                <option value={2}>2 stelle - Sufficiente</option>
                <option value={1}>1 stella - Insufficiente</option>
              </Select>
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
                Recensione attiva (visibile al pubblico)
              </Label>
            </FormGroup>

            <ButtonGroup>
              <ActionButton type="button" onClick={handleCloseModal}>
                Annulla
              </ActionButton>
              <ActionButton variant="edit" type="submit" disabled={loading}>
                {loading ? 'Salvataggio...' : editingReview ? 'Aggiorna' : 'Crea'}
              </ActionButton>
            </ButtonGroup>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ReviewsManager;