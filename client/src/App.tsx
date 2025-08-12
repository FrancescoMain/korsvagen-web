import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  HomePage,
  AboutPage,
  ServicesPage,
  ProjectsPage,
  ProjectDetailPage,
  NewsPage,
  NewsDetailPage,
  ContactPage,
  CareersPage,
  TeamPage,
  WorkInProgressPage,
  PageEditorPage,
} from "./pages";
import ScrollToTop from "./components/common/ScrollToTop";
import { AuthProvider } from "./components/Auth/AuthProvider";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ProtectedRoute } from "./components/Auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/Dashboard/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { PagesOverview } from "./pages/PagesOverview";
import { MediaLibrary } from "./pages/MediaLibrary";
import { Settings } from "./pages/Settings";
import { ReviewsManagement } from "./pages/ReviewsManagement";
import AboutManagement from "./pages/AboutManagement";
import TeamManagement from "./pages/TeamManagement";
import ServicesManagement from "./pages/ServicesManagement";
import { ProjectsManagement } from "./pages";
import { NewsManager } from "./components/NewsManager";
import "./styles/dashboard.css";

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <Router>
            <ScrollToTop />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#2a2a2a",
                  color: "#ffffff",
                  border: "1px solid #333",
                  borderRadius: "8px",
                },
              }}
            />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/chi-siamo" element={<AboutPage />} />
              <Route path="/servizi" element={<ServicesPage />} />
              <Route path="/progetti" element={<ProjectsPage />} />
              <Route
                path="/progetti/:projectId"
                element={<ProjectDetailPage />}
              />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:newsId" element={<NewsDetailPage />} />
              <Route path="/il-nostro-team" element={<TeamPage />} />
              <Route path="/contatti" element={<ContactPage />} />
              <Route path="/lavora-con-noi" element={<CareersPage />} />
              <Route
                path="/work-in-progress"
                element={<WorkInProgressPage />}
              />

              {/* Auth routes */}
              <Route path="/login" element={<LoginPage />} />

              {/* Dashboard routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />
                <Route path="pages" element={<PagesOverview />} />
                <Route path="pages/:pageId" element={<PageEditorPage />} />
                <Route path="media" element={<MediaLibrary />} />
                <Route path="reviews" element={<ReviewsManagement />} />
                <Route path="about" element={<AboutManagement />} />
                <Route path="team" element={<TeamManagement />} />
                <Route path="services" element={<ServicesManagement />} />
                <Route path="projects" element={<ProjectsManagement />} />
                <Route path="news" element={<NewsManager />} />
                <Route path="settings" element={<Settings />} />
              </Route>


              {/* Fallback routes */}
              <Route
                path="/admin"
                element={<Navigate to="/dashboard" replace />}
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
