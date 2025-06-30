import React from "react";
import styled from "styled-components";
import InstagramWall from "../common/InstagramWall";
const ProjectsSection: React.FC = () => {
  return (
    <ProjectsContainer>
      <SectionContent>
        <SectionTitle>I Nostri Lavori in Corso</SectionTitle>
        <InstagramWall />
        <InstagramCTA
          href="https://www.instagram.com/korsvagensrl/"
          target="_blank"
          rel="noopener noreferrer"
        >
          FOLLOW US ON INSTAGRAM
        </InstagramCTA>
      </SectionContent>
    </ProjectsContainer>
  );
};

const ProjectsContainer = styled.section`
  padding: 5rem 2rem;
  background: #ffffff;

  @media (max-width: 320px) {
    padding: 3rem 1rem;
  }

  @media (max-width: 300px) {
    padding: 2rem 0.5rem;
  }
`;

const SectionContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 320px) {
    margin: 0 auto;
    text-align: center;
  }
`;

const SectionTitle = styled.h3`
  font-family: "Montserrat", sans-serif;
  font-size: 2.5rem;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const InstagramCTA = styled.a`
  display: inline-block;
  background: transparent;
  color: #e67e22;
  border: 2px solid #e67e22;
  padding: 1rem 2.5rem;
  font-family: "Montserrat", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  text-transform: uppercase;
  margin: 2rem auto;
  display: block;
  width: fit-content;

  &:hover {
    background: #e67e22;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(230, 126, 34, 0.3);
  }

  @media (max-width: 768px) {
    padding: 0.8rem 2rem;
    font-size: 0.9rem;
  }

  @media (max-width: 320px) {
    margin: 2rem auto;
    display: block;
    text-align: center;
    width: fit-content;
  }
`;

export default ProjectsSection;
