/**
 * KORSVAGEN WEB APPLICATION - FOOTER COMPONENT
 *
 * Componente footer aggiornato per utilizzare il SettingsContext
 * invece dei dati hardcoded in contactData.ts.
 * Supporta fallback ai dati statici durante il caricamento.
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.1.0 - Updated to use SettingsContext
 */

import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useContactData } from "../../contexts/SettingsContext";
import { contactData as fallbackData } from "../../data/contactData";

const Footer: React.FC = () => {
  // Utilizza il nuovo hook per ottenere i dati di contatto
  // Commento: useContactData fornisce compatibilità con contactData.ts
  const { contactData: dynamicContactData, loading } = useContactData();

  // Utilizza i dati dinamici se disponibili, altrimenti fallback ai dati statici
  // Commento: Garantisce che il footer funzioni sempre, anche durante il caricamento
  const contactData = dynamicContactData || fallbackData;

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
            <SectionTitle>{contactData.company}</SectionTitle>
            <SectionDescription>
              La tua visione, la nostra esperienza. Costruiamo il futuro insieme
              con professionalità, qualità e innovazione.
            </SectionDescription>
            <SocialLinks>
              <SocialLink
                href={contactData.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
              >
                📷
              </SocialLink>
              <SocialLink href={`mailto:${contactData.email}`} title="Email">
                📧
              </SocialLink>
              <SocialLink href={`tel:${contactData.phone}`} title="Telefono">
                📞
              </SocialLink>
              <SocialLink
                href={contactData.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                💼
              </SocialLink>
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
                {contactData.address.street}
                <br />
                {contactData.address.city}
              </ContactItem>
              <ContactItem>
                <strong>Telefono:</strong>
                <br />
                <a href={`tel:${contactData.phone}`}>{contactData.phone}</a>
              </ContactItem>
              <ContactItem>
                <strong>Email:</strong>
                <br />
                <a href={`mailto:${contactData.email}`}>{contactData.email}</a>
              </ContactItem>
            </ContactInfo>
          </FooterSection>
        </FooterGrid>

        <FooterBottom>
          <div>
            <FooterText>
              © 2025 {contactData.company} - Tutti i diritti riservati
            </FooterText>
            <FooterSubtext>
              REA: {contactData.business.rea} | P.IVA/C.F.:{" "}
              {contactData.business.piva}
            </FooterSubtext>
          </div>

          <LegalLinks>
            <LegalLink href="/privacy">Privacy Policy</LegalLink>
            <LegalLink href="/cookie">Cookie Policy</LegalLink>
            <LegalLink href="/termini">Termini e Condizioni</LegalLink>
          </LegalLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background: #1a1a1a;
  padding: 4rem 2rem 2rem;
  color: #ffffff;

  @media (max-width: 768px) {
    padding: 3rem 1rem 2rem;
  }
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const FooterSection = styled.div``;

const SectionTitle = styled.h3`
  color: #ffffff;
  font-family: "Arial", sans-serif;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SectionDescription = styled.p`
  color: #cccccc;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-weight: 300;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const SocialLink = styled.a`
  width: 40px;
  height: 40px;
  background: #333333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease;

  &:hover {
    background: #555555;
    transform: translateY(-2px);
  }
`;

const LinksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    margin-bottom: 0.8rem;
  }
`;

const FooterLink = styled(Link)`
  color: #cccccc;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 300;
  transition: color 0.3s ease;

  &:hover {
    color: #ffffff;
  }
`;

const ServicesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    color: #cccccc;
    font-size: 1rem;
    font-weight: 300;
    margin-bottom: 0.8rem;
    transition: color 0.3s ease;
    cursor: pointer;

    &:hover {
      color: #ffffff;
    }
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContactItem = styled.div`
  color: #cccccc;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 300;

  strong {
    color: #ffffff;
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  a {
    color: #cccccc;
    text-decoration: none;
    transition: color 0.3s ease;

    &:hover {
      color: #ffffff;
    }
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #333333;
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const LegalLink = styled.a`
  color: #cccccc;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 300;
  transition: color 0.3s ease;

  &:hover {
    color: #ffffff;
  }
`;

const FooterText = styled.p`
  color: #ffffff;
  font-size: 1rem;
  margin: 0;
  font-weight: 300;
`;

const FooterSubtext = styled.p`
  color: #cccccc;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 300;

  @media (max-width: 320px) {
    font-size: 0.8rem;
    line-height: 1.4;
  }
`;

export default Footer;
