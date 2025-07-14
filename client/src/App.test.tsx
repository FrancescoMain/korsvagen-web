import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Korsvagen work in progress page', () => {
  render(<App />);
  
  // Test that main elements are rendered
  const constructionTitle = screen.getByText(/sito in costruzione/i);
  const companyTagline = screen.getByText(/costruzioni & progettazione/i);
  const projectsTitle = screen.getByText(/i nostri lavori in corso/i);
  const copyrightText = screen.getByText(/© 2025 korsvagen s\.r\.l\./i);
  
  expect(constructionTitle).toBeInTheDocument();
  expect(companyTagline).toBeInTheDocument();
  expect(projectsTitle).toBeInTheDocument();
  expect(copyrightText).toBeInTheDocument();
});

test('renders contact information', () => {
  render(<App />);
  
  // Test contact elements - use more specific text to avoid duplicates
  const emailContact = screen.getByText(/korsvagensrl@gmail\.com/i);
  const phoneContact = screen.getByText(/\+39 334 178 4609/i);
  const addressContact = screen.getByText(/Via Santa Maria la Carità 18 - Scafati \(SA\)/i);
  const vatNumber = screen.getByText(/P\.IVA: 09976601212/i);
  
  expect(emailContact).toBeInTheDocument();
  expect(phoneContact).toBeInTheDocument();
  expect(addressContact).toBeInTheDocument();
  expect(vatNumber).toBeInTheDocument();
});
