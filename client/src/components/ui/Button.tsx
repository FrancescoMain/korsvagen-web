import React, { ButtonHTMLAttributes, ReactNode } from "react";
import styled, { css } from "styled-components";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const ButtonBase = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.15s ease-in-out;
  cursor: pointer;
  text-decoration: none;
  font-family: inherit;
  position: relative;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary), 0 0 0 4px rgba(37, 99, 235, 0.1);
  }

  ${({ fullWidth }) =>
    fullWidth &&
    css`
      width: 100%;
    `}

  /* Size variants */
  ${({ size }) => {
    switch (size) {
      case "sm":
        return css`
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
        `;
      case "lg":
        return css`
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          line-height: 1.5rem;
        `;
      default:
        return css`
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          line-height: 1.25rem;
        `;
    }
  }}

  /* Color variants */
  ${({ variant }) => {
    switch (variant) {
      case "secondary":
        return css`
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid #e2e8f0;

          &:hover:not(:disabled) {
            background-color: #f1f5f9;
            border-color: #cbd5e1;
          }

          &:active:not(:disabled) {
            background-color: #e2e8f0;
          }
        `;
      case "danger":
        return css`
          background-color: var(--error);
          color: white;

          &:hover:not(:disabled) {
            background-color: #dc2626;
          }

          &:active:not(:disabled) {
            background-color: #b91c1c;
          }
        `;
      case "ghost":
        return css`
          background-color: transparent;
          color: var(--text-secondary);

          &:hover:not(:disabled) {
            background-color: var(--bg-secondary);
            color: var(--text-primary);
          }

          &:active:not(:disabled) {
            background-color: #e2e8f0;
          }
        `;
      default:
        return css`
          background-color: var(--primary);
          color: white;

          &:hover:not(:disabled) {
            background-color: var(--primary-dark);
          }

          &:active:not(:disabled) {
            background-color: #1e40af;
          }
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}) => {
  return (
    <ButtonBase
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </ButtonBase>
  );
};
