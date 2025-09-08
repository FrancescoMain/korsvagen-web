import React from "react";
import styled from "styled-components";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import Link from "../components/common/Link";
import EmergencyButton from "../components/common/EmergencyButton";
import EmergencyModal from "../components/common/EmergencyModal";
import { usePageData } from "../hooks/usePageData";
import { useReviews } from "../hooks/useReviews";
import { useHomeNews } from "../hooks/useHomeNews";
import { useHomeProjects } from "../hooks/useHomeProjects";
import { useHomeServices } from "../hooks/useHomeServices";

const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  background: #1a1a1a;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  background: #1a1a1a;
  padding-top: 110px;

  @media (max-width: 768px) {
    padding-top: 80px;
  }
`;

const HeroSection = styled.section`
  background: #1a1a1a;
  color: white;
  text-align: center;
  padding: 0;
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    min-height: 80vh;
  }

  @media (max-width: 480px) {
    min-height: 70vh;
  }

  @media (max-height: 600px) {
    min-height: 90vh;
  }

  .hero-video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    object-fit: cover;
    z-index: 1;

    @media (max-width: 768px) {
      height: 80vh;
    }

    @media (max-width: 480px) {
      height: 70vh;
    }

    @media (max-height: 600px) {
      height: 90vh;
    }
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2;
  }

  .hero-content {
    position: relative;
    z-index: 3;
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
    text-align: center;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding-top: 15vh;

    @media (max-width: 768px) {
      height: 80vh;
      padding: 10vh 1.5rem 0;
    }

    @media (max-width: 480px) {
      height: 70vh;
      padding: 8vh 1rem 0;
    }

    @media (max-height: 600px) {
      height: 90vh;
      padding: 8vh 1rem 0;
    }
  }

  .hero-top {
    margin-bottom: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }

  .hero-bottom {
    margin-top: auto;
    padding-bottom: 15vh;

    @media (max-width: 768px) {
      padding-bottom: 12vh;
    }

    @media (max-width: 480px) {
      padding-bottom: 10vh;
    }
  }

  h1 {
    font-size: 4.5rem;
    font-weight: 700;
    margin-bottom: 20px;
    font-family: "Korsvagen Brand", "Times New Roman", serif;
    letter-spacing: 0.1em;
    line-height: 1.1;
    color: #ffffff;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 3.5rem;
    }

    @media (max-width: 480px) {
      font-size: 2.8rem;
    }
  }

  .slogan-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .slogan-top,
  .slogan-bottom {
    font-size: 3rem;
    font-weight: 300;
    margin: 0;
    font-family: "Inter", "Segoe UI", sans-serif;
    letter-spacing: 0.15em;
    line-height: 1.1;
    color: #ffffff;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.7);
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 2.2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.8rem;
    }
  }

  .cta-button {
    background: transparent;
    color: #ffffff;
    padding: 16px 40px;
    border: 2px solid #ffffff;
    border-radius: 0;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-family: "Inter", "Segoe UI", sans-serif;

    &:hover {
      background: #ffffff;
      color: #1a1a1a;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
    }

    @media (max-width: 768px) {
      padding: 14px 32px;
      font-size: 0.95rem;
    }

    @media (max-width: 480px) {
      padding: 12px 28px;
      font-size: 0.9rem;
      width: 100%;
      max-width: 300px;
    }
`;

const ServicesGallery = styled.section`
  padding: 100px 0;
  background: #ffffff;
  color: #1a1a1a;
  overflow: hidden;

  .services-header {
    text-align: center;
    margin-bottom: 80px;
    padding: 0 20px;

    h2 {
      font-size: 3.5rem;
      font-weight: 300;
      color: #1a1a1a;
      margin-bottom: 30px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 2.8rem;
      }

      @media (max-width: 480px) {
        font-size: 2.2rem;
      }
    }

    .subtitle {
      font-size: 1.3rem;
      color: #666666;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-weight: 300;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }
    }
  }

  .gallery-container {
    position: relative;
    width: 100%;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
      height: 500px;
    }

    @media (max-width: 480px) {
      height: 400px;
    }
  }

  .gallery-track {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 30px;
    padding: 0 50px;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    @media (max-width: 768px) {
      gap: 20px;
      padding: 0 30px;
    }

    @media (max-width: 480px) {
      gap: 15px;
      padding: 0 20px;
    }
  }

  .service-card {
    position: relative;
    overflow: hidden;
    border-radius: 0;
    background: #000;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    flex-shrink: 0;

    &.active {
      width: 700px;
      height: 450px;
      z-index: 3;

      @media (max-width: 1024px) {
        width: 600px;
        height: 400px;
      }

      @media (max-width: 768px) {
        width: 500px;
        height: 350px;
      }

      @media (max-width: 480px) {
        width: 320px;
        height: 250px;
      }

      .service-content {
        opacity: 1;
        transform: translateY(0);
      }

      .service-overlay {
        background: rgba(0, 0, 0, 0.4);
      }
    }

    &.side {
      width: 250px;
      height: 300px;
      opacity: 0.7;
      transform: scale(0.85);
      z-index: 2;

      @media (max-width: 768px) {
        display: none;
      }

      .service-content {
        opacity: 0;
        transform: translateY(20px);
      }

      .service-overlay {
        background: rgba(0, 0, 0, 0.7);
      }
    }

    &.hidden {
      width: 200px;
      height: 250px;
      opacity: 0.3;
      transform: scale(0.7);
      z-index: 1;

      @media (max-width: 768px) {
        display: none;
      }

      .service-content {
        opacity: 0;
        transform: translateY(20px);
      }

      .service-overlay {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    .service-video {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .service-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      transition: all 0.6s ease;
      z-index: 2;
    }

    .service-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 40px 30px;
      z-index: 3;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.6s ease;

      h3 {
        font-size: 2rem;
        font-weight: 400;
        color: #ffffff;
        margin-bottom: 15px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
        letter-spacing: 0.05em;
        text-transform: uppercase;

        @media (max-width: 768px) {
          font-size: 1.6rem;
        }

        @media (max-width: 480px) {
          font-size: 1.2rem;
        }
      }

      p {
        color: #e0e0e0;
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 20px;
        font-family: "Inter", "Segoe UI", sans-serif;

        @media (max-width: 480px) {
          font-size: 0.9rem;
        }
      }

      .service-cta {
        background: transparent;
        color: #ffffff;
        padding: 12px 24px;
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 0;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-family: "Inter", "Segoe UI", sans-serif;

        &:hover {
          background: #ffffff;
          color: #1a1a1a;
          border-color: #ffffff;
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          padding: 10px 20px;
          font-size: 0.85rem;
        }
      }

      @media (max-width: 768px) {
        padding: 30px 20px;
      }

      @media (max-width: 480px) {
        padding: 25px 15px 20px;
      }
    }
  }

  .gallery-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(26, 26, 26, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 4;

    &:hover {
      background: rgba(26, 26, 26, 0.7);
      transform: translateY(-50%) scale(1.1);
    }

    &.prev {
      left: 20px;
    }

    &.next {
      right: 20px;
    }

    @media (max-width: 480px) {
      width: 40px;
      height: 40px;
      font-size: 0.8rem;
    }
  }

  .gallery-indicators {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 40px;

    .indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #cccccc;
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        background: #1a1a1a;
        transform: scale(1.2);
      }
    }
  }

  .simple-cta {
    text-align: center;
    margin-top: 60px;

    .simple-cta-button {
      background: transparent;
      color: #1a1a1a;
      padding: 15px 35px;
      border: 2px solid #1a1a1a;
      border-radius: 0;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family: "Inter", "Segoe UI", sans-serif;

      &:hover {
        background: #1a1a1a;
        color: #ffffff;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(26, 26, 26, 0.2);
      }

      @media (max-width: 768px) {
        padding: 12px 30px;
        font-size: 0.95rem;
      }

      @media (max-width: 480px) {
        padding: 10px 25px;
        font-size: 0.9rem;
      }
    }
  }

  .cta-section {
    text-align: center;
    padding: 80px 40px;
    margin-top: 60px;
    background: #f8f9fa;

    h3 {
      font-size: 2.2rem;
      font-weight: 300;
      color: #1a1a1a;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.05em;

      @media (max-width: 768px) {
        font-size: 1.8rem;
      }
    }

    p {
      font-size: 1.1rem;
      color: #666666;
      margin-bottom: 40px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }

    .main-cta {
      background: #1a1a1a;
      color: #ffffff;
      padding: 18px 45px;
      border: 2px solid #1a1a1a;
      border-radius: 0;
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family: "Inter", "Segoe UI", sans-serif;

      &:hover {
        background: transparent;
        color: #1a1a1a;
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(26, 26, 26, 0.2);
      }

      @media (max-width: 768px) {
        padding: 16px 40px;
        font-size: 1rem;
      }

      @media (max-width: 480px) {
        padding: 14px 35px;
        font-size: 0.95rem;
        width: 100%;
        max-width: 300px;
      }
    }

    @media (max-width: 768px) {
      padding: 60px 30px;
    }

    @media (max-width: 480px) {
      padding: 50px 20px;
    }
  }

  @media (max-width: 768px) {
    padding: 80px 0;
  }

  @media (max-width: 480px) {
    padding: 60px 0;
  }
