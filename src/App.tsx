import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
        <Route path="/command-center" element={<CommandCenterPage />} />
        <Route path="/map-explorer" element={<CommandCenterPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/exploration" element={<ExplorationPage />} />
        <Route path="/geology" element={<ExplorationPage />} />
        <Route path="/prospectivity" element={<ProspectivityPage />} />
        <Route path="/subsurface" element={<SubsurfacePage />} />
        <Route path="/satellite" element={<SatellitePage />} />
        <Route path="/environmental" element={<EnvironmentalPage />} />
        <Route path="/production" element={<ProductionPage />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/risk-center" element={<RiskCenterPage />} />
        <Route path="/scenario-lab" element={<ScenarioLabPage />} />
        <Route path="/optimization" element={<OptimizationPage />} />
        <Route path="/intelligence" element={<IntelligencePage />} />
        <Route path="/models" element={<IntelligencePage />} />
        <Route path="/nexus" element={<NexusPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/data-hub" element={<DataHubPage />} />

        {/* Admin Clearance Only */}
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
