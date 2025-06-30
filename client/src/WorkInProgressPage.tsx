import React from "react";
import styled from "styled-components";
import {
  Header,
  Footer,
  HeroSection,
  ProjectsSection,
  ContactsSection,
} from "./components";

const WorkInProgressPage: React.FC = () => {
  return (
    <Container>
      <Header />
      <HeroSection />
      <ProjectsSection />
      <ContactsSection />
      <Footer />
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #2c3e50;
  font-family: "Open Sans", sans-serif;
  overflow-x: hidden;
  width: 100%;
`;

export default WorkInProgressPage;
