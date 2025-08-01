import React from "react";
import { useParams } from "react-router-dom";
import { useNavigateWithScroll } from "../hooks/useNavigateWithScroll";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";

const ProjectDetailContainer = styled.div`
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

const BackButton = styled.button`
  position: fixed;
  top: 120px;
  left: 30px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: #ffffff;
  padding: 15px 30px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  z-index: 100;
  font-family: "Inter", "Segoe UI", sans-serif;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    top: 100px;
    left: 25px;
    padding: 12px 25px;
    font-size: 0.95rem;
  }

  @media (max-width: 768px) {
    top: 90px;
    left: 20px;
    padding: 10px 20px;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    display: none;
  }
`;

const MobileBackButton = styled.button`
  display: none;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: #ffffff;
  padding: 12px 25px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  font-family: "Inter", "Segoe UI", sans-serif;
  margin: 0 auto 20px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    display: block;
  }
`;

const HeroSection = styled.section`
  background: linear-gradient(
      135deg,
      rgba(26, 26, 26, 0.95) 0%,
      rgba(44, 44, 44, 0.95) 100%
    ),
    url("https://images.unsplash.com/photo-1590479773265-7464e5d48118?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80");
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
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 900px;
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

      @media (max-width: 1024px) {
        font-size: 3.5rem;
      }

      @media (max-width: 768px) {
        font-size: 2.5rem;
        margin-bottom: 25px;
        line-height: 1.2;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
        margin-bottom: 20px;
        letter-spacing: 0.05em;
      }
    }

    .project-meta {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-bottom: 30px;
      flex-wrap: wrap;

      @media (max-width: 1024px) {
        gap: 30px;
      }

      @media (max-width: 768px) {
        gap: 20px;
        margin-bottom: 25px;
      }

      @media (max-width: 600px) {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        max-width: 300px;
        margin: 0 auto 25px;
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 15px;
        max-width: 200px;
        margin: 0 auto 20px;
      }

      .meta-item {
        text-align: center;
        min-width: 80px;

        .label {
          font-size: 0.9rem;
          color: #cccccc;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: "Inter", "Segoe UI", sans-serif;

          @media (max-width: 480px) {
            font-size: 0.8rem;
            margin-bottom: 3px;
          }
        }

        .value {
          font-weight: 600;
          color: #ffffff;
          font-size: 1.1rem;
          font-family: "Inter", "Segoe UI", sans-serif;

          @media (max-width: 480px) {
            font-size: 1rem;
          }
        }
      }
    }

    p {
      font-size: 1.3rem;
      color: #cccccc;
      font-weight: 300;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 1024px) {
        font-size: 1.2rem;
      }

      @media (max-width: 768px) {
        font-size: 1.1rem;
        max-width: 600px;
        line-height: 1.5;
      }

      @media (max-width: 480px) {
        font-size: 1rem;
        max-width: 100%;
        line-height: 1.4;
      }
    }
  }

  @media (max-width: 1024px) {
    padding: 110px 20px 70px;
    min-height: 65vh;
    background-attachment: scroll;
  }

  @media (max-width: 768px) {
    padding: 100px 20px 60px;
    min-height: 60vh;
  }

  @media (max-width: 480px) {
    padding: 90px 15px 50px;
    min-height: 55vh;
  }
`;

const ProjectContent = styled.section`
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

const ProjectGallery = styled.div`
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 60px;
  }

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .gallery-image {
      height: 250px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #cccccc;
      font-family: "Inter", "Segoe UI", sans-serif;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          45deg,
          rgba(0, 0, 0, 0.3) 0%,
          rgba(0, 0, 0, 0.1) 100%
        );
        z-index: 1;
      }

      &::after {
        content: "🔍";
        position: absolute;
        top: 15px;
        right: 15px;
        font-size: 1.2rem;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 3;
      }

      .image-title {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        color: white;
        padding: 30px 20px 20px;
        font-size: 1.1rem;
        font-weight: 500;
        z-index: 2;
        transition: transform 0.3s ease;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-5px) scale(1.05);
        transform-origin: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

        &::after {
          opacity: 1;
        }

        .image-title {
          transform: translateY(-5px);
        }
      }

      @media (max-width: 768px) {
        height: 200px;

        .image-title {
          font-size: 1rem;
          padding: 25px 15px 15px;
        }
      }
    }
  }
`;

