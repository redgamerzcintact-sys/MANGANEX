import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'maplibre-gl/dist/maplibre-gl.css';
import 'leaflet/dist/leaflet.css';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './components/landing/LandingPage';
import { CommandCenterPage } from './components/commandCenter/CommandCenterPage';
import { ExplorationPage } from './components/exploration/ExplorationPage';
import { SubsurfacePage } from './components/subsurface/SubsurfacePage';
import { SatellitePage } from './components/satellite/SatellitePage';
import { ProductionPage } from './components/production/ProductionPage';
import { RiskCenterPage } from './components/risk/RiskCenterPage';
import { ScenarioLabPage } from './components/scenarioLab/ScenarioLabPage';
import { OptimizationPage } from './components/optimization/OptimizationPage';
import { IntelligencePage } from './components/intelligence/IntelligencePage';
import { ReportsPage } from './components/reports/ReportsPage';
import { DataHubPage } from './components/dataHub/DataHubPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { NexusPage } from './components/nexus/NexusPage';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { EquipmentPage } from './components/equipment/EquipmentPage';
import { UserManagementPage } from './components/admin/UserManagementPage';
import { EnvironmentalPage } from './components/environmental/EnvironmentalPage';
import { ProspectivityPage } from './components/exploration/ProspectivityPage';

// ── 5 Dedicated Role Dashboards ──────────────────────────────────────────────
import { AdminDashboardPage } from './components/dashboard/AdminDashboardPage';
import { GeologistDashboardPage } from './components/dashboard/GeologistDashboardPage';
import { MiningEngineerDashboardPage } from './components/dashboard/MiningEngineerDashboardPage';
import { DataAnalystDashboardPage } from './components/dashboard/DataAnalystDashboardPage';
import { ViewerDashboardPage } from './components/dashboard/ViewerDashboardPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { useAuthStore, ROLE_DEFAULT_ROUTES } from './stores/authStore';

const DynamicRoleDashboardRedirect: React.FC = () => {
  const { user } = useAuthStore();
  const target = user ? ROLE_DEFAULT_ROUTES[user.role] || '/admin/dashboard' : '/login';
  return <Navigate to={target} replace />;
};

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Root Entry: Website opens directly on Enterprise Login */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/geologist/login" element={<LoginPage />} />
      <Route path="/engineer/login" element={<LoginPage />} />
      <Route path="/analyst/login" element={<LoginPage />} />
      <Route path="/viewer/login" element={<LoginPage />} />

      {/* Main Multi-Page Application Layout */}
      <Route element={<AppLayout />}>
        {/* Dynamic Role Dashboard Dispatch */}
        <Route path="/dashboard" element={<DynamicRoleDashboardRedirect />} />

        {/* 1. ADMIN — Platform Control Center */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 2. GEOLOGIST — Geological Exploration Workspace */}
        <Route
          path="/geologist/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_GEOLOGIST']}>
              <GeologistDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 3. MINING ENGINEER — Mining Operations Center */}
        <Route
          path="/operations/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ENGINEER']}>
              <MiningEngineerDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 4. DATA ANALYST — Data & Model Intelligence Center */}
        <Route
          path="/analytics/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_ANALYST']}>
              <DataAnalystDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* 5. VIEWER — Read-Only Intelligence Portal */}
        <Route
          path="/viewer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_VIEWER']}>
              <ViewerDashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Shared / Specialized Feature Modules */}
        <Route path="/command-center" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
        <Route path="/map-explorer" element={<ProtectedRoute><CommandCenterPage /></ProtectedRoute>} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/exploration" element={<ProtectedRoute><ExplorationPage /></ProtectedRoute>} />
        <Route path="/geology" element={<ProtectedRoute><ExplorationPage /></ProtectedRoute>} />
        <Route path="/prospectivity" element={<ProtectedRoute><ProspectivityPage /></ProtectedRoute>} />
        <Route path="/subsurface" element={<ProtectedRoute><SubsurfacePage /></ProtectedRoute>} />
        <Route path="/satellite" element={<ProtectedRoute><SatellitePage /></ProtectedRoute>} />
        <Route path="/environmental" element={<ProtectedRoute><EnvironmentalPage /></ProtectedRoute>} />
        <Route path="/production" element={<ProtectedRoute><ProductionPage /></ProtectedRoute>} />
        <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
        <Route path="/risk-center" element={<ProtectedRoute><RiskCenterPage /></ProtectedRoute>} />
        <Route path="/scenario-lab" element={<ProtectedRoute><ScenarioLabPage /></ProtectedRoute>} />
        <Route path="/optimization" element={<ProtectedRoute><OptimizationPage /></ProtectedRoute>} />
        <Route path="/intelligence" element={<ProtectedRoute><IntelligencePage /></ProtectedRoute>} />
        <Route path="/models" element={<ProtectedRoute><IntelligencePage /></ProtectedRoute>} />
        <Route path="/nexus" element={<ProtectedRoute><NexusPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="/data-hub" element={<ProtectedRoute><DataHubPage /></ProtectedRoute>} />

        {/* Admin Clearance Only */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Route>

      {/* Fallback to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
