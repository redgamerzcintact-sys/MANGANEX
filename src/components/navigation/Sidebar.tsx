import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
      ROLE_GEOLOGIST: { to: '/geologist/dashboard', label: 'Geologist Workspace' },
      ROLE_ENGINEER: { to: '/operations/dashboard', label: 'Operations Command' },
      ROLE_ANALYST: { to: '/analyst/dashboard', label: 'Data Analytics Center' },
      ROLE_VIEWER: { to: '/viewer/dashboard', label: 'Executive Portal' },
      ROLE_ADMIN: { to: '/admin/dashboard', label: 'Platform Control Center' },
    };

    const myDashboard = roleDashboardMap[userRole] || roleDashboardMap.ROLE_ADMIN;

    return [
      {
        group: 'ROLE WORKSPACE',
        items: [
          { to: myDashboard.to, label: myDashboard.label, icon: LayoutDashboard },
        ],
      },
      {
        group: 'CORE HACKATHON PILLARS',
        items: [
          { to: '/command-center', label: 'Cadastral GIS Map', icon: Compass, badge: 'GIS' },
          { to: '/prospectivity', label: 'Reserve Prospectivity', icon: Cpu, badge: 'AI' },
          { to: '/production', label: 'Shortfall Forecasting', icon: Activity, badge: 'AI' },
          { to: '/scenario-lab', label: 'Scenario Lab (Mitigation)', icon: GitFork, badge: 'HERO' },
        ],
      },
      {
        group: 'GEOSPATIAL & TWIN',
        items: [
          { to: '/subsurface', label: '3D Subsurface Twin', icon: Box },
          { to: '/satellite', label: 'Satellite Alteration Indices', icon: Satellite },
          { to: '/equipment', label: 'Equipment & Pump Fleet', icon: Wrench },
        ],
      },
      {
        group: 'INTELLIGENCE & AUDIT',
        items: [
          { to: '/nexus', label: 'NEXUS AI Copilot', icon: BrainCircuit, badge: 'RAG' },
          { to: '/reports', label: 'Audit Reports & Logs', icon: FileText },
          ...(userRole === 'ROLE_ADMIN'
            ? [
                { to: '/admin/users', label: 'User Management', icon: Users },
                { to: '/settings', label: 'System Configuration', icon: Settings },
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
      className={`h-full border-r border-[#4D4037] bg-[#1A1613] flex flex-col justify-between transition-all duration-300 z-20 select-none font-sans ${
        collapsed ? 'w-[68px]' : 'w-[242px]'
      }`}
    >
      {/* Role Profile Badge at top */}
      {!collapsed && (
        <div className="p-3 border-b border-[#4D4037]/60 bg-[#241E1A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-[#2F2722] border border-[#4D4037] flex items-center justify-center shrink-0">
                <ShieldCheck className={`w-3.5 h-3.5 ${badge.text}`} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-[#FFF8F0] truncate">
                  {user?.fullName || 'Chief Exploration Geologist'}
                </div>
                <div className="text-[9px] font-mono text-[#DEC8B7] truncate">
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
              <div className="px-3 text-[9px] font-mono tracking-widest text-[#A69282] uppercase font-bold">
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
                        ? 'bg-[#2F2722] text-[#FB923C] border border-[#FB923C]/50 shadow-[0_0_14px_rgba(251,146,60,0.22)] font-bold'
                        : 'text-[#DEC8B7] hover:text-[#FFF8F0] hover:bg-[#241E1A] border border-transparent'
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
                              ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 animate-pulse'
                              : item.badge === 'HERO' || item.badge === 'AI' || item.badge === 'RAG'
                              ? 'bg-[#FB923C]/20 text-[#FB923C] border border-[#FB923C]/40'
                              : item.badge === 'READ'
                              ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                              : 'bg-[#E8B298]/20 text-[#E8B298] border border-[#E8B298]/40'
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
      <div className="p-2 border-t border-[#4D4037] bg-[#241E1A] space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 rounded-xl bg-[#1A1613] hover:bg-[#EF4444]/15 text-[#DEC8B7] hover:text-[#EF4444] text-xs font-mono transition-colors cursor-pointer border border-[#4D4037] hover:border-[#EF4444]/40"
          title="Sign out of current account"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>SIGN OUT</span>}
        </button>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-[#1A1613] hover:bg-[#2F2722] text-[#DEC8B7] hover:text-[#FFF8F0] text-xs font-mono transition-colors cursor-pointer border border-[#4D4037]"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>COLLAPSE RAIL</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
