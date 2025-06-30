import React from 'react';
import styled from 'styled-components';

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterText>
          © 2025 KORSVAGEN S.R.L. - Tutti i diritti riservati
        </FooterText>
        <FooterSubtext>
          REA: 1071429 | P.IVA/C.F.: 09976601212 | Strada Statale 145, 99 -
          80045 Pompei (NA)
        </FooterSubtext>
      </FooterContent>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background: #2c3e50;
  padding: 2rem;

  @media (max-width: 320px) {
    padding: 1.5rem 1rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const FooterText = styled.p`
  color: #ecf0f1;
  font-size: 0.9rem;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const FooterSubtext = styled.p`
  color: #bdc3c7;
  font-size: 0.8rem;
  margin: 0;
  font-weight: 300;
  word-break: break-word;

  @media (max-width: 320px) {
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;

export default Footer;
