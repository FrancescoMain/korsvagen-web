import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Footer: React.FC = () => {
  const quickLinks = [
    { path: "/", label: "Home" },
    { path: "/chi-siamo", label: "Chi Siamo" },
    { path: "/servizi", label: "Servizi" },
    { path: "/progetti", label: "Progetti" },
    { path: "/news", label: "News" },
    { path: "/contatti", label: "Contatti" },
    { path: "/lavora-con-noi", label: "Lavora con Noi" },
  ];

  const services = [
    "Progettazione",
    "Costruzioni",
    "Ristrutturazioni",
    "Consulenza Tecnica",
    "Efficienza Energetica",
  ];

  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <SectionTitle>KORSVAGEN S.R.L.</SectionTitle>
            <SectionDescription>
              La tua visione, la nostra esperienza. Costruiamo il futuro insieme
              con professionalità, qualità e innovazione.
            </SectionDescription>
            <SocialLinks>
              <SocialLink
                href="https://instagram.com/korsvagensrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                📷 Instagram
              </SocialLink>
              <SocialLink href="mailto:korsvagensrl@gmail.com">
                📧 Email
              </SocialLink>
              <SocialLink href="tel:+393494298547">📞 Telefono</SocialLink>
            </SocialLinks>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Link Rapidi</SectionTitle>
            <LinksList>
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <FooterLink to={link.path}>{link.label}</FooterLink>
                </li>
              ))}
            </LinksList>
          </FooterSection>

          <FooterSection>
            <SectionTitle>I Nostri Servizi</SectionTitle>
            <ServicesList>
              {services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ServicesList>
          </FooterSection>

          <FooterSection>
            <SectionTitle>Contatti</SectionTitle>
            <ContactInfo>
              <ContactItem>
                <strong>Indirizzo:</strong>
                <br />
                Via Santa Maria la Carità 18
                <br />
                Scafati (SA)
              </ContactItem>
              <ContactItem>
                <strong>Telefono:</strong>
                <br />
                <a href="tel:+393494298547">+39 349 429 8547</a>
              </ContactItem>
              <ContactItem>
                <strong>Email:</strong>
                <br />
                <a href="mailto:korsvagensrl@gmail.com">
                  korsvagensrl@gmail.com
                </a>
              </ContactItem>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <LegalLinks>
            <LegalLink href="/privacy">Privacy Policy</LegalLink>
            <LegalLink href="/cookie">Cookie Policy</LegalLink>
            <LegalLink href="/termini">Termini e Condizioni</LegalLink>
          </LegalLinks>

          <FooterText>
            © 2025 KORSVAGEN S.R.L. - Tutti i diritti riservati
          </FooterText>

          <FooterSubtext>REA: 1071429 | P.IVA/C.F.: 09976601212</FooterSubtext>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background: #2c3e50;
  padding: 3rem 2rem 1rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem 1rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div``;

const SectionTitle = styled.h3`
  color: #ecf0f1;
  font-family: "Montserrat", sans-serif;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const SectionDescription = styled.p`
  color: #bdc3c7;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SocialLink = styled.a`
  color: #3182ce;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;

  &:hover {
    color: #63b3ed;
  }
`;

const LinksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.5rem;
  }
`;

const FooterLink = styled(Link)`
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;

  &:hover {
    color: #ecf0f1;
  }
`;

const ServicesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    color: #bdc3c7;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
    padding-left: 1rem;
    position: relative;

    &:before {
      content: "•";
      color: #3182ce;
      position: absolute;
      left: 0;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContactItem = styled.div`
  color: #bdc3c7;
  font-size: 0.9rem;
  line-height: 1.4;

  strong {
    color: #ecf0f1;
  }

  a {
    color: #3182ce;
    text-decoration: none;

    &:hover {
      color: #63b3ed;
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #34495e;
  padding-top: 1.5rem;
  text-align: center;
`;

const LegalLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const LegalLink = styled.a`
  color: #bdc3c7;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;

  &:hover {
    color: #ecf0f1;
  }
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

  @media (max-width: 320px) {
    font-size: 0.75rem;
    line-height: 1.4;
  }
`;

export default Footer;
