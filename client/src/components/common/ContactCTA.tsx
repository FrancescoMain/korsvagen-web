import React from "react";
import styled from "styled-components";

interface ContactCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  id?: string;
}

const ContactCTA: React.FC<ContactCTAProps> = ({
  title = "Contattaci",
  subtitle = "Hai un progetto in mente? Compila il form sottostante per ricevere un preventivo gratuito e senza impegno.",
  buttonText = "Richiedi Preventivo",
  id = "contact-form",
}) => {
  return (
    <ContactSection id={id}>
      <ContactContainer>
        <ContactTitle>{title}</ContactTitle>
        <ContactSubtitle>{subtitle}</ContactSubtitle>

        <ContactForm>
          <ContactRow>
            <ContactInput type="text" placeholder="Nome e Cognome" required />
            <ContactInput type="email" placeholder="Email" required />
          </ContactRow>
          <ContactRow>
            <ContactInput type="tel" placeholder="Telefono" required />
            <ContactInput type="text" placeholder="Azienda (opzionale)" />
          </ContactRow>
          <ContactTextarea placeholder="Messaggio" rows={4} required />
          <ContactSubmit type="submit">{buttonText}</ContactSubmit>
        </ContactForm>
      </ContactContainer>
    </ContactSection>
  );
};

const ContactSection = styled.section`
  background: #1a1a1a;
  color: #ffffff;
  padding: 100px 0;

  @media (max-width: 768px) {
    padding: 80px 0;
  }

  @media (max-width: 480px) {
    padding: 60px 0;
  }
`;

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const ContactTitle = styled.h2`
  font-size: 3.5rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 20px;
  color: #ffffff;
  font-family: "Korsvagen Brand", "Times New Roman", serif;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const ContactSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 60px;
  color: #cccccc;
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 50px;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 40px;
  }
`;

const ContactForm = styled.form`
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;

  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const ContactRow = styled.div`
  display: flex;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const ContactInput = styled.input`
  flex: 1;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  font-family: "Inter", "Segoe UI", sans-serif;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 480px) {
    padding: 16px 18px;
    font-size: 0.95rem;
  }
`;

const ContactTextarea = styled.textarea`
  width: 100%;
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 1rem;
  font-family: "Inter", "Segoe UI", sans-serif;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
  }

  &:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 480px) {
    padding: 16px 18px;
    font-size: 0.95rem;
    min-height: 100px;
  }
`;

const ContactSubmit = styled.button`
  background: #ffffff;
  color: #1a1a1a;
  padding: 18px 40px;
  border: 2px solid #ffffff;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-family: "Inter", "Segoe UI", sans-serif;
  margin-top: 20px;

  &:hover {
    background: transparent;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 16px 35px;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    padding: 14px 30px;
    font-size: 0.95rem;
    width: 100%;
  }
`;

export default ContactCTA;
