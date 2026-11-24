import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore, UserRole } from '../../stores/authStore';
import {
  Compass,
  MapPin,
  Box,
  Layers,
  Activity,
  AlertTriangle,
  GitFork,
  Sliders,
  BrainCircuit,
  FileText,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Cpu,
  Settings,
  LayoutDashboard,
  Satellite,
  Wrench,
  Trees,
  Users,
  LogOut,
  Eye,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const role = (user?.role || 'ROLE_ADMIN') as UserRole;

  // Build clean, judge-focused role-tailored sections
  const getSectionsForRole = (userRole: UserRole): NavSection[] => {
    // 1. Role's default dashboard
    const roleDashboardMap: Record<UserRole, { to: string; label: string }> = {
      ROLE_GEOLOGIST: { to: '/geologist/dashboard', label: t('nav.geologistWorkspace') },
      ROLE_ENGINEER: { to: '/operations/dashboard', label: t('nav.operationsCommand') },
      ROLE_ANALYST: { to: '/analyst/dashboard', label: t('nav.dataAnalyticsCenter') },
      ROLE_VIEWER: { to: '/viewer/dashboard', label: t('nav.executivePortal') },
      ROLE_ADMIN: { to: '/admin/dashboard', label: t('nav.platformControlCenter') },
    };

    const myDashboard = roleDashboardMap[userRole] || roleDashboardMap.ROLE_ADMIN;

    return [
      {
        group: t('nav.roleWorkspace'),
        items: [
          { to: myDashboard.to, label: myDashboard.label, icon: LayoutDashboard },
        ],
      },
      {
        group: t('nav.corePillars'),
        items: [
          { to: '/command-center', label: t('nav.cadastralGisMap'), icon: Compass, badge: 'GIS' },
          { to: '/prospectivity', label: t('nav.reserveProspectivity'), icon: Cpu, badge: 'AI' },
          { to: '/production', label: t('nav.shortfallForecasting'), icon: Activity, badge: 'AI' },
          { to: '/scenario-lab', label: t('nav.scenarioLab'), icon: GitFork, badge: 'HERO' },
        ],
      },
      {
        group: t('nav.geospatialTwin'),
        items: [
          { to: '/subsurface', label: t('nav.subsurfaceTwin'), icon: Box },
          { to: '/satellite', label: t('nav.satelliteIndices'), icon: Satellite },
          { to: '/equipment', label: t('nav.equipmentFleet'), icon: Wrench },
        ],
      },
      {
        group: t('nav.intelligenceAudit'),
        items: [
          { to: '/nexus', label: t('nav.nexusCopilot'), icon: BrainCircuit, badge: 'RAG' },
          { to: '/reports', label: t('nav.auditReports'), icon: FileText },
          ...(userRole === 'ROLE_ADMIN'
            ? [
                { to: '/admin/users', label: t('nav.userManagement'), icon: Users },
                { to: '/settings', label: t('nav.systemConfig'), icon: Settings },
              ]
            : []),
        ],
      },
    ];
  };

  const sections = getSectionsForRole(role);

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'ROLE_ADMIN':
        return { bg: 'bg-[#FB923C]/15', text: 'text-[#FB923C]', border: 'border-[#FB923C]/35', label: 'ADMIN' };
      case 'ROLE_GEOLOGIST':
        return { bg: 'bg-[#E8B298]/15', text: 'text-[#E8B298]', border: 'border-[#E8B298]/35', label: 'GEOLOGIST' };
      case 'ROLE_ENGINEER':
        return { bg: 'bg-[#F59E0B]/15', text: 'text-[#F59E0B]', border: 'border-[#F59E0B]/35', label: 'MINING ENG' };
      case 'ROLE_ANALYST':
        return { bg: 'bg-[#38BDF8]/15', text: 'text-[#38BDF8]', border: 'border-[#38BDF8]/35', label: 'ANALYST' };
      case 'ROLE_VIEWER':
        return { bg: 'bg-[#10B981]/15', text: 'text-[#10B981]', border: 'border-[#10B981]/35', label: 'VIEWER' };
      default:
        return { bg: 'bg-[#FB923C]/15', text: 'text-[#FB923C]', border: 'border-[#FB923C]/35', label: 'USER' };
    }
  };

  const badge = getRoleBadgeStyle(role);

  return (
    <aside
      className={`h-full border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col justify-between transition-all duration-300 z-20 select-none font-sans ${
        collapsed ? 'w-[68px]' : 'w-[242px]'
      }`}
    >
      {/* Role Profile Badge at top */}
      {!collapsed && (
        <div className="p-3 border-b border-[var(--border-color)]/60 bg-[var(--panel-surface)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-[var(--elevated-surface)] border border-[var(--border-color)] flex items-center justify-center shrink-0">
                <ShieldCheck className={`w-3.5 h-3.5 ${badge.text}`} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                  {user?.fullName || 'Chief Exploration Geologist'}
                </div>
                <div className="text-[9px] font-mono text-[var(--text-secondary)] truncate">
                  {user?.organization || 'MOIL Limited'}
                </div>
              </div>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[9px] font-mono tracking-widest text-[var(--text-muted)] uppercase font-bold">
                {section.group}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-[var(--elevated-surface)] text-[var(--accent-primary)] border border-[var(--accent-primary)]/50 shadow-sm font-bold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--panel-surface)] border border-transparent'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[8px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            item.badge === 'ALERT' || item.badge === 'LIVE'
                              ? 'bg-[var(--color-critical)]/20 text-[var(--color-critical)] border border-[var(--color-critical)]/40 animate-pulse'
                              : item.badge === 'HERO' || item.badge === 'AI' || item.badge === 'RAG'
                              ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40'
                              : item.badge === 'READ'
                              ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/40'
                              : 'bg-[var(--accent-skin)]/20 text-[var(--accent-skin)] border border-[var(--accent-skin)]/40'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer: Sign Out & Collapse Controls */}
      <div className="p-2 border-t border-[var(--border-color)] bg-[var(--panel-surface)] space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--color-critical)]/15 text-[var(--text-secondary)] hover:text-[var(--color-critical)] text-xs font-mono transition-colors cursor-pointer border border-[var(--border-color)] hover:border-[var(--color-critical)]/40"
          title={t('nav.signOut')}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t('nav.signOut')}</span>}
        </button>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--elevated-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-mono transition-colors cursor-pointer border border-[var(--border-color)]"
          title={collapsed ? t('nav.collapseRail') : t('nav.collapseRail')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>{t('nav.collapseRail')}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
