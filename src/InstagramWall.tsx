import React, { useState } from 'react';
import styled from 'styled-components';

interface InstagramPostData {
  id: string;
  url: string;
  caption: string;
  embedId: string;
}

const InstagramWall: React.FC = () => {
  const [loading, setLoading] = useState(true);

  // URL di post Instagram reali per progetti edilizi/architettura
  // Sostituire con veri post di @korsvagen quando sarà attivo
  const instagramPosts: InstagramPostData[] = [
    {
      id: '1',
      url: 'https://www.instagram.com/p/CUbHfhpswxt/',
      embedId: 'CUbHfhpswxt',
      caption: 'Progetto residenziale moderno - Architettura contemporanea'
    },
    {
      id: '2',
      url: 'https://www.instagram.com/p/CQpx_Jhsl7w/',
      embedId: 'CQpx_Jhsl7w',
      caption: 'Cantiere in costruzione - Strutture innovative'
    },
    {
      id: '3',
      url: 'https://www.instagram.com/p/CPBDnxRsGdu/',
      embedId: 'CPBDnxRsGdu',
      caption: 'Villa di lusso completata - Design esclusivo'
    },
    {
      id: '4',
      url: 'https://www.instagram.com/p/COjKpQsL7Xy/',
      embedId: 'COjKpQsL7Xy',
      caption: 'Edificio commerciale - Soluzioni architettoniche avanzate'
    },
    {
      id: '5',
      url: 'https://www.instagram.com/p/CNpQrStLwXy/',
      embedId: 'CNpQrStLwXy',
      caption: 'Interno di pregio - Finiture di alta qualità'
    },
    {
      id: '6',
      url: 'https://www.instagram.com/p/CMvPqLsLxYz/',
      embedId: 'CMvPqLsLxYz',
      caption: 'Sviluppo urbanistico - Sostenibilità e innovazione'
    }
  ];

  React.useEffect(() => {
    // Simula il caricamento iniziale
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handlePostClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Caricamento progetti Instagram...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <Grid>
        {instagramPosts.map((post) => (
          <PostWrapper key={post.id}>
            <PostCard onClick={() => handlePostClick(post.url)}>
              <IframeContainer>
                <InstagramIframe
                  src={`https://www.instagram.com/p/${post.embedId}/embed/`}
                  title={`Instagram post ${post.id}`}
                  loading="lazy"
                />
                <ClickOverlay>
                  <OverlayIcon>📱</OverlayIcon>
                  <OverlayText>Visualizza su Instagram</OverlayText>
                </ClickOverlay>
              </IframeContainer>
              <Caption>{post.caption}</Caption>
            </PostCard>
          </PostWrapper>
        ))}
      </Grid>
      
      <InfoMessage>
        <InfoTitle>📸 Instagram @korsvagen</InfoTitle>
        <InfoText>
          <strong>Nota:</strong> Questi sono post di esempio per dimostrare il layout.
          <br />
          Una volta attivato l'account Instagram @korsvagen, sostituire con i veri post dei progetti aziendali.
        </InfoText>
        <InstructionsList>
          <li>✅ Layout responsive pronto</li>
          <li>✅ Embed Instagram funzionante</li>
          <li>⏳ Account @korsvagen da attivare</li>
          <li>⏳ Foto progetti reali da pubblicare</li>
        </InstructionsList>
      </InfoMessage>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 2rem 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #ECF0F1;
  border-top: 4px solid #E67E22;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #7F8C8D;
  margin-top: 1.5rem;
  font-size: 1.1rem;
  font-family: 'Montserrat', sans-serif;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const PostWrapper = styled.div`
  position: relative;
`;

const PostCard = styled.div`
  background: #FFFFFF;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.1);
  border: 1px solid #ECF0F1;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(44, 62, 80, 0.15);
  }
`;

const IframeContainer = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
`;

const InstagramIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px 12px 0 0;
  background: #ECF0F1;
`;

const ClickOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 12px 12px 0 0;
  
  ${PostCard}:hover & {
    opacity: 1;
  }
`;

const OverlayIcon = styled.span`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const OverlayText = styled.span`
  color: #FFFFFF;
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
`;

const Caption = styled.p`
  padding: 1.5rem;
  margin: 0;
  color: #2C3E50;
  font-size: 0.95rem;
  line-height: 1.5;
  background: #FFFFFF;
  border-top: 1px solid #ECF0F1;
  font-weight: 500;
`;

const InfoMessage = styled.div`
  background: linear-gradient(135deg, #E8F5E8 0%, #F0F9FF 100%);
  border: 2px solid #27AE60;
  border-radius: 16px;
  padding: 2rem;
  margin-top: 2rem;
`;

const InfoTitle = styled.h4`
  color: #27AE60;
  font-family: 'Montserrat', sans-serif;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
  text-align: center;
`;

const InfoText = styled.p`
  color: #1B4332;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  text-align: center;
  
  strong {
    color: #27AE60;
  }
`;

const InstructionsList = styled.ul`
  color: #1B4332;
  font-size: 0.95rem;
  line-height: 1.8;
  margin: 0;
  padding-left: 1rem;
  
  li {
    margin-bottom: 0.5rem;
  }
`;

export default InstagramWall;
