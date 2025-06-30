import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

const ProjectsContainer = styled.div`
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

const ProjectsGrid = styled.section`
  padding: 80px 20px;
  max-width: 1200px;
  margin: 0 auto;

  .filter-tabs {
    display: flex;
    justify-content: center;
    margin-bottom: 50px;
    flex-wrap: wrap;
    gap: 10px;

    button {
      padding: 12px 25px;
      background: #f7fafc;
      border: 2px solid #e2e8f0;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: 500;
      color: #4a5568;

      &.active {
        background: #3182ce;
        color: white;
        border-color: #3182ce;
      }

      &:hover:not(.active) {
        background: #e2e8f0;
      }
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .project-card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    .project-image {
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .project-content {
      padding: 25px;

      .project-category {
        color: #3182ce;
        font-size: 0.9rem;
        font-weight: 500;
        margin-bottom: 10px;
      }

      h3 {
        color: #2d3748;
        margin-bottom: 15px;
        font-family: "Montserrat", sans-serif;
        font-size: 1.3rem;
      }

      p {
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .project-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;

        .detail-item {
          text-align: center;

          .label {
            font-size: 0.8rem;
            color: #718096;
            margin-bottom: 5px;
          }

          .value {
            font-weight: 600;
            color: #2d3748;
          }
        }
      }

      .view-project-btn {
        background: #3182ce;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s ease;
        width: 100%;
        margin-top: 15px;

        &:hover {
          background: #2c5282;
        }
      }
    }
  }

  .coming-soon {
    text-align: center;
    padding: 60px 20px;

    h2 {
      color: #4a5568;
      margin-bottom: 20px;
      font-family: "Montserrat", sans-serif;
    }

    p {
      color: #718096;
      font-size: 1.1rem;
    }
  }
`;

const ProjectsPage: React.FC = () => {
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

  return (
    <ProjectsContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>I Nostri Progetti</h1>
            <p>Scopri le nostre realizzazioni e i progetti in corso</p>
          </div>
        </HeroSection>

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
              <div key={project.id} className="project-card">
                <div className="project-image">
                  Immagine del progetto in arrivo
                </div>
                <div className="project-content">
                  <div className="project-category">
                    {project.category.toUpperCase()}
                  </div>
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
      </MainContent>
      <Footer />
    </ProjectsContainer>
  );
};

export default ProjectsPage;
