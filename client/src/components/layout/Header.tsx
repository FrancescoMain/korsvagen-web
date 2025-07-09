import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import Link from "../common/Link";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Home" },
    { path: "/chi-siamo", label: "Chi Siamo" },
    { path: "/servizi", label: "Servizi" },
    { path: "/progetti", label: "Progetti" },
    { path: "/news", label: "News" },
    { path: "/il-nostro-team", label: "Il Nostro Team" },
    { path: "/lavora-con-noi", label: "Lavora con Noi" },
    { path: "/contatti", label: "Contatti" },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Previeni scroll quando il menu è aperto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  // Chiudi menu su cambio pagina
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <HeaderContainer>
      <HeaderContent>
        <Navigation $menuOpen={isMenuOpen}>
          <DesktopMenu>
            {menuItems.map((item) => (
              <MenuLink
                key={item.path}
                to={item.path}
                $isActive={location.pathname === item.path}
              >
                {item.label}
              </MenuLink>
            ))}
          </DesktopMenu>

          <MobileMenuToggle onClick={toggleMenu} $isOpen={isMenuOpen}>
            <span></span>
            <span></span>
            <span></span>
          </MobileMenuToggle>

          {isMenuOpen && <MobileOverlay onClick={() => setIsMenuOpen(false)} />}

          <MobileMenu $isOpen={isMenuOpen}>
            <div className="menu-content">
              {menuItems.map((item) => (
                <MobileMenuLink
                  key={item.path}
                  to={item.path}
                  $isActive={location.pathname === item.path}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </MobileMenuLink>
              ))}
            </div>
          </MobileMenu>
        </Navigation>

        <LogoSection>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <LogoImage src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
            <Tagline>Costruzioni & Progettazione</Tagline>
          </Link>
        </LogoSection>
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  width: 100%;
  border-bottom: 1px solid #e2e8f0;
  backdrop-filter: blur(12px);
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  height: 110px;

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    height: 80px;
  }

  @media (max-width: 320px) {
    padding: 0 1rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;

  a {
    display: flex;
    align-items: center;
    gap: 1rem;
    text-decoration: none;

    @media (max-width: 480px) {
      gap: 0.75rem;
    }
  }
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;

  @media (max-width: 768px) {
    height: 40px;
  }

  @media (max-width: 480px) {
    height: 35px;
  }
`;

const Tagline = styled.span`
  font-family: "Arial", sans-serif;
  font-size: 1rem;
  color: #666666;
  font-weight: 300;
  letter-spacing: 0.5px;
  text-align: center;
  text-transform: uppercase;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const Navigation = styled.nav<{ $menuOpen: boolean }>`
  position: relative;
`;

const DesktopMenu = styled.div`
  display: flex;
  gap: 1.8rem;
  align-items: center;

  @media (max-width: 1200px) {
    gap: 1.5rem;
  }

  @media (max-width: 1280px) {
    display: none;
  }
`;

const MenuLink = styled(Link)<{ $isActive: boolean }>`
  font-family: "Arial", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: ${(props) => (props.$isActive ? "#1a1a1a" : "#4a5568")};
  text-decoration: none;
  padding: 1.2rem 0;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.8px;

  @media (max-width: 1200px) {
    font-size: 0.9rem;
    letter-spacing: 0.5px;
  }

  &:hover {
    color: #1a1a1a;
    transform: translateY(-1px);

    &::after {
      width: 100%;
    }
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 4px;
    background: #1a1a1a;
    transition: width 0.3s ease;
  }

  ${(props) =>
    props.$isActive &&
    `
    color: #1a1a1a;
    font-weight: 600;
  `}
`;

const MobileMenuToggle = styled.button<{ $isOpen: boolean }>`
  display: none;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  gap: 4px;
  position: relative;

  @media (max-width: 1280px) {
    display: flex;
  }

  span {
    width: 25px;
    height: 3px;
    background: #1a1a1a;
    transition: all 0.3s ease;
    border-radius: 2px;

    &:nth-child(1) {
      transform: ${(props) =>
        props.$isOpen ? "rotate(45deg) translate(6px, 6px)" : "none"};
    }

    &:nth-child(2) {
      opacity: ${(props) => (props.$isOpen ? "0" : "1")};
    }

    &:nth-child(3) {
      transform: ${(props) =>
        props.$isOpen ? "rotate(-45deg) translate(6px, -6px)" : "none"};
    }
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 110px;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  z-index: 1002;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;
  max-height: ${(props) => (props.$isOpen ? "calc(100vh - 110px)" : "0")};
  overflow: hidden;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    top: 80px;
    max-height: ${(props) => (props.$isOpen ? "calc(100vh - 80px)" : "0")};
  }

  @media (max-width: 1280px) {
    display: block;
  }

  .menu-content {
    background: transparent;
    transform: ${(props) =>
      props.$isOpen ? "translateY(0)" : "translateY(-100%)"};
    transition: transform 0.4s ease-in-out;
    overflow-y: auto;
    max-height: inherit;
    height: 100%;
  }
`;

const MobileMenuLink = styled(Link)<{ $isActive: boolean }>`
  display: block;
  font-family: "Arial", sans-serif;
  font-size: 1.2rem;
  font-weight: 500;
  color: ${(props) => (props.$isActive ? "#1a1a1a" : "#4a5568")};
  text-decoration: none;
  padding: 1.5rem 2rem;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: #1a1a1a;
  }

  ${(props) =>
    props.$isActive &&
    `
    color: #1a1a1a;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.05);
  `}
`;

const MobileOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  cursor: pointer;

  @media (min-width: 1281px) {
    display: none;
  }
`;

export default Header;
