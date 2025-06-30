import React from "react";
import styled from "styled-components";

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <LogoSection>
          <LogoImage src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
          <BrandInfo>
            <CompanyName>KORSVAGEN</CompanyName>
            <Tagline>Costruzioni & Progettazione</Tagline>
          </BrandInfo>
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

  @media (max-width: 320px) {
    padding: 1rem 1rem;
  }

  @media (max-width: 300px) {
    padding: 0.8rem 0.5rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    justify-content: center;
    text-align: center;
  }

  @media (max-width: 300px) {
    flex-direction: column;
    gap: 0.8rem;
    justify-content: center;
    text-align: center;
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

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 300px) {
    align-items: center;
    text-align: center;
  }
`;

const CompanyName = styled.h1`
  font-family: "Montserrat", sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }

  @media (max-width: 320px) {
    font-size: 1.5rem;
    letter-spacing: 0.5px;
  }

  @media (max-width: 300px) {
    font-size: 1.3rem;
    letter-spacing: 0.3px;
    line-height: 1.2;
  }
`;

const Tagline = styled.span`
  font-family: "Open Sans", sans-serif;
  font-size: 1rem;
  color: #e67e22;
  font-weight: 500;
  margin-top: 0.3rem;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  @media (max-width: 300px) {
    font-size: 0.8rem;
    letter-spacing: 0.2px;
    margin-top: 0.2rem;
  }
`;

export default Header;
