import React from 'react';
import styled from 'styled-components';
import InstagramWall from './InstagramWall';

const WorkInProgressPage: React.FC = () => {
  return (
    <Container>
      <Header>
        <HeaderContent>
          <LogoSection>
            <LogoImage src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
            <BrandInfo>
              <CompanyName>KORSVAGEN</CompanyName>
              <Tagline>Costruzioni & Sviluppo</Tagline>
            </BrandInfo>
          </LogoSection>
        </HeaderContent>
      </Header>

      <HeroSection>
        <HeroContent>
          <ConstructionIcon>🏗️</ConstructionIcon>
          <MainTitle>SITO IN COSTRUZIONE</MainTitle>
          <HeroSubtitle>
            Stiamo costruendo qualcosa di straordinario<br />
            per mostrarvi i nostri progetti
          </HeroSubtitle>
          <CTAButton>
            TORNA PRESTO PER SCOPRIRE
          </CTAButton>
        </HeroContent>
      </HeroSection>

      <ProjectsSection>
        <SectionContent>
          <SectionTitle>I Nostri Lavori in Corso</SectionTitle>
          <InstagramWall />
          <InstagramCTA 
            href="https://instagram.com/korsvagen" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            SEGUICI SU INSTAGRAM
          </InstagramCTA>
          <InstagramHandle>@korsvagen</InstagramHandle>
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
            <ContactInfo>+39 081 XXX XXXX</ContactInfo>
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
          <FooterText>© 2025 KORSVAGEN S.R.L. - Tutti i diritti riservati</FooterText>
          <FooterSubtext>
            REA: 1071429 | P.IVA/C.F.: 09976601212 | Strada Statale 145, 99 - 80045 Pompei (NA)
          </FooterSubtext>
        </FooterContent>
      </Footer>
    </Container>
  );
};

// Styled Components con palette edilizia moderna
const Container = styled.div`
  min-height: 100vh;
  background: #FFFFFF;
  color: #2C3E50;
  font-family: 'Open Sans', sans-serif;
`;

const Header = styled.header`
  background: #FFFFFF;
  box-shadow: 0 2px 20px rgba(44, 62, 80, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
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
  font-family: 'Montserrat', sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2C3E50;
  margin: 0;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }
`;

const Tagline = styled.span`
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: #E67E22;
  font-weight: 500;
  margin-top: 0.3rem;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #ECF0F1 0%, #FFFFFF 100%);
  padding: 4rem 2rem;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
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
  font-family: 'Montserrat', sans-serif;
  font-size: 3.5rem;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 1.5rem;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: 1px;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  color: #34495E;
  line-height: 1.6;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }
`;

const CTAButton = styled.button`
  background: #E67E22;
  color: #FFFFFF;
  border: none;
  padding: 1rem 2.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  box-shadow: 0 5px 20px rgba(230, 126, 34, 0.3);
  
  &:hover {
    background: #D35400;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(230, 126, 34, 0.4);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 2rem;
    font-size: 0.9rem;
  }
`;

const ProjectsSection = styled.section`
  padding: 5rem 2rem;
  background: #FFFFFF;
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  color: #2C3E50;
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
  color: #E67E22;
  border: 2px solid #E67E22;
  padding: 1rem 2.5rem;
  font-family: 'Montserrat', sans-serif;
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
    background: #E67E22;
    color: #FFFFFF;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(230, 126, 34, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 0.8rem 2rem;
    font-size: 0.9rem;
  }
`;

const InstagramHandle = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #7F8C8D;
  margin-top: 1rem;
  font-weight: 500;
`;

const ContactsSection = styled.section`
  background: #ECF0F1;
  padding: 3rem 2rem;
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
  color: #2C3E50;
  font-weight: 500;
`;

const Footer = styled.footer`
  background: #2C3E50;
  padding: 2rem;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`;

const FooterText = styled.p`
  color: #ECF0F1;
  font-size: 0.9rem;
  margin: 0;
  margin-bottom: 0.5rem;
`;

const FooterSubtext = styled.p`
  color: #BDC3C7;
  font-size: 0.8rem;
  margin: 0;
  font-weight: 300;
`;

export default WorkInProgressPage;
