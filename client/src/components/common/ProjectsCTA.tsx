import React from "react";
import styled from "styled-components";

interface ProjectsCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  id?: string;
}

const ProjectsCTA: React.FC<ProjectsCTAProps> = ({
  title = "Hai un progetto in mente?",
  subtitle = "Trasforma la tua idea in realtà. Contattaci per una consulenza gratuita e scopri come possiamo aiutarti a realizzare il tuo progetto.",
  buttonText = "Inizia il tuo progetto",
  id = "projects-cta",
}) => {
  const scrollToContact = () => {
    const element = document.getElementById("contact-form");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <CTASection id={id}>
      <CTAContainer>
        <CTAContent>
          <CTATitle>{title}</CTATitle>
          <CTASubtitle>{subtitle}</CTASubtitle>
          <CTAButton onClick={scrollToContact}>{buttonText}</CTAButton>
        </CTAContent>
        <CTAVisual>
          <CTAImage
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
          </CTAImage>
        </CTAVisual>
      </CTAContainer>
    </CTASection>
  );
};

const CTASection = styled.section`
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%);
  color: #ffffff;
  padding: 120px 0;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80");
    background-size: cover;
    background-position: center;
    opacity: 0.1;
    z-index: 1;
  }

  @media (max-width: 768px) {
    padding: 100px 0;
  }

  @media (max-width: 480px) {
    padding: 80px 0;
  }
`;

const CTAContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 60px;
    padding: 0 1rem;
  }
`;

const CTAContent = styled.div`
  text-align: left;

  @media (max-width: 768px) {
    text-align: center;
  }
`;

const CTATitle = styled.h2`
  font-size: 3.5rem;
  font-weight: 400;
  margin-bottom: 30px;
  color: #ffffff;
  font-family: "Korsvagen Brand", "Times New Roman", serif;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 2.8rem;
    margin-bottom: 25px;
  }

  @media (max-width: 480px) {
    font-size: 2.2rem;
    margin-bottom: 20px;
  }
`;

const CTASubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 50px;
  color: #cccccc;
  font-weight: 300;
  line-height: 1.7;
  font-family: "Inter", "Segoe UI", sans-serif;

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 40px;
  }

  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 35px;
  }
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
  color: #ffffff;
  padding: 20px 50px;
  border: none;
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-family: "Inter", "Segoe UI", sans-serif;
  box-shadow: 0 10px 30px rgba(230, 126, 34, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(230, 126, 34, 0.5);
    background: linear-gradient(135deg, #d35400 0%, #e67e22 100%);
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 18px 40px;
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    padding: 16px 35px;
    font-size: 1rem;
    width: 100%;
  }
`;

const CTAVisual = styled.div`
  position: relative;

  @media (max-width: 768px) {
    order: -1;
  }
`;

const CTAImage = styled.div`
  height: 350px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cccccc;
  font-family: "Inter", "Segoe UI", sans-serif;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
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
      rgba(230, 126, 34, 0.1) 0%,
      rgba(211, 84, 0, 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);

    &::before {
      opacity: 1;
    }
  }

  .placeholder-text {
    font-size: 1.1rem;
    text-align: center;
    position: relative;
    z-index: 2;
  }

  @media (max-width: 768px) {
    height: 280px;
  }

  @media (max-width: 480px) {
    height: 220px;
  }
`;

export default ProjectsCTA;
