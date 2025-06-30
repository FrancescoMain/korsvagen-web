import React from "react";
import styled from "styled-components";

const HeroSection: React.FC = () => {
  return (
    <HeroContainer>
      <HeroContent>
        <ConstructionIcon>🏗️</ConstructionIcon>
        <MainTitle>SITO IN COSTRUZIONE</MainTitle>
        <HeroSubtitle>
          Stiamo realizzando qualcosa di straordinario
          <br />
          per mostrarvi i nostri progetti
        </HeroSubtitle>
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

  @media (max-width: 300px) {
    padding: 2rem 0.5rem;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 320px) {
    margin: 0 auto;
    text-align: center;
  }

  @media (max-width: 300px) {
    margin: 0 auto;
    text-align: center;
    padding: 0 0.2rem;
  }
`;

const ConstructionIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 300px) {
    font-size: 2.5rem;
    margin-bottom: 1rem;
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

  @media (max-width: 300px) {
    font-size: 1.6rem;
    letter-spacing: 0.2px;
    line-height: 1.3;
    margin-bottom: 1rem;
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

  @media (max-width: 300px) {
    font-size: 1rem;
    line-height: 1.4;
    margin-bottom: 1.5rem;
    padding: 0 0.2rem;
  }
`;

export default HeroSection;
