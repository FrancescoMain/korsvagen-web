/**
 * KORSVAGEN WEB APPLICATION - EMERGENCY BUTTON COMPONENT
 *
 * Sticky emergency button with smooth animations for the homepage.
 * Features:
 * - Smooth expand/contract animation
 * - Responsive design
 * - Accessibility support
 * - Click handler for modal opening
 *
 * @author KORSVAGEN S.R.L.
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface EmergencyButtonProps {
  onClick: () => void;
}

// Keyframe animations
const slideInFromRight = keyframes`
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const contractButton = keyframes`
  0% {
    border-radius: 50px;
    padding: 16px 24px;
    width: auto;
  }
  100% {
    border-radius: 50%;
    padding: 16px;
    width: 60px;
  }
`;

const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
  }
  50% {
    box-shadow: 0 6px 30px rgba(220, 38, 38, 0.7);
  }
  100% {
    box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);
  }
`;

// Styled components
const ButtonContainer = styled.div`
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;

  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
  }
`;

const Button = styled.button<{ isExpanded: boolean }>`
  background: #dc2626; /* Red emergency color */
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
  font-family: 'Inter', 'Segoe UI', sans-serif;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  border-radius: ${props => props.isExpanded ? '50px' : '50%'};
  padding: ${props => props.isExpanded ? '16px 24px' : '16px'};
  min-width: 60px;
  min-height: 60px;
  width: ${props => props.isExpanded ? 'auto' : '60px'};
  height: ${props => props.isExpanded ? 'auto' : '60px'};
  animation: ${props => props.isExpanded ? slideInFromRight : contractButton} 0.6s ease-out;
  box-shadow: 0 4px 20px rgba(220, 38, 38, 0.4);

  &:hover {
    background: #b91c1c;
    transform: scale(1.05);
    animation: ${pulseAnimation} 2s infinite;
  }

  &:active {
    transform: scale(0.95);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.3);
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: ${props => props.isExpanded ? '12px 20px' : '12px'};
    min-width: 50px;
    min-height: 50px;
    width: ${props => props.isExpanded ? 'auto' : '50px'};
    height: ${props => props.isExpanded ? 'auto' : '50px'};
  }

  @media (max-width: 480px) {
    bottom: 15px;
    right: 15px;
  }
`;

const Icon = styled.span`
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  min-width: 24px;
  color: white;

  @media (max-width: 768px) {
    font-size: 20px;
    min-width: 20px;
  }
`;

const Text = styled.span<{ isExpanded: boolean }>`
  opacity: ${props => props.isExpanded ? 1 : 0};
  width: ${props => props.isExpanded ? 'auto' : '0'};
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.4s ease-in-out ${props => props.isExpanded ? '0.2s' : '0s'};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const EmergencyButton: React.FC<EmergencyButtonProps> = ({ onClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // After 2 seconds, contract the button
    const timer = setTimeout(() => {
      setIsExpanded(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    // Add a small haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
    
    onClick();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <ButtonContainer>
      <Button
        isExpanded={isExpanded}
        onClick={handleClick}
        onKeyDown={handleKeyPress}
        aria-label="Centralino Emergenze - Clicca per richiedere assistenza urgente"
        role="button"
        tabIndex={0}
      >
        <Icon>!</Icon>
        <Text isExpanded={isExpanded}>
          Centralino Emergenze
        </Text>
      </Button>
    </ButtonContainer>
  );
};

export default EmergencyButton;