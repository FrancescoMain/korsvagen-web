import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const BadgePage = React.lazy(() => import("./features/badging/BadgePage"));
const SiteApp = React.lazy(() => import("./SiteApp"));

export default function App() {
  return <BrowserRouter>
    <React.Suspense fallback={<p role="status">Caricamento…</p>}>
      <Routes>
        <Route path="/badge/:token" element={<BadgePage />} />
        <Route path="*" element={<SiteApp />} />
      </Routes>
    </React.Suspense>
  </BrowserRouter>;
}