`;

const ProjectsGallery = styled.section`
  padding: 100px 0;
  background: #1a1a1a;
  color: #ffffff;
  overflow: hidden;

  .projects-header {
    text-align: center;
    margin-bottom: 80px;
    padding: 0 20px;

    h2 {
      font-size: 3.5rem;
      font-weight: 300;
      color: #ffffff;
      margin-bottom: 30px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.1em;
      text-transform: uppercase;

      @media (max-width: 768px) {
        font-size: 2.8rem;
      }

      @media (max-width: 480px) {
        font-size: 2.2rem;
      }
    }

    .subtitle {
      font-size: 1.3rem;
      color: #cccccc;
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;
      font-weight: 300;

      @media (max-width: 768px) {
        font-size: 1.1rem;
      }
    }
  }

  .gallery-container {
    position: relative;
    width: 100%;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
      height: 500px;
    }

    @media (max-width: 480px) {
      height: 400px;
    }
  }

  .gallery-track {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 30px;
    padding: 0 50px;
    transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);

    @media (max-width: 768px) {
      gap: 20px;
      padding: 0 30px;
    }

    @media (max-width: 480px) {
      gap: 15px;
      padding: 0 20px;
    }
  }

  .project-card {
    position: relative;
    overflow: hidden;
    border-radius: 0;
    background: #000;
    cursor: pointer;
    transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    flex-shrink: 0;

    &.active {
      width: 700px;
      height: 450px;
      z-index: 3;

      @media (max-width: 1024px) {
        width: 600px;
        height: 400px;
      }

      @media (max-width: 768px) {
        width: 500px;
        height: 350px;
      }

      @media (max-width: 480px) {
        width: 320px;
        height: 250px;
      }

      .project-content {
        opacity: 1;
        transform: translateY(0);
      }

      .project-overlay {
        background: rgba(0, 0, 0, 0.4);
      }
    }

    &.side {
      width: 250px;
      height: 300px;
      opacity: 0.7;
      transform: scale(0.85);
      z-index: 2;

      @media (max-width: 768px) {
        display: none;
      }

      .project-content {
        opacity: 0;
        transform: translateY(20px);
      }

      .project-overlay {
        background: rgba(0, 0, 0, 0.7);
      }
    }

    &.hidden {
      width: 200px;
      height: 250px;
      opacity: 0.3;
      transform: scale(0.7);
      z-index: 1;

      @media (max-width: 768px) {
        display: none;
      }

      .project-content {
        opacity: 0;
        transform: translateY(20px);
      }

      .project-overlay {
        background: rgba(0, 0, 0, 0.8);
      }
    }

    .project-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s ease;
    }

    .project-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      transition: all 0.6s ease;
      z-index: 2;
    }

    .project-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 40px 30px;
      z-index: 3;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.6s ease;

      h3 {
        font-size: 2rem;
        font-weight: 400;
        color: #ffffff;
        margin-bottom: 10px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        line-height: 1.2;

        @media (max-width: 768px) {
          font-size: 1.4rem;
          line-height: 1.1;
        }

        @media (max-width: 480px) {
          font-size: 1.1rem;
          line-height: 1.1;
          margin-bottom: 8px;
        }
      }

      .project-location {
        color: #cccccc;
        font-size: 0.9rem;
        margin-bottom: 15px;
        font-family: "Inter", "Segoe UI", sans-serif;
        font-style: italic;

        @media (max-width: 480px) {
          font-size: 0.8rem;
        }
      }

      p {
        color: #e0e0e0;
        font-size: 1rem;
        line-height: 1.5;
        margin-bottom: 20px;
        font-family: "Inter", "Segoe UI", sans-serif;

        @media (max-width: 480px) {
          font-size: 0.9rem;
        }
      }

      .project-cta {
        background: transparent;
        color: #ffffff;
        padding: 12px 24px;
        border: 1px solid rgba(255, 255, 255, 0.5);
        border-radius: 0;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        text-decoration: none;
        display: inline-block;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        font-family: "Inter", "Segoe UI", sans-serif;

        &:hover {
          background: #ffffff;
          color: #1a1a1a;
          border-color: #ffffff;
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          padding: 10px 20px;
          font-size: 0.85rem;
        }
      }

      @media (max-width: 768px) {
        padding: 30px 20px;
      }

      @media (max-width: 480px) {
        padding: 25px 15px 20px;
      }
    }
  }

  .gallery-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    z-index: 4;

    &:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-50%) scale(1.1);
    }

    &.prev {
      left: 20px;
    }

    &.next {
      right: 20px;
    }

    @media (max-width: 480px) {
      width: 40px;
      height: 40px;
      font-size: 0.8rem;
    }
  }

  .gallery-indicators {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 40px;

    .indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #666666;
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        background: #ffffff;
        transform: scale(1.2);
      }
    }
  }

  .simple-cta {
    text-align: center;
    margin-top: 60px;

    .simple-cta-button {
      background: transparent;
      color: #ffffff;
      padding: 15px 35px;
      border: 2px solid #ffffff;
      border-radius: 0;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family: "Inter", "Segoe UI", sans-serif;

      &:hover {
        background: #ffffff;
        color: #1a1a1a;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
      }

      @media (max-width: 768px) {
        padding: 12px 30px;
        font-size: 0.95rem;
      }

      @media (max-width: 480px) {
        padding: 10px 25px;
        font-size: 0.9rem;
      }
    }
  }

  .cta-section {
    text-align: center;
    padding: 80px 40px;
    margin-top: 60px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);

    h3 {
      font-size: 2.2rem;
      font-weight: 300;
      color: #ffffff;
      margin-bottom: 20px;
      font-family: "Korsvagen Brand", "Times New Roman", serif;
      letter-spacing: 0.05em;

      @media (max-width: 768px) {
        font-size: 1.8rem;
      }
    }

    p {
      font-size: 1.1rem;
      color: #cccccc;
      margin-bottom: 40px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.6;
      font-family: "Inter", "Segoe UI", sans-serif;

      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }

    .main-cta {
      background: transparent;
      color: #ffffff;
      padding: 18px 45px;
      border: 2px solid #ffffff;
      border-radius: 0;
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      display: inline-block;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-family: "Inter", "Segoe UI", sans-serif;

      &:hover {
        background: #ffffff;
        color: #1a1a1a;
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
      }

      @media (max-width: 768px) {
        padding: 16px 40px;
        font-size: 1rem;
      }

      @media (max-width: 480px) {
        padding: 14px 35px;
        font-size: 0.95rem;
        width: 100%;
        max-width: 300px;
      }
    }

    @media (max-width: 768px) {
      padding: 60px 30px;
    }

    @media (max-width: 480px) {
      padding: 50px 20px;
    }
  }

  @media (max-width: 768px) {
    padding: 80px 0;
  }

  @media (max-width: 480px) {
    padding: 60px 0;
  }
