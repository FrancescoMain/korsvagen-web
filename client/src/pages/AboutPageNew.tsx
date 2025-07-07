import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

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
  background: #1a1a1a;
  color: white;
  text-align: center;
  padding: 0;
  position: relative;
  overflow: hidden;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 50vh;
  }

  @media (max-width: 480px) {
    min-height: 40vh;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.8) 0%,
      rgba(45, 55, 72, 0.3) 100%
    );
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
      font-family: "Trajan Pro", "Times New Roman", serif;
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
      font-family: "Trajan Pro", "Times New Roman", serif;
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
      font-family: "Trajan Pro", "Times New Roman", serif;
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
  padding: 120px 0;
  margin: 0;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 100px 0;
  }

  @media (max-width: 480px) {
    padding: 80px 0;
  }

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
    position: relative;
    z-index: 2;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;

    @media (max-width: 768px) {
      padding: 0 15px;
    }

    @media (max-width: 480px) {
      padding: 0 10px;
    }
  }

  .stats-title {
    text-align: center;
    margin-bottom: 80px;

    @media (max-width: 768px) {
      margin-bottom: 60px;
    }

    @media (max-width: 480px) {
      margin-bottom: 50px;
    }

    h2 {
      font-size: 4rem;
      font-weight: 400;
      color: #ffffff;
      margin-bottom: 20px;
      font-family: "Trajan Pro", "Times New Roman", serif;
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
      font-family: "Inter", "Segoe UI", sans-serif;
      font-weight: 300;
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
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 40px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 50px 30px;
      text-align: center;
      position: relative;
      overflow: hidden;
      transition: all 0.4s ease;

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
        font-size: 4rem;
        font-weight: 400;
        color: #ffffff;
        margin-bottom: 20px;
        font-family: "Trajan Pro", "Times New Roman", serif;
        letter-spacing: 0.1em;
        text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
        transition: transform 0.4s ease;

        @media (max-width: 768px) {
          font-size: 3.5rem;
        }

        @media (max-width: 480px) {
          font-size: 3rem;
        }
      }

      .label {
        color: rgba(255, 255, 255, 0.9);
        font-weight: 300;
        font-size: 1.1rem;
        font-family: "Inter", "Segoe UI", sans-serif;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        line-height: 1.4;

        @media (max-width: 768px) {
          font-size: 1rem;
        }

        @media (max-width: 480px) {
          font-size: 0.95rem;
        }
      }

      @media (max-width: 768px) {
        padding: 40px 25px;
      }

      @media (max-width: 480px) {
        padding: 35px 20px;
      }
    }
  }
`;

const AboutPage: React.FC = () => {
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
                <div className="number">15+</div>
                <div className="label">Anni di Esperienza</div>
              </div>
              <div className="stat-card">
                <div className="number">200+</div>
                <div className="label">Progetti Realizzati</div>
              </div>
              <div className="stat-card">
                <div className="number">150+</div>
                <div className="label">Clienti Soddisfatti</div>
              </div>
            </div>
          </div>
        </StatsSection>
      </MainContent>
      <Footer />
    </AboutContainer>
  );
};

export default AboutPage;
