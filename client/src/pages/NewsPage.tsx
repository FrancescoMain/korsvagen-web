import React from "react";
import { useNavigateWithScroll } from "../hooks/useNavigateWithScroll";
import styled from "styled-components";
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

const NewsPage: React.FC = () => {
  const navigate = useNavigateWithScroll();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  const allNews = [
    {
      id: 1,
      title: "KORSVAGEN vince il premio 'Innovazione nell'Edilizia 2024'",
      excerpt:
        "La nostra azienda è stata riconosciuta per l'utilizzo di tecnologie innovative nella costruzione sostenibile e per l'approccio eco-friendly ai progetti edilizi.",
      date: "15 Dicembre 2024",
      category: "Premi",
      featured: true,
      image:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        KORSVAGEN S.R.L. ha ricevuto il prestigioso premio "Innovazione nell'Edilizia 2024" durante la cerimonia tenutasi presso il Palazzo delle Stelline di Milano. 
        
        Il riconoscimento, assegnato dall'Associazione Nazionale Costruttori Edili, premia le aziende che si distinguono per l'utilizzo di tecnologie innovative e sostenibili nel settore delle costruzioni.
        
        "Questo premio rappresenta il riconoscimento del nostro impegno costante verso l'innovazione e la sostenibilità", ha dichiarato il CEO di KORSVAGEN durante la cerimonia. "Continueremo a investire in tecnologie all'avanguardia per offrire ai nostri clienti soluzioni sempre più efficienti e rispettose dell'ambiente."
        
        Tra i progetti che hanno contribuito al riconoscimento, spicca la recente realizzazione di un complesso residenziale a energia zero nel centro di Milano, che utilizza materiali eco-compatibili e sistemi di domotica avanzata.
      `,
    },
    {
      id: 2,
      title: "Nuovo progetto di riqualificazione urbana a Milano",
      excerpt:
        "Iniziati i lavori per il progetto di riqualificazione del quartiere Isola, che prevede la costruzione di edifici residenziali ad alta efficienza energetica.",
      date: "8 Dicembre 2024",
      category: "Progetti",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        KORSVAGEN S.R.L. ha dato il via ai lavori per un ambizioso progetto di riqualificazione urbana nel quartiere Isola di Milano. 
        
        Il progetto prevede la costruzione di 150 unità abitative distribuite in tre edifici ad alta efficienza energetica, con certificazione LEED Gold.
        
        "Questo progetto rappresenta il nostro impegno verso lo sviluppo urbano sostenibile", ha spiegato il direttore tecnico. "Ogni edificio sarà dotato di pannelli solari, sistemi di raccolta dell'acqua piovana e giardini pensili per migliorare la qualità dell'aria urbana."
        
        I lavori, che hanno un valore complessivo di 45 milioni di euro, dovrebbero completarsi entro 24 mesi e daranno lavoro a oltre 200 professionisti del settore edile.
      `,
    },
    {
      id: 3,
      title: "Partnership con istituti di ricerca per l'edilizia sostenibile",
      excerpt:
        "KORSVAGEN S.R.L. ha siglato accordi di collaborazione con il Politecnico di Milano per lo sviluppo di nuove tecnologie costruttive.",
      date: "1 Dicembre 2024",
      category: "Partnership",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        KORSVAGEN S.R.L. ha siglato un importante accordo di collaborazione con il Politecnico di Milano per lo sviluppo di nuove tecnologie costruttive sostenibili.
        
        La partnership prevede la creazione di un laboratorio di ricerca congiunto dove verranno sviluppati nuovi materiali biocompatibili e sistemi costruttivi innovativi.
        
        "La collaborazione con il mondo accademico è fondamentale per rimanere all'avanguardia nel settore", ha sottolineato il responsabile R&D di KORSVAGEN. "Insieme al Politecnico, vogliamo sviluppare soluzioni che possano rivoluzionare il modo di costruire, sempre nel rispetto dell'ambiente."
        
        Il progetto di ricerca, della durata di tre anni, si concentrerà principalmente su materiali da costruzione a base di canapa e sistemi di isolamento termico innovativi.
      `,
    },
    {
      id: 4,
      title: "Certificazione ISO 14001 per la gestione ambientale",
      excerpt:
        "La nostra azienda ha ottenuto la certificazione ISO 14001, confermando il nostro impegno per la sostenibilità ambientale nei processi costruttivi.",
      date: "25 Novembre 2024",
      category: "Certificazioni",
      image:
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        KORSVAGEN S.R.L. ha ottenuto la certificazione ISO 14001:2015 per la gestione ambientale, confermando il proprio impegno verso la sostenibilità.
        
        La certificazione, rilasciata da un ente accreditato internazionale, attesta che l'azienda ha implementato un sistema di gestione ambientale efficace e conforme agli standard internazionali.
        
        "Questa certificazione rappresenta un traguardo importante nel nostro percorso verso la sostenibilità", ha dichiarato il responsabile qualità. "Dimostra che tutti i nostri processi, dalla progettazione alla realizzazione, sono orientati alla riduzione dell'impatto ambientale."
        
        La certificazione copre tutti gli aspetti dell'attività aziendale, dalla gestione dei rifiuti di cantiere all'utilizzo di materiali eco-compatibili, dalla riduzione delle emissioni di CO2 al risparmio energetico.
      `,
    },
  ];

  // Filtro le news in base alla categoria selezionata
  const filteredNews =
    selectedCategory === "all"
      ? allNews
      : allNews.filter((article) => article.category === selectedCategory);

  // Ottengo le categorie uniche per la select
  const categories = [
    "all",
    ...Array.from(new Set(allNews.map((article) => article.category))),
  ];

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const handleReadMore = (newsId: number) => {
    navigate(`/news/${newsId}`);
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

            <NewsGrid>
              {filteredNews.map((article) => (
                <div
                  key={article.id}
                  className={`news-card ${article.featured ? "featured" : ""}`}
                  onClick={() => handleReadMore(article.id)}
                >
                  <div
                    className="news-image"
                    style={{
                      backgroundImage: `url(${article.image})`,
                    }}
                  >
                    <div className="image-overlay">
                      {!article.image && "Immagine articolo"}
                    </div>
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
                    <button
                      className="read-more-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadMore(article.id);
                      }}
                    >
                      Leggi di più
                    </button>
                  </div>
                </div>
              ))}
            </NewsGrid>
          </Container>
        </NewsSection>

        <ContactCTA />
      </MainContent>
      <Footer />
    </NewsContainer>
  );
};

export default NewsPage;
