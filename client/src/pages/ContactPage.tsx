import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { contactData } from "../data/contactData";

const ContactContainer = styled.div`
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

  @media (max-width: 1024px) {
    padding-top: 100px;
  }

  @media (max-width: 768px) {
    padding-top: 80px;
  }

  @media (max-width: 480px) {
    padding-top: 70px;
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(44, 44, 44, 0.95) 100%
    ),
    url("https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: white;
  text-align: center;
  padding: 120px 20px 80px;
  min-height: 60vh;
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
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;

    h1 {
      font-size: 4rem;
      margin-bottom: 30px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #ffffff;
      line-height: 1.1;
      font-weight: 400;

      @media (max-width: 1024px) {
        font-size: 3.5rem;
      }

      @media (max-width: 768px) {
        font-size: 2.5rem;
        margin-bottom: 25px;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
        margin-bottom: 20px;
        letter-spacing: 0.05em;
      }
    }

    p {
      font-size: 1.3rem;
      color: #cccccc;
      font-weight: 300;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 1024px) {
        font-size: 1.2rem;
      }

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }

  @media (max-width: 1024px) {
    padding: 110px 20px 70px;
    min-height: 55vh;
    background-attachment: scroll;
  }

  @media (max-width: 768px) {
    padding: 100px 20px 60px;
    min-height: 50vh;
  }

  @media (max-width: 480px) {
    padding: 90px 15px 50px;
    min-height: 45vh;
  }
`;

const ContactSection = styled.section`
  padding: 80px 0;
  background: #1a1a1a;

  @media (max-width: 768px) {
    padding: 60px 0;
  }

  @media (max-width: 480px) {
    padding: 40px 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  margin-bottom: 80px;

  @media (max-width: 1024px) {
    gap: 60px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 50px;
    margin-bottom: 60px;
  }

  @media (max-width: 480px) {
    gap: 40px;
  }
`;

const ContactForm = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 30px;
  }

  @media (max-width: 480px) {
    padding: 25px;
  }

  h3 {
    color: #ffffff;
    margin-bottom: 30px;
    font-family: "Korsvagen Brand", "Times New Roman", serif;
    font-size: 1.8rem;
    font-weight: 400;
    letter-spacing: 0.02em;

    @media (max-width: 768px) {
      font-size: 1.6rem;
      margin-bottom: 25px;
    }

    @media (max-width: 480px) {
      font-size: 1.4rem;
      margin-bottom: 20px;
    }
  }

  .form-group {
    margin-bottom: 25px;

    @media (max-width: 480px) {
      margin-bottom: 20px;
    }

    label {
      display: block;
      color: #cccccc;
      margin-bottom: 8px;
      font-weight: 500;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      @media (max-width: 480px) {
        font-size: 0.85rem;
        margin-bottom: 6px;
      }
    }

    input,
    select,
    textarea {
      width: 100%;
      padding: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #4caf50;
        background: rgba(255, 255, 255, 0.1);
      }

      &::placeholder {
        color: #999999;
      }

      @media (max-width: 480px) {
        padding: 12px;
        font-size: 0.95rem;
      }
    }

    select {
      cursor: pointer;

      option {
        background: #ffffff;
        color: #1a1a1a;
        padding: 10px;
        border: none;
        font-family: "Inter", "Segoe UI", sans-serif;

        &:hover,
        &:focus,
        &:checked {
          background: #f0f0f0;
          color: #1a1a1a;
        }
      }
    }

    textarea {
      resize: vertical;
      min-height: 120px;
    }
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 15px;
    }
  }

  .submit-btn {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
    padding: 18px 40px;
    border: 2px solid rgba(76, 175, 80, 0.2);
    border-radius: 50px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    font-family: "Inter", "Segoe UI", sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(76, 175, 80, 0.2);
      border-color: rgba(76, 175, 80, 0.4);
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
    }

    @media (max-width: 480px) {
      padding: 15px 30px;
      font-size: 1rem;
    }
  }

  .privacy-notice {
    font-size: 0.85rem;
    color: #999999;
    margin-top: 20px;
    line-height: 1.5;
    font-family: "Inter", "Segoe UI", sans-serif;

    a {
      color: #4caf50;
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    @media (max-width: 480px) {
      font-size: 0.8rem;
      margin-top: 15px;
    }
  }
`;

const ContactInfo = styled.div`
  .info-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);

    @media (max-width: 480px) {
      padding: 25px;
      margin-bottom: 25px;
    }

    h4 {
      color: #ffffff;
      margin-bottom: 25px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-size: 1.4rem;
      font-weight: 400;
      letter-spacing: 0.02em;

      @media (max-width: 480px) {
        font-size: 1.2rem;
        margin-bottom: 20px;
      }
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;

      @media (max-width: 480px) {
        margin-bottom: 15px;
      }

      .icon {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        flex-shrink: 0;
        font-size: 1.2rem;
        border: 1px solid rgba(76, 175, 80, 0.2);

        @media (max-width: 480px) {
          width: 45px;
          height: 45px;
          margin-right: 15px;
          font-size: 1.1rem;
        }
      }

      .content {
        .label {
          font-weight: 600;
          color: #ffffff;
          margin-bottom: 5px;
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 1rem;

          @media (max-width: 480px) {
            font-size: 0.95rem;
          }
        }

        .value {
          color: #cccccc;
          line-height: 1.5;
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 0.95rem;

          @media (max-width: 480px) {
            font-size: 0.9rem;
          }
        }

        a {
          color: #4caf50;
          text-decoration: none;
          transition: color 0.3s ease;

          &:hover {
            color: #66bb6a;
            text-decoration: underline;
          }
        }
      }
    }
  }

  .office-hours {
    background: rgba(76, 175, 80, 0.05);
    border: 1px solid rgba(76, 175, 80, 0.1);
    border-radius: 15px;
    padding: 25px;

    @media (max-width: 480px) {
      padding: 20px;
    }

    h4 {
      color: #ffffff;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-size: 1.2rem;
      font-weight: 400;

      @media (max-width: 480px) {
        font-size: 1.1rem;
        margin-bottom: 15px;
      }
    }

    .hours-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      color: #cccccc;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-size: 0.95rem;

      @media (max-width: 480px) {
        font-size: 0.9rem;
        margin-bottom: 8px;
      }

      .day {
        font-weight: 500;
        color: #ffffff;
      }

      .time {
        color: #4caf50;
      }
    }
  }
