import React, { useState } from "react";
import styled from "styled-components";

const InstagramWall: React.FC = () => {
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Simula il caricamento iniziale
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleProfileClick = () => {
    window.open(
      "https://www.instagram.com/korsvagensrl/",
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <LoadingText>Caricamento profilo Instagram...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <ProfileHeader>
        <ProfileTitle>📸 @korsvagensrl</ProfileTitle>
        <ProfileSubtitle>
          I nostri progetti edilizi in tempo reale
        </ProfileSubtitle>
      </ProfileHeader>

      <InstagramContainer>
        <InstagramIframe
          src="https://www.instagram.com/korsvagensrl/embed/"
          title="Profilo Instagram @korsvagensrl"
          loading="lazy"
          allowTransparency={true}
          frameBorder={0}
        />
        <ClickOverlay onClick={handleProfileClick}>
          <OverlayContent>
            <OverlayIcon>📱</OverlayIcon>
            <OverlayText>Visualizza su Instagram</OverlayText>
            <OverlaySubtext>@korsvagensrl</OverlaySubtext>
          </OverlayContent>
        </ClickOverlay>
      </InstagramContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  margin: 2rem 0;

  @media (max-width: 320px) {
    margin: 1rem 0;
  }
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

const ProfileHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const ProfileTitle = styled.h3`
  color: #2c3e50;
  font-family: "Montserrat", sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const ProfileSubtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
`;

const InstagramContainer = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(44, 62, 80, 0.1);
  border: 1px solid #ecf0f1;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    height: 500px;
  }

  @media (max-width: 320px) {
    height: 400px;
    border-radius: 12px;
  }
`;

const InstagramIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  background: #ffffff;
`;

const ClickOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
  backdrop-filter: blur(2px);

  &:hover {
    opacity: 1;
  }
`;

const OverlayContent = styled.div`
  text-align: center;
  color: #ffffff;
`;

const OverlayIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const OverlayText = styled.div`
  font-size: 1.3rem;
  font-weight: 600;
  font-family: "Montserrat", sans-serif;
  margin-bottom: 0.5rem;
  letter-spacing: 0.5px;
`;

const OverlaySubtext = styled.div`
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 400;
`;

const InfoMessage = styled.div`
  background: linear-gradient(135deg, #e8f5e8 0%, #f0f9ff 100%);
  border: 2px solid #27ae60;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
`;

const InfoTitle = styled.h4`
  color: #27ae60;
  font-family: "Montserrat", sans-serif;
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
`;

const InfoText = styled.p`
  color: #1b4332;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;

  strong {
    color: #27ae60;
  }
`;

const FeaturesList = styled.ul`
  color: #1b4332;
  font-size: 0.95rem;
  line-height: 1.8;
  margin: 0;
  padding-left: 1rem;
  text-align: left;
  display: inline-block;

  li {
    margin-bottom: 0.5rem;
  }
`;

export default InstagramWall;
