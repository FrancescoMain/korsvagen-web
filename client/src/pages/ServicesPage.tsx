import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";

const ServicesContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  background: #1a1a1a;
  color: #ffffff;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
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
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  overflow: hidden;
  position: relative;

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
    max-width: 800px;
    width: 100%;
    padding: 0 10px;
    position: relative;
    z-index: 2;

    h1 {
      font-size: 4.5rem;
      font-weight: 400;
      margin-bottom: 30px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      line-height: 1.1;
      color: #ffffff;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
      text-transform: uppercase;

      @media (max-width: 1024px) {
        font-size: 3.5rem;
      }

      @media (max-width: 768px) {
        font-size: 3rem;
        margin-bottom: 20px;
      }

      @media (max-width: 480px) {
        font-size: 2.5rem;
        margin-bottom: 15px;
      }
    }

    p {
      font-size: 1.4rem;
      color: #e2e8f0;
      margin: 0;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-weight: 300;

      @media (max-width: 768px) {
        font-size: 1.2rem;
      }

      @media (max-width: 480px) {
        font-size: 1.1rem;
      }
    }
  }

  @media (max-width: 1024px) {
    padding: 100px 15px 60px;
    min-height: 60vh;
  }

  @media (max-width: 768px) {
    padding: 80px 15px 50px;
    min-height: 50vh;
    background-attachment: scroll;
  }

  @media (max-width: 480px) {
    padding: 60px 10px 40px;
    min-height: 45vh;
  }
`;

const ServicesGrid = styled.section`
  background: #1a1a1a;
  padding: 100px 20px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 80px 15px;
  }

  @media (max-width: 480px) {
    padding: 60px 10px;
  }

  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 40px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }

    @media (max-width: 480px) {
      gap: 25px;
    }
  }

  .service-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .card-header {
      background: linear-gradient(135deg, #2c2c2c 0%, #1a1a1a 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: #e67e22;
      }

      h3 {
        font-size: 1.8rem;
        margin-bottom: 15px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
        font-weight: 400;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        color: #ffffff;

        @media (max-width: 768px) {
          font-size: 1.6rem;
        }

        @media (max-width: 480px) {
          font-size: 1.4rem;
        }
      }

      .subtitle {
        opacity: 0.8;
        font-size: 1rem;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-weight: 300;
        color: #cccccc;
      }
    }

    .card-content {
      padding: 40px 30px;

      @media (max-width: 768px) {
        padding: 30px 25px;
      }

      @media (max-width: 480px) {
        padding: 25px 20px;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0 0 30px 0;

        li {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #cccccc;
          position: relative;
          padding-left: 25px;
          font-family: "Inter", "Segoe UI", sans-serif;
          line-height: 1.5;

          &:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #e67e22;
            font-weight: bold;
            font-size: 1.1rem;
            top: 12px;
          }

          &:last-child {
            border-bottom: none;
          }

          @media (max-width: 480px) {
            padding: 10px 0 10px 30px;
            font-size: 0.95rem;
            line-height: 1.6;

            &:before {
              font-size: 1rem;
              top: 10px;
            }
          }

          @media (max-width: 350px) {
            padding-left: 35px;
            font-size: 0.9rem;

            &:before {
              font-size: 0.9rem;
            }
          }
        }
      }

      .description {
        color: #cccccc;
        line-height: 1.7;
        margin-bottom: 25px;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 1rem;

        @media (max-width: 480px) {
          font-size: 0.95rem;
        }
      }

      .cta-button {
        background: transparent;
        color: #ffffff;
        padding: 15px 30px;
        border: 2px solid #e67e22;
        border-radius: 50px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.3s ease;
        width: 100%;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;

        &:hover {
          background: #e67e22;
          color: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(230, 126, 34, 0.3);
        }

        @media (max-width: 768px) {
          padding: 14px 25px;
          font-size: 0.95rem;
        }

        @media (max-width: 480px) {
          padding: 12px 20px;
          font-size: 0.9rem;
        }
      }
    }
  }
`;

const ServicesPage: React.FC = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact-form");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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
                <button className="cta-button" onClick={scrollToContact}>
                  Richiedi Preventivo
                </button>
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
                <button className="cta-button" onClick={scrollToContact}>
                  Richiedi Preventivo
                </button>
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
                <button className="cta-button" onClick={scrollToContact}>
                  Richiedi Preventivo
                </button>
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
                <button className="cta-button" onClick={scrollToContact}>
                  Richiedi Preventivo
                </button>
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
                <button className="cta-button" onClick={scrollToContact}>
                  Richiedi Preventivo
                </button>
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
                <button className="cta-button" onClick={scrollToContact}>
                  Richiedi Preventivo
                </button>
              </div>
            </div>
          </div>
        </ServicesGrid>

        <ContactCTA
          title="Richiedi un Preventivo"
          subtitle="Sei interessato a uno dei nostri servizi? Compila il form e riceverai un preventivo personalizzato gratuito."
          buttonText="Invia Richiesta"
        />
      </MainContent>
      <Footer />
    </ServicesContainer>
  );
};

export default ServicesPage;
