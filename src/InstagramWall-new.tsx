import React, { useState, useEffect } from "react";
import styled from "styled-components";

interface InstagramPost {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  permalink: string;
  timestamp: string;
}

const InstagramWall: React.FC = () => {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data che simula progetti edilizi reali
  const constructionPosts: InstagramPost[] = [
    {
      id: "1",
      media_url:
        "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption:
        "Nuova villa residenziale in costruzione - Progetto 2025 #korsvagen #edilizia",
      permalink: "https://instagram.com/p/korsvagen1",
      timestamp: "2025-06-30T10:00:00Z",
    },
    {
      id: "2",
      media_url:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption: "Complesso residenziale moderno - Architettura contemporanea",
      permalink: "https://instagram.com/p/korsvagen2",
      timestamp: "2025-06-29T15:30:00Z",
    },
    {
      id: "3",
      media_url:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption: "Cantiere in progress - Strutture in cemento armato di qualità",
      permalink: "https://instagram.com/p/korsvagen3",
      timestamp: "2025-06-28T09:15:00Z",
    },
    {
      id: "4",
      media_url:
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption: "Edificio commerciale completato - Design moderno ed efficiente",
      permalink: "https://instagram.com/p/korsvagen4",
      timestamp: "2025-06-27T14:20:00Z",
    },
    {
      id: "5",
      media_url:
        "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption:
        "Interno di lusso - Finiture di alta qualità per i nostri clienti",
      permalink: "https://instagram.com/p/korsvagen5",
      timestamp: "2025-06-26T11:45:00Z",
    },
    {
      id: "6",
      media_url:
        "https://images.unsplash.com/photo-1448630360428-65456885c650?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption:
        "Sviluppo urbanistico sostenibile - Innovazione e rispetto ambientale",
      permalink: "https://instagram.com/p/korsvagen6",
      timestamp: "2025-06-25T16:30:00Z",
    },
    {
      id: "7",
      media_url:
        "https://images.unsplash.com/photo-1582503809203-280e22c38bb6?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption:
        "Team al lavoro - Professionalità e dedizione nei nostri cantieri",
      permalink: "https://instagram.com/p/korsvagen7",
      timestamp: "2025-06-24T13:10:00Z",
    },
    {
      id: "8",
      media_url:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
      media_type: "IMAGE",
      caption: "Vista aerea del nuovo quartiere residenziale #sviluppourbano",
      permalink: "https://instagram.com/p/korsvagen8",
      timestamp: "2025-06-23T08:45:00Z",
    },
  ];

  useEffect(() => {
    // Simula il caricamento dei dati Instagram
    const loadPosts = async () => {
      setLoading(true);
      // Simula latenza API reale
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPosts(constructionPosts);
      setLoading(false);
    };

    loadPosts();
  }, []);

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
        {posts.map((post) => (
          <PostCard key={post.id}>
            <PostLink
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ImageContainer>
                <PostImage
                  src={post.media_url}
                  alt={post.caption || "Progetto Korsvagen"}
                />
                <Overlay>
                  <OverlayIcon>📱</OverlayIcon>
                  <OverlayText>Visualizza su Instagram</OverlayText>
                </Overlay>
              </ImageContainer>
            </PostLink>
            {post.caption && (
              <Caption>
                {post.caption.length > 80
                  ? `${post.caption.substring(0, 80)}...`
                  : post.caption}
              </Caption>
            )}
          </PostCard>
        ))}
      </Grid>
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
  border: 4px solid #ecf0f1;
  border-top: 4px solid #e67e22;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: #7f8c8d;
  margin-top: 1.5rem;
  font-size: 1.1rem;
  font-family: "Montserrat", sans-serif;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const PostCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.1);
  border: 1px solid #ecf0f1;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(44, 62, 80, 0.15);
  }
`;

const PostLink = styled.a`
  display: block;
  text-decoration: none;
  color: inherit;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  ${PostCard}:hover & {
    transform: scale(1.05);
  }
`;

const Overlay = styled.div`
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

  ${PostCard}:hover & {
    opacity: 1;
  }
`;

const OverlayIcon = styled.span`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const OverlayText = styled.span`
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  font-family: "Montserrat", sans-serif;
`;

const Caption = styled.p`
  padding: 1.5rem;
  margin: 0;
  color: #2c3e50;
  font-size: 0.95rem;
  line-height: 1.5;
  background: #ffffff;
  border-top: 1px solid #ecf0f1;
`;

export default InstagramWall;
