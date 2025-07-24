/**
 * KORSVAGEN WEB APPLICATION - CONTACT CTA COMPONENT
 *
 * Componente CTA di contatto aggiornato per utilizzare il SettingsContext
 * invece dei dati hardcoded in contactData.ts.
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.1.0 - Updated to use SettingsContext
 */

import React from "react";
import styled from "styled-components";
import { useContactData } from "../../contexts/SettingsContext";
import { contactData as fallbackData } from "../../data/contactData";
import Link from "./Link";

const ContactCTA: React.FC = () => {
  // Utilizza il nuovo hook per ottenere i dati di contatto dinamici
  // Commento: Hook personalizzato che mantiene compatibilità con contactData
  const { contactData: dynamicContactData, loading } = useContactData();

  // Utilizza i dati dinamici se disponibili, altrimenti fallback ai dati statici
  // Commento: Garantisce che il CTA funzioni sempre, anche durante il caricamento
  const contactData = dynamicContactData || fallbackData;

  return (
    <ContactContainer>
      <ContactContent>
        <HeroWrapper>
          <ContactTitle>Hai un progetto in mente?</ContactTitle>
          <ContactDescription>
            Raccontaci la tua visione e trasformiamola in realtà. Il nostro team
            è pronto ad affiancarti in ogni fase del progetto.
          </ContactDescription>
        </HeroWrapper>

        <ContactInfoGrid>
          <ContactCard>
            <IconWrapper>
              <Icon>📍</Icon>
            </IconWrapper>
            <CardContent>
              <CardTitle>Indirizzo</CardTitle>
              <CardText>
                {contactData.address.street}
                <br />
                {contactData.address.city}
              </CardText>
            </CardContent>
          </ContactCard>

          <ContactCard>
            <IconWrapper>
              <Icon>📞</Icon>
            </IconWrapper>
            <CardContent>
              <CardTitle>Telefono</CardTitle>
              <CardText>
                <ContactLink href={`tel:${contactData.phone}`}>
                  {contactData.phone}
                </ContactLink>
              </CardText>
            </CardContent>
          </ContactCard>

          <ContactCard>
            <IconWrapper>
              <Icon>📧</Icon>
            </IconWrapper>
            <CardContent>
              <CardTitle>Email</CardTitle>
              <CardText>
                <ContactLink href={`mailto:${contactData.email}`}>
                  {contactData.email}
                </ContactLink>
              </CardText>
            </CardContent>
          </ContactCard>
        </ContactInfoGrid>

        <CTAButtonWrapper>
          <ContactButton to="/contatti">
            <ButtonIcon>💬</ButtonIcon>
            <ButtonText>Contattaci Ora</ButtonText>
          </ContactButton>
        </CTAButtonWrapper>
      </ContactContent>
    </ContactContainer>
  );
};

const ContactContainer = styled.section`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  padding: 100px 0;
  color: #ffffff;
  position: relative;
  overflow: hidden;

  /* Forza il tema scuro e previene sovrascrizioni del browser */
  -webkit-color-scheme: dark;
  color-scheme: dark;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 30% 70%,
        rgba(76, 175, 80, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 70% 30%,
        rgba(102, 126, 234, 0.1) 0%,
        transparent 50%
      );
    z-index: 0;
  }

  @media (max-width: 768px) {
    padding: 80px 0;
  }

  @media (max-width: 480px) {
    padding: 60px 0;
  }
`;

const ContactContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const HeroWrapper = styled.div`
  text-align: center;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    margin-bottom: 50px;
  }

  @media (max-width: 480px) {
    margin-bottom: 40px;
  }
`;

const ContactTitle = styled.h2`
  font-family: "Korsvagen Brand", Arial, sans-serif;
  font-size: 3.5rem;
  color: #ffffff;
  margin-bottom: 2rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: uppercase;

  background: linear-gradient(135deg, #ffffff 0%, #cccccc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  /* Fallback per temi scuri del browser */
  @media (prefers-color-scheme: dark) {
    -webkit-text-fill-color: #ffffff !important;
    background: none !important;
    color: #ffffff !important;
  }

  @media (max-width: 1024px) {
    font-size: 3rem;
  }

  @media (max-width: 768px) {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;

    /* Assicuriamoci che sia visibile su mobile con tema scuro */
    -webkit-text-fill-color: #ffffff !important;
    background: none !important;
    color: #ffffff !important;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
    margin-bottom: 1rem;

    /* Assicuriamoci che sia visibile su mobile con tema scuro */
    -webkit-text-fill-color: #ffffff !important;
    background: none !important;
    color: #ffffff !important;
  }
`;

