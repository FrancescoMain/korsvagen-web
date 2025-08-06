import React from "react";
import styled from "styled-components";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  size?: "compact" | "medium" | "large";
  backgroundImage?: string;
  overlay?: boolean;
  className?: string;
}

const HeroSection = styled.section<{
  $size: "compact" | "medium" | "large";
  $backgroundImage?: string;
  $overlay: boolean;
}>`
  background: ${({ $backgroundImage }) =>
    $backgroundImage
      ? `linear-gradient(
          135deg,
          rgba(26, 26, 26, 0.95) 0%,
          rgba(44, 44, 44, 0.95) 100%
        ),
        url("${$backgroundImage}")`
      : "linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)"};
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  color: white;
  text-align: center;
  padding: 80px 20px 40px;
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Standardized compact sizes - much smaller than before */
  height: ${({ $size }) => {
    switch ($size) {
      case "compact":
        return "200px"; // Much more compact
      case "medium":
        return "300px";
      case "large":
        return "400px";
      default:
        return "200px";
    }
  }};

  @media (max-width: 1024px) {
    height: ${({ $size }) => {
      switch ($size) {
        case "compact":
          return "180px";
        case "medium":
          return "250px";
        case "large":
          return "320px";
        default:
          return "180px";
      }
    }};
    background-attachment: scroll;
    padding: 60px 15px 30px;
  }

  @media (max-width: 768px) {
    height: ${({ $size }) => {
      switch ($size) {
        case "compact":
          return "160px";
        case "medium":
          return "220px";
        case "large":
          return "280px";
        default:
          return "160px";
      }
    }};
    padding: 50px 15px 25px;
  }

  @media (max-width: 480px) {
    height: ${({ $size }) => {
      switch ($size) {
        case "compact":
          return "140px";
        case "medium":
          return "180px";
        case "large":
          return "220px";
        default:
          return "140px";
      }
    }};
    padding: 40px 10px 20px;
  }

  /* Optional overlay */
  ${({ $overlay }) =>
    $overlay &&
    `
    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(26, 26, 26, 0.7);
      z-index: 1;
    }
  `}

  .hero-content {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    padding: 0 1rem;

    h1 {
      font-size: clamp(1.75rem, 4vw, 2.5rem);
      font-weight: 700;
      margin-bottom: 0.75rem;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      line-height: 1.2;
      color: #ffffff;
      text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
      text-transform: uppercase;

      @media (max-width: 768px) {
        margin-bottom: 0.5rem;
      }
    }

    .subtitle {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      font-weight: 400;
      line-height: 1.4;
      color: rgba(255, 255, 255, 0.9);
      opacity: 0.9;
      margin: 0;
      font-family: "Inter", "Segoe UI", sans-serif;
      letter-spacing: 0.05em;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
  }
`;

const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  size = "compact",
  backgroundImage,
  overlay = true,
  className,
}) => {
  // Use a unified background image for all heroes if none specified
  const defaultBackgroundImage =
    "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

  return (
    <HeroSection
      $size={size}
      $backgroundImage={backgroundImage || defaultBackgroundImage}
      $overlay={overlay}
      className={className}
    >
      <div className="hero-content">
        <h1>{title}</h1>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </div>
    </HeroSection>
  );
};

export default PageHero;