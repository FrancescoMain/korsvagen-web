import React from "react";
import styled from "styled-components";
import { Breadcrumb } from "../components/Dashboard/Breadcrumb";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const ComingSoonCard = styled.div`
  background-color: var(--bg-primary);
  border-radius: 0.75rem;
  padding: 3rem;
  text-align: center;
  border: 1px solid #e5e7eb;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
`;

const Description = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
`;

export const Settings: React.FC = () => {
  return (
    <Container>
      <Breadcrumb />
      <ComingSoonCard>
        <Title>Settings</Title>
        <Description>
          This feature is coming soon. You'll be able to configure your
          application settings from here.
        </Description>
      </ComingSoonCard>
    </Container>
  );
};
