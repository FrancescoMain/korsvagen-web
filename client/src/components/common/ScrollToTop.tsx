import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top quando cambia la route
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // Scroll smooth invece di immediato
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
