import React, { useState } from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  shortDescription: string;
  fullDescription: string;
  placeholder: string;
  skills: string[];
  experience: string;
  education: string;
  cvDownloadUrl?: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "marco-rossi",
    name: "Marco Rossi",
    role: "Fondatore & CEO",
    placeholder: "MR",
    shortDescription:
      "Con oltre 20 anni di esperienza nel settore, Marco guida l'azienda con visione strategica e passione per l'eccellenza.",
    fullDescription:
      "Marco Rossi è il fondatore e CEO di KORSVAGEN S.R.L., con oltre 20 anni di esperienza nel settore delle costruzioni. Ha iniziato la sua carriera come geometra, specializzandosi progressivamente nella gestione di progetti complessi e nella direzione aziendale. La sua visione strategica e la passione per l'eccellenza hanno portato l'azienda a diventare un punto di riferimento nel settore edilizio. Marco è particolarmente esperto nella pianificazione di progetti residenziali e commerciali di grande scala.",
    skills: [
      "Gestione Aziendale",
      "Pianificazione Strategica",
      "Project Management",
      "Direzione Lavori",
    ],
    experience: "20+ anni nel settore edilizio",
    education: "Diploma di Geometra, Master in Business Administration",
    cvDownloadUrl: "/cv/marco-rossi.pdf",
  },
  {
    id: "elena-bianchi",
    name: "Elena Bianchi",
    role: "Direttore Tecnico",
    placeholder: "EB",
    shortDescription:
      "Architetto specializzata in progettazione sostenibile, Elena supervisiona tutti gli aspetti tecnici dei progetti.",
    fullDescription:
      "Elena Bianchi è il Direttore Tecnico di KORSVAGEN S.R.L., con una specializzazione in architettura sostenibile e progettazione eco-compatibile. Laureata in Architettura con lode, ha conseguito un Master in Sustainable Design presso un prestigioso istituto europeo. Elena supervisiona tutti gli aspetti tecnici dei progetti, dalla fase di progettazione preliminare fino alla realizzazione, garantendo sempre l'integrazione di soluzioni innovative e sostenibili.",
    skills: [
      "Progettazione Architettonica",
      "Design Sostenibile",
      "BIM Modeling",
      "Efficienza Energetica",
    ],
    experience: "15+ anni in progettazione architettonica",
    education: "Laurea in Architettura, Master in Sustainable Design",
    cvDownloadUrl: "/cv/elena-bianchi.pdf",
  },
  {
    id: "giuseppe-verdi",
    name: "Giuseppe Verdi",
    role: "Capo Cantiere",
    placeholder: "GV",
    shortDescription:
      "Esperto maestro d'opera con 15 anni di esperienza, Giuseppe coordina le attività di cantiere con precisione.",
    fullDescription:
      "Giuseppe Verdi è il nostro Capo Cantiere, un maestro d'opera con 15 anni di solida esperienza nella gestione e coordinamento delle attività di cantiere. Ha iniziato la sua carriera come muratore specializzato, evolvendosi rapidamente in ruoli di responsabilità. Giuseppe è esperto nella gestione delle squadre di lavoro, nell'organizzazione delle fasi operative e nel controllo qualità delle lavorazioni. La sua competenza tecnica e le sue doti organizzative garantiscono il rispetto dei tempi e la qualità dei lavori.",
    skills: [
      "Gestione Cantiere",
      "Coordinamento Squadre",
      "Controllo Qualità",
      "Sicurezza Sul Lavoro",
    ],
    experience: "15+ anni in gestione cantieri",
    education: "Diploma di Maestro d'Opera, Certificazioni di Sicurezza",
    cvDownloadUrl: "/cv/giuseppe-verdi.pdf",
  },
  {
    id: "anna-ferrari",
    name: "Anna Ferrari",
    role: "Responsabile Qualità",
    placeholder: "AF",
    shortDescription:
      "Ingegnere civile con specializzazione in controllo qualità, Anna garantisce i massimi standard in ogni progetto.",
    fullDescription:
      "Anna Ferrari è la nostra Responsabile Qualità, ingegnere civile con specializzazione in controllo qualità e testing dei materiali. Laureata in Ingegneria Civile con una tesi sperimentale sui materiali innovativi per l'edilizia, Anna ha sviluppato protocolli di controllo qualità che garantiscono i massimi standard in ogni fase del progetto. La sua attenzione ai dettagli e la conoscenza approfondita delle normative tecniche assicurano che ogni realizzazione rispetti e superi gli standard richiesti.",
    skills: [
      "Controllo Qualità",
      "Testing Materiali",
      "Normative Tecniche",
      "Analisi Strutturali",
    ],
    experience: "12+ anni in controllo qualità edilizio",
    education:
      "Laurea in Ingegneria Civile, Specializzazione in Materiali da Costruzione",
    cvDownloadUrl: "/cv/anna-ferrari.pdf",
  },
  {
    id: "luca-neri",
    name: "Luca Neri",
    role: "Project Manager",
    placeholder: "LN",
    shortDescription:
      "Coordina i progetti dall'inizio alla fine, assicurando il rispetto dei tempi e dei budget concordati.",
    fullDescription:
      "Luca Neri è il nostro Project Manager senior, specializzato nel coordinamento di progetti edilizi complessi dall'ideazione alla consegna. Con una formazione in Ingegneria Gestionale e certificazioni internazionali in Project Management, Luca eccelle nella pianificazione, nel controllo dei costi e nella gestione delle risorse. La sua metodologia strutturata e l'uso di strumenti di project management all'avanguardia garantiscono il rispetto dei tempi e dei budget concordati, mantenendo sempre alti gli standard qualitativi.",
    skills: [
      "Project Management",
      "Pianificazione",
      "Controllo Costi",
      "Gestione Risorse",
    ],
    experience: "10+ anni in project management",
    education: "Laurea in Ingegneria Gestionale, Certificazione PMP",
    cvDownloadUrl: "/cv/luca-neri.pdf",
  },
  {
    id: "sofia-romano",
    name: "Sofia Romano",
    role: "Interior Designer",
    placeholder: "SR",
    shortDescription:
      "Creatività e funzionalità si uniscono nei progetti di Sofia, che cura ogni dettaglio degli interni.",
    fullDescription:
      "Sofia Romano è la nostra Interior Designer, una professionista che combina creatività artistica e funzionalità pratica nella progettazione degli spazi interni. Laureata in Design dell'Arredamento con specializzazione in spazi residenziali e commerciali, Sofia ha un approccio olistico al design che considera le esigenze specifiche di ogni cliente. La sua capacità di trasformare gli spazi in ambienti accoglienti e funzionali, unita alla conoscenza delle ultime tendenze del design, rende ogni progetto unico e personalizzato.",
    skills: [
      "Interior Design",
      "Space Planning",
      "Selezione Materiali",
      "Trend Analysis",
    ],
    experience: "8+ anni in interior design",
    education: "Laurea in Design dell'Arredamento, Master in Retail Design",
    cvDownloadUrl: "/cv/sofia-romano.pdf",
  },
  {
    id: "mario-conti",
    name: "Mario Conti",
    role: "Responsabile Sicurezza",
    placeholder: "MC",
    shortDescription:
      "Specialista in sicurezza sul lavoro, Mario garantisce il rispetto delle normative in tutti i cantieri.",
    fullDescription:
      "Mario Conti è il nostro Responsabile Sicurezza, un esperto qualificato nella gestione della sicurezza sui luoghi di lavoro. Con formazione specifica in Ingegneria della Sicurezza e numerose certificazioni nel settore, Mario sviluppa e implementa protocolli di sicurezza rigorosi per tutti i nostri cantieri. La sua esperienza ventennale nel settore e l'aggiornamento costante sulle normative vigenti garantiscono un ambiente di lavoro sicuro per tutti i collaboratori e il pieno rispetto delle disposizioni legislative.",
    skills: [
      "Sicurezza Sul Lavoro",
      "Normative di Sicurezza",
      "Risk Assessment",
      "Formazione Sicurezza",
    ],
    experience: "18+ anni in sicurezza cantieri",
    education: "Laurea in Ingegneria della Sicurezza, Certificazioni RSPP",
    cvDownloadUrl: "/cv/mario-conti.pdf",
  },
];

