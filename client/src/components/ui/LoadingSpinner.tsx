import React from "react";
import styled, { keyframes } from "styled-components";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerWrapper = styled.div<{ size: string; color?: string }>`
  display: inline-block;

  ${({ size }) => {
    switch (size) {
      case "sm":
        return `
          width: 1rem;
          height: 1rem;
          border-width: 2px;
        `;
      case "lg":
        return `
          width: 2rem;
          height: 2rem;
          border-width: 3px;
        `;
      default:
        return `
          width: 1.5rem;
          height: 1.5rem;
          border-width: 2px;
        `;
    }
  }}

  border: solid ${({ color }) => color || "var(--primary)"};
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const CenteredWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

export const LoadingSpinner: React.FC<
  LoadingSpinnerProps & { centered?: boolean }
> = ({ size = "md", color, centered = false }) => {
  const spinner = <SpinnerWrapper size={size} color={color} />;

  return centered ? <CenteredWrapper>{spinner}</CenteredWrapper> : spinner;
};
