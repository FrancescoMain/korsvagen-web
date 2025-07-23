import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import { useSettings } from "../contexts/SettingsContext";

const AboutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  background: #1a1a1a;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  background: #1a1a1a;
  padding-top: 110px;

  @media (max-width: 768px) {
    padding-top: 80px;
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(44, 44, 44, 0.95) 100%
    ),
    url("https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: white;
  text-align: center;
  padding: 120px 20px 80px;
  position: relative;
  overflow: hidden;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 60vh;
    padding: 100px 20px 60px;
    background-attachment: scroll;
  }

  @media (max-width: 480px) {
    min-height: 50vh;
    padding: 80px 20px 50px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(26, 26, 26, 0.7);
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;

    h1 {
      font-size: 4rem;
      font-weight: 400;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      line-height: 1.1;
      color: #ffffff;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 3rem;
      }

      @media (max-width: 480px) {
        font-size: 2.5rem;
      }
    }

    .subtitle {
      font-size: 1.3rem;
      font-weight: 300;
      color: rgba(255, 255, 255, 0.9);
      font-family: "Inter", "Segoe UI", sans-serif;
      letter-spacing: 0.05em;
      line-height: 1.5;
      max-width: 600px;
      margin: 0 auto;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }

    @media (max-width: 768px) {
      padding: 0 1.5rem;
    }

    @media (max-width: 480px) {
      padding: 0 1rem;
    }
  }
`;

const ContentSection = styled.section`
  padding: 100px 0;
  width: 100%;
  background: #ffffff;
  color: #1a1a1a;

  @media (max-width: 768px) {
    padding: 80px 0;
  }

  @media (max-width: 480px) {
    padding: 60px 0;
  }

  .section {
    margin-bottom: 80px;
    padding: 0 20px;

    &:last-child {
      margin-bottom: 0;
    }

    @media (max-width: 768px) {
      padding: 0 15px;
    }

    @media (max-width: 480px) {
      padding: 0 10px;
    }

    h2 {
      font-size: 3rem;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 40px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-align: center;

      @media (max-width: 768px) {
        font-size: 2.5rem;
        margin-bottom: 30px;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
        margin-bottom: 25px;
      }
    }

    p {
      color: #4a5568;
      line-height: 1.8;
      margin-bottom: 25px;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-size: 1.1rem;
      font-weight: 300;
      max-width: 800px;
      margin-left: auto;
      margin-right: auto;

      @media (max-width: 768px) {
        font-size: 1rem;
        line-height: 1.7;
      }

      strong {
        color: #1a1a1a;
        font-weight: 500;
      }
    }
  }
