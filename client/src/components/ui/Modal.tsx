import React, { ReactNode, useEffect } from "react";
import styled from "styled-components";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
  transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out;
  padding: 1rem;
`;

const ModalContent = styled.div<{ size: string; isOpen: boolean }>`
  background-color: var(--bg-primary);
  border-radius: 0.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(${({ isOpen }) => (isOpen ? 1 : 0.95)});
  transition: transform 0.2s ease-in-out;

  ${({ size }) => {
    switch (size) {
      case "sm":
        return "max-width: 24rem;";
      case "lg":
        return "max-width: 48rem;";
      case "xl":
        return "max-width: 64rem;";
      default:
        return "max-width: 32rem;";
    }
  }}
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--primary);
  }
`;

const ModalBody = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
`;

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent size={size} isOpen={isOpen}>
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && (
              <CloseButton onClick={onClose} aria-label="Close modal">
                <X size={20} />
              </CloseButton>
            )}
          </ModalHeader>
        )}
        <ModalBody>{children}</ModalBody>
      </ModalContent>
    </Overlay>
  );
};
