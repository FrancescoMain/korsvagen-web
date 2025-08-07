import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigateWithScroll } from "../hooks/useNavigateWithScroll";
import { useProjects } from "../hooks/useProjects";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import ProjectsCTA from "../components/common/ProjectsCTA";
import PageHero from "../components/common/PageHero";
import toast from "react-hot-toast";

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
  const { fetchPublicProjects, fetchProjectLabels, loading } = useProjects();

  // States
  const [activeFilter, setActiveFilter] = useState("tutti");
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState([
    { key: "tutti", label: "Tutti i Progetti" },
    { key: "residenziale", label: "Residenziale" },
    { key: "commerciale", label: "Commerciale" },
    { key: "industriale", label: "Industriale" },
    { key: "ristrutturazione", label: "Ristrutturazioni" },
  ]);
  const [pageLoading, setPageLoading] = useState(true);

  // Load projects and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setPageLoading(true);
        
        // Load categories/labels
        try {
          const labels = await fetchProjectLabels();
          const dynamicCategories = [
            { key: "tutti", label: "Tutti i Progetti" },
            ...labels.map(label => ({
              key: label.name,
              label: label.display_name
            }))
          ];
          setCategories(dynamicCategories);
        } catch (error) {
          console.warn("Could not load project labels, using defaults");
        }

        // Load projects
        const projectsData = await fetchPublicProjects({
          label: activeFilter === "tutti" ? undefined : activeFilter,
          limit: 50 // Load more projects for the public page
        });
        
        setProjects(projectsData.projects || []);

      } catch (error: any) {
        console.error("Error loading projects:", error);
        toast.error("Errore nel caricamento dei progetti");
        setProjects([]);
      } finally {
        setPageLoading(false);
      }
    };

    loadData();
  }, [activeFilter, fetchPublicProjects, fetchProjectLabels]);

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
            {pageLoading ? (
              // Loading state
              [...Array(6)].map((_, i) => (
                <div key={i} className="project-card" style={{ opacity: 0.6 }}>
                  <div className="project-image">
                    <div className="project-category">CARICAMENTO...</div>
                    Caricamento progetto...
                  </div>
                  <div className="project-content">
                    <h3>Caricamento...</h3>
                    <p>Caricamento progetti in corso...</p>
                    <div className="project-details">
                      <div className="detail-item">
                        <div className="label">Anno</div>
                        <div className="value">----</div>
                      </div>
                      <div className="detail-item">
                        <div className="label">Luogo</div>
                        <div className="value">----</div>
                      </div>
                      <div className="detail-item">
                        <div className="label">Status</div>
                        <div className="value">----</div>
                      </div>
                    </div>
                    <button className="view-project-btn" disabled>
                      Caricamento...
                    </button>
                  </div>
                </div>
              ))
            ) : projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={() => handleProjectClick(project.id)}
              >
                <div 
                  className="project-image"
                  style={project.cover_image_url ? {
                    backgroundImage: `url(${project.cover_image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.7)'
                  } : {}}
                >
                  <div className="project-category">
                    {project.label.toUpperCase()}
                  </div>
                  {!project.cover_image_url && "Immagine del progetto in arrivo"}
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  {project.subtitle && (
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#d4af37', 
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>
                      {project.subtitle}
                    </p>
                  )}
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

          {!pageLoading && projects.length === 0 && (
            <div className="coming-soon">
              <h2>Nessun progetto trovato</h2>
              <p>
                {activeFilter === "tutti" 
                  ? "Al momento non ci sono progetti pubblicati. Torna presto per scoprire le nostre realizzazioni."
                  : `Nessun progetto trovato per la categoria "${categories.find(c => c.key === activeFilter)?.label}". Prova con una categoria diversa.`
                }
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