const TeamPage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  return (
    <TeamContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>Il Nostro Team</h1>
            <p className="subtitle">
              Professionisti esperti al servizio dei tuoi progetti
            </p>
          </div>
        </HeroSection>

        <TeamGrid>
          <div className="team-container">
            <div className="grid">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="team-card"
                  onClick={() => handleMemberClick(member)}
                >
                  <div className="member-image">
                    <div className="member-placeholder">
                      {member.placeholder}
                    </div>
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p className="role">{member.role}</p>
                    <p className="description">{member.shortDescription}</p>
                    <button className="view-details">Scopri di più</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TeamGrid>

        {selectedMember && (
          <Modal onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
              <div className="modal-header">
                <div className="member-image">
                  <div className="member-placeholder">
                    {selectedMember.placeholder}
                  </div>
                </div>
                <div className="member-basic-info">
                  <h2>{selectedMember.name}</h2>
                  <p className="role">{selectedMember.role}</p>
                  <p className="experience">{selectedMember.experience}</p>
                </div>
              </div>

              <div className="modal-body">
                <div className="section">
                  <h3>Chi è</h3>
                  <p>{selectedMember.fullDescription}</p>
                </div>

                <div className="section">
                  <h3>Competenze</h3>
                  <div className="skills-list">
                    {selectedMember.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="section">
                  <h3>Formazione</h3>
                  <p>{selectedMember.education}</p>
                </div>

                {selectedMember.cvDownloadUrl && (
                  <div className="section">
                    <a
                      href={selectedMember.cvDownloadUrl}
                      download
                      className="download-cv"
                    >
                      Scarica CV Completo
                    </a>
                  </div>
                )}
              </div>
            </ModalContent>
          </Modal>
        )}

        <ContactCTA />
      </MainContent>
      <Footer />
    </TeamContainer>
  );
};