`;

const ContactContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 80px 2rem;
  background: #1a1a1a;
  color: #ffffff;

  @media (max-width: 768px) {
    padding: 60px 1rem;
  }

  @media (max-width: 480px) {
    padding: 40px 1rem;
  }

  .contact-intro {
    text-align: center;
    margin-bottom: 60px;

    h2 {
      font-family: "Korsvagen Brand", Arial, sans-serif;
      font-size: 2.5rem;
      color: #ffffff;
      margin-bottom: 1.5rem;
      font-weight: 400;

      @media (max-width: 768px) {
        font-size: 2rem;
      }

      @media (max-width: 480px) {
        font-size: 1.8rem;
      }
    }

    p {
      font-size: 1.2rem;
      color: #cccccc;
      line-height: 1.6;
      max-width: 600px;
      margin: 0 auto;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
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

          <ContactGrid>
            <ContactForm>
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
            </ContactForm>

            <ContactInfo>
              <div className="info-section">
                <h4>Informazioni di Contatto</h4>

                <div className="info-item">
                  <div className="icon">📍</div>
                  <div className="content">
                    <div className="label">Indirizzo</div>
                    <div className="value">
                      {contactData.address.street}
                      <br />
                      {contactData.address.city}
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon">📞</div>
                  <div className="content">
                    <div className="label">Telefono</div>
                    <div className="value">
                      <a href={`tel:${contactData.phone}`}>
                        {contactData.phone}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon">📧</div>
                  <div className="content">
                    <div className="label">Email</div>
                    <div className="value">
                      <a href={`mailto:${contactData.email}`}>
                        {contactData.email}
                      </a>
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <div className="icon">🌐</div>
                  <div className="content">
                    <div className="label">Social Media</div>
                    <div className="value">
                      <a
                        href={contactData.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Instagram
                      </a>{" "}
                      |
                      <a
                        href={contactData.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        LinkedIn
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="office-hours">
                <h4>Orari di Apertura</h4>
                <div className="hours-item">
                  <span className="day">Lunedì - Venerdì</span>
                  <span className="time">9:00 - 18:00</span>
                </div>
                <div className="hours-item">
                  <span className="day">Sabato</span>
                  <span className="time">9:00 - 13:00</span>
                </div>
                <div className="hours-item">
                  <span className="day">Domenica</span>
                  <span className="time">Chiuso</span>
                </div>
              </div>
            </ContactInfo>
          </ContactGrid>
        </ContactContent>
      </MainContent>
      <Footer />
    </ContactContainer>
  );
};

export default ContactPage;
