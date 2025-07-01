import React from "react";
import styled from "styled-components";

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <LogoImage src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
          <Tagline>Costruzioni & Progettazione</Tagline>
        </LogoSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background: #ffffff;
  box-shadow: 0 2px 20px rgba(44, 62, 80, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;

  @media (max-width: 300px) {
    min-height: auto;
  }
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 320px) {
    padding: 1rem 1rem;
  }

  @media (max-width: 300px) {
    padding: 0.8rem 0.5rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  text-align: center;

  @media (max-width: 300px) {
    gap: 0.3rem;
  }
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 45px;
  }

  @media (max-width: 300px) {
    height: 35px;
  }
`;

const Tagline = styled.span`
  font-family: "Open Sans", sans-serif;
  font-size: 1rem;
  color: #e67e22;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  @media (max-width: 300px) {
    font-size: 0.8rem;
    letter-spacing: 0.2px;
  }
`;

export default Header;
