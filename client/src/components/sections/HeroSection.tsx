import React from 'react';
import styled from 'styled-components';

const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <HeroContent>
        <ConstructionIcon>🏗️</ConstructionIcon>
        <MainTitle>SITO IN COSTRUZIONE</MainTitle>
        <HeroSubtitle>
          Stiamo costruendo qualcosa di straordinario
          <br />
          per mostrarvi i nostri progetti
        </HeroSubtitle>
        <CTAButton
          href="https://www.instagram.com/korsvagensrl/"
          target="_blank"
          rel="noopener noreferrer"
        >
          SEGUICI SU INSTAGRAM
        </CTAButton>
      </HeroContent>
    </HeroContainer>
  );
};

const HeroContainer = styled.section`
  background: linear-gradient(135deg, #ecf0f1 0%, #ffffff 100%);
  padding: 4rem 2rem;
  text-align: center;

  @media (max-width: 320px) {
    padding: 3rem 1rem;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 320px) {
    margin: 0 auto;
    text-align: center;
  }
`;

const ConstructionIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 1.5rem;
  }
`;

const MainTitle = styled.h2`
  font-family: "Montserrat", sans-serif;
  font-size: 3.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: 1px;
  }

  @media (max-width: 320px) {
    font-size: 2rem;
    letter-spacing: 0.5px;
    word-break: break-word;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  color: #34495e;
  line-height: 1.6;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const CTAButton = styled.a`
  background: #e67e22;
  color: #ffffff;
  border: none;
  padding: 1rem 2.5rem;
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  box-shadow: 0 5px 20px rgba(230, 126, 34, 0.3);
  text-decoration: none;
  display: inline-block;

  &:hover {
    background: #d35400;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(230, 126, 34, 0.4);
    color: #ffffff;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 2rem;
    font-size: 0.9rem;
  }

  @media (max-width: 320px) {
    margin: 0 auto;
    display: block;
    text-align: center;
    width: fit-content;
  }
`;

export default HeroSection;
