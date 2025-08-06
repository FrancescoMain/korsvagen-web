import React, { useState } from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import PageHero from "../components/common/PageHero";

const CareersContainer = styled.div`
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


const ContentSection = styled.section`
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

  .intro-section {
    text-align: center;
    margin-bottom: 80px;

    @media (max-width: 768px) {
      margin-bottom: 60px;
    }

    @media (max-width: 480px) {
      margin-bottom: 50px;
    }

    h2 {
      font-size: 2.5rem;
      color: #ffffff;
      margin-bottom: 30px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 2rem;
        margin-bottom: 25px;
      }

      @media (max-width: 480px) {
        font-size: 1.8rem;
        margin-bottom: 20px;
      }
    }

    p {
      font-size: 1.2rem;
      color: #cccccc;
      line-height: 1.7;
      max-width: 700px;
      margin: 0 auto;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }

  .benefits-section {
    margin-bottom: 80px;

    @media (max-width: 768px) {
      margin-bottom: 60px;
    }

    @media (max-width: 480px) {
      margin-bottom: 50px;
    }

    h3 {
      font-size: 2rem;
      color: #ffffff;
      margin-bottom: 40px;
      text-align: center;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 1.8rem;
        margin-bottom: 35px;
      }

      @media (max-width: 480px) {
        font-size: 1.6rem;
        margin-bottom: 30px;
      }
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 40px;

      @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .benefit-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        padding: 30px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          padding: 25px;
        }

        @media (max-width: 480px) {
          padding: 20px;
        }

        .benefit-icon {
          font-size: 3rem;
          margin-bottom: 20px;
          color: #4caf50;

          @media (max-width: 768px) {
            font-size: 2.5rem;
            margin-bottom: 15px;
          }

          @media (max-width: 480px) {
            font-size: 2rem;
            margin-bottom: 12px;
          }
        }

        h4 {
          font-size: 1.3rem;
          color: #ffffff;
          margin-bottom: 15px;
          font-family: "Korsvagen Brand", "Times New Roman", serif;
          font-weight: 400;
          letter-spacing: 0.02em;

          @media (max-width: 768px) {
            font-size: 1.2rem;
            margin-bottom: 12px;
          }

          @media (max-width: 480px) {
            font-size: 1.1rem;
            margin-bottom: 10px;
          }
        }

        p {
          font-size: 1rem;
          color: #cccccc;
          line-height: 1.6;
          margin: 0;
          font-family: "Inter", "Segoe UI", sans-serif;

          @media (max-width: 480px) {
            font-size: 0.95rem;
          }
        }
      }
    }
  }

  .positions-section {
    margin-bottom: 80px;

    @media (max-width: 768px) {
      margin-bottom: 60px;
    }

    @media (max-width: 480px) {
      margin-bottom: 50px;
    }

    h3 {
      font-size: 2rem;
      color: #ffffff;
      margin-bottom: 40px;
      text-align: center;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 1.8rem;
        margin-bottom: 35px;
      }

      @media (max-width: 480px) {
        font-size: 1.6rem;
        margin-bottom: 30px;
      }
    }

    .positions-grid {
      display: grid;
      gap: 25px;
      margin-top: 40px;

      @media (max-width: 768px) {
        gap: 20px;
      }

      .position-card {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        padding: 30px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        @media (max-width: 768px) {
          padding: 25px;
        }

        @media (max-width: 480px) {
          padding: 20px;
        }

        .position-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;

          @media (max-width: 600px) {
            flex-direction: column;
            gap: 10px;
          }

          h4 {
            color: #ffffff;
            margin: 0;
            font-family: "Korsvagen Brand", "Times New Roman", serif;
            font-size: 1.4rem;
            font-weight: 400;
            letter-spacing: 0.02em;

            @media (max-width: 768px) {
              font-size: 1.3rem;
            }

            @media (max-width: 480px) {
              font-size: 1.2rem;
            }
          }

          .position-type {
            background: rgba(76, 175, 80, 0.1);
            color: #4caf50;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            border: 1px solid rgba(76, 175, 80, 0.2);
            font-family: "Inter", "Segoe UI", sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
        }

        .position-details {
          margin-bottom: 20px;

          .detail-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            color: #cccccc;
            font-size: 0.95rem;
            font-family: "Inter", "Segoe UI", sans-serif;

            @media (max-width: 480px) {
              font-size: 0.9rem;
              margin-bottom: 10px;
            }

            .icon {
              margin-right: 12px;
              width: 18px;
              color: #4caf50;

              @media (max-width: 480px) {
                width: 16px;
                margin-right: 10px;
              }
            }
          }
        }

        p {
          color: #cccccc;
          line-height: 1.6;
          margin-bottom: 20px;
          font-family: "Inter", "Segoe UI", sans-serif;

          @media (max-width: 480px) {
            font-size: 0.95rem;
          }
        }

        .requirements {
          margin-bottom: 25px;

          h5 {
            color: #ffffff;
            margin-bottom: 15px;
            font-size: 1rem;
            font-weight: 600;
            font-family: "Inter", "Segoe UI", sans-serif;

            @media (max-width: 480px) {
              font-size: 0.95rem;
              margin-bottom: 12px;
            }
          }

          ul {
            list-style: none;
            padding: 0;

            li {
              color: #cccccc;
              margin-bottom: 8px;
              font-family: "Inter", "Segoe UI", sans-serif;
              font-size: 0.9rem;
              display: flex;
              align-items: center;

              @media (max-width: 480px) {
                font-size: 0.85rem;
                margin-bottom: 6px;
              }

              &::before {
                content: "•";
                color: #4caf50;
                font-weight: bold;
                margin-right: 12px;
                font-size: 1.2rem;

                @media (max-width: 480px) {
                  margin-right: 10px;
                  font-size: 1.1rem;
                }
              }
            }
          }
        }

        .apply-button {
          background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: "Inter", "Segoe UI", sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;

          &:hover {
            background: linear-gradient(135deg, #45a049 0%, #4caf50 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
          }

          @media (max-width: 480px) {
            padding: 10px 25px;
            font-size: 0.9rem;
          }
        }
      }
    }
  }