const TeamContainer = styled.div`
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
  position: relative;
  overflow: hidden;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;

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

  @media (max-width: 768px) {
    min-height: 60vh;
    padding: 100px 20px 60px;
    background-attachment: scroll;
  }

  .hero-content {
    max-width: 800px;
    width: 100%;
    position: relative;
    z-index: 2;

    h1 {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: white;

      @media (max-width: 768px) {
        font-size: 2.8rem;
      }

      @media (max-width: 480px) {
        font-size: 2.2rem;
      }
    }

    .subtitle {
      font-size: 1.3rem;
      color: #e2e8f0;
      margin: 0;
      line-height: 1.4;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 768px) {
        font-size: 1.2rem;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
      }
    }
  }
`;

const TeamGrid = styled.section`
  background: #f8f9fa;
  padding: 100px 0;

  .team-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;

    @media (max-width: 768px) {
      padding: 0 25px;
    }

    @media (max-width: 480px) {
      padding: 0 20px;
    }
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 40px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 25px;
    }
  }

  .team-card {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
    }
  }

  .member-image {
    width: 100%;
    height: 200px;
    overflow: hidden;
    position: relative;

    @media (max-width: 480px) {
      height: 160px;
    }
  }

  .member-placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a1a, #2c2c2c);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 3rem;
    font-weight: 600;

    @media (max-width: 480px) {
      font-size: 2.5rem;
    }
  }

  .member-info {
    padding: 30px 25px;

    h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.05em;
    }

    .role {
      color: #e67e22;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .description {
      color: #6c757d;
      font-size: 0.95rem;
      line-height: 1.5;
      margin-bottom: 20px;
    }

    .view-details {
      background: #1a1a1a;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &:hover {
        background: #2c2c2c;
        transform: translateY(-2px);
      }
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;

  .modal-header {
    display: flex;
    align-items: center;
    gap: 30px;
    padding: 40px 40px 20px;
    border-bottom: 1px solid #e2e8f0;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      gap: 20px;
      padding: 30px 25px 20px;
    }

    .member-image {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;

      .member-placeholder {
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #1a1a1a, #2c2c2c);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2.5rem;
        font-weight: 600;
      }
    }

    .member-basic-info {
      h2 {
        font-size: 2rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 8px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
      }

      .role {
        color: #e67e22;
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .experience {
        color: #6c757d;
        font-size: 1rem;
        margin: 0;
      }
    }
  }

  .modal-body {
    padding: 30px 40px 40px;

    @media (max-width: 768px) {
      padding: 25px;
    }

    .section {
      margin-bottom: 30px;

      &:last-child {
        margin-bottom: 0;
      }

      h3 {
        font-size: 1.3rem;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 15px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
      }

      p {
        color: #4a5568;
        font-size: 1rem;
        line-height: 1.6;
        margin: 0;
      }
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;

      .skill-tag {
        background: #f8f9fa;
        color: #1a1a1a;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: 500;
        border: 1px solid #e2e8f0;
      }
    }

    .download-cv {
      display: inline-block;
      background: #e67e22;
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.3s ease;

      &:hover {
        background: #d35400;
        transform: translateY(-2px);
      }
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 25px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #6c757d;
  cursor: pointer;
  transition: color 0.3s ease;
  z-index: 1;

  &:hover {
    color: #1a1a1a;
  }
`;

export default TeamPage;