`;

const MissionVisionBanner = styled.div`
  position: relative;
  height: 500px;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin: 0;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    height: 400px;
    background-attachment: scroll;
  }

  @media (max-width: 480px) {
    height: 300px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(26, 26, 26, 0.5) 50%,
      rgba(0, 0, 0, 0.8) 100%
    );
    z-index: 1;
    transition: all 0.3s ease;
  }

  &:hover::before {
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.6) 0%,
      rgba(26, 26, 26, 0.4) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  .banner-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 900px;
    padding: 0 2rem;
    color: white;
    transform: translateY(0);
    transition: transform 0.3s ease;

    h3 {
      font-size: 4rem;
      font-weight: 400;
      margin-bottom: 40px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.9);
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: -15px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 3px;
        background: linear-gradient(90deg, #3182ce, #63b3ed);
      }

      @media (max-width: 768px) {
        font-size: 3rem;
        margin-bottom: 30px;
      }

      @media (max-width: 480px) {
        font-size: 2.5rem;
        margin-bottom: 25px;
      }
    }

    p {
      font-size: 1.4rem;
      font-weight: 300;
      line-height: 1.8;
      color: rgba(255, 255, 255, 0.95);
      font-family: "Inter", "Segoe UI", sans-serif;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
      max-width: 800px;
      margin: 0 auto;

      @media (max-width: 768px) {
        font-size: 1.2rem;
        line-height: 1.6;
      }

      @media (max-width: 480px) {
        font-size: 1.1rem;
        line-height: 1.5;
      }
    }

    @media (max-width: 768px) {
      padding: 0 1.5rem;
    }

    @media (max-width: 480px) {
      padding: 0 1rem;
    }
  }

  &:hover .banner-content {
    transform: translateY(-10px);
  }

  &.mission {
    background-image: url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");

    .banner-content h3::after {
      background: linear-gradient(90deg, #e67e22, #f39c12);
    }
  }

  &.vision {
    background-image: url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");

    .banner-content h3::after {
      background: linear-gradient(90deg, #3182ce, #63b3ed);
    }
  }
`;

const StatsSection = styled.section`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80");
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
    opacity: 0.1;
    z-index: 1;

    @media (max-width: 768px) {
      background-attachment: scroll;
    }
  }

  .stats-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 40px;
    text-align: center;
    position: relative;
    z-index: 2;

    @media (max-width: 768px) {
      padding: 0 25px;
    }

    @media (max-width: 480px) {
      padding: 0 20px;
    }
  }

  .stats-title {
    margin-bottom: 80px;

    h2 {
      font-size: 4rem;
      font-weight: 400;
      color: #ffffff;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.8);

      @media (max-width: 768px) {
        font-size: 3rem;
      }

      @media (max-width: 480px) {
        font-size: 2.5rem;
      }
    }

    .subtitle {
      font-size: 1.3rem;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 300;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;
      letter-spacing: 0.05em;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 25px;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 20px;
    }
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: 40px 20px;
    text-align: center;
    transition: all 0.4s ease;
    position: relative;
    overflow: hidden;

    @media (max-width: 1024px) {
      padding: 45px 25px;
    }

    @media (max-width: 480px) {
      padding: 40px 20px;
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3182ce, #63b3ed, #e67e22);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.4s ease;
    }

    &:hover {
      transform: translateY(-10px);
      background: rgba(255, 255, 255, 0.15);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

      &::before {
        transform: scaleX(1);
      }

      .number {
        transform: scale(1.1);
      }
    }

    .number {
      font-size: 3.5rem;
      font-weight: 400;
      color: #ffffff;
      margin-bottom: 15px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
      transition: transform 0.4s ease;

      @media (max-width: 1024px) {
        font-size: 3.8rem;
      }

      @media (max-width: 768px) {
        font-size: 3.2rem;
      }

      @media (max-width: 480px) {
        font-size: 2.8rem;
      }
    }

    .label {
      color: rgba(255, 255, 255, 0.9);
      font-weight: 300;
      font-size: 1rem;
      font-family: "Inter", "Segoe UI", sans-serif;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      line-height: 1.4;

      @media (max-width: 1024px) {
        font-size: 1.05rem;
      }

      @media (max-width: 768px) {
        font-size: 0.95rem;
      }

      @media (max-width: 480px) {
        font-size: 0.9rem;
      }
    }
  }
`;

const CertificationsSection = styled.section`
  background: #f8f9fa;
  padding: 100px 0;
  position: relative;
  overflow: hidden;

  .certifications-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;

    @media (max-width: 768px) {
      padding: 0 25px;
    }

    @media (max-width: 480px) {
      padding: 0 20px;
    }
  }

  .certifications-title {
    text-align: center;
    margin-bottom: 80px;

    h2 {
      font-size: 3rem;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
      }
    }

    .subtitle {
      font-size: 1.2rem;
      color: #6c757d;
      font-weight: 300;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }

  .certifications-gallery {
    position: relative;
    overflow: hidden;
    height: 380px;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    padding: 15px 0;

    @media (max-width: 768px) {
      height: 330px;
      padding: 10px 0;
    }

    @media (max-width: 480px) {
      height: 280px;
      padding: 10px 0;
    }
  }

  .certifications-track {
    display: flex;
    align-items: center;
    gap: 60px;
    animation: scroll 30s linear infinite;
    width: fit-content;
    padding: 0 50px;

    @media (max-width: 768px) {
      gap: 40px;
      padding: 0 30px;
    }

    @media (max-width: 480px) {
      gap: 30px;
      padding: 0 20px;
    }
  }

  @keyframes scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  .certification-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 250px;
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-10px);
    }

    &:hover ~ * .certifications-track,
    &:hover + * .certifications-track {
      animation-play-state: paused;
    }

    @media (max-width: 768px) {
      min-width: 200px;
    }

    @media (max-width: 480px) {
      min-width: 180px;
    }
  }

  .certification-item:hover ~ .certifications-track {
    animation-play-state: paused;
  }

  .certifications-track:hover {
    animation-play-state: paused;
  }

  .certification-circle {
    width: 150px;
    height: 150px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    position: relative;
    box-shadow: 0 10px 30px rgba(26, 26, 26, 0.3);
    transition: all 0.3s ease;

    &::before {
      content: "";
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a1a1a, #2c2c2c, #e67e22);
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 15px 40px rgba(26, 26, 26, 0.4);

      &::before {
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      width: 120px;
      height: 120px;
    }

    @media (max-width: 480px) {
      width: 100px;
      height: 100px;
    }
  }

  .certification-icon {
    font-size: 3rem;
    color: white;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 2.5rem;
    }

    @media (max-width: 480px) {
      font-size: 2rem;
    }
  }

  .certification-content {
    h3 {
      font-size: 1.3rem;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 10px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.05em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 1.2rem;
      }

      @media (max-width: 480px) {
        font-size: 1.1rem;
      }
    }

    p {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
      margin: 0;
      max-width: 200px;

      @media (max-width: 768px) {
        font-size: 0.85rem;
        max-width: 160px;
      }

      @media (max-width: 480px) {
        font-size: 0.8rem;
        max-width: 140px;
      }
    }
  }
