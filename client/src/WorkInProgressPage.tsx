import React from "react";
import styled from "styled-components";
import InstagramWall from "./components/common/InstagramWall";

const WorkInProgressPage: React.FC = () => {
  return (
    <Container>
      <Header>
        <HeaderContent>
          <LogoSection>
            <LogoImage src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
            <BrandInfo>
              <CompanyName>KORSVAGEN</CompanyName>
              <Tagline>Costruzioni & Progettazione</Tagline>
            </BrandInfo>
          </LogoSection>
        </HeaderContent>
      </Header>

      <HeroSection>
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
      </HeroSection>

      <ProjectsSection>
        <SectionContent>
          <SectionTitle>I Nostri Lavori in Corso</SectionTitle>
          <InstagramWall />
          <InstagramCTA
            href="https://www.instagram.com/korsvagensrl/"
            target="_blank"
            rel="noopener noreferrer"
          >
            FOLLOW US ON INSTAGRAM
          </InstagramCTA>
          <InstagramHandle>
            Seguici su @korsvagensrl per i nostri lavori in tempo reale
          </InstagramHandle>
        </SectionContent>
      </ProjectsSection>

      <ContactsSection>
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
      </ContactsSection>

      <Footer>
        <FooterContent>
          <FooterText>
            © 2025 KORSVAGEN S.R.L. - Tutti i diritti riservati
          </FooterText>
          <FooterSubtext>
            REA: 1071429 | P.IVA/C.F.: 09976601212 | Strada Statale 145, 99 -
            80045 Pompei (NA)
          </FooterSubtext>
        </FooterContent>
      </Footer>
    </Container>
  );
};

// Styled Components con palette edilizia moderna
const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #2c3e50;
  font-family: "Open Sans", sans-serif;
  overflow-x: hidden;
  width: 100%;
`;

const Header = styled.header`
  background: #ffffff;
  box-shadow: 0 2px 20px rgba(44, 62, 80, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;

  @media (max-width: 320px) {
    padding: 1rem 1rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 45px;
  }
`;

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;
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
`;

const HeroSection = styled.section`
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
  text-align: center;

  @media (max-width: 320px) {
    padding: 0 0.5rem;
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
    padding: 0.8rem 1.5rem;
    font-size: 0.8rem;
    margin: 2rem auto;
    display: block;
    text-align: center;
    width: fit-content;
  }
`;

const ProjectsSection = styled.section`
  padding: 5rem 2rem;
  background: #ffffff;

  @media (max-width: 320px) {
    padding: 3rem 1rem;
  }
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;

  @media (max-width: 320px) {
    padding: 0 0.5rem;
  }
`;

const SectionTitle = styled.h3`
  font-family: "Montserrat", sans-serif;
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const InstagramCTA = styled.a`
  display: inline-block;
  background: transparent;
  color: #e67e22;
  border: 2px solid #e67e22;
  padding: 1rem 2.5rem;
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  margin: 2rem auto;
  display: block;
  width: fit-content;

  &:hover {
    background: #e67e22;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(230, 126, 34, 0.3);
  }

  @media (max-width: 768px) {
    padding: 0.8rem 2rem;
    font-size: 0.9rem;
  }

  @media (max-width: 320px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.8rem;
    margin: 2rem auto;
    text-align: center;
    width: fit-content;
  }
`;

const InstagramHandle = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #7f8c8d;
  margin-top: 1rem;
  font-weight: 500;

  @media (max-width: 320px) {
    font-size: 1rem;
    padding: 0 0.5rem;
    line-height: 1.4;
  }
`;

const ContactsSection = styled.section`
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

const Footer = styled.footer`
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

export default WorkInProgressPage;
