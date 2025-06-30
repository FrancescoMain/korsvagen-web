import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { StandardHero } from "../components";

const NewsContainer = styled.div`
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

const NewsGrid = styled.section`
  padding: 80px 20px;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 480px) {
    padding: 60px 15px;
  }

  @media (max-width: 350px) {
    padding: 40px 10px;
  }

  .news-grid {
    display: grid;
    gap: 30px;
    width: 100%;

    @media (max-width: 480px) {
      gap: 20px;
    }
  }

  .news-card {
    background: white;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    }

    &.featured {
      grid-column: 1 / -1;
      display: grid;
      grid-template-columns: 1fr 1fr;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .news-image {
      width: 100%;
      height: 250px;
      background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4a5568;
      font-size: 0.9rem;

      &.featured {
        height: 300px;
      }
    }

    .news-content {
      padding: 30px;

      .news-meta {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;

        .date {
          color: #3182ce;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .category {
          background: #e6fffa;
          color: #3182ce;
          padding: 5px 12px;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 500;
        }
      }

      h3 {
        color: #2d3748;
        margin-bottom: 15px;
        font-family: "Montserrat", sans-serif;
        font-size: 1.3rem;
        line-height: 1.4;

        &.featured {
          font-size: 1.8rem;
        }
      }

      p {
        color: #4a5568;
        line-height: 1.6;
        margin-bottom: 20px;
      }

      .read-more-btn {
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
      margin-bottom: 30px;
    }

    .newsletter-signup {
      background: #f7fafc;
      padding: 30px;
      border-radius: 10px;
      max-width: 400px;
      margin: 0 auto;

      h3 {
        color: #2d3748;
        margin-bottom: 15px;
        font-family: "Montserrat", sans-serif;
      }

      .input-group {
        display: flex;
        gap: 10px;
        margin-top: 15px;

        input {
          flex: 1;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 5px;
          font-size: 0.9rem;

          &:focus {
            outline: none;
            border-color: #3182ce;
          }
        }

        button {
          background: #3182ce;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 0.9rem;

          &:hover {
            background: #2c5282;
          }
        }

        @media (max-width: 480px) {
          flex-direction: column;
        }
      }
    }
  }
`;

const NewsPage: React.FC = () => {
  const news = [
    {
      id: 1,
      title:
        "KORSVAGEN S.R.L. vince il premio 'Innovazione nell'Edilizia 2024'",
      excerpt:
        "La nostra azienda è stata riconosciuta per l'utilizzo di tecnologie innovative nella costruzione sostenibile e per l'approccio eco-friendly ai progetti edilizi.",
      date: "15 Dicembre 2024",
      category: "Premi",
      featured: true,
    },
    {
      id: 2,
      title: "Nuovo progetto di riqualificazione urbana a Milano",
      excerpt:
        "Iniziati i lavori per il progetto di riqualificazione del quartiere Isola, che prevedee la costruzione di edifici residenziali ad alta efficienza energetica.",
      date: "8 Dicembre 2024",
      category: "Progetti",
    },
    {
      id: 3,
      title: "Partnership con istituti di ricerca per l'edilizia sostenibile",
      excerpt:
        "KORSVAGEN S.R.L. ha siglato accordi di collaborazione con il Politecnico di Milano per lo sviluppo di nuove tecnologie costruttive.",
      date: "1 Dicembre 2024",
      category: "Partnership",
    },
    {
      id: 4,
      title: "Certificazione ISO 14001 per la gestione ambientale",
      excerpt:
        "La nostra azienda ha ottenuto la certificazione ISO 14001, confermando il nostro impegno per la sostenibilità ambientale nei processi costruttivi.",
      date: "25 Novembre 2024",
      category: "Certificazioni",
    },
  ];

  return (
    <NewsContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <div className="hero-content">
            <h1>News & Aggiornamenti</h1>
            <p>Resta aggiornato sulle nostre ultime novità e progetti</p>
          </div>
        </HeroSection>

        <NewsGrid>
          {news.length > 0 ? (
            <div className="news-grid">
              {news.map((article, index) => (
                <div
                  key={article.id}
                  className={`news-card ${article.featured ? "featured" : ""}`}
                >
                  <div
                    className={`news-image ${
                      article.featured ? "featured" : ""
                    }`}
                  >
                    Immagine articolo in arrivo
                  </div>
                  <div className="news-content">
                    <div className="news-meta">
                      <span className="date">{article.date}</span>
                      <span className="category">{article.category}</span>
                    </div>
                    <h3 className={article.featured ? "featured" : ""}>
                      {article.title}
                    </h3>
                    <p>{article.excerpt}</p>
                    <button className="read-more-btn">Leggi di più</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="coming-soon">
              <h2>Sezione News in sviluppo</h2>
              <p>
                Stiamo preparando contenuti interessanti per tenerti aggiornato
                sui nostri progetti e novità aziendali.
              </p>

              <div className="newsletter-signup">
                <h3>Rimani aggiornato</h3>
                <p>
                  Iscriviti alla nostra newsletter per ricevere le ultime
                  novità.
                </p>
                <div className="input-group">
                  <input type="email" placeholder="La tua email" />
                  <button>Iscriviti</button>
                </div>
              </div>
            </div>
          )}
        </NewsGrid>
      </MainContent>
      <Footer />
    </NewsContainer>
  );
};

export default NewsPage;