`;

const WhyChooseUsSection = styled.section`
  background: white;
  padding: 100px 0;

  .why-choose-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;

    @media (max-width: 768px) {
      padding: 0 25px;
    }

    @media (max-width: 480px) {
      padding: 0 20px;
    }
  }

  .section-title {
    text-align: center;
    margin-bottom: 80px;

    h2 {
      font-size: 3rem;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 2.5rem;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
      }
    }

    .subtitle {
      font-size: 1.2rem;
      color: #6c757d;
      font-weight: 300;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }

  .reasons-grid {
    display: flex;
    flex-direction: column;
    gap: 80px;

    @media (max-width: 768px) {
      gap: 60px;
    }
  }

  .reason-item {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;

    &.reverse {
      .reason-content {
        order: 2;
      }
      .reason-image {
        order: 1;
      }
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 30px;
      text-align: center;

      &.reverse {
        .reason-content {
          order: 1;
        }
        .reason-image {
          order: 2;
        }
      }
    }
  }

  .reason-content {
    h3 {
      font-size: 2rem;
      font-weight: 400;
      color: #1a1a1a;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 1.8rem;
      }

      @media (max-width: 480px) {
        font-size: 1.5rem;
      }
    }

    p {
      color: #6c757d;
      font-size: 1.1rem;
      line-height: 1.8;
      margin: 0;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
  }

  .reason-image {
    img {
      width: 100%;
      height: 300px;
      object-fit: cover;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);

      @media (max-width: 768px) {
        height: 250px;
      }

      @media (max-width: 480px) {
        height: 200px;
      }
    }
  }
