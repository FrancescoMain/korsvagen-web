import React, { useState } from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const CareersContainer = styled.div`
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
    width: 100%;
  }

  h1 {
    font-size: 2.8rem;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: "Montserrat", sans-serif;
    line-height: 1.2;

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
  }

  p {
    font-size: 1.2rem;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.4;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }

  @media (max-width: 1024px) {
    padding: 80px 20px;
    min-height: 250px;
  }

  @media (max-width: 768px) {
    padding: 60px 20px;
    min-height: 200px;
  }

  @media (max-width: 480px) {
    padding: 40px 20px;
    min-height: 180px;
  }

  p {
    font-size: 1.2rem;
    color: #e2e8f0;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    padding: 60px 20px;

    h1 {
      font-size: 2rem;
    }
  }
`;

const ContentSection = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;

  .intro-section {
    text-align: center;
    margin-bottom: 60px;

    h2 {
      font-size: 2.5rem;
      color: #2d3748;
      margin-bottom: 20px;
      font-family: "Montserrat", sans-serif;
    }

    p {
      font-size: 1.1rem;
      color: #4a5568;
      line-height: 1.6;
      max-width: 700px;
      margin: 0 auto;
    }
  }

  .benefits-section {
    margin-bottom: 60px;

    h3 {
      font-size: 2rem;
      color: #2d3748;
      margin-bottom: 30px;
      text-align: center;
      font-family: "Montserrat", sans-serif;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin-top: 40px;

      .benefit-card {
        background: white;
        padding: 30px;
        border-radius: 15px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-5px);
        }

        .icon {
          font-size: 3rem;
          margin-bottom: 20px;
          display: block;
        }

        h4 {
          color: #2d3748;
          margin-bottom: 15px;
          font-family: "Montserrat", sans-serif;
        }

        p {
          color: #4a5568;
          line-height: 1.6;
        }
      }
    }
  }

  .positions-section {
    margin-bottom: 60px;

    h3 {
      font-size: 2rem;
      color: #2d3748;
      margin-bottom: 30px;
      text-align: center;
      font-family: "Montserrat", sans-serif;
    }

    .positions-grid {
      display: grid;
      gap: 20px;
      margin-top: 40px;

      .position-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 25px;
        transition: all 0.3s ease;

        &:hover {
          border-color: #3182ce;
          box-shadow: 0 4px 15px rgba(49, 130, 206, 0.1);
        }

        .position-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 15px;

          h4 {
            color: #2d3748;
            margin: 0;
            font-family: "Montserrat", sans-serif;
            font-size: 1.3rem;
          }

          .position-type {
            background: #e6fffa;
            color: #3182ce;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 500;
          }
        }

        .position-details {
          margin-bottom: 15px;

          .detail-item {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            color: #4a5568;
            font-size: 0.9rem;

            .icon {
              margin-right: 8px;
              width: 16px;
            }
          }
        }

        p {
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .requirements {
          margin-bottom: 20px;

          h5 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 0.9rem;
            font-weight: 600;
          }

          ul {
            list-style: none;
            padding: 0;
            margin: 0;

            li {
              color: #4a5568;
              padding: 3px 0;
              padding-left: 15px;
              position: relative;
              font-size: 0.9rem;

              &:before {
                content: "•";
                position: absolute;
                left: 0;
                color: #3182ce;
              }
            }
          }
        }

        .apply-btn {
          background: #3182ce;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.3s ease;

          &:hover {
            background: #2c5282;
          }
        }
      }
    }
  }

  @media (max-width: 768px) {
    padding: 60px 20px;

    .intro-section h2 {
      font-size: 2rem;
    }

    .benefits-section .benefits-grid {
      grid-template-columns: 1fr;
    }

    .positions-section .position-card .position-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }
