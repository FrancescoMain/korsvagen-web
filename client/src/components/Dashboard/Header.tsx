import React, { useState } from "react";
import styled from "styled-components";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings as SettingsIcon,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../contexts/ThemeContext";
import { Button } from "../ui/Button";

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  sidebarCollapsed: boolean;
}

const HeaderContainer = styled.header`
  height: 60px;
  background-color: var(--bg-primary);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  position: relative;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MobileMenuButton = styled.button`
  display: none;
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

  @media (max-width: 768px) {
    display: flex;
  }
`;

const BreadcrumbContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.875rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NotificationButton = styled.button`
  position: relative;
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
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--error);
  border-radius: 50%;
`;

const ThemeToggle = styled.button`
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
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserMenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--text-secondary);
  border-radius: 0.375rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;

  @media (max-width: 640px) {
    display: none;
  }
`;

const UserName = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: capitalize;
`;

const UserMenu = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: var(--bg-primary);
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 200px;
  z-index: 10;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transform: translateY(${({ $isOpen }) => ($isOpen ? "0" : "-10px")});
  transition: all 0.15s ease-in-out;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: all 0.15s ease-in-out;

  &:first-child {
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }

  &:last-child {
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }

  &:hover {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }

  &.danger {
    color: var(--error);

    &:hover {
      background-color: #fef2f2;
      color: var(--error);
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.25rem 0;
`;

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  sidebarCollapsed,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const toggleUserMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
  };

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <HeaderContainer>
      <LeftSection>
        <MobileMenuButton onClick={onToggleMobileSidebar}>
          <Menu size={20} />
        </MobileMenuButton>

        <BreadcrumbContainer>Dashboard</BreadcrumbContainer>
      </LeftSection>

      <RightSection>
        <ThemeToggle onClick={toggleTheme}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </ThemeToggle>

        <NotificationButton>
          <Bell size={20} />
          <NotificationBadge />
        </NotificationButton>

        <UserMenuContainer>
          <UserMenuTrigger onClick={toggleUserMenu}>
            <User size={20} />
            <UserInfo>
              <UserName>{user?.username}</UserName>
              <UserRole>{user?.role}</UserRole>
            </UserInfo>
            <ChevronDown size={16} />
          </UserMenuTrigger>

          <UserMenu $isOpen={userMenuOpen}>
            <MenuItem>
              <User size={16} />
              Profile
            </MenuItem>
            <MenuItem>
              <SettingsIcon size={16} />
              Settings
            </MenuItem>
            <Divider />
            <MenuItem className="danger" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </MenuItem>
          </UserMenu>
        </UserMenuContainer>
      </RightSection>
    </HeaderContainer>
  );
};
