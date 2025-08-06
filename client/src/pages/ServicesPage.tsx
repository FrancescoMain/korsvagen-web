import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import PageHero from "../components/common/PageHero";
import { useServices } from "../hooks/useServices";

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
      background: linear-gradient(135deg, rgba(44, 44, 44, 0.9) 0%, rgba(26, 26, 26, 0.95) 100%);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      color: white;
      padding: 40px 30px;
      text-align: center;
      position: relative;
      
      /* Overlay to ensure text readability */
      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(44, 44, 44, 0.8) 0%, rgba(26, 26, 26, 0.9) 100%);
        z-index: 1;
      }
      
      /* Ensure text is above overlay */
      h3, .subtitle {
        position: relative;
        z-index: 2;
      }

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

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
  color: #ffffff;
  font-size: 1.2rem;
`;

const ErrorMessage = styled.div`
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.3);
  color: #dc3545;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  margin: 2rem auto;
  max-width: 600px;
  
  .title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .message {
    font-size: 1rem;
    line-height: 1.5;
  }
`;

const ServicesPage: React.FC = () => {
  const { services, loading, error, fetchPublicServices } = useServices();

  // Carica servizi al mount
  useEffect(() => {
    fetchPublicServices();
  }, [fetchPublicServices]);

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact-form");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderServiceCard = (service: any) => (
    <div key={service.id} className="service-card">
      <div 
        className="card-header"
        style={{
          backgroundImage: service.image_url 
            ? `linear-gradient(135deg, rgba(44, 44, 44, 0.8) 0%, rgba(26, 26, 26, 0.9) 100%), url(${service.image_url})`
            : undefined
        }}
      >
        <h3>{service.title}</h3>
        {service.subtitle && (
          <p className="subtitle">{service.subtitle}</p>
        )}
      </div>
      <div className="card-content">
        <p className="description">
          {service.description}
        </p>
        {service.microservices && service.microservices.length > 0 && (
          <ul>
            {service.microservices.map((microservice: string, index: number) => (
              <li key={index}>{microservice}</li>
            ))}
          </ul>
        )}
        <button className="cta-button" onClick={scrollToContact}>
          Richiedi Preventivo
        </button>
      </div>
    </div>
  );

  return (
    <ServicesContainer>
      <Header />
      <MainContent>
        <PageHero
          title="I Nostri Servizi"
          subtitle="Soluzioni complete per ogni esigenza edilizia"
          size="compact"
        />

        <ServicesGrid>
          {loading ? (
            <LoadingSpinner>
              Caricamento servizi...
            </LoadingSpinner>
          ) : error ? (
            <ErrorMessage>
              <div className="title">Errore nel caricamento</div>
              <div className="message">
                Non è stato possibile caricare i servizi. Riprova più tardi.
                <br />
                <small>Dettagli: {error}</small>
              </div>
            </ErrorMessage>
          ) : services.length === 0 ? (
            <ErrorMessage>
              <div className="title">Nessun servizio disponibile</div>
              <div className="message">
                I nostri servizi saranno presto disponibili. Torna a trovarci!
              </div>
            </ErrorMessage>
          ) : (
            <div className="services-grid">
              {services.map(renderServiceCard)}
            </div>
          )}
        </ServicesGrid>

        <ContactCTA />
      </MainContent>
      <Footer />
    </ServicesContainer>
  );
};

export default ServicesPage;