`;

const ApplicationForm = styled.section`
  background: #1a1a1a;
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }

  @media (max-width: 480px) {
    padding: 40px 0;
  }
`;

const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }

  .form-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 40px;
    backdrop-filter: blur(10px);

    @media (max-width: 768px) {
      padding: 30px;
    }

    @media (max-width: 480px) {
      padding: 25px;
    }

    h3 {
      font-size: 2rem;
      color: #ffffff;
      margin-bottom: 30px;
      text-align: center;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-weight: 400;
      letter-spacing: 0.02em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 1.8rem;
        margin-bottom: 25px;
      }

      @media (max-width: 480px) {
        font-size: 1.6rem;
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
        margin-bottom: 8px;
        color: #cccccc;
        font-weight: 500;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 1rem;

        @media (max-width: 480px) {
          font-size: 0.95rem;
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

      textarea {
        resize: vertical;
        min-height: 120px;
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

      input[type="file"] {
        padding: 10px;
        border: 2px dashed rgba(255, 255, 255, 0.2);
        background: rgba(255, 255, 255, 0.02);
        cursor: pointer;

        &::-webkit-file-upload-button {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 6px;
          padding: 8px 16px;
          margin-right: 15px;
          cursor: pointer;
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        &::-webkit-file-upload-button:hover {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.5);
        }

        &:hover {
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.05);
        }
      }
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 15px;
      }
    }

    .submit-button {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border: none;
      padding: 15px 40px;
      border-radius: 25px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: "Inter", "Segoe UI", sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: 100%;

      &:hover {
        background: linear-gradient(135deg, #45a049 0%, #4caf50 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
      }

      @media (max-width: 480px) {
        padding: 12px 30px;
        font-size: 1rem;
      }
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
    cv: null as File | null,
    messaggio: "",
  });

  const formRef = React.useRef<HTMLDivElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Verifica che il file sia PDF o DOC/DOCX
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert(
          "Formato file non supportato. Si prega di caricare un file PDF o Word."
        );
        return;
      }
      // Verifica dimensione file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Il file è troppo grande. Dimensione massima: 5MB.");
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      cv: file,
    }));
  };

  const handleApplyClick = (positionTitle: string) => {
    setFormData((prev) => ({
      ...prev,
      posizione: positionTitle,
    }));

    // Scroll al form
    formRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        <PageHero
          title="Lavora con Noi"
          subtitle="Unisciti al team KORSVAGEN e contribuisci a costruire il futuro dell'edilizia"
          size="compact"
        />

        <ContentSection>
          <Container>
            <div className="intro-section">
              <h2>Perché Scegliere KORSVAGEN</h2>
              <p>
                In KORSVAGEN crediamo che le persone siano il nostro asset più
                prezioso. Offriamo un ambiente di lavoro stimolante, opportunità
                di crescita professionale e la possibilità di lavorare su
                progetti innovativi che fanno la differenza.
              </p>
            </div>

            <div className="benefits-section">
              <h3>I Nostri Vantaggi</h3>
              <div className="benefits-grid">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-card">
                    <div className="benefit-icon">{benefit.icon}</div>
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
                    <button
                      className="apply-button"
                      onClick={() => handleApplyClick(position.title)}
                    >
                      Candidati
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </ContentSection>

        <ApplicationForm ref={formRef}>
          <FormContainer>
            <div className="form-card">
              <h3>
                {formData.posizione
                  ? `Candidatura per: ${formData.posizione}`
                  : "Candidatura Spontanea"}
              </h3>
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
                      placeholder="Il tuo nome"
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
                      placeholder="Il tuo cognome"
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
                      placeholder="la.tua@email.com"
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
                      placeholder="+39 123 456 7890"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="posizione">Posizione di Interesse</label>
                    <select
                      id="posizione"
                      name="posizione"
                      value={formData.posizione}
                      onChange={handleInputChange}
                    >
                      <option value="">Seleziona una posizione</option>
                      <option value="Ingegnere Strutturale">
                        Ingegnere Strutturale
                      </option>
                      <option value="Architetto Progettista">
                        Architetto Progettista
                      </option>
                      <option value="Geometra/Capo Cantiere">
                        Geometra/Capo Cantiere
                      </option>
                      <option value="Operaio Specializzato">
                        Operaio Specializzato
                      </option>
                      <option value="altro">Altro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="cv">Curriculum Vitae *</label>
                    <input
                      type="file"
                      id="cv"
                      name="cv"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      required
                    />
                    <small
                      style={{
                        color: "#999",
                        fontSize: "0.8rem",
                        marginTop: "5px",
                        display: "block",
                      }}
                    >
                      Formati accettati: PDF, DOC, DOCX (max 5MB)
                    </small>
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

                <button type="submit" className="submit-button">
                  Invia Candidatura
                </button>
              </form>
            </div>
          </FormContainer>
        </ApplicationForm>

        <ContactCTA />
      </MainContent>
      <Footer />
    </CareersContainer>
  );
};

export default CareersPage;
