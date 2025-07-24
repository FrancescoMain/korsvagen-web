import React from "react";
import { useParams } from "react-router-dom";
import { useNavigateWithScroll } from "../hooks/useNavigateWithScroll";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";

const NewsDetailContainer = styled.div`
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
    url("https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: white;
  text-align: center;
  padding: 120px 20px 80px;
  min-height: 60vh;
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
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;

    h1 {
      font-size: 3.5rem;
      margin-bottom: 30px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: #ffffff;
      line-height: 1.2;

      @media (max-width: 1024px) {
        font-size: 3rem;
      }

      @media (max-width: 768px) {
        font-size: 2.5rem;
        margin-bottom: 25px;
      }

      @media (max-width: 480px) {
        font-size: 2rem;
        margin-bottom: 20px;
        letter-spacing: 0.02em;
      }
    }

    .news-meta {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 30px;
      flex-wrap: wrap;

      @media (max-width: 600px) {
        gap: 20px;
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 10px;

        .label {
          font-size: 0.9rem;
          color: #cccccc;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: "Inter", "Segoe UI", sans-serif;
        }

        .value {
          font-weight: 600;
          color: #4caf50;
          font-size: 1rem;
          font-family: "Inter", "Segoe UI", sans-serif;
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
        }
      }
    }

    p {
      font-size: 1.2rem;
      color: #cccccc;
      font-weight: 300;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 1024px) {
        font-size: 1.1rem;
      }

      @media (max-width: 768px) {
        font-size: 1rem;
      }

      @media (max-width: 480px) {
        font-size: 0.95rem;
      }
    }
  }

  @media (max-width: 1024px) {
    padding: 110px 20px 70px;
    min-height: 55vh;
    background-attachment: scroll;
  }

  @media (max-width: 768px) {
    padding: 100px 20px 60px;
    min-height: 50vh;
  }

  @media (max-width: 480px) {
    padding: 90px 15px 50px;
    min-height: 45vh;
  }
`;

const NewsContent = styled.section`
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
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const NewsImage = styled.div`
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 20px;
  margin-bottom: 40px;
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
      rgba(0, 0, 0, 0.2) 0%,
      rgba(0, 0, 0, 0.05) 100%
    );
    z-index: 1;
  }

  @media (max-width: 768px) {
    height: 300px;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    height: 250px;
    margin-bottom: 25px;
  }
`;

const NewsArticle = styled.article`
  .content {
    color: #cccccc;
    line-height: 1.8;
    font-family: "Inter", "Segoe UI", sans-serif;
    font-size: 1.1rem;

    @media (max-width: 768px) {
      font-size: 1rem;
      line-height: 1.7;
    }

    @media (max-width: 480px) {
      font-size: 0.95rem;
      line-height: 1.6;
    }

    p {
      margin-bottom: 25px;

      @media (max-width: 480px) {
        margin-bottom: 20px;
      }
    }

    h2 {
      color: #ffffff;
      margin: 40px 0 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-size: 1.8rem;
      font-weight: 400;
      letter-spacing: 0.02em;

      @media (max-width: 768px) {
        font-size: 1.6rem;
        margin: 35px 0 18px;
      }

      @media (max-width: 480px) {
        font-size: 1.4rem;
        margin: 30px 0 15px;
      }
    }

    h3 {
      color: #ffffff;
      margin: 30px 0 15px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      font-size: 1.4rem;
      font-weight: 400;
      letter-spacing: 0.02em;

      @media (max-width: 768px) {
        font-size: 1.3rem;
        margin: 25px 0 12px;
      }

      @media (max-width: 480px) {
        font-size: 1.2rem;
        margin: 20px 0 10px;
      }
    }

    blockquote {
      background: rgba(255, 255, 255, 0.05);
      border-left: 4px solid #4caf50;
      padding: 25px;
      margin: 30px 0;
      border-radius: 10px;
      font-style: italic;
      color: #e0e0e0;

      @media (max-width: 480px) {
        padding: 20px;
        margin: 25px 0;
      }
    }

    ul,
    ol {
      padding-left: 30px;
      margin-bottom: 25px;

      li {
        margin-bottom: 10px;

        @media (max-width: 480px) {
          margin-bottom: 8px;
        }
      }
    }
  }
`;

const RelatedNews = styled.section`
  margin-top: 60px;
  padding-top: 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    color: #ffffff;
    margin-bottom: 30px;
    font-family: "Korsvagen Brand", "Times New Roman", serif;
    font-size: 2rem;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-align: center;

    @media (max-width: 768px) {
      font-size: 1.8rem;
      margin-bottom: 25px;
    }

    @media (max-width: 480px) {
      font-size: 1.6rem;
      margin-bottom: 20px;
    }
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 25px;
    }

    .related-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 15px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
      cursor: pointer;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .card-image {
        height: 150px;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        position: relative;

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
        }
      }

      .card-content {
        padding: 20px;

        .card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;

          .date {
            color: #4caf50;
            font-size: 0.8rem;
            font-family: "Inter", "Segoe UI", sans-serif;
          }

          .category {
            background: rgba(76, 175, 80, 0.1);
            color: #4caf50;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: 500;
            border: 1px solid rgba(76, 175, 80, 0.2);
          }
        }

        h3 {
          color: #ffffff;
          margin-bottom: 10px;
          font-family: "Korsvagen Brand", "Times New Roman", serif;
          font-size: 1.1rem;
          line-height: 1.3;
          font-weight: 400;

          @media (max-width: 480px) {
            font-size: 1rem;
          }
        }

        p {
          color: #cccccc;
          font-size: 0.9rem;
          line-height: 1.4;
          font-family: "Inter", "Segoe UI", sans-serif;

          @media (max-width: 480px) {
            font-size: 0.85rem;
          }
        }
      }
    }
  }
