import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Menu from '../pages/Menu';
import BookTable from '../pages/BookTable';
import About from '../pages/About';
import Contact from '../pages/Contact';

import AppLayout from '../layouts/AppLayout';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import PersonaStudio from '../pages/PersonaStudio';
import ExperimentBuilder from '../pages/ExperimentBuilder';
import ExperimentHistory from '../pages/ExperimentHistory';
import SurveyLab from '../pages/SurveyLab';
import InterviewRoom from '../pages/InterviewRoom';
import InsightsDashboard from '../pages/InsightsDashboard';
import AdoptionScoring from '../pages/AdoptionScoring';
import ScenarioLibrary from '../pages/ScenarioLibrary';
import ResearchReports from '../pages/ResearchReports';
import SettingsPage from '../pages/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Primary First Page: Kadappa Cafe Website with Customer & Researcher Access */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="menu" element={<Menu />} />
        <Route path="book" element={<BookTable />} />
        <Route path="contact" element={<Contact />} />
      </Route>

      {/* Authentication & Editorial Landing */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/editorial" element={<LandingPage />} />
      <Route path="/cafe" element={<Navigate to="/" replace />} />

      {/* REGALUX AI — Research Intelligence Studio */}
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/personas" element={<PersonaStudio />} />
        <Route path="/experiments" element={<ExperimentHistory />} />
        <Route path="/experiments/new" element={<ExperimentBuilder />} />
        <Route path="/surveys" element={<SurveyLab />} />
        <Route path="/interviews" element={<InterviewRoom />} />
        <Route path="/insights" element={<InsightsDashboard />} />
        <Route path="/adoption" element={<AdoptionScoring />} />
        <Route path="/scenarios" element={<ScenarioLibrary />} />
        <Route path="/reports" element={<ResearchReports />} />
        <Route path="/history" element={<ExperimentHistory />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
