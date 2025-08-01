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
  } = useReviews();

  // Carica recensioni al mount
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

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
      </Header>

      {error && (
        <div style={{ color: 'red', padding: '1rem', background: '#ffebee', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div>
        <p>Recensioni caricate: {reviews.length}</p>
        {reviews.map(review => (
          <div key={review.id} style={{ padding: '1rem', border: '1px solid #ddd', marginBottom: '1rem', borderRadius: '8px' }}>
            <h3>{review.author_name}</h3>
            <p>{review.review_text}</p>
            <p>Rating: {review.rating}/5</p>
          </div>
        ))}
      </div>

      {reviews.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <p>Nessuna recensione presente.</p>
        </div>
      )}
    </Container>
  );
};

export default ReviewsManager;