`;

const NewsSection = styled.section`
  background: #ffffff;
  color: #000000;
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const NewsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const NewsSectionTitle = styled.h2`
  font-size: 3.5rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 20px;
  color: #000000;
  font-family: "Korsvagen Brand", "Times New Roman", serif;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const NewsSectionSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 60px;
  color: #666666;
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 30px;
  }
`;

const NewsGallery = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 60px;

  @media (max-width: 768px) {
    gap: 30px;
    margin-bottom: 40px;
  }
`;

const NewsCard = styled.article`
  display: flex;
  background: #f8f8f8;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NewsImageContainer = styled.div`
  flex: 1;
  min-height: 300px;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 200px;
  }
`;

const NewsImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${NewsCard}:hover & {
    transform: scale(1.05);
  }
`;

const NewsContent = styled.div`
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 30px;
  }

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const NewsDate = styled.time`
  font-size: 0.9rem;
  color: #999999;
  margin-bottom: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const NewsTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #000000;
  line-height: 1.3;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.3rem;
  }
`;

const NewsExcerpt = styled.p`
  font-size: 1rem;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 24px;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const NewsActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: auto;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const NewsCtaButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background: #000000;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;

  &:hover {
    background: #333333;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 14px 20px;
  }
`;

const NewsSecondaryButton = styled(Link)`
  display: inline-block;
  padding: 12px 24px;
  background: transparent;
  color: #000000;
  text-decoration: none;
  border: 2px solid #000000;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.02em;

  &:hover {
    background: #000000;
    color: #ffffff;
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    padding: 14px 20px;
  }