const ContactDescription = styled.p`
  font-size: 1.3rem;
  color: #cccccc;
  margin-bottom: 0;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7;
  font-family: "Inter", "Segoe UI", sans-serif;
  font-weight: 300;

  /* Assicuriamoci che sia visibile con tema scuro del browser */
  @media (prefers-color-scheme: dark) {
    color: #cccccc !important;
  }

  @media (max-width: 1024px) {
    font-size: 1.2rem;
  }

  @media (max-width: 768px) {
    font-size: 1.1rem;
    max-width: 600px;
    color: #cccccc !important; /* Forza il colore su mobile */
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    max-width: 100%;
    color: #cccccc !important; /* Forza il colore su mobile */
  }
`;

const ContactInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  margin-bottom: 60px;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    margin-bottom: 50px;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
    margin-bottom: 40px;
  }
`;

const ContactCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem 2rem;
  backdrop-filter: blur(20px);
  transition: all 0.4s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(76, 175, 80, 0.05) 0%,
      rgba(102, 126, 234, 0.05) 100%
    );
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 0;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(76, 175, 80, 0.3);
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
  }
`;

const IconWrapper = styled.div`
  position: relative;
  z-index: 1;
  margin-bottom: 1.5rem;
`;

const Icon = styled.div`
  font-size: 3rem;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    rgba(76, 175, 80, 0.2) 0%,
    rgba(102, 126, 234, 0.2) 100%
  );
  border: 2px solid rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  ${ContactCard}:hover & {
    background: linear-gradient(
      135deg,
      rgba(76, 175, 80, 0.3) 0%,
      rgba(102, 126, 234, 0.3) 100%
    );
    border-color: rgba(76, 175, 80, 0.5);
    transform: scale(1.1);
  }

  @media (max-width: 480px) {
    font-size: 2.5rem;
    width: 70px;
    height: 70px;
  }
`;

const CardContent = styled.div`
  position: relative;
  z-index: 1;
`;

const CardTitle = styled.h3`
  font-family: "Korsvagen Brand", Arial, sans-serif;
  font-size: 1.3rem;
  color: #ffffff;
  margin-bottom: 1rem;
  font-weight: 400;
  letter-spacing: 0.02em;

  /* Assicuriamoci che sia visibile con tema scuro del browser */
  @media (prefers-color-scheme: dark) {
    color: #ffffff !important;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
    color: #ffffff !important; /* Forza il colore su mobile */
  }
`;

const CardText = styled.div`
  color: #cccccc;
  font-family: "Inter", "Segoe UI", sans-serif;
  font-size: 1rem;
  line-height: 1.6;

  /* Assicuriamoci che sia visibile con tema scuro del browser */
  @media (prefers-color-scheme: dark) {
    color: #cccccc !important;
  }

  @media (max-width: 480px) {
    font-size: 0.95rem;
    color: #cccccc !important; /* Forza il colore su mobile */
  }
`;

const ContactLink = styled.a`
  color: #4caf50;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    color: #66bb6a;
    text-decoration: underline;
  }
`;

const CTAButtonWrapper = styled.div`
  text-align: center;
`;

const ContactButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: #ffffff;
  padding: 1.2rem 3rem;
  border-radius: 60px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "Inter", "Segoe UI", sans-serif;
  transition: all 0.4s ease;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
    z-index: 0;
  }

  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(76, 175, 80, 0.4);
    border-color: rgba(255, 255, 255, 0.2);

    &::before {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem 2.5rem;
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    padding: 0.9rem 2rem;
    font-size: 1rem;
    gap: 0.8rem;
  }
`;

const ButtonIcon = styled.span`
  font-size: 1.3rem;
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const ButtonText = styled.span`
  position: relative;
  z-index: 1;
`;

export default ContactCTA;
