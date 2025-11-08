import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App.jsx";
import MatchesPage from "./pages/MatchesPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/league/:leagueId" element={<App />} />
        <Route path="/team/:teamId" element={<App />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
