import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from '../navigation/TopBar';
import { Sidebar } from '../navigation/Sidebar';
import { NexusDrawer } from '../assistant/NexusDrawer';
import { CommandPalette } from '../ui/CommandPalette';
import { MissionBriefingModal } from '../briefing/MissionBriefingModal';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans antialiased transition-colors">
      {/* Top Operational Command Bar */}
      <TopBar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Container with Sidebar + Dynamic Route Workspace */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative bg-[var(--bg-primary)] transition-colors">
          <Outlet />
        </main>
      </div>

      {/* Floating Global Copilot Drawer */}
      <NexusDrawer />

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette />

      {/* Guided Mission Briefing Experience */}
      <MissionBriefingModal />
    </div>
  );
};
