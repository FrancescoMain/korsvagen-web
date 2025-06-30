import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const HomeContainer = styled.div`
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
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: 3.5rem;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: "Montserrat", sans-serif;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

    @media (max-width: 768px) {
      font-size: 2.5rem;
      letter-spacing: 1px;
    }

    @media (max-width: 480px) {
      font-size: 2rem;
      letter-spacing: 0.5px;
    }
  }

  .slogan {
    font-size: 1.8rem;
    margin-bottom: 30px;
    color: #e2e8f0;
    font-weight: 300;
    letter-spacing: 3px;

    @media (max-width: 768px) {
      font-size: 1.4rem;
      letter-spacing: 2px;
    }

    @media (max-width: 480px) {
      font-size: 1.2rem;
      letter-spacing: 1px;
    }
  }

  .subtitle {
    font-size: 1.2rem;
    margin-bottom: 40px;
    color: #cbd5e0;
    line-height: 1.6;

    @media (max-width: 768px) {
      font-size: 1.1rem;
      margin-bottom: 30px;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
      margin-bottom: 25px;
    }
  }

  .cta-button {
    background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
    color: white;
    padding: 18px 40px;
    border: none;
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(230, 126, 34, 0.3);
    letter-spacing: 0.5px;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(230, 126, 34, 0.4);
      background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
    }

    @media (max-width: 768px) {
      padding: 15px 30px;
      font-size: 1.1rem;
    }

    @media (max-width: 480px) {
      padding: 12px 25px;
      font-size: 1rem;
      width: 100%;
      max-width: 280px;
    }
  }

  @media (max-width: 768px) {
    padding: 80px 20px;
  }

  @media (max-width: 480px) {
    padding: 60px 15px;
  }
`;

const ServicesPreview = styled.section`
  padding: 80px 20px;
  background: #f7fafc;

  h2 {
    text-align: center;
    font-size: 2.5rem;
    color: #2d3748;
    margin-bottom: 20px;
    font-family: "Montserrat", sans-serif;
  }

  .section-subtitle {
    text-align: center;
    font-size: 1.2rem;
    color: #4a5568;
    margin-bottom: 50px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto 60px;
  }

  .service-card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    text-align: center;
    transition: all 0.3s ease;
    overflow: hidden;
    position: relative;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }

    .service-icon {
      background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
      color: white;
      padding: 40px 30px 30px;
      position: relative;

      .icon {
        font-size: 3rem;
        margin-bottom: 15px;
        display: block;
      }

      h3 {
        color: white;
        margin: 0;
        font-size: 1.4rem;
        font-family: "Montserrat", sans-serif;
        font-weight: 600;
      }

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 20px;
        background: white;
        border-radius: 50% 50% 0 0 / 100% 100% 0 0;
      }
    }

    .service-content {
      padding: 30px;
      padding-top: 20px;

      p {
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .service-features {
        list-style: none;
        padding: 0;
        margin: 20px 0;

        li {
          color: #2d3748;
          margin-bottom: 8px;
          padding-left: 20px;
          position: relative;
          font-size: 0.9rem;

          &:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #3182ce;
            font-weight: bold;
          }
        }
      }

      .service-cta {
        background: #3182ce;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 25px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s ease;
        text-decoration: none;
        display: inline-block;

        &:hover {
          background: #2c5282;
        }
      }
    }
  }

  .cta-section {
    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    border-radius: 15px;
    padding: 40px;
    text-align: center;
    color: white;
    margin-top: 40px;

    h3 {
      font-family: "Montserrat", sans-serif;
      font-size: 1.8rem;
      margin-bottom: 15px;
    }

    p {
      font-size: 1.1rem;
      margin-bottom: 25px;
      opacity: 0.9;
    }

    .main-cta {
      background: #e67e22;
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 25px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-right: 15px;

      &:hover {
        background: #d35400;
        transform: translateY(-2px);
      }
    }

    .secondary-cta {
      background: transparent;
      color: white;
      padding: 15px 30px;
      border: 2px solid white;
      border-radius: 25px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;

      &:hover {
        background: white;
        color: #2d3748;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 60px 20px;

    h2 {
      font-size: 2rem;
    }

    .services-grid {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .service-card .service-icon {
      padding: 30px 20px 20px;

      .icon {
        font-size: 2.5rem;
      }

      h3 {
        font-size: 1.2rem;
      }
    }

    .cta-section {
      padding: 30px 20px;

      h3 {
        font-size: 1.5rem;
      }

      .main-cta,
      .secondary-cta {
        display: block;
        margin: 10px auto;
        width: 100%;
        max-width: 250px;
      }
    }
  }
`;

