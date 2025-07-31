import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Plus, Edit, Trash2, Star, User } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Breadcrumb } from "../components/Dashboard/Breadcrumb";
import toast from "react-hot-toast";

interface Review {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

const Container = styled.div`
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ReviewCard = styled.div<{ visible: boolean }>`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s;
  opacity: ${({ visible }) => (visible ? 1 : 0.6)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const AuthorDetails = styled.div`
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
`;

const Rating = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const StarIcon = styled(Star)<{ filled: boolean }>`
  width: 16px;
  height: 16px;
  fill: ${({ filled }) => (filled ? "#fbbf24" : "none")};
  color: #fbbf24;
`;

const ReviewContent = styled.p`
  color: var(--text-primary);
  line-height: 1.6;
  margin: 0 0 1rem;
  font-style: italic;
`;

const ReviewActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusBadge = styled.span<{ visible: boolean }>`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${({ visible }) => (visible ? "#dcfce7" : "#fef3c7")};
  color: ${({ visible }) => (visible ? "#166534" : "#92400e")};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }

  &.edit:hover {
    background: #dbeafe;
    color: #1d4ed8;
  }

  &.delete:hover {
    background: #fee2e2;
    color: #dc2626;
  }
`;

const FormGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const RatingSelector = styled.div`
  display: flex;
  gap: 0.25rem;
  align-items: center;
`;

const RatingButton = styled.button<{ selected: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ selected }) => (selected ? "#fbbf24" : "#d1d5db")};
  transition: color 0.2s;

  &:hover {
    color: #fbbf24;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }

  label {
    font-size: 0.875rem;
    color: var(--text-primary);
    cursor: pointer;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);

  h3 {
    margin: 0 0 0.5rem;
    color: var(--text-primary);
  }

  p {
    margin: 0;
  }
`;

export const ReviewsManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    visible: true,
  });

  // Mock data - in production this would come from API
  useEffect(() => {
    const mockReviews: Review[] = [
      {
        id: "1",
        name: "Mario Rossi",
        role: "Proprietario di Casa",
        content: "Servizio eccellente! KORSVAGEN ha trasformato la nostra casa in un sogno. Professionalità e attenzione ai dettagli incredibili.",
        rating: 5,
        visible: true,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        name: "Giulia Bianchi",
        role: "Architetto",
        content: "Collaborazione fantastica. La loro competenza nelle costruzioni ha permesso di realizzare progetti complessi con risultati straordinari.",
        rating: 5,
        visible: true,
        createdAt: "2024-01-10T15:30:00Z",
        updatedAt: "2024-01-10T15:30:00Z",
      },
      {
        id: "3",
        name: "Andrea Verdi",
        role: "Imprenditore",
        content: "KORSVAGEN ha costruito la sede della mia azienda. Tempi rispettati, qualità eccellente. Consigliatissimi!",
        rating: 4,
        visible: false,
        createdAt: "2024-01-08T09:15:00Z",
        updatedAt: "2024-01-08T09:15:00Z",
      },
    ];

    setReviews(mockReviews);
  }, []);

  const handleOpenModal = (review?: Review) => {
    if (review) {
      setEditingReview(review);
      setFormData({
        name: review.name,
        role: review.role || "",
        content: review.content,
        rating: review.rating,
        visible: review.visible,
      });
    } else {
      setEditingReview(null);
      setFormData({
        name: "",
        role: "",
        content: "",
        rating: 5,
        visible: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReview(null);
    setFormData({
      name: "",
      role: "",
      content: "",
      rating: 5,
      visible: true,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Nome e contenuto sono obbligatori");
      return;
    }

    try {
      if (editingReview) {
        // Update existing review
        const updatedReviews = reviews.map((review) =>
          review.id === editingReview.id
            ? {
                ...review,
                ...formData,
                updatedAt: new Date().toISOString(),
              }
            : review
        );
        setReviews(updatedReviews);
        toast.success("Recensione aggiornata con successo!");
      } else {
        // Add new review
        const newReview: Review = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setReviews([newReview, ...reviews]);
        toast.success("Nuova recensione aggiunta con successo!");
      }

      handleCloseModal();
    } catch (error) {
      toast.error("Errore durante il salvataggio");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Sei sicuro di voler eliminare questa recensione?")) {
      return;
    }

    try {
      setReviews(reviews.filter((review) => review.id !== reviewId));
      toast.success("Recensione eliminata con successo!");
    } catch (error) {
      toast.error("Errore durante l'eliminazione");
    }
  };

  const toggleVisibility = async (reviewId: string) => {
    try {
      const updatedReviews = reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              visible: !review.visible,
              updatedAt: new Date().toISOString(),
            }
          : review
      );
      setReviews(updatedReviews);
      toast.success("Visibilità recensione aggiornata!");
    } catch (error) {
      toast.error("Errore durante l'aggiornamento");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <StarIcon key={index} filled={index < rating} />
    ));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Container>
      <Breadcrumb />

      <Header>
        <Title>Gestione Recensioni</Title>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={16} />
          Nuova Recensione
        </Button>
      </Header>

      {reviews.length === 0 ? (
        <EmptyState>
          <h3>Nessuna recensione</h3>
          <p>Inizia aggiungendo la prima recensione per la homepage</p>
        </EmptyState>
      ) : (
        <ReviewsGrid>
          {reviews.map((review) => (
            <ReviewCard key={review.id} visible={review.visible}>
              <ReviewHeader>
                <AuthorInfo>
                  <Avatar>{getInitials(review.name)}</Avatar>
                  <AuthorDetails>
                    <h3>{review.name}</h3>
                    {review.role && <p>{review.role}</p>}
                  </AuthorDetails>
                </AuthorInfo>
                <Rating>{renderStars(review.rating)}</Rating>
              </ReviewHeader>

              <ReviewContent>"{review.content}"</ReviewContent>

              <ReviewActions>
                <StatusBadge visible={review.visible}>
                  {review.visible ? "Visibile" : "Nascosta"}
                </StatusBadge>
                <ActionButtons>
                  <ActionButton
                    className="edit"
                    onClick={() => handleOpenModal(review)}
                  >
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => toggleVisibility(review.id)}
                  >
                    <User size={16} />
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </ActionButtons>
              </ReviewActions>
            </ReviewCard>
          ))}
        </ReviewsGrid>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingReview ? "Modifica Recensione" : "Nuova Recensione"}
      >
        <FormGrid>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Nome *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome del cliente"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Ruolo / Azienda
            </label>
            <Input
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="Es. Proprietario di Casa, Architetto..."
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Contenuto Recensione *
            </label>
            <TextArea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Scrivi il contenuto della recensione..."
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              Valutazione
            </label>
            <RatingSelector>
              {Array.from({ length: 5 }, (_, index) => (
                <RatingButton
                  key={index}
                  type="button"
                  selected={index < formData.rating}
                  onClick={() => setFormData({ ...formData, rating: index + 1 })}
                >
                  <Star size={20} fill={index < formData.rating ? "#fbbf24" : "none"} />
                </RatingButton>
              ))}
              <span style={{ marginLeft: "0.5rem", color: "var(--text-secondary)" }}>
                {formData.rating} / 5
              </span>
            </RatingSelector>
          </div>

          <CheckboxContainer>
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
            />
            <label htmlFor="visible">Mostra nella homepage</label>
          </CheckboxContainer>

          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={handleCloseModal}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              {editingReview ? "Salva Modifiche" : "Aggiungi Recensione"}
            </Button>
          </div>
        </FormGrid>
      </Modal>
    </Container>
  );
};