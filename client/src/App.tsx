import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  WorkInProgressPage,
} from "./pages";
import ScrollToTop from "./components/common/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chi-siamo" element={<AboutPage />} />
        <Route path="/servizi" element={<ServicesPage />} />
        <Route path="/progetti" element={<ProjectsPage />} />
        <Route path="/progetti/:projectId" element={<ProjectDetailPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:newsId" element={<NewsDetailPage />} />
        <Route path="/contatti" element={<ContactPage />} />
        <Route path="/lavora-con-noi" element={<CareersPage />} />
        <Route path="/work-in-progress" element={<WorkInProgressPage />} />
        {/* Fallback route */}
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