const HomePage: React.FC = () => {
  return (
    <HomeContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>KORSVAGEN S.R.L.</h1>
            <p className="slogan">YOU DREAM, WE BUILD</p>
            <p className="subtitle">
              Trasformiamo le tue idee in realtà con professionalità, qualità e
              innovazione. Dal progetto alla realizzazione, siamo il tuo partner
              di fiducia.
            </p>
            <button className="cta-button">Richiedi una Consulenza</button>
          </div>
        </HeroSection>

        <ServicesPreview>
          <h2>I Nostri Servizi</h2>
          <p className="section-subtitle">
            Offriamo soluzioni complete per ogni esigenza edilizia, dalla
            progettazione alla realizzazione finale. Scopri come possiamo
            trasformare le tue idee in realtà.
          </p>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">
                <span className="icon">🏗️</span>
                <h3>Progettazione</h3>
              </div>
              <div className="service-content">
                <p>
                  Progettazione completa per ogni tipo di costruzione, dalla
                  fase preliminare al progetto esecutivo.
                </p>
                <ul className="service-features">
                  <li>Progettazione Architettonica</li>
                  <li>Progettazione Strutturale</li>
                  <li>Progettazione Impiantistica</li>
                  <li>Rendering 3D e Visualizzazioni</li>
                </ul>
                <a href="/servizi" className="service-cta">
                  Scopri di più
                </a>
              </div>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <span className="icon">🏢</span>
                <h3>Costruzioni</h3>
              </div>
              <div className="service-content">
                <p>
                  Realizziamo costruzioni di ogni tipologia con materiali di
                  qualità e tecniche all'avanguardia.
                </p>
                <ul className="service-features">
                  <li>Costruzioni Residenziali</li>
                  <li>Costruzioni Commerciali</li>
                  <li>Costruzioni Industriali</li>
                  <li>Gestione Cantiere Completa</li>
                </ul>
                <a href="/servizi" className="service-cta">
                  Scopri di più
                </a>
              </div>
            </div>
            <div className="service-card">
              <div className="service-icon">
                <span className="icon">🔧</span>
                <h3>Ristrutturazioni</h3>
              </div>
              <div className="service-content">
                <p>
                  Ristrutturazioni complete e riqualificazioni energetiche per
                  rinnovare e valorizzare i tuoi spazi.
                </p>
                <ul className="service-features">
                  <li>Ristrutturazioni Complete</li>
                  <li>Riqualificazione Energetica</li>
                  <li>Bonus Edilizi</li>
                  <li>Restauro Conservativo</li>
                </ul>
                <a href="/servizi" className="service-cta">
                  Scopri di più
                </a>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h3>Pronto a Realizzare il Tuo Progetto?</h3>
            <p>
              Contattaci per una consulenza gratuita e senza impegno. I nostri
              esperti sono pronti ad ascoltarti.
            </p>
            <button className="main-cta">Richiedi Consulenza</button>
            <a href="/contatti" className="secondary-cta">
              Contattaci
            </a>
          </div>
        </ServicesPreview>
      </MainContent>
      <Footer />
    </HomeContainer>
  );
};

export default HomePage;