`;

const NewsDetailPage: React.FC = () => {
  const { newsId } = useParams<{ newsId: string }>();
  const navigate = useNavigateWithScroll();

  // Mock data delle news - in un'app reale, questo dovrebbe venire da un API
  const allNews = [
    {
      id: 1,
      title: "KORSVAGEN vince il premio 'Innovazione nell'Edilizia 2024'",
      excerpt:
        "La nostra azienda è stata riconosciuta per l'utilizzo di tecnologie innovative nella costruzione sostenibile e per l'approccio eco-friendly ai progetti edilizi.",
      date: "15 Dicembre 2024",
      category: "Premi",
      image:
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      content: `
        KORSVAGEN S.R.L. ha ricevuto il prestigioso premio "Innovazione nell'Edilizia 2024" durante la cerimonia tenutasi presso il Palazzo delle Stelline di Milano. 
        
        Il riconoscimento, assegnato dall'Associazione Nazionale Costruttori Edili, premia le aziende che si distinguono per l'utilizzo di tecnologie innovative e sostenibili nel settore delle costruzioni.
        
        "Questo premio rappresenta il riconoscimento del nostro impegno costante verso l'innovazione e la sostenibilità", ha dichiarato il CEO di KORSVAGEN durante la cerimonia. "Continueremo a investire in tecnologie all'avanguardia per offrire ai nostri clienti soluzioni sempre più efficienti e rispettose dell'ambiente."
        
        Tra i progetti che hanno contribuito al riconoscimento, spicca la recente realizzazione di un complesso residenziale a energia zero nel centro di Milano, che utilizza materiali eco-compatibili e sistemi di domotica avanzata.
        
        L'azienda ha inoltre presentato durante la cerimonia il suo nuovo piano quinquennale per la sostenibilità, che prevede l'utilizzo esclusivo di energie rinnovabili entro il 2027 e l'implementazione di processi di economia circolare in tutti i cantieri.
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

  const news = allNews.find((n) => n.id === parseInt(newsId || "1"));
  const relatedNews = allNews
    .filter((n) => n.id !== parseInt(newsId || "1"))
    .slice(0, 2);

  const handleBack = () => {
    navigate("/news");
  };

  const handleRelatedClick = (relatedNewsId: number) => {
    navigate(`/news/${relatedNewsId}`);
  };

  if (!news) {
    return (
      <NewsDetailContainer>
        <Header />
        <MainContent>
          <div style={{ textAlign: "center", padding: "100px 20px" }}>
            <h1>Articolo non trovato</h1>
            <button onClick={handleBack}>Torna alle News</button>
          </div>
        </MainContent>
        <Footer />
      </NewsDetailContainer>
    );
  }

  return (
    <NewsDetailContainer>
      <Header />
      <BackButton onClick={handleBack}>← Torna alle News</BackButton>

      <MainContent>
        <HeroSection style={{ backgroundImage: `url(${news.image})` }}>
          <div className="hero-content">
            <MobileBackButton onClick={handleBack}>
              ← Torna alle News
            </MobileBackButton>

            <h1>{news.title}</h1>
            <div className="news-meta">
              <div className="meta-item">
                <span className="label">Data:</span>
                <span className="value">{news.date}</span>
              </div>
              <div className="meta-item">
                <span className="category">{news.category}</span>
              </div>
            </div>
            <p>{news.excerpt}</p>
          </div>
        </HeroSection>

        <NewsContent>
          <Container>
            <NewsImage style={{ backgroundImage: `url(${news.image})` }} />

            <NewsArticle>
              <div className="content">
                {news.content
                  .split("\n")
                  .filter((paragraph) => paragraph.trim())
                  .map((paragraph, index) => (
                    <p key={index}>{paragraph.trim()}</p>
                  ))}
              </div>
            </NewsArticle>

            {relatedNews.length > 0 && (
              <RelatedNews>
                <h2>Articoli Correlati</h2>
                <div className="related-grid">
                  {relatedNews.map((relatedArticle) => (
                    <div
                      key={relatedArticle.id}
                      className="related-card"
                      onClick={() => handleRelatedClick(relatedArticle.id)}
                    >
                      <div
                        className="card-image"
                        style={{
                          backgroundImage: `url(${relatedArticle.image})`,
                        }}
                      />
                      <div className="card-content">
                        <div className="card-meta">
                          <span className="date">{relatedArticle.date}</span>
                          <span className="category">
                            {relatedArticle.category}
                          </span>
                        </div>
                        <h3>{relatedArticle.title}</h3>
                        <p>{relatedArticle.excerpt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </RelatedNews>
            )}
          </Container>
        </NewsContent>

        <ContactCTA />
      </MainContent>

      <Footer />
    </NewsDetailContainer>
  );
};

export default NewsDetailPage;