`;

const NewsSimpleCta = styled.div`
  text-align: center;
  margin-top: 40px;

  .simple-cta-button {
    display: inline-block;
    padding: 16px 32px;
    background: transparent;
    color: #000000;
    text-decoration: none;
    border: 2px solid #000000;
    border-radius: 50px;
    font-weight: 500;
    font-size: 1rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    letter-spacing: 0.02em;
    text-transform: uppercase;

    &:hover {
      background: #000000;
      color: #ffffff;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
      padding: 14px 28px;
      font-size: 0.95rem;
    }

    @media (max-width: 480px) {
      padding: 12px 24px;
      font-size: 0.9rem;
    }
  }
`;

const ReviewsSection = styled.section`
  background: #1a1a1a;
  color: #ffffff;
  padding: 0;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
`;

const ReviewsContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ReviewsTrack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ReviewCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 80px 40px;
  width: 100%;
  min-height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transform: translateY(50px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.active {
    opacity: 1;
    transform: translateY(0);
    position: relative;
  }

  @media (max-width: 768px) {
    padding: 60px 30px;
  }

  @media (max-width: 480px) {
    padding: 40px 20px;
  }
`;

const ReviewStars = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  justify-content: center;

  .star {
    color: #ffd700;
    font-size: 2rem;

    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
`;

const ReviewText = styled.blockquote`
  font-size: 2rem;
  font-weight: 300;
  line-height: 1.4;
  max-width: 800px;
  margin: 0 auto 40px;
  color: #ffffff;
  font-style: italic;
  font-family: "Georgia", serif;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-bottom: 25px;
  }

  &::before {
    content: """;
    font-size: 4rem;
    color: #666666;
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: "Georgia", serif;

    @media (max-width: 768px) {
      font-size: 3rem;
      top: 10px;
    }
  }
`;

const ReviewAuthor = styled.div`
  .author-name {
    font-size: 1.3rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 8px;
    font-family: "Inter", "Segoe UI", sans-serif;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }

  .author-company {
    font-size: 1rem;
    color: #cccccc;
    font-weight: 300;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }

    @media (max-width: 480px) {
      font-size: 0.85rem;
    }
  }
`;

const ReviewsIndicators = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
  z-index: 3;

  @media (max-width: 768px) {
    bottom: 30px;
  }

  .indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    cursor: pointer;
    transition: all 0.3s ease;

    &.active {
      background: #ffffff;
      transform: scale(1.3);
    }
  }
`;

const InstagramSection = styled.section`
  background: #ffffff;
  padding: 80px 0;

  @media (max-width: 768px) {
    padding: 60px 0;
  }
`;

const InstagramContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const InstagramTitle = styled.h2`
  font-size: 3.5rem;
  font-weight: 300;
  text-align: center;
  margin-bottom: 20px;
  color: #000000;
  font-family: "Korsvagen Brand", "Times New Roman", serif;
  letter-spacing: 0.05em;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const InstagramSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 60px;
  color: #666666;
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 40px;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 30px;
  }
`;

const InstagramEmbed = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  iframe {
    width: 100%;
    height: 600px;
    border: none;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    @media (max-width: 768px) {
      height: 500px;
    }

    @media (max-width: 480px) {
      height: 400px;
      border-radius: 12px;
    }
  }
`;

const HomePage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [currentProjectSlide, setCurrentProjectSlide] = React.useState(0); // Primo elemento selezionato di default
  const [currentReviewSlide, setCurrentReviewSlide] = React.useState(0);
  const [showEmergencyModal, setShowEmergencyModal] = React.useState(false);
  
  // Load page data from backend with fallback
  const { pageData, loading, error } = usePageData("home");
  
  // Load reviews from database
  const { publicReviews, loading: reviewsLoading } = useReviews();
  
  // Load dynamic data from APIs
  const { news, loading: newsLoading } = useHomeNews(3);
  const { projects, loading: projectsLoading } = useHomeProjects(6);
  const { services, loading: servicesLoading } = useHomeServices();

  // Touch handling for mobile navigation
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (
    galleryType: "services" | "projects" | "reviews" | "news"
  ) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (galleryType === "services") {
      if (isLeftSwipe) {
        nextSlide();
      }
      if (isRightSwipe) {
        prevSlide();
      }
    } else if (galleryType === "projects") {
      if (isLeftSwipe) {
        nextProjectSlide();
      }
      if (isRightSwipe) {
        prevProjectSlide();
      }
    } else if (galleryType === "reviews") {
      if (isLeftSwipe) {
        nextReviewSlide();
      }
      if (isRightSwipe) {
        prevReviewSlide();
      }
    }
  };


  // Use dynamic reviews from database with fallback to static data
  const reviews = publicReviews.length > 0 ? publicReviews.map(review => ({
    text: review.review_text,
    author: review.author_name,
    company: review.author_company || "Cliente",
    stars: review.rating,
  })) : [
    {
      text: "Eccezionale! Korsvagen ha realizzato la casa dei nostri sogni con professionalità e attenzione ai dettagli incredibili.",
      author: "Mario Rossi",
      company: "Imprenditore edile",
      stars: 5,
    },
    {
      text: "Ottima esperienza, team competente e disponibile. Consigliatissimi per chi cerca qualità e affidabilità.",
      author: "Giulia Verdi",
      company: "Architetto",
      stars: 5,
    },
    {
      text: "Hanno trasformato la mia visione in realtà. Ogni fase del progetto è stata gestita con cura e precisione.",
      author: "Laura Bianchi",
      company: "Cliente privato",
      stars: 5,
    },
  ];

  // Auto-rotate reviews every 3 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentReviewSlide((prev) => (prev + 1) % reviews.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [reviews.length]);

  const nextSlide = () => {
    if (services.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % services.length);
    }
  };

  const prevSlide = () => {
    if (services.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextProjectSlide = () => {
    if (projects.length > 0) {
      setCurrentProjectSlide((prev) => (prev + 1) % projects.length);
    }
  };

  const prevProjectSlide = () => {
    if (projects.length > 0) {
      setCurrentProjectSlide(
        (prev) => (prev - 1 + projects.length) % projects.length
      );
    }
  };

  const goToProjectSlide = (index: number) => {
    setCurrentProjectSlide(index);
  };

  const nextReviewSlide = () => {
    setCurrentReviewSlide((prev) => (prev + 1) % reviews.length);
  };

  const prevReviewSlide = () => {
    setCurrentReviewSlide(
      (prev) => (prev - 1 + reviews.length) % reviews.length
    );
  };

  const goToReviewSlide = (index: number) => {
    setCurrentReviewSlide(index);
  };

  const getCardClass = (index: number) => {
    if (services.length === 0) return "hidden";
    if (index === currentSlide) return "active";
    if (
      index === (currentSlide - 1 + services.length) % services.length ||
      index === (currentSlide + 1) % services.length
    )
      return "side";
    return "hidden";
  };

  const getProjectCardClass = (index: number) => {
    if (projects.length === 0) return "hidden";
    if (index === currentProjectSlide) return "active";
    if (
      index === (currentProjectSlide - 1 + projects.length) % projects.length ||
      index === (currentProjectSlide + 1) % projects.length
    )
      return "side";
    return "hidden";
  };

  const getReviewCardClass = (index: number) => {
    if (index === currentReviewSlide) return "active";
    return ""; // Mostra tutte le recensioni, ma solo quella attiva è visibile
  };

  // Show loading if page data or any critical content is loading
  const isLoading = loading || newsLoading || projectsLoading || servicesLoading;
  
  if (isLoading) {
    return (
      <HomeContainer>
        <Header />
        <MainContent>
          <div style={{ textAlign: "center", padding: "100px 20px", color: "#666" }}>
            Caricamento contenuti...
          </div>
        </MainContent>
        <Footer />
      </HomeContainer>
    );
  }

  return (
    <HomeContainer>
      <Header />
      <MainContent>
        <HeroSection>
          <video className="hero-video" autoPlay muted loop playsInline>
            <source src="/korsvagen-hero.mp4" type="video/mp4" />
          </video>
          <div className="hero-content">
            <div className="hero-top">
              <h1>{pageData?.hero_title || "KORSVAGEN"}</h1>
              <div className="slogan-container">
                <p className="slogan-top">YOU DREAM</p>
                <p className="slogan-bottom">WE BUILD</p>
              </div>
            </div>
            <div className="hero-bottom">
              <Link to="/chi-siamo" className="cta-button">
                Scopri di più
              </Link>
            </div>
          </div>
        </HeroSection>

        <ServicesGallery>
          <div className="services-header">
            <h2>{pageData?.sections?.services?.title || "I Nostri Servizi"}</h2>
            <p className="subtitle">
              {pageData?.sections?.services?.subtitle || "Soluzioni innovative per ogni fase del tuo progetto. Dalla progettazione alla realizzazione, con competenza e tecnologie all'avanguardia."}
            </p>
          </div>

          <div className="gallery-container">
            <button className="gallery-nav prev" onClick={prevSlide}>
              ‹
            </button>

            <div className="gallery-track">
              {services.map((service, index) => (
                <div
                  key={service.id || index}
                  className={`service-card ${getCardClass(index)}`}
                  onClick={() => goToSlide(index)}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={() => onTouchEnd("services")}
                >
                  {service.image_url && service.image_url.endsWith('.webm') ? (
                    <video
                      className="service-video"
                      autoPlay
                      muted
                      loop
                      playsInline
                    >
                      <source src={service.image_url} type="video/webm" />
                    </video>
                  ) : (
                    <img
                      className="service-video"
                      src={service.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'}
                      alt={service.title}
                    />
                  )}
                  <div className="service-overlay"></div>
                  <div className="service-content">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <Link to="/servizi" className="service-cta">
                      Scopri di più
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <button className="gallery-nav next" onClick={nextSlide}>
              ›
            </button>
          </div>

          <div className="gallery-indicators">
            {services.map((_, index) => (
              <div
                key={index}
                className={`indicator ${
                  index === currentSlide ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>

          <div className="simple-cta">
            <Link to="/servizi" className="simple-cta-button">
              Scopri Altri Servizi
            </Link>
          </div>
        </ServicesGallery>

        <ProjectsGallery>
          <div className="projects-header">
            <h2>{pageData?.sections?.projects?.title || "I Nostri Progetti"}</h2>
            <p className="subtitle">
              {pageData?.sections?.projects?.subtitle || "Scopri alcuni dei nostri progetti realizzati, esempi concreti di eccellenza architettonica e innovazione tecnologica."}
            </p>
          </div>

          <div className="gallery-container">
            <button className="gallery-nav prev" onClick={prevProjectSlide}>
              ‹
            </button>

            <div className="gallery-track">
              {projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className={`project-card ${getProjectCardClass(index)}`}
                  onClick={() => goToProjectSlide(index)}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={() => onTouchEnd("projects")}
                >
                  <img
                    src={project.cover_image || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80'}
                    alt={project.title}
                    className="project-image"
                  />
                  <div className="project-overlay"></div>
                  <div className="project-content">
                    <h3>{project.title}</h3>
                    <div className="project-location">{project.location}</div>
                    <p>{project.description}</p>
                    <Link to="/progetti" className="project-cta">
                      Scopri di più
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <button className="gallery-nav next" onClick={nextProjectSlide}>
              ›
            </button>
          </div>

          <div className="gallery-indicators">
            {projects.map((_, index) => (
              <div
                key={index}
                className={`indicator ${
                  index === currentProjectSlide ? "active" : ""
                }`}
                onClick={() => goToProjectSlide(index)}
              />
            ))}
          </div>

          <div className="simple-cta">
            <Link to="/progetti" className="simple-cta-button">
              Scopri Altri Progetti
            </Link>
          </div>
        </ProjectsGallery>

        <NewsSection>
          <NewsContainer>
            <NewsSectionTitle>{pageData?.sections?.news?.title || "Ultime News"}</NewsSectionTitle>
            <NewsSectionSubtitle>
              {pageData?.sections?.news?.subtitle || "Resta aggiornato sulle ultime novità e tendenze dal mondo dell'architettura e costruzioni."}
            </NewsSectionSubtitle>

            <NewsGallery>
              {news.map((newsItem, index) => (
                <NewsCard key={newsItem.id || index}>
                  <NewsImageContainer>
                    <NewsImage src={newsItem.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'} alt={newsItem.title} />
                  </NewsImageContainer>
                  <NewsContent>
                    <NewsDate>{newsItem.published_date}</NewsDate>
                    <NewsTitle>{newsItem.title}</NewsTitle>
                    <NewsExcerpt>{newsItem.subtitle || newsItem.content?.substring(0, 120) + '...'}</NewsExcerpt>
                    <NewsActions>
                      <NewsCtaButton to={`/news/${newsItem.slug}`}>
                        Leggi di più
                      </NewsCtaButton>
                      <NewsSecondaryButton to="/progetti">
                        Vedi Progetti
                      </NewsSecondaryButton>
                    </NewsActions>
                  </NewsContent>
                </NewsCard>
              ))}
            </NewsGallery>

            <NewsSimpleCta>
              <Link to="/news" className="simple-cta-button">
                Leggi Tutte le News
              </Link>
            </NewsSimpleCta>
          </NewsContainer>
        </NewsSection>

        <ReviewsSection>
          <ReviewsContainer
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => onTouchEnd("reviews")}
          >
            <button className="gallery-nav prev" onClick={prevReviewSlide}>
              ‹
            </button>

            <ReviewsTrack>
              {reviews.map((review, index) => (
                <ReviewCard key={index} className={getReviewCardClass(index)}>
                  <ReviewStars>
                    {[...Array(review.stars)].map((_, i) => (
                      <span key={i} className="star">
                        ★
                      </span>
                    ))}
                  </ReviewStars>
                  <ReviewText>{review.text}</ReviewText>
                  <ReviewAuthor>
                    <div className="author-name">{review.author}</div>
                    <div className="author-company">{review.company}</div>
                  </ReviewAuthor>
                </ReviewCard>
              ))}
            </ReviewsTrack>

            <button className="gallery-nav next" onClick={nextReviewSlide}>
              ›
            </button>

            <ReviewsIndicators>
              {reviews.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${
                    index === currentReviewSlide ? "active" : ""
                  }`}
                  onClick={() => goToReviewSlide(index)}
                />
              ))}
            </ReviewsIndicators>
          </ReviewsContainer>
        </ReviewsSection>

        <InstagramSection>
          <InstagramContainer>
            <InstagramTitle>Seguici su Instagram</InstagramTitle>
            <InstagramSubtitle>
              Resta aggiornato con i nostri progetti più recenti e scopri dietro
              le quinte della nostra attività.
            </InstagramSubtitle>

            <InstagramEmbed>
              <iframe
                src="https://www.instagram.com/korsvagensrl/embed/"
                width="400"
                height="500"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                allow="encrypted-media"
                title="Instagram Feed"
              ></iframe>
            </InstagramEmbed>
          </InstagramContainer>
        </InstagramSection>

        <ContactCTA />
      </MainContent>
      <Footer />
      
      {/* Emergency Button - Always visible on homepage */}
      <EmergencyButton onClick={() => setShowEmergencyModal(true)} />
      
      {/* Emergency Modal */}
      <EmergencyModal 
        isOpen={showEmergencyModal} 
        onClose={() => setShowEmergencyModal(false)} 
      />
    </HomeContainer>
  );
};

export default HomePage;
