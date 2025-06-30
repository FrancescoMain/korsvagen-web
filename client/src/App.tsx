import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  HomePage,
  AboutPage,
  ServicesPage,
  ProjectsPage,
  NewsPage,
  ContactPage,
  CareersPage,
  WorkInProgressPage,
} from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chi-siamo" element={<AboutPage />} />
        <Route path="/servizi" element={<ServicesPage />} />
        <Route path="/progetti" element={<ProjectsPage />} />
        <Route path="/news" element={<NewsPage />} />
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
