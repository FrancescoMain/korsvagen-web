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

  // Mock data per ora - da sostituire con vera API Instagram
  const mockPosts: InstagramPost[] = [
    {
      id: "1",
      media_url: "https://picsum.photos/300/300?random=1",
      media_type: "IMAGE",
      caption: "Nuovo libro in arrivo nella collezione Korsvagen #libri #arte",
      permalink: "https://instagram.com/p/mock1",
      timestamp: "2025-06-30T10:00:00Z",
    },
    {
      id: "2",
      media_url: "https://picsum.photos/300/300?random=2",
      media_type: "IMAGE",
      caption: "Dietro le quinte del nostro ultimo progetto editoriale",
      permalink: "https://instagram.com/p/mock2",
      timestamp: "2025-06-29T15:30:00Z",
    },
    {
      id: "3",
      media_url: "https://picsum.photos/300/300?random=3",
      media_type: "IMAGE",
      caption: "Ispirazione artistica per la copertina del nuovo volume",
      permalink: "https://instagram.com/p/mock3",
      timestamp: "2025-06-28T09:15:00Z",
    },
    {
      id: "4",
      media_url: "https://picsum.photos/300/300?random=4",
      media_type: "IMAGE",
      caption: "La bellezza dei dettagli nelle nostre edizioni",
      permalink: "https://instagram.com/p/mock4",
      timestamp: "2025-06-27T14:20:00Z",
    },
    {
      id: "5",
      media_url: "https://picsum.photos/300/300?random=5",
      media_type: "IMAGE",
      caption: "Processo creativo: dall'idea al libro finito",
      permalink: "https://instagram.com/p/mock5",
      timestamp: "2025-06-26T11:45:00Z",
    },
    {
      id: "6",
      media_url: "https://picsum.photos/300/300?random=6",
      media_type: "IMAGE",
      caption: "Collaborazione con artisti emergenti #supportart",
      permalink: "https://instagram.com/p/mock6",
      timestamp: "2025-06-25T16:30:00Z",
    },
  ];

  useEffect(() => {
    // Simula il caricamento dei dati
    const loadPosts = async () => {
      setLoading(true);
      // Simula latenza API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setPosts(mockPosts);
      setLoading(false);
    };

    loadPosts();
  }, []);

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Caricamento post Instagram...</LoadingText>
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
                  alt={post.caption || "Instagram post"}
                />
                <Overlay>
                  <OverlayText>Visualizza su Instagram</OverlayText>
                </Overlay>
              </ImageContainer>
            </PostLink>
            {post.caption && (
              <Caption>
                {post.caption.length > 60
                  ? `${post.caption.substring(0, 60)}...`
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
  padding: 3rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid #333;
  border-top: 3px solid #d4af37;
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
  color: #cccccc;
  margin-top: 1rem;
  font-size: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const PostCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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
  height: 250px;
  overflow: hidden;
`;

const PostImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${PostCard}:hover & {
    opacity: 1;
  }
`;

const OverlayText = styled.span`
  color: #d4af37;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 0.5px;
`;

const Caption = styled.p`
  padding: 1rem;
  margin: 0;
  color: #cccccc;
  font-size: 0.9rem;
  line-height: 1.4;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

export default InstagramWall;