`;

const AboutPage: React.FC = () => {
  const { companyStats } = useSettings();

  return (
    <AboutContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>Chi Siamo</h1>
            <p className="subtitle">
              Esperienza, professionalità e passione per l'edilizia di qualità
            </p>
          </div>
        </HeroSection>

        <ContentSection>
          <div className="section">
            <h2>La Nostra Storia</h2>
            <p>
              KORSVAGEN S.R.L. nasce dalla passione per l'edilizia e dalla
              volontà di offrire servizi di costruzione e progettazione di
              altissima qualità. Con anni di esperienza nel settore, ci siamo
              affermati come punto di riferimento per privati e aziende che
              cercano professionalità e affidabilità.
            </p>
            <p>
              La nostra filosofia è semplice: trasformare i sogni dei nostri
              clienti in realtà, garantendo sempre la massima qualità, rispetto
              dei tempi e trasparenza in ogni fase del progetto.
            </p>
          </div>
        </ContentSection>

        <MissionVisionBanner className="mission">
          <div className="banner-content">
            <h3>Mission</h3>
            <p>
              Realizzare progetti edilizi di eccellenza, combinando innovazione
              tecnologica, sostenibilità ambientale e tradizione artigianale per
              costruire il futuro delle nostre comunità.
            </p>
          </div>
        </MissionVisionBanner>

        <MissionVisionBanner className="vision">
          <div className="banner-content">
            <h3>Vision</h3>
            <p>
              Essere il partner di fiducia per chiunque voglia costruire il
              proprio futuro, offrendo soluzioni personalizzate e
              all'avanguardia che rispettino l'ambiente e durino nel tempo.
            </p>
          </div>
        </MissionVisionBanner>

        <StatsSection>
          <div className="stats-container">
            <div className="stats-title">
              <h2>I Nostri Numeri</h2>
              <p className="subtitle">
                Risultati concreti che parlano della nostra esperienza
              </p>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="number">
                  {companyStats?.years_experience || 15}+
                </div>
                <div className="label">Anni di Esperienza</div>
              </div>
              <div className="stat-card">
                <div className="number">
                  {companyStats?.projects_completed || 200}+
                </div>
                <div className="label">Progetti Realizzati</div>
              </div>
              <div className="stat-card">
                <div className="number">
                  +{companyStats?.revenue_growth || 35}%
                </div>
                <div className="label">Incremento Fatturato</div>
              </div>
              <div className="stat-card">
                <div className="number">{companyStats?.team_members || 25}</div>
                <div className="label">Membri del Team</div>
              </div>
            </div>
          </div>
        </StatsSection>

        <CertificationsSection>
          <div className="certifications-container">
            <div className="certifications-title">
              <h2>Certificazioni e Qualifiche</h2>
              <p className="subtitle">
                Riconoscimenti che attestano la nostra professionalità
              </p>
            </div>
            <div className="certifications-gallery">
              <div className="certifications-track">
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">ISO</div>
                  </div>
                  <div className="certification-content">
                    <h3>ISO 9001</h3>
                    <p>Certificazione di qualità nei processi di gestione</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">SOA</div>
                  </div>
                  <div className="certification-content">
                    <h3>SOA Costruzioni</h3>
                    <p>Attestazione per lavori pubblici e privati</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">ECO</div>
                  </div>
                  <div className="certification-content">
                    <h3>Edilizia Sostenibile</h3>
                    <p>Specializzazione in costruzioni eco-compatibili</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">ELT</div>
                  </div>
                  <div className="certification-content">
                    <h3>Impianti Elettrici</h3>
                    <p>Abilitazione per installazioni elettriche</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">PRO</div>
                  </div>
                  <div className="certification-content">
                    <h3>Progettazione</h3>
                    <p>Certificazione per progettazione architettonica</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">SIC</div>
                  </div>
                  <div className="certification-content">
                    <h3>Sicurezza</h3>
                    <p>Certificazione per sicurezza sul lavoro</p>
                  </div>
                </div>
                {/* Duplicated items for seamless loop */}
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">ISO</div>
                  </div>
                  <div className="certification-content">
                    <h3>ISO 9001</h3>
                    <p>Certificazione di qualità nei processi di gestione</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">SOA</div>
                  </div>
                  <div className="certification-content">
                    <h3>SOA Costruzioni</h3>
                    <p>Attestazione per lavori pubblici e privati</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">ECO</div>
                  </div>
                  <div className="certification-content">
                    <h3>Edilizia Sostenibile</h3>
                    <p>Specializzazione in costruzioni eco-compatibili</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">ELT</div>
                  </div>
                  <div className="certification-content">
                    <h3>Impianti Elettrici</h3>
                    <p>Abilitazione per installazioni elettriche</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">PRO</div>
                  </div>
                  <div className="certification-content">
                    <h3>Progettazione</h3>
                    <p>Certificazione per progettazione architettonica</p>
                  </div>
                </div>
                <div className="certification-item">
                  <div className="certification-circle">
                    <div className="certification-icon">SIC</div>
                  </div>
                  <div className="certification-content">
                    <h3>Sicurezza</h3>
                    <p>Certificazione per sicurezza sul lavoro</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CertificationsSection>

        <WhyChooseUsSection>
          <div className="why-choose-container">
            <div className="section-title">
              <h2>Perché Sceglierci</h2>
              <p className="subtitle">
                I vantaggi che ci distinguono nel panorama dell'edilizia
              </p>
            </div>
            <div className="reasons-grid">
              <div className="reason-item">
                <div className="reason-content">
                  <h3>Esperienza Consolidata</h3>
                  <p>
                    Oltre 15 anni di attività nel settore edile ci hanno
                    permesso di perfezionare le nostre competenze e di
                    affrontare ogni tipo di progetto con professionalità.
                  </p>
                </div>
                <div className="reason-image">
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Esperienza"
                  />
                </div>
              </div>
              <div className="reason-item reverse">
                <div className="reason-image">
                  <img
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Qualità"
                  />
                </div>
                <div className="reason-content">
                  <h3>Qualità Garantita</h3>
                  <p>
                    Utilizziamo solo materiali di prima qualità e tecnologie
                    all'avanguardia per garantire risultati duraturi e
                    soddisfacenti.
                  </p>
                </div>
              </div>
              <div className="reason-item">
                <div className="reason-content">
                  <h3>Approccio Personalizzato</h3>
                  <p>
                    Ogni progetto è unico. Ascoltiamo le esigenze del cliente e
                    sviluppiamo soluzioni su misura che rispettino budget e
                    tempistiche.
                  </p>
                </div>
                <div className="reason-image">
                  <img
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                    alt="Personalizzazione"
                  />
                </div>
              </div>
            </div>
          </div>
        </WhyChooseUsSection>

        <ContactCTA />
      </MainContent>
      <Footer />
    </AboutContainer>
  );
};

export default AboutPage;
