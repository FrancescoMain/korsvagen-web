import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: "/", label: "Home" },
    { path: "/chi-siamo", label: "Chi Siamo" },
    { path: "/servizi", label: "Servizi" },
    { path: "/progetti", label: "Progetti" },
    { path: "/news", label: "News" },
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
        <LogoSection>
          <Link
            to="/"
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <LogoImage src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
            <BrandInfo>
              <CompanyName>KORSVAGEN</CompanyName>
              <Tagline>Costruzioni & Progettazione</Tagline>
            </BrandInfo>
          </Link>
        </LogoSection>

        <Navigation>
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

          <MobileMenu $isOpen={isMenuOpen} onClick={() => setIsMenuOpen(false)}>
            <div className="menu-content" onClick={(e) => e.stopPropagation()}>
              <div className="menu-header">
                <div className="logo-mobile">
                  <img src="/LOGO KORSVAGEN.png" alt="Korsvagen Logo" />
                  <div className="brand-text">
                    <h2>KORSVAGEN</h2>
                    <span>Costruzioni & Progettazione</span>
                  </div>
                </div>
              </div>
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
      </HeaderContent>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background: #ffffff;
  box-shadow: 0 2px 20px rgba(44, 62, 80, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }

  @media (max-width: 320px) {
    padding: 1rem 1rem;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  z-index: 110;

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
    height: 45px;
  }

  @media (max-width: 480px) {
    height: 40px;
  }
`;

const BrandInfo = styled.div`
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    display: none;
  }
`;

const CompanyName = styled.h1`
  font-family: "Montserrat", sans-serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: 2px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    letter-spacing: 1px;
  }

  @media (max-width: 320px) {
    font-size: 1.5rem;
    letter-spacing: 0.5px;
  }
`;

const Tagline = styled.span`
  font-family: "Open Sans", sans-serif;
  font-size: 1rem;
  color: #e67e22;
  font-weight: 500;
  margin-top: 0.3rem;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Navigation = styled.nav`
  position: relative;
`;

const DesktopMenu = styled.div`
  display: flex;
  gap: 1.5rem;
  align-items: center;

  @media (max-width: 1200px) {
    gap: 1rem;
  }

  @media (max-width: 1024px) {
    display: none;
  }
`;

const MenuLink = styled(Link)<{ $isActive: boolean }>`
  font-family: "Open Sans", sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: ${(props) => (props.$isActive ? "#3182ce" : "#2c3e50")};
  text-decoration: none;
  padding: 0.5rem 0.8rem;
  border-radius: 5px;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;

  @media (max-width: 1200px) {
    font-size: 0.9rem;
    padding: 0.5rem 0.6rem;
  }

  &:hover {
    color: #3182ce;
    background: #f7fafc;
  }

  ${(props) =>
    props.$isActive &&
    `
    &:after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0.8rem;
      right: 0.8rem;
      height: 2px;
      background: #3182ce;
    }
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
  z-index: 110;
  position: relative;

  @media (max-width: 1024px) {
    display: flex;
  }

  span {
    width: 25px;
    height: 3px;
    background: #2c3e50;
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 105;
  opacity: ${(props) => (props.$isOpen ? "1" : "0")};
  visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
  transition: all 0.3s ease;

  @media (max-width: 1024px) {
    display: block;
  }

  .menu-content {
    position: absolute;
    top: 0;
    right: 0;
    background: white;
    height: 100vh;
    width: min(280px, 85vw);
    max-width: 320px;
    padding: 2rem 0;
    transform: ${(props) =>
      props.$isOpen ? "translateX(0)" : "translateX(100%)"};
    transition: transform 0.3s ease;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
    overflow-y: auto;

    @media (max-width: 350px) {
      width: 100vw;
      max-width: none;
    }
  }

  .menu-header {
    padding: 0 1.5rem 2rem;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 1rem;

    .logo-mobile {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      img {
        height: 35px;
      }

      .brand-text {
        h2 {
          font-family: "Montserrat", sans-serif;
          font-size: 1.2rem;
          color: #2c3e50;
          margin: 0;
        }

        span {
          font-size: 0.8rem;
          color: #e67e22;
        }
      }
    }
  }
`;

const MobileMenuLink = styled(Link)<{ $isActive: boolean }>`
  display: block;
  font-family: "Open Sans", sans-serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: ${(props) => (props.$isActive ? "#3182ce" : "#2c3e50")};
  text-decoration: none;
  padding: 1rem 1.5rem;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;

  &:hover {
    background: #f7fafc;
    color: #3182ce;
    border-left-color: #3182ce;
  }

  ${(props) =>
    props.$isActive &&
    `
    background: #f7fafc;
    border-left-color: #3182ce;
  `}
`;

export default Header;
