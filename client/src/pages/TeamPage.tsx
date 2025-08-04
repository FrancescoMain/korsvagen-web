import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import { useTeam, type TeamMember } from "../hooks/useTeam";


const TeamPage: React.FC = () => {
  const { members, loading, error, fetchPublicMembers, getCVDownloadUrl } = useTeam();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Carica membri al mount
  useEffect(() => {
    fetchPublicMembers();
  }, [fetchPublicMembers]);

  const handleMemberClick = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  // Loading state
  if (loading) {
    return (
      <TeamContainer>
        <Header />
        <MainContent>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            color: 'white',
            fontSize: '1.2rem'
          }}>
            Caricamento team...
          </div>
        </MainContent>
        <Footer />
      </TeamContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <TeamContainer>
        <Header />
        <MainContent>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '60vh',
            color: 'white',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Errore nel caricamento</h2>
            <p style={{ marginBottom: '2rem' }}>{error}</p>
            <button 
              onClick={fetchPublicMembers}
              style={{
                background: '#d4af37',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Riprova
            </button>
          </div>
        </MainContent>
        <Footer />
      </TeamContainer>
    );
  }

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
              {members.map((member) => (
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
                    <p className="description">{member.short_description}</p>
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
                  <p>{selectedMember.full_description}</p>
                </div>

                <div className="section">
                  <h3>Competenze</h3>
                  <div className="skills-list">
                    {selectedMember.skills?.map((skill, index) => (
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

                {selectedMember.has_cv && (
                  <div className="section">
                    <a
                      href={getCVDownloadUrl(selectedMember.id)}
                      target="_blank"
                      rel="noopener noreferrer"
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
