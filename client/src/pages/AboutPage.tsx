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
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
`;

const HeroSection = styled.section`
  background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
  color: white;
  text-align: center;
  padding: 100px 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;

  .hero-content {
    max-width: 800px;
    width: 100%;
    padding: 0 10px;

    h1 {
      font-size: 2.8rem;
      font-weight: bold;
      margin-bottom: 20px;
      font-family: "Montserrat", sans-serif;
      line-height: 1.2;
      word-wrap: break-word;

      @media (max-width: 1024px) {
        font-size: 2.4rem;
      }

      @media (max-width: 768px) {
        font-size: 2rem;
        margin-bottom: 15px;
      }

      @media (max-width: 480px) {
        font-size: 1.8rem;
        margin-bottom: 10px;
      }

      @media (max-width: 350px) {
        font-size: 1.6rem;
      }
    }
  }

  @media (max-width: 1024px) {
    padding: 80px 15px;
    min-height: 250px;
  }

  @media (max-width: 768px) {
    padding: 60px 15px;
    min-height: 200px;
  }

  @media (max-width: 480px) {
    padding: 40px 10px;
    min-height: 180px;
  }

  @media (max-width: 350px) {
    padding: 30px 10px;
    min-height: 160px;
  }
`;

const ContentSection = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;

  .section {
    margin-bottom: 60px;

    h2 {
      font-size: 2rem;
      color: #2d3748;
      margin-bottom: 30px;
      font-family: "Montserrat", sans-serif;
    }

    p {
      color: #4a5568;
      line-height: 1.6;
      margin-bottom: 20px;
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
    margin-top: 40px;

    .stat-card {
      background: #f7fafc;
      padding: 30px;
      border-radius: 10px;
      text-align: center;

      .number {
        font-size: 2.5rem;
        font-weight: bold;
        color: #3182ce;
        margin-bottom: 10px;
        font-family: "Montserrat", sans-serif;
      }

      .label {
        color: #4a5568;
        font-weight: 500;
      }
    }
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin-top: 40px;

    .team-card {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;

      h3 {
        color: #2d3748;
        margin-bottom: 10px;
        font-family: "Montserrat", sans-serif;
      }

      .role {
        color: #3182ce;
        font-weight: 500;
        margin-bottom: 15px;
      }

      p {
        color: #4a5568;
        font-size: 0.9rem;
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

          <div className="section">
            <h2>Mission e Vision</h2>
            <p>
              <strong>Mission:</strong> Realizzare progetti edilizi di
              eccellenza, combinando innovazione tecnologica, sostenibilità
              ambientale e tradizione artigianale.
            </p>
            <p>
              <strong>Vision:</strong> Essere il partner di fiducia per chiunque
              voglia costruire il proprio futuro, offrendo soluzioni
              personalizzate e all'avanguardia.
            </p>
          </div>

          <div className="section">
            <h2>I Nostri Numeri</h2>
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
              <div className="stat-card">
                <div className="number">100%</div>
                <div className="label">Qualità Garantita</div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2>Il Nostro Team</h2>
            <div className="team-grid">
              <div className="team-card">
                <h3>Ingegneri Strutturali</h3>
                <div className="role">Progettazione Strutturale</div>
                <p>
                  Team di ingegneri specializzati nella progettazione di
                  strutture sicure e innovative.
                </p>
              </div>
              <div className="team-card">
                <h3>Architetti</h3>
                <div className="role">Progettazione Architettonica</div>
                <p>
                  Architetti esperti nella creazione di spazi funzionali e dal
                  design accattivante.
                </p>
              </div>
              <div className="team-card">
                <h3>Geometri</h3>
                <div className="role">Gestione Cantiere</div>
                <p>
                  Professionisti qualificati per la gestione e il controllo di
                  ogni fase del cantiere.
                </p>
              </div>
            </div>
          </div>
        </ContentSection>
      </MainContent>
      <Footer />
    </AboutContainer>
  );
};

export default AboutPage;
