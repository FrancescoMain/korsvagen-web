import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { storage } from "../../utils/storage";

const LayoutContainer = styled.div<{ $sidebarCollapsed: boolean }>`
  display: grid;
  grid-template-areas:
    "sidebar header"
    "sidebar main";
  grid-template-columns: ${({ $sidebarCollapsed }) =>
    $sidebarCollapsed ? "80px 1fr" : "250px 1fr"};
  grid-template-rows: 60px 1fr;
  min-height: 100vh;
  transition: grid-template-columns 0.3s ease-in-out;

  @media (max-width: 768px) {
    grid-template-areas:
      "header header"
      "main main";
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;
  }
`;

const SidebarArea = styled.div`
  grid-area: sidebar;
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

const HeaderArea = styled.div`
  grid-area: header;
`;

const MainArea = styled.main`
  grid-area: main;
  background-color: var(--bg-secondary);
  overflow-y: auto;
  padding: 1.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MobileSidebarOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 40;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileSidebarContainer = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 250px;
  z-index: 50;
  transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "-100%")});
  transition: transform 0.3s ease-in-out;

  @media (max-width: 768px) {
    display: block;
  }
`;

export const DashboardLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => storage.sidebarState.get() || false
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    const newCollapsed = !sidebarCollapsed;
    setSidebarCollapsed(newCollapsed);
    storage.sidebarState.set(newCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <LayoutContainer $sidebarCollapsed={sidebarCollapsed}>
      <SidebarArea>
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      </SidebarArea>

      <HeaderArea>
        <Header
          onToggleMobileSidebar={toggleMobileSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />
      </HeaderArea>

      <MainArea>
        <Outlet />
      </MainArea>

      {/* Mobile Sidebar */}
      <MobileSidebarOverlay
        $isOpen={mobileSidebarOpen}
        onClick={closeMobileSidebar}
      />
      <MobileSidebarContainer $isOpen={mobileSidebarOpen}>
        <Sidebar
          collapsed={false}
          onToggle={toggleSidebar}
          onNavigate={closeMobileSidebar}
        />
      </MobileSidebarContainer>
    </LayoutContainer>
  );
};
