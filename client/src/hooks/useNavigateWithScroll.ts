import { useNavigate as useReactRouterNavigate, NavigateOptions } from "react-router-dom";

// Custom hook che wrappa useNavigate per aggiungere scroll to top
export const useNavigateWithScroll = () => {
  const navigate = useReactRouterNavigate();

  const navigateWithScroll = (to: string | number, options?: NavigateOptions) => {
    navigate(to as any, options);
    
    // Se stiamo navigando verso una nuova pagina (non indietro), scroll to top
    if (typeof to === "string") {
      setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth",
        });
      }, 100); // Piccolo delay per assicurarsi che la navigazione sia completata
    }
  };

  return navigateWithScroll;
};

export default useNavigateWithScroll;
