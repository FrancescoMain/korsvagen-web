import React from 'react';
import styled from 'styled-components';

const ContactsSection: React.FC = () => {
  return (
    <ContactsContainer>
      <ContactsContent>
        <ContactItem>
          <ContactIcon>📧</ContactIcon>
          <ContactInfo>korsvagensrl@arubapec.it</ContactInfo>
        </ContactItem>
        <ContactItem>
          <ContactIcon>📞</ContactIcon>
          <ContactInfo>+39 334 178 4609</ContactInfo>
        </ContactItem>
        <ContactItem>
          <ContactIcon>📍</ContactIcon>
          <ContactInfo>Strada Statale 145, 99 - Pompei (NA)</ContactInfo>
        </ContactItem>
        <ContactItem>
          <ContactIcon>🏢</ContactIcon>
          <ContactInfo>P.IVA: 09976601212</ContactInfo>
        </ContactItem>
      </ContactsContent>
    </ContactsContainer>
  );
};

const ContactsContainer = styled.section`
  background: #ecf0f1;
  padding: 3rem 2rem;

  @media (max-width: 320px) {
    padding: 2rem 1rem;
  }
`;

const ContactsContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;

  @media (max-width: 768px) {
    justify-content: flex-start;
  }
`;

const ContactIcon = styled.span`
  font-size: 1.5rem;
`;

const ContactInfo = styled.span`
  font-size: 1.1rem;
  color: #2c3e50;
  font-weight: 500;
  word-break: break-word;

  @media (max-width: 320px) {
    font-size: 1rem;
  }
`;

export default ContactsSection;
