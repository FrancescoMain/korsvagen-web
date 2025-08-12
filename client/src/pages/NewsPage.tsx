import React from "react";
import { useNavigateWithScroll } from "../hooks/useNavigateWithScroll";
import styled from "styled-components";
import { api } from "../utils/api";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import PageHero from "../components/common/PageHero";

const NewsContainer = styled.div`
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


const NewsSection = styled.section`
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

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    margin-bottom: 60px;
  }

  @media (max-width: 480px) {
    gap: 25px;
  }

  .news-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-5px) scale(1.02);
      transform-origin: center;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    &.featured {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 400px;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }

      .news-image {
        height: 100%;
        min-height: 300px;
      }

      .news-content {
        padding: 40px;

        @media (max-width: 480px) {
          padding: 30px;
        }
      }
    }

    .news-image {
      height: 250px;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
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

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #cccccc;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 1rem;
        z-index: 2;
      }

      @media (max-width: 480px) {
        height: 200px;
      }
    }

    .news-content {
      padding: 30px;

      @media (max-width: 480px) {
        padding: 25px;
      }

      .news-meta {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;

        @media (max-width: 480px) {
          gap: 10px;
          margin-bottom: 15px;
        }

        .date {
          color: #4caf50;
          font-weight: 500;
          font-size: 0.9rem;
          font-family: "Inter", "Segoe UI", sans-serif;

          @media (max-width: 480px) {
            font-size: 0.85rem;
          }
        }

        .category {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid rgba(76, 175, 80, 0.2);
          font-family: "Inter", "Segoe UI", sans-serif;

          @media (max-width: 480px) {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
        }
      }

      h3 {
        color: #ffffff;
        margin-bottom: 15px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
        font-size: 1.4rem;
        line-height: 1.4;
        font-weight: 400;
        letter-spacing: 0.02em;

        &.featured {
          font-size: 2rem;
          margin-bottom: 20px;

          @media (max-width: 768px) {
            font-size: 1.7rem;
          }

          @media (max-width: 480px) {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          font-size: 1.2rem;
          margin-bottom: 12px;
        }
      }

      p {
        color: #cccccc;
        line-height: 1.6;
        margin-bottom: 25px;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 1rem;

        @media (max-width: 480px) {
          font-size: 0.95rem;
          margin-bottom: 20px;
        }
      }

      .read-more-btn {
        background: rgba(76, 175, 80, 0.1);
        color: #4caf50;
        padding: 12px 24px;
        border: 2px solid rgba(76, 175, 80, 0.2);
        border-radius: 30px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s ease;
        font-family: "Inter", "Segoe UI", sans-serif;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(76, 175, 80, 0.2);
          border-color: rgba(76, 175, 80, 0.4);
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          padding: 10px 20px;
          font-size: 0.85rem;
        }
      }
    }
  }
`;

const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);

  @media (max-width: 768px) {
    padding: 25px;
    margin-bottom: 40px;
  }

  @media (max-width: 480px) {
    padding: 20px;
    margin-bottom: 30px;
  }

  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }

    h2 {
      color: #ffffff;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-size: 1.5rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      margin: 0;

      @media (max-width: 768px) {
        font-size: 1.3rem;
      }

      @media (max-width: 480px) {
        font-size: 1.2rem;
      }
    }
  }

  .filter-controls {
    display: flex;
    gap: 20px;
    align-items: center;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
      width: 100%;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        color: #cccccc;
        font-size: 0.9rem;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      select {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 10px;
        color: #ffffff;
        padding: 12px 16px;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-size: 1rem;
        min-width: 150px;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
        cursor: pointer;

        &:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        &:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(76, 175, 80, 0.5);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        option {
          background: #2a2a2a;
          color: #ffffff;
          padding: 10px;
          border: none;
        }

        @media (max-width: 768px) {
          width: 100%;
          min-width: auto;
        }
      }
    }

    .results-count {
      color: #4caf50;
      font-size: 0.9rem;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-weight: 500;
    }
  }
`;

interface NewsArticle {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  category: string;
  image_url?: string;
  published_date: string;
  is_featured: boolean;
  views_count?: number;
}

const NewsPage: React.FC = () => {
  const navigate = useNavigateWithScroll();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  const [news, setNews] = React.useState<NewsArticle[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string>("");

  // Carica articoli dal API
  React.useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError("");

        const params: any = {};
        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        const response = await api.news.getList(params);
        setNews(response.data.data || []);
      } catch (error: any) {
        console.error("Errore caricamento news:", error);
        setError(error.message || "Errore nel caricamento delle news. Riprova più tardi.");
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, [selectedCategory]);

  // Carica categorie disponibili
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await api.news.getCategories();
        setCategories(["all", ...response.data.data]);
      } catch (error: any) {
        console.error("Errore caricamento categorie:", error);
        // Fallback categorie di default
        setCategories(["all", "Progetti", "Azienda", "Partnership", "Certificazioni", "Premi"]);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleReadMore = (article: NewsArticle) => {
    navigate(`/news/${article.slug}`);
  };

  return (
    <NewsContainer>
      <Header />
      <MainContent>
        <PageHero
          title="News"
          subtitle="Resta aggiornato sulle nostre ultime novità e progetti innovativi"
          size="compact"
        />

        <NewsSection>
          <Container>
            {/* <FilterSection>
              <div className="filter-header">
                <h2>Filtra per categoria</h2>
              </div>
              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="category-select">Categoria</label>
                  <select
                    id="category-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="all">Tutte le categorie</option>
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="results-count">
                  {filteredNews.length} articol
                  {filteredNews.length !== 1 ? "i" : "o"} trovat
                  {filteredNews.length !== 1 ? "i" : "o"}
                </div>
              </div>
            </FilterSection> */}

            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#666" }}>
                Caricamento articoli...
              </div>
            ) : error ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#f44336" }}>
                {error}
              </div>
            ) : news.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#666" }}>
                <h3>Nessun articolo trovato</h3>
                <p>
                  {selectedCategory !== "all"
                    ? "Non ci sono articoli per questa categoria"
                    : "Non ci sono ancora articoli pubblicati"}
                </p>
              </div>
            ) : (
              <NewsGrid>
                {news.map((article) => (
                  <div
                    key={article.id}
                    className={`news-card ${article.is_featured ? "featured" : ""}`}
                    onClick={() => handleReadMore(article)}
                  >
                    <div
                      className="news-image"
                      style={{
                        backgroundImage: article.image_url ? `url(${article.image_url})` : undefined,
                      }}
                    >
                      <div className="image-overlay">
                        {!article.image_url && "Immagine articolo"}
                      </div>
                    </div>
                    <div className="news-content">
                      <div className="news-meta">
                        <span className="date">{article.published_date}</span>
                        <span className="category">{article.category}</span>
                      </div>
                      <h3 className={article.is_featured ? "featured" : ""}>
                        {article.title}
                      </h3>
                      {article.subtitle && <p>{article.subtitle}</p>}
                      <button
                        className="read-more-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReadMore(article);
                        }}
                      >
                        Leggi di più
                      </button>
                    </div>
                  </div>
                ))}
              </NewsGrid>
            )}
          </Container>
        </NewsSection>

        <ContactCTA />
      </MainContent>
      <Footer />
    </NewsContainer>
  );
};

export default NewsPage;
