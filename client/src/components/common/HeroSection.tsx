import React from "react";
import styled from "styled-components";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundGradient?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  backgroundGradient = "linear-gradient(135deg, #4a5568 0%, #2d3748 100%)",
  className,
}) => {
  return (
    <HeroContainer
      $backgroundGradient={backgroundGradient}
      className={className}
    >
      <HeroContent>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </HeroContent>
    </HeroContainer>
  );
};

const HeroContainer = styled.section<{ $backgroundGradient: string }>`
  background: ${(props) => props.$backgroundGradient};
  color: white;
  text-align: center;
  padding: 100px 20px;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 1024px) {
    padding: 80px 20px;
    min-height: 250px;
  }

  @media (max-width: 768px) {
    padding: 60px 20px;
    min-height: 200px;
  }

  @media (max-width: 480px) {
    padding: 40px 20px;
    min-height: 180px;
  }
`;

const HeroContent = styled.div`
  max-width: 800px;
  width: 100%;

  h1 {
    font-size: 2.8rem;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: "Montserrat", sans-serif;
    line-height: 1.2;

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
  }

  p {
    font-size: 1.2rem;
    color: #e2e8f0;
    margin: 0;
    line-height: 1.4;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }
`;

export default HeroSection;
