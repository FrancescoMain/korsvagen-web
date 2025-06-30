import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactsSection from "../components/sections/ContactsSection";

const ContactContainer = styled.div`
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

const ContactContent = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;

  .contact-intro {
    text-align: center;
    margin-bottom: 60px;

    h2 {
      color: #2d3748;
      font-size: 2rem;
      margin-bottom: 20px;
      font-family: "Montserrat", sans-serif;
    }

    p {
      color: #4a5568;
      font-size: 1.1rem;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;
    }
  }

  .contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    margin-bottom: 60px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }

  .contact-form {
    background: white;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);

    h3 {
      color: #2d3748;
      margin-bottom: 30px;
      font-family: "Montserrat", sans-serif;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        color: #4a5568;
        margin-bottom: 8px;
        font-weight: 500;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #e2e8f0;
        border-radius: 5px;
        font-size: 1rem;
        transition: border-color 0.3s ease;

        &:focus {
          outline: none;
          border-color: #3182ce;
        }
      }

      textarea {
        min-height: 120px;
        resize: vertical;
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
      }
    }

    .submit-btn {
      background: #3182ce;
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 5px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s ease;
      width: 100%;

      &:hover {
        background: #2c5282;
      }
    }

    .privacy-notice {
      font-size: 0.9rem;
      color: #718096;
      margin-top: 15px;
      line-height: 1.4;

      a {
        color: #3182ce;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .contact-info {
    .info-section {
      margin-bottom: 40px;

      h4 {
        color: #2d3748;
        margin-bottom: 20px;
        font-family: "Montserrat", sans-serif;
        font-size: 1.2rem;
      }

      .info-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;

        .icon {
          background: #3182ce;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 15px;
          flex-shrink: 0;
          font-weight: bold;
        }

        .content {
          .label {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 2px;
          }

          .value {
            color: #4a5568;
            line-height: 1.4;
          }

          a {
            color: #3182ce;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }

    .office-hours {
      background: #f7fafc;
      padding: 25px;
      border-radius: 10px;

      h4 {
        color: #2d3748;
        margin-bottom: 15px;
        font-family: "Montserrat", sans-serif;
      }

      .hours-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        color: #4a5568;

        .day {
          font-weight: 500;
        }
      }
    }
  }

  .map-section {
    background: #f7fafc;
    padding: 40px;
    border-radius: 15px;
    text-align: center;

    h3 {
      color: #2d3748;
      margin-bottom: 20px;
      font-family: "Montserrat", sans-serif;
    }

    .map-placeholder {
      width: 100%;
      height: 300px;
      background: #e2e8f0;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4a5568;
      margin-bottom: 20px;
    }

    p {
      color: #4a5568;
    }
  }
`;

const ContactPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    servizio: "",
    messaggio: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementare invio form
    console.log("Form data:", formData);
    alert("Grazie per il tuo messaggio! Ti contatteremo presto.");
  };

  return (
    <ContactContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>Contattaci</h1>
            <p>Siamo qui per realizzare i tuoi progetti edilizi</p>
          </div>
        </HeroSection>

        <ContactContent>
          <div className="contact-intro">
            <h2>Iniziamo a Parlare del Tuo Progetto</h2>
            <p>
              Hai un progetto in mente? Vuoi ristrutturare la tua casa o
              costruire da zero? Il nostro team di esperti è pronto ad
              ascoltarti e trovare la soluzione migliore per te.
            </p>
          </div>

          <div className="contact-grid">
            <div className="contact-form">
              <h3>Inviaci un Messaggio</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nome">Nome *</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cognome">Cognome *</label>
                    <input
                      type="text"
                      id="cognome"
                      name="cognome"
                      value={formData.cognome}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="telefono">Telefono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="servizio">Servizio di Interesse</label>
                  <select
                    id="servizio"
                    name="servizio"
                    value={formData.servizio}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleziona un servizio</option>
                    <option value="progettazione">Progettazione</option>
                    <option value="costruzioni">Costruzioni</option>
                    <option value="ristrutturazioni">Ristrutturazioni</option>
                    <option value="consulenza">Consulenza Tecnica</option>
                    <option value="efficienza-energetica">
                      Efficienza Energetica
                    </option>
                    <option value="altro">Altro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="messaggio">Messaggio *</label>
                  <textarea
                    id="messaggio"
                    name="messaggio"
                    value={formData.messaggio}
                    onChange={handleInputChange}
                    placeholder="Descrivi il tuo progetto o la tua richiesta..."
                    required
                  />
                </div>

                <button type="submit" className="submit-btn">
                  Invia Richiesta
                </button>

                <p className="privacy-notice">
                  Inviando questo modulo accetti il trattamento dei tuoi dati
                  personali secondo la nostra
                  <a href="/privacy"> Privacy Policy</a>. Ti contatteremo
                  esclusivamente per rispondere alla tua richiesta.
                </p>
              </form>
            </div>

            <div className="contact-info">
              <div className="info-section">
                <h4>Informazioni di Contatto</h4>

                <div className="info-item">
                  <div className="icon">📍</div>
                  <div className="content">
                    <div className="label">Indirizzo</div>
                    <div className="value">
                      Via dell'Edilizia, 123
                      <br />
                      20100 Milano, Italy
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon">📞</div>
                  <div className="content">
                    <div className="label">Telefono</div>
                    <div className="value">
                      <a href="tel:+390212345678">+39 02 1234 5678</a>
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon">📧</div>
                  <div className="content">
                    <div className="label">Email</div>
                    <div className="value">
                      <a href="mailto:info@korsvagen.it">info@korsvagen.it</a>
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon">🌐</div>
                  <div className="content">
                    <div className="label">Sito Web</div>
                    <div className="value">
                      <a
                        href="https://www.korsvagen.it"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        www.korsvagen.it
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="office-hours">
                <h4>Orari di Apertura</h4>
                <div className="hours-item">
                  <span className="day">Lunedì - Venerdì</span>
                  <span>9:00 - 18:00</span>
                </div>
                <div className="hours-item">
                  <span className="day">Sabato</span>
                  <span>9:00 - 13:00</span>
                </div>
                <div className="hours-item">
                  <span className="day">Domenica</span>
                  <span>Chiuso</span>
                </div>
              </div>
            </div>
          </div>

          <div className="map-section">
            <h3>Dove Siamo</h3>
            <div className="map-placeholder">Mappa interattiva in arrivo</div>
            <p>
              Facilmente raggiungibili con mezzi pubblici e auto. Parcheggio
              disponibile.
            </p>
          </div>
        </ContactContent>

        {/* Riutilizziamo il componente ContactsSection esistente */}
        <ContactsSection />
      </MainContent>
      <Footer />
    </ContactContainer>
  );
};

export default ContactPage;
