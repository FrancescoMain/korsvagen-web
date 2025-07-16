import React, { InputHTMLAttributes, ReactNode, forwardRef } from "react";
import styled, { css } from "styled-components";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  helperText?: string;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const InputContainer = styled.div<{
  hasError?: boolean;
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
}>`
  position: relative;
  display: flex;
  align-items: center;

  ${({ hasLeftIcon }) =>
    hasLeftIcon &&
    css`
      input {
        padding-left: 2.5rem;
      }
    `}

  ${({ hasRightIcon }) =>
    hasRightIcon &&
    css`
      input {
        padding-right: 2.5rem;
      }
    `}
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #9ca3af;
  }

  ${({ hasError }) =>
    hasError &&
    css`
      border-color: var(--error);
      &:focus {
        border-color: var(--error);
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
      }
    `}
`;

const IconWrapper = styled.div<{ position: "left" | "right" }>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  z-index: 1;

  ${({ position }) =>
    position === "left"
      ? css`
          left: 0.75rem;
        `
      : css`
          right: 0.75rem;
        `}

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const ErrorText = styled.span`
  font-size: 0.75rem;
  color: var(--error);
  font-weight: 500;
`;

const HelperText = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, leftIcon, rightIcon, helperText, className, ...props },
    ref
  ) => {
    return (
      <InputWrapper className={className}>
        {label && <Label>{label}</Label>}
        <InputContainer
          hasError={!!error}
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
        >
          {leftIcon && <IconWrapper position="left">{leftIcon}</IconWrapper>}
          <StyledInput ref={ref} hasError={!!error} {...props} />
          {rightIcon && <IconWrapper position="right">{rightIcon}</IconWrapper>}
        </InputContainer>
        {error && <ErrorText>{error}</ErrorText>}
        {helperText && !error && <HelperText>{helperText}</HelperText>}
      </InputWrapper>
    );
  }
);
