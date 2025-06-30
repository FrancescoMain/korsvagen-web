import React from "react";
import styled from "styled-components";
import InstagramWall from "./InstagramWall";

const WorkInProgressPage: React.FC = () => {
  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <Logo>Korsvagen</Logo>
          <Tagline>Editore di Libri d'Arte e Letteratura</Tagline>
        </LogoSection>

        <MainMessage>
          <Title>Sito in Arrivo</Title>
          <Subtitle>
            Stiamo lavorando per portarvi una nuova esperienza editoriale.
            <br />
            Nel frattempo, seguiteci sui nostri canali social.
          </Subtitle>
        </MainMessage>

        <InstagramSection>
          <SocialTitle>Seguici su Instagram</SocialTitle>
          <InstagramWall />
          <InstagramLink
            href="https://instagram.com/korsvagen"
            target="_blank"
            rel="noopener noreferrer"
          >
            @korsvagen
          </InstagramLink>
        </InstagramSection>

        <Footer>
          <FooterText>© 2025 Korsvagen. Tutti i diritti riservati.</FooterText>
        </Footer>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
  font-family: "Georgia", "Times New Roman", serif;
  position: relative;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  justify-content: space-between;
`;

const LogoSection = styled.div`
  text-align: center;
  margin-top: 2rem;
`;

const Logo = styled.h1`
  font-size: 3.5rem;
  font-weight: 300;
  letter-spacing: 3px;
  margin: 0;
  color: #d4af37;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 2.5rem;
    letter-spacing: 2px;
  }
`;

const Tagline = styled.p`
  font-size: 1.1rem;
  color: #cccccc;
  margin-top: 0.5rem;
  font-style: italic;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const MainMessage = styled.div`
  text-align: center;
  margin: 3rem 0;
  max-width: 600px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color: #ffffff;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  color: #cccccc;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const InstagramSection = styled.div`
  width: 100%;
  max-width: 800px;
  text-align: center;
  margin: 2rem 0;
`;

const SocialTitle = styled.h3`
  font-size: 1.8rem;
  color: #d4af37;
  margin-bottom: 2rem;
  font-weight: 300;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const InstagramLink = styled.a`
  display: inline-block;
  color: #d4af37;
  text-decoration: none;
  font-size: 1.3rem;
  font-weight: 500;
  margin-top: 1.5rem;
  padding: 0.8rem 2rem;
  border: 2px solid #d4af37;
  border-radius: 30px;
  transition: all 0.3s ease;
  letter-spacing: 1px;

  &:hover {
    background-color: #d4af37;
    color: #1a1a1a;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0.6rem 1.5rem;
  }
`;

const Footer = styled.footer`
  margin-top: auto;
  padding: 2rem 0;
`;

const FooterText = styled.p`
  color: #888888;
  font-size: 0.9rem;
  margin: 0;
  letter-spacing: 0.5px;
`;

export default WorkInProgressPage;
