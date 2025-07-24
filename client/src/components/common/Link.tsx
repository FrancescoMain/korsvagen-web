import React from "react";
import { Link as ReactRouterLink, LinkProps } from "react-router-dom";

// Componente Link personalizzato che fa scroll to top
const Link: React.FC<LinkProps> = ({ to, children, onClick, ...props }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Esegui il click originale se presente
    if (onClick) {
      onClick(e);
    }

    // Aggiungi scroll to top dopo un piccolo delay
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <ReactRouterLink to={to} onClick={handleClick} {...props}>
      {children}
    </ReactRouterLink>
  );
};

export default Link;
