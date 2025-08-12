import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Home,
  FileText,
  Image,
  Settings,
  Menu,
  X,
  MessageSquare,
  Users,
  Cog,
  Newspaper,
  Briefcase,
} from "lucide-react";

interface NavigationItem {
  title: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    icon: <Home size={20} />,
    path: "/dashboard",
  },
  {
    title: "Homepage",
    icon: <FileText size={20} />,
    path: "/dashboard/pages/home",
  },
  {
    title: "Gestione About",
    icon: <FileText size={20} />,
    path: "/dashboard/about",
  },
  {
    title: "Gestione Team",
    icon: <Users size={20} />,
    path: "/dashboard/team",
  },
  {
    title: "Gestione Servizi",
    icon: <Cog size={20} />,
    path: "/dashboard/services",
  },
  {
    title: "Gestione Progetti",
    icon: <FileText size={20} />,
    path: "/dashboard/projects",
  },
  {
    title: "Gestione News",
    icon: <Newspaper size={20} />,
    path: "/dashboard/news",
  },
  {
    title: "Lavora con Noi",
    icon: <Briefcase size={20} />,
    path: "/dashboard/jobs",
  },
  {
    title: "Contact",
    icon: <FileText size={20} />,
    path: "/dashboard/pages/contact",
  },
  {
    title: "Recensioni",
    icon: <MessageSquare size={20} />,
    path: "/dashboard/reviews",
  },
  {
    title: "Media Library",
    icon: <Image size={20} />,
    path: "/dashboard/media",
  },
  {
    title: "Impostazioni",
    icon: <Settings size={20} />,
    path: "/dashboard/settings",
  },
];

const SidebarContainer = styled.div<{ $collapsed: boolean }>`
  height: 100vh;
  background-color: var(--bg-primary);
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  position: relative;
  width: ${({ $collapsed }) => ($collapsed ? "80px" : "250px")};
  transition: width 0.3s ease-in-out;
  overflow: visible;
  min-width: 80px;
`;

const SidebarHeader = styled.div<{ $collapsed: boolean }>`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) =>
    $collapsed ? "center" : "space-between"};
  min-height: 60px;
  position: relative;
`;

const Logo = styled.div<{ $collapsed: boolean }>`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
  opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
  transition: opacity 0.3s ease-in-out;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  background-color: var(--bg-secondary);
  border: 1px solid #e5e7eb;

  &:hover {
    color: var(--text-primary);
    background-color: var(--primary);
    color: white;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const NavItem = styled.div<{ $active?: boolean; $collapsed: boolean }>`
  margin: 0 0.5rem;
`;

const NavLink = styled(Link)<{
  $active?: boolean;
  $collapsed: boolean;
  $isChild?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: ${({ $collapsed, $isChild }) =>
    $collapsed
      ? "0.75rem"
      : $isChild
      ? "0.5rem 1rem 0.5rem 2.5rem"
      : "0.75rem 1rem"};
  color: ${({ $active }) =>
    $active ? "var(--primary)" : "var(--text-secondary)"};
  text-decoration: none;
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;
  font-size: ${({ $isChild }) => ($isChild ? "0.875rem" : "0.875rem")};
  justify-content: ${({ $collapsed }) =>
    $collapsed ? "center" : "flex-start"};
  background-color: ${({ $active }) =>
    $active ? "rgba(37, 99, 235, 0.1)" : "transparent"};
  position: relative;
  margin: ${({ $collapsed }) => ($collapsed ? "0.25rem 0" : "0")};

  &:hover {
    background-color: ${({ $active }) =>
      $active ? "rgba(37, 99, 235, 0.15)" : "var(--bg-secondary)"};
    color: ${({ $active }) =>
      $active ? "var(--primary)" : "var(--text-primary)"};
    transform: ${({ $collapsed }) => ($collapsed ? "scale(1.05)" : "none")};
  }

  span {
    opacity: ${({ $collapsed }) => ($collapsed ? 0 : 1)};
    transition: opacity 0.3s ease-in-out;
    white-space: nowrap;
  }
`;


export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  onNavigate,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const handleToggleClick = () => {
    onToggle();
  };

  return (
    <SidebarContainer $collapsed={collapsed}>
      <SidebarHeader $collapsed={collapsed}>
        {!collapsed && <Logo $collapsed={collapsed}>KORSVAGEN</Logo>}
        <ToggleButton onClick={handleToggleClick}>
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </ToggleButton>
      </SidebarHeader>

      <Navigation>
        {navigationItems.map((item) => {
          const active = isActive(item.path);

          return (
            <NavItem key={item.title} $active={active} $collapsed={collapsed}>
              <NavLink
                to={item.path}
                $active={active}
                $collapsed={collapsed}
                onClick={() => handleNavigation(item.path)}
              >
                {item.icon}
                <span>{item.title}</span>
              </NavLink>
            </NavItem>
          );
        })}
      </Navigation>
    </SidebarContainer>
  );
};
