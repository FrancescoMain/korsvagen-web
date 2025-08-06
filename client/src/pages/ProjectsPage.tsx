import React from "react";
import styled from "styled-components";
import { useNavigateWithScroll } from "../hooks/useNavigateWithScroll";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import ProjectsCTA from "../components/common/ProjectsCTA";
import PageHero from "../components/common/PageHero";

const ProjectsContainer = styled.div`
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


const ProjectsGrid = styled.section`
  background: #1a1a1a;
  padding: 100px 20px;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 80px 15px;
  }

  @media (max-width: 480px) {
    padding: 60px 10px;
  }

  .filter-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 60px;
    flex-wrap: wrap;
    gap: 15px;

    @media (max-width: 768px) {
      gap: 10px;
      margin-bottom: 50px;
    }

    button {
      padding: 15px 30px;
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      color: #cccccc;
      font-family: "Inter", "Segoe UI", sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.05em;

      &.active {
        background: #e67e22;
        color: #1a1a1a;
        border-color: #e67e22;
      }

      &:hover:not(.active) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.4);
        color: #ffffff;
      }

      @media (max-width: 768px) {
        padding: 12px 20px;
        font-size: 0.9rem;
      }

      @media (max-width: 480px) {
        padding: 10px 16px;
        font-size: 0.85rem;
      }
    }
  }

  .projects-grid {
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

  .project-card {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    overflow: hidden;
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover {
      transform: translateY(-10px);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .project-image {
      width: 100%;
      height: 250px;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.1) 0%,
        rgba(255, 255, 255, 0.05) 100%
      );
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #cccccc;
      font-family: "Inter", "Segoe UI", sans-serif;

      .project-category {
        position: absolute;
        top: 20px;
        left: 20px;
        background: #e67e22;
        color: #1a1a1a;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        z-index: 2;
      }

      @media (max-width: 768px) {
        height: 220px;
      }

      @media (max-width: 480px) {
        height: 200px;
      }
    }

    .project-content {
      padding: 30px;

      @media (max-width: 768px) {
        padding: 25px;
      }

      @media (max-width: 480px) {
        padding: 20px;
      }

      h3 {
        color: #ffffff;
        margin-bottom: 15px;
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

      p {
        color: #cccccc;
        line-height: 1.7;
        margin-bottom: 25px;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 1rem;

        @media (max-width: 480px) {
          font-size: 0.95rem;
          margin-bottom: 20px;
        }
      }

      .project-details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 25px;
        padding: 20px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);

        @media (max-width: 480px) {
          grid-template-columns: 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }

        .detail-item {
          text-align: center;

          @media (max-width: 480px) {
            display: flex;
            justify-content: space-between;
            text-align: left;
          }

          .label {
            font-size: 0.85rem;
            color: #999999;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-family: "Inter", "Segoe UI", sans-serif;

            @media (max-width: 480px) {
              margin-bottom: 0;
            }
          }

          .value {
            font-weight: 600;
            color: #ffffff;
            font-size: 1rem;
            font-family: "Inter", "Segoe UI", sans-serif;

            @media (max-width: 480px) {
              font-size: 0.95rem;
            }
          }
        }
      }

      .view-project-btn {
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

  .coming-soon {
    text-align: center;
    padding: 60px 20px;
    color: #cccccc;

    h2 {
      color: #ffffff;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-size: 2.5rem;
      font-weight: 400;
      letter-spacing: 0.05em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 2rem;
      }

      @media (max-width: 480px) {
        font-size: 1.8rem;
      }
    }

    p {
      color: #cccccc;
      font-size: 1.1rem;
      font-family: "Inter", "Segoe UI", sans-serif;
      line-height: 1.6;
    }
  }
`;

const ProjectsPage: React.FC = () => {
  const navigate = useNavigateWithScroll();
  const [activeFilter, setActiveFilter] = React.useState("tutti");

  const projects = [
    {
      id: 1,
      title: "Villa Residenziale Moderna",
      category: "residenziale",
      description:
        "Progettazione e costruzione di villa unifamiliare con design contemporaneo e soluzioni tecnologiche avanzate.",
      year: "2024",
      location: "Milano",
      status: "Completato",
    },
    {
      id: 2,
      title: "Centro Commerciale",
      category: "commerciale",
      description:
        "Realizzazione di complesso commerciale multifunzionale con aree retail, uffici e spazi comuni.",
      year: "2023",
      location: "Roma",
      status: "Completato",
    },
    {
      id: 3,
      title: "Ristrutturazione Palazzo Storico",
      category: "ristrutturazione",
      description:
        "Restauro conservativo e riqualificazione energetica di palazzo storico del XVIII secolo.",
      year: "2024",
      location: "Firenze",
      status: "In corso",
    },
    {
      id: 4,
      title: "Complesso Industriale",
      category: "industriale",
      description:
        "Progettazione e costruzione di stabilimento produttivo con uffici amministrativi integrati.",
      year: "2023",
      location: "Torino",
      status: "Completato",
    },
    {
      id: 5,
      title: "Residenza Eco-Sostenibile",
      category: "residenziale",
      description:
        "Condominio residenziale con certificazione energetica A+ e sistemi di energia rinnovabile.",
      year: "2024",
      location: "Bologna",
      status: "In corso",
    },
    {
      id: 6,
      title: "Uffici Direzionali",
      category: "commerciale",
      description:
        "Torre per uffici con tecnologie smart building e spazi flessibili per coworking.",
      year: "2024",
      location: "Napoli",
      status: "In progettazione",
    },
  ];

  const categories = [
    { key: "tutti", label: "Tutti i Progetti" },
    { key: "residenziale", label: "Residenziale" },
    { key: "commerciale", label: "Commerciale" },
    { key: "industriale", label: "Industriale" },
    { key: "ristrutturazione", label: "Ristrutturazioni" },
  ];

  const filteredProjects =
    activeFilter === "tutti"
      ? projects
      : projects.filter((project) => project.category === activeFilter);

  const handleProjectClick = (projectId: number) => {
    navigate(`/progetti/${projectId}`);
  };

  return (
    <ProjectsContainer>
      <Header />
      <MainContent>
        <PageHero
          title="I Nostri Progetti"
          subtitle="Scopri le nostre realizzazioni e i progetti in corso"
          size="compact"
        />

        <ProjectsGrid>
          <div className="filter-tabs">
            {categories.map((category) => (
              <button
                key={category.key}
                className={activeFilter === category.key ? "active" : ""}
                onClick={() => setActiveFilter(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="project-image">
                  <div className="project-category">
                    {project.category.toUpperCase()}
                  </div>
                  Immagine del progetto in arrivo
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-details">
                    <div className="detail-item">
                      <div className="label">Anno</div>
                      <div className="value">{project.year}</div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Luogo</div>
                      <div className="value">{project.location}</div>
                    </div>
                    <div className="detail-item">
                      <div className="label">Status</div>
                      <div className="value">{project.status}</div>
                    </div>
                  </div>
                  <button className="view-project-btn">
                    Visualizza Dettagli
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="coming-soon">
              <h2>Progetti in arrivo</h2>
              <p>
                Stiamo aggiornando questa sezione con i nostri ultimi progetti.
              </p>
            </div>
          )}
        </ProjectsGrid>

        <ProjectsCTA />
        <ContactCTA />
      </MainContent>
      <Footer />
    </ProjectsContainer>
  );
};

export default ProjectsPage;