`;

const ApplicationForm = styled.section`
  background: #f7fafc;
  padding: 60px 20px;

  .form-container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);

    h3 {
      color: #2d3748;
      margin-bottom: 30px;
      text-align: center;
      font-family: "Montserrat", sans-serif;
      font-size: 1.8rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
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

      .file-input {
        position: relative;
        display: inline-block;
        cursor: pointer;
        width: 100%;

        input[type="file"] {
          position: absolute;
          left: -9999px;
        }

        .file-label {
          display: block;
          padding: 12px;
          background: #f7fafc;
          border: 2px dashed #cbd5e0;
          border-radius: 5px;
          text-align: center;
          color: #4a5568;
          transition: all 0.3s ease;

          &:hover {
            border-color: #3182ce;
            background: #ebf8ff;
          }
        }
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

  @media (max-width: 768px) {
    padding: 40px 20px;

    .form-container {
      padding: 30px 20px;
    }
  }
`;

const CareersPage: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    telefono: "",
    posizione: "",
    esperienza: "",
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
    console.log("Application data:", formData);
    alert("Grazie per la tua candidatura! Ti contatteremo presto.");
  };

  const positions = [
    {
      id: 1,
      title: "Ingegnere Strutturale",
      type: "Tempo Pieno",
      location: "Pompei (NA)",
      experience: "3-5 anni",
      description:
        "Cerchiamo un ingegnere strutturale esperto per la progettazione e il calcolo di strutture in cemento armato, acciaio e legno.",
      requirements: [
        "Laurea in Ingegneria Civile/Strutturale",
        "Esperienza con software di calcolo strutturale",
        "Conoscenza normative tecniche",
        "Capacità di lavoro in team",
      ],
    },
    {
      id: 2,
      title: "Architetto Progettista",
      type: "Tempo Pieno",
      location: "Pompei (NA)",
      experience: "2-4 anni",
      description:
        "Ricerchiamo un architetto per la progettazione architettonica di edifici residenziali e commerciali.",
      requirements: [
        "Laurea in Architettura",
        "Esperienza con AutoCAD, Revit, SketchUp",
        "Creatività e senso estetico",
        "Conoscenza normative urbanistiche",
      ],
    },
    {
      id: 3,
      title: "Geometra/Capo Cantiere",
      type: "Tempo Pieno",
      location: "Varie sedi",
      experience: "5+ anni",
      description:
        "Cerchiamo un geometra esperto per la gestione e supervisione dei cantieri edilizi.",
      requirements: [
        "Diploma di Geometra",
        "Esperienza nella gestione cantieri",
        "Conoscenza normative sicurezza",
        "Capacità organizzative e leadership",
      ],
    },
    {
      id: 4,
      title: "Operaio Specializzato",
      type: "Tempo Pieno",
      location: "Varie sedi",
      experience: "1-3 anni",
      description:
        "Ricerchiamo operai specializzati in muratura, carpenteria e finiture edili.",
      requirements: [
        "Esperienza nel settore edile",
        "Conoscenza tecniche costruttive",
        "Attestati di sicurezza",
        "Disponibilità trasferte",
      ],
    },
  ];

  const benefits = [
    {
      icon: "💰",
      title: "Stipendio Competitivo",
      description:
        "Offriamo retribuzioni allineate al mercato con possibilità di crescita economica.",
    },
    {
      icon: "📈",
      title: "Crescita Professionale",
      description:
        "Percorsi di formazione continua e opportunità di avanzamento di carriera.",
    },
    {
      icon: "🏥",
      title: "Assicurazione Sanitaria",
      description: "Copertura sanitaria integrativa per te e la tua famiglia.",
    },
    {
      icon: "⏰",
      title: "Flessibilità",
      description:
        "Orari flessibili e possibilità di smart working dove possibile.",
    },
    {
      icon: "🎯",
      title: "Progetti Stimolanti",
      description:
        "Lavorerai su progetti innovativi e sfidanti nel settore edilizio.",
    },
    {
      icon: "👥",
      title: "Team Affiatato",
      description:
        "Ambiente di lavoro collaborativo con colleghi qualificati e disponibili.",
    },
  ];

  return (
    <CareersContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>Lavora con Noi</h1>
            <p>
              Unisciti al team KORSVAGEN e contribuisci a costruire il futuro
              dell'edilizia. Cerchiamo professionisti appassionati e qualificati
              per crescere insieme.
            </p>
          </div>
        </HeroSection>

        <ContentSection>
          <div className="intro-section">
            <h2>Perché Scegliere KORSVAGEN</h2>
            <p>
              In KORSVAGEN crediamo che le persone siano il nostro asset più
              prezioso. Offriamo un ambiente di lavoro stimolante, opportunità
              di crescita professionale e la possibilità di lavorare su progetti
              innovativi che fanno la differenza.
            </p>
          </div>

          <div className="benefits-section">
            <h3>I Nostri Vantaggi</h3>
            <div className="benefits-grid">
              {benefits.map((benefit, index) => (
                <div key={index} className="benefit-card">
                  <span className="icon">{benefit.icon}</span>
                  <h4>{benefit.title}</h4>
                  <p>{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="positions-section">
            <h3>Posizioni Aperte</h3>
            <div className="positions-grid">
              {positions.map((position) => (
                <div key={position.id} className="position-card">
                  <div className="position-header">
                    <h4>{position.title}</h4>
                    <span className="position-type">{position.type}</span>
                  </div>
                  <div className="position-details">
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      {position.location}
                    </div>
                    <div className="detail-item">
                      <span className="icon">💼</span>
                      {position.experience}
                    </div>
                  </div>
                  <p>{position.description}</p>
                  <div className="requirements">
                    <h5>Requisiti:</h5>
                    <ul>
                      {position.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <button className="apply-btn">Candidati</button>
                </div>
              ))}
            </div>
          </div>
        </ContentSection>

        <ApplicationForm>
          <div className="form-container">
            <h3>Candidatura Spontanea</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
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

              <div className="form-grid">
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

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="posizione">Posizione di Interesse</label>
                  <select
                    id="posizione"
                    name="posizione"
                    value={formData.posizione}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleziona una posizione</option>
                    <option value="ingegnere-strutturale">
                      Ingegnere Strutturale
                    </option>
                    <option value="architetto">Architetto Progettista</option>
                    <option value="geometra">Geometra/Capo Cantiere</option>
                    <option value="operaio">Operaio Specializzato</option>
                    <option value="altro">Altro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="esperienza">Anni di Esperienza</label>
                  <select
                    id="esperienza"
                    name="esperienza"
                    value={formData.esperienza}
                    onChange={handleInputChange}
                  >
                    <option value="">Seleziona esperienza</option>
                    <option value="0-1">0-1 anni</option>
                    <option value="1-3">1-3 anni</option>
                    <option value="3-5">3-5 anni</option>
                    <option value="5+">5+ anni</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="cv">Curriculum Vitae</label>
                <div className="file-input">
                  <input type="file" id="cv" accept=".pdf,.doc,.docx" />
                  <label htmlFor="cv" className="file-label">
                    📄 Carica il tuo CV (PDF, DOC, DOCX)
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="messaggio">Lettera di Presentazione</label>
                <textarea
                  id="messaggio"
                  name="messaggio"
                  value={formData.messaggio}
                  onChange={handleInputChange}
                  placeholder="Raccontaci di te, delle tue competenze e perché vorresti lavorare con noi..."
                />
              </div>

              <button type="submit" className="submit-btn">
                Invia Candidatura
              </button>

              <p className="privacy-notice">
                Inviando questa candidatura accetti il trattamento dei tuoi dati
                personali secondo la nostra
                <a href="/privacy"> Privacy Policy</a>. I tuoi dati saranno
                utilizzati esclusivamente per valutare la tua candidatura.
              </p>
            </form>
          </div>
        </ApplicationForm>
      </MainContent>
      <Footer />
    </CareersContainer>
  );
};

export default CareersPage;
