import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ServicesContainer = styled.div`
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

    p {
      font-size: 1.2rem;
      color: #e2e8f0;
      margin: 0;
      line-height: 1.4;
      word-wrap: break-word;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }

      @media (max-width: 350px) {
        font-size: 0.9rem;
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

const ServicesGrid = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }

  .service-card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .card-header {
      background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
      color: white;
      padding: 30px;
      text-align: center;

      h3 {
        font-size: 1.5rem;
        margin-bottom: 10px;
        font-family: "Montserrat", sans-serif;
      }

      .subtitle {
        opacity: 0.9;
      }
    }

    .card-content {
      padding: 30px;

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
          color: #4a5568;
          position: relative;
          padding-left: 20px;

          &:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #3182ce;
            font-weight: bold;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }

      .description {
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .cta-button {
        background: #3182ce;
        color: white;
        padding: 12px 25px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s ease;
        width: 100%;

        &:hover {
          background: #2c5282;
        }
      }
    }
  }
`;

const ServicesPage: React.FC = () => {
  return (
    <ServicesContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>I Nostri Servizi</h1>
            <p>Soluzioni complete per ogni esigenza edilizia</p>
          </div>
        </HeroSection>

        <ServicesGrid>
          <div className="services-grid">
            <div className="service-card">
              <div className="card-header">
                <h3>Progettazione</h3>
                <p className="subtitle">Dall'idea al progetto definitivo</p>
              </div>
              <div className="card-content">
                <p className="description">
                  Offriamo servizi completi di progettazione per trasformare le
                  tue idee in progetti realizzabili.
                </p>
                <ul>
                  <li>Progettazione Architettonica</li>
                  <li>Progettazione Strutturale</li>
                  <li>Progettazione Impiantistica</li>
                  <li>Pratiche Edilizie</li>
                  <li>Rendering 3D</li>
                </ul>
                <button className="cta-button">Richiedi Preventivo</button>
              </div>
            </div>

            <div className="service-card">
              <div className="card-header">
                <h3>Costruzioni</h3>
                <p className="subtitle">Realizziamo i tuoi progetti</p>
              </div>
              <div className="card-content">
                <p className="description">
                  Costruiamo edifici di ogni tipo con materiali di qualità e
                  tecniche all'avanguardia.
                </p>
                <ul>
                  <li>Costruzioni Residenziali</li>
                  <li>Costruzioni Commerciali</li>
                  <li>Costruzioni Industriali</li>
                  <li>Ville e Abitazioni Custom</li>
                  <li>Edifici Pubblici</li>
                </ul>
                <button className="cta-button">Richiedi Preventivo</button>
              </div>
            </div>

            <div className="service-card">
              <div className="card-header">
                <h3>Ristrutturazioni</h3>
                <p className="subtitle">Rinnova i tuoi spazi</p>
              </div>
              <div className="card-content">
                <p className="description">
                  Ristrutturiamo e riqualifichiamo edifici esistenti per
                  renderli moderni e funzionali.
                </p>
                <ul>
                  <li>Ristrutturazioni Complete</li>
                  <li>Ristrutturazioni Parziali</li>
                  <li>Riqualificazione Energetica</li>
                  <li>Restauro Conservativo</li>
                  <li>Bonus Edilizi</li>
                </ul>
                <button className="cta-button">Richiedi Preventivo</button>
              </div>
            </div>

            <div className="service-card">
              <div className="card-header">
                <h3>Gestione Cantiere</h3>
                <p className="subtitle">Controllo totale del progetto</p>
              </div>
              <div className="card-content">
                <p className="description">
                  Gestiamo ogni fase del cantiere garantendo qualità, sicurezza
                  e rispetto dei tempi.
                </p>
                <ul>
                  <li>Direzione Lavori</li>
                  <li>Coordinamento Sicurezza</li>
                  <li>Controllo Qualità</li>
                  <li>Gestione Fornitori</li>
                  <li>Collaudi e Certificazioni</li>
                </ul>
                <button className="cta-button">Richiedi Preventivo</button>
              </div>
            </div>

            <div className="service-card">
              <div className="card-header">
                <h3>Consulenza Tecnica</h3>
                <p className="subtitle">Esperti al tuo servizio</p>
              </div>
              <div className="card-content">
                <p className="description">
                  Forniamo consulenza specializzata per risolvere problematiche
                  tecniche e normative.
                </p>
                <ul>
                  <li>Perizie Tecniche</li>
                  <li>Valutazioni Immobiliari</li>
                  <li>Consulenza Normativa</li>
                  <li>Due Diligence Immobiliare</li>
                  <li>Assistenza Legale Tecnica</li>
                </ul>
                <button className="cta-button">Richiedi Preventivo</button>
              </div>
            </div>

            <div className="service-card">
              <div className="card-header">
                <h3>Efficienza Energetica</h3>
                <p className="subtitle">Sostenibilità e risparmio</p>
              </div>
              <div className="card-content">
                <p className="description">
                  Miglioriamo l'efficienza energetica degli edifici per ridurre
                  i consumi e l'impatto ambientale.
                </p>
                <ul>
                  <li>Certificazione Energetica</li>
                  <li>Cappotto Termico</li>
                  <li>Impianti Rinnovabili</li>
                  <li>Domotica e Smart Home</li>
                  <li>Superbonus e Incentivi</li>
                </ul>
                <button className="cta-button">Richiedi Preventivo</button>
              </div>
            </div>
          </div>
        </ServicesGrid>
      </MainContent>
      <Footer />
    </ServicesContainer>
  );
};

export default ServicesPage;