const ProjectInfo = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
    margin-bottom: 60px;
  }

  .project-description {
    h2 {
      color: #ffffff;
      margin-bottom: 30px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-size: 2.5rem;
      font-weight: 400;
      letter-spacing: 0.05em;
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
      color: #cccccc;
      line-height: 1.8;
      margin-bottom: 25px;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-size: 1.1rem;

      @media (max-width: 480px) {
        font-size: 1rem;
        margin-bottom: 20px;
      }
    }

    .project-features {
      margin-top: 40px;

      @media (max-width: 768px) {
        margin-top: 30px;
      }

      h3 {
        color: #ffffff;
        margin-bottom: 20px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
        font-size: 1.5rem;
        font-weight: 400;
        letter-spacing: 0.05em;
        text-transform: uppercase;

        @media (max-width: 768px) {
          font-size: 1.3rem;
        }

        @media (max-width: 480px) {
          font-size: 1.2rem;
        }
      }

      ul {
        list-style: none;
        padding: 0;

        li {
          color: #cccccc;
          margin-bottom: 15px;
          font-family: "Inter", "Segoe UI", sans-serif;
          font-size: 1rem;
          display: flex;
          align-items: center;

          @media (max-width: 480px) {
            font-size: 0.95rem;
            margin-bottom: 12px;
          }

          &::before {
            content: "✓";
            color: #4caf50;
            font-weight: bold;
            margin-right: 15px;
            font-size: 1.2rem;
            flex-shrink: 0;

            @media (max-width: 480px) {
              margin-right: 12px;
              font-size: 1.1rem;
            }
          }
        }
      }
    }
  }

  .project-sidebar {
    .sidebar-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 30px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      margin-bottom: 30px;

      @media (max-width: 768px) {
        padding: 25px;
      }

      @media (max-width: 480px) {
        padding: 20px;
      }

      h3 {
        color: #ffffff;
        margin-bottom: 20px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
        font-size: 1.3rem;
        font-weight: 400;
        letter-spacing: 0.05em;
        text-transform: uppercase;

        @media (max-width: 768px) {
          font-size: 1.2rem;
        }

        @media (max-width: 480px) {
          font-size: 1.1rem;
        }
      }

      .detail-list {
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);

          &:last-child {
            border-bottom: none;
          }

          @media (max-width: 480px) {
            flex-direction: column;
            align-items: flex-start;
            padding: 12px 0;
          }

          .label {
            font-size: 0.9rem;
            color: #999999;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-family: "Inter", "Segoe UI", sans-serif;
          }

          .value {
            font-weight: 600;
            color: #ffffff;
            font-size: 1rem;
            font-family: "Inter", "Segoe UI", sans-serif;

            @media (max-width: 480px) {
              margin-top: 5px;
            }
          }
        }
      }
    }
  }
`;

const ImageModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: ${(props) => (props.isOpen ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
`;

