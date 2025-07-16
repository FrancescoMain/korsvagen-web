import React from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { ChevronRight, Home } from "lucide-react";

const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
`;

const BreadcrumbItem = styled.span<{ isActive?: boolean }>`
  color: ${({ isActive }) =>
    isActive ? "var(--text-primary)" : "var(--text-secondary)"};
  font-weight: ${({ isActive }) => (isActive ? "500" : "400")};
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  padding: 0;
  transition: color 0.15s ease-in-out;

  &:hover {
    color: var(--text-primary);
  }
`;

const Separator = styled(ChevronRight)`
  color: var(--text-secondary);
  opacity: 0.5;
`;

export const Breadcrumb: React.FC = () => {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNames: { [key: string]: string } = {
    dashboard: "Dashboard",
    pages: "Pages",
    media: "Media Library",
    settings: "Settings",
    home: "Homepage",
    about: "About",
    contact: "Contact",
  };

  const getBreadcrumbName = (path: string) => {
    return (
      breadcrumbNames[path] || path.charAt(0).toUpperCase() + path.slice(1)
    );
  };

  if (pathnames.length === 0 || pathnames[0] !== "dashboard") {
    return null;
  }

  return (
    <BreadcrumbContainer>
      <Home size={16} />
      <BreadcrumbLink>Dashboard</BreadcrumbLink>

      {pathnames.slice(1).map((pathname, index) => {
        const isLast = index === pathnames.length - 2;

        return (
          <React.Fragment key={pathname}>
            <Separator size={16} />
            <BreadcrumbItem isActive={isLast}>
              {getBreadcrumbName(pathname)}
            </BreadcrumbItem>
          </React.Fragment>
        );
      })}
    </BreadcrumbContainer>
  );
};
