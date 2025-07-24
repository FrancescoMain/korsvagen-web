import React from "react";
import styled from "styled-components";
import { LoginForm } from "../components/Auth/LoginForm";

const LoginPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`;

const LoginCard = styled.div`
  background-color: var(--bg-primary);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
`;

export const LoginPage: React.FC = () => {
  return (
    <LoginPageContainer>
      <LoginCard>
        <LoginForm />
      </LoginCard>
    </LoginPageContainer>
  );
};