const ModalImage = styled.div`
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  cursor: default;

  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.3s ease;
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.9);
      border-color: rgba(255, 255, 255, 0.4);
    }
  }

  .modal-image {
    width: 100%;
    height: 100%;
    max-width: 90vw;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .image-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
    color: white;
    padding: 40px 30px 20px;
    border-radius: 0 0 20px 20px;
    text-align: center;

    h3 {
      margin: 0 0 10px 0;
      font-size: 1.3rem;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-weight: 400;
    }

    p {
      margin: 0 0 10px 0;
      font-size: 1rem;
      color: #cccccc;
      font-family: "Inter", "Segoe UI", sans-serif;
    }

    small {
      font-size: 0.9rem;
      color: #999999;
      font-family: "Inter", "Segoe UI", sans-serif;
    }
  }

  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 85vh;

    .close-button {
      width: 35px;
      height: 35px;
      font-size: 1rem;
    }

    .image-info {
      padding: 30px 20px 15px;

      h3 {
        font-size: 1.1rem;
      }

      p {
        font-size: 0.9rem;
      }

      small {
        font-size: 0.8rem;
      }
    }
  }
`;

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigateWithScroll();
  const [selectedImage, setSelectedImage] = React.useState<number | null>(null);

  // Mock data del progetto - in un'app reale, questo dovrebbe venire da un API
  const project = {
    id: projectId,
    title: "Ristrutturazione Villa Moderna",
    description:
      "Un progetto completo di ristrutturazione che ha trasformato una villa degli anni '80 in una moderna abitazione sostenibile.",
    category: "Residenziale",
    year: "2023",
    location: "Milano",
    status: "Completato",
    client: "Famiglia Rossi",
    surface: "350 mq",
    budget: "€ 450.000",
    timeline: "18 mesi",
    longDescription: `
      Questo progetto di ristrutturazione ha completamente trasformato una villa degli anni '80 in una moderna abitazione sostenibile. 
      Il nostro team ha lavorato a stretto contatto con la famiglia per creare spazi funzionali e accoglienti, 
      integrando tecnologie all'avanguardia per l'efficienza energetica.
      
      La ristrutturazione ha incluso una completa riprogettazione degli interni, l'installazione di un sistema di 
      riscaldamento a pompa di calore, pannelli solari e un sistema di domotica avanzato. 
      Particolare attenzione è stata dedicata all'illuminazione naturale e alla creazione di spazi aperti che 
      favoriscono la convivialità familiare.
    `,
    features: [
      "Ristrutturazione completa interni ed esterni",
      "Installazione pannelli solari",
      "Sistema di riscaldamento a pompa di calore",
      "Domotica avanzata",
      "Cucina moderna open space",
      "Bagni di design con materiali sostenibili",
      "Giardino paesaggistico",
      "Certificazione energetica A+",
    ],
    images: [
      {
        id: 1,
        title: "Vista principale della villa",
        alt: "Vista principale della villa ristrutturata",
        url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 2,
        title: "Interni moderni",
        alt: "Interni moderni della villa",
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 3,
        title: "Esterni e giardino",
        alt: "Esterni e giardino della villa",
        url: "https://images.unsplash.com/photo-1600047508788-786564deb7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 4,
        title: "Dettagli costruttivi",
        alt: "Dettagli tecnici e costruttivi",
        url: "https://images.unsplash.com/photo-1600047508798-b3a5d7d3c4f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      },
    ],
  };

  const handleBack = () => {
    navigate(-1);
  };

  const openImageModal = (imageIndex: number) => {
    setSelectedImage(imageIndex);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <ProjectDetailContainer>
      <Header />
      <BackButton onClick={handleBack}>← Torna ai Progetti</BackButton>

      <MainContent>
        <HeroSection>
          <div className="hero-content">
            {/* Pulsante back mobile */}
            <div className="mobile-back-container" style={{ display: "none" }}>
              <BackButton
                onClick={handleBack}
                style={{
                  position: "relative",
                  top: "auto",
                  left: "auto",
                  margin: "0 auto 20px",
                }}
              >
                ← Torna ai Progetti
              </BackButton>
            </div>

            <h1>{project.title}</h1>
            <div className="project-meta">
              <div className="meta-item">
                <div className="label">Categoria</div>
                <div className="value">{project.category}</div>
              </div>
              <div className="meta-item">
                <div className="label">Anno</div>
                <div className="value">{project.year}</div>
              </div>
              <div className="meta-item">
                <div className="label">Luogo</div>
                <div className="value">{project.location}</div>
              </div>
              <div className="meta-item">
                <div className="label">Status</div>
                <div className="value">{project.status}</div>
              </div>
            </div>
            <p>{project.description}</p>
          </div>
        </HeroSection>

        <ProjectContent>
          <Container>
            <ProjectGallery>
              <div className="gallery-grid">
                {project.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="gallery-image"
                    style={{ backgroundImage: `url(${image.url})` }}
                    onClick={() => openImageModal(index)}
                    title={`Clicca per ingrandire: ${image.alt}`}
                  >
                    <div className="image-title">{image.title}</div>
                  </div>
                ))}
              </div>
            </ProjectGallery>

            <ProjectInfo>
              <div className="project-description">
                <h2>Descrizione del Progetto</h2>
                {project.longDescription
                  .split("\n")
                  .map(
                    (paragraph, index) =>
                      paragraph.trim() && <p key={index}>{paragraph.trim()}</p>
                  )}

                <div className="project-features">
                  <h3>Caratteristiche Principali</h3>
                  <ul>
                    {project.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="project-sidebar">
                <div className="sidebar-card">
                  <h3>Dettagli Progetto</h3>
                  <div className="detail-list">
                    <div className="detail-item">
                      <span className="label">Cliente</span>
                      <span className="value">{project.client}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Superficie</span>
                      <span className="value">{project.surface}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Budget</span>
                      <span className="value">{project.budget}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Durata</span>
                      <span className="value">{project.timeline}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ProjectInfo>
          </Container>
        </ProjectContent>

        <ContactCTA />
      </MainContent>

      <Footer />

      {/* Modal per visualizzare le immagini in grande */}
      <ImageModal isOpen={selectedImage !== null} onClick={closeImageModal}>
        <ModalImage onClick={(e) => e.stopPropagation()}>
          <div className="close-button" onClick={closeImageModal}>
            ×
          </div>
          {selectedImage !== null && project.images[selectedImage] && (
            <>
              <img
                src={project.images[selectedImage].url}
                alt={project.images[selectedImage].alt}
                className="modal-image"
              />
              <div className="image-info">
                <h3>{project.images[selectedImage].title}</h3>
                <p>{project.images[selectedImage].alt}</p>
                <small>
                  Immagine {selectedImage + 1} di {project.images.length}
                </small>
              </div>
            </>
          )}
        </ModalImage>
      </ImageModal>
    </ProjectDetailContainer>
  );
};

export default ProjectDetailPage;
