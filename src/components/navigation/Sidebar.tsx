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
  Eye
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

  // Build role-tailored sections
  const getSectionsForRole = (userRole: UserRole): NavSection[] => {
    switch (userRole) {
      case 'ROLE_GEOLOGIST':
        return [
          {
            group: 'WORKSPACE',
            items: [
              { to: '/geologist/dashboard', label: 'Geologist Dashboard', icon: LayoutDashboard }
            ]
          },
          {
            group: 'GEOLOGICAL EXPLORATION',
            items: [
              { to: '/command-center', label: 'Map Explorer', icon: Compass, badge: 'GIS' },
              { to: '/exploration', label: 'Geological Layers', icon: MapPin },
              { to: '/subsurface', label: '3D Subsurface Twin', icon: Box },
              { to: '/prospectivity', label: 'Mn Prospectivity', icon: Cpu, badge: 'AI' }
            ]
          },
          {
            group: 'EARTH OBSERVATION',
            items: [
              { to: '/satellite', label: 'Satellite Intelligence', icon: Satellite }
            ]
          },
          {
            group: 'INTELLIGENCE & REPORTS',
            items: [
              { to: '/nexus', label: 'NEXUS AI Copilot', icon: BrainCircuit, badge: 'RAG' },
              { to: '/reports', label: 'Geological Reports', icon: FileText }
            ]
          }
        ];

      case 'ROLE_ENGINEER':
        return [
          {
            group: 'OPERATIONS',
            items: [
              { to: '/operations/dashboard', label: 'Operations Dashboard', icon: LayoutDashboard }
            ]
          },
          {
            group: 'PRODUCTION & FLEET',
            items: [
              { to: '/production', label: 'Production Monitoring', icon: Activity },
              { to: '/equipment', label: 'Fleet Telemetry', icon: Wrench },
              { to: '/command-center', label: 'Mine Cadastre Map', icon: Compass, badge: 'GIS' }
            ]
          },
          {
            group: 'RISK & SCENARIO LAB',
            items: [
              { to: '/risk-center', label: 'Shortfall Radar', icon: AlertTriangle, badge: 'ALERT' },
              { to: '/scenario-lab', label: 'Scenario Lab', icon: GitFork }
            ]
          },
          {
            group: 'INTELLIGENCE & REPORTS',
            items: [
              { to: '/nexus', label: 'NEXUS AI Copilot', icon: BrainCircuit, badge: 'RAG' },
              { to: '/reports', label: 'Shift Briefings', icon: FileText }
            ]
          }
        ];

      case 'ROLE_ANALYST':
        return [
          {
            group: 'DATA & MODELS',
            items: [
              { to: '/analytics/dashboard', label: 'Analyst Dashboard', icon: LayoutDashboard }
            ]
          },
          {
            group: 'FEATURE ENGINEERING',
            items: [
              { to: '/data-hub', label: 'Dataset Explorer', icon: Database },
              { to: '/intelligence', label: 'Model Observatory', icon: Sliders, badge: 'ML' },
              { to: '/prospectivity', label: 'Prediction Analytics', icon: Cpu, badge: 'AI' }
            ]
          },
          {
            group: 'REMOTE SENSING & 3D',
            items: [
              { to: '/satellite', label: 'Satellite Indices', icon: Satellite },
              { to: '/subsurface', label: 'Visualization Studio', icon: Box }
            ]
          },
          {
            group: 'INTELLIGENCE & REPORTS',
            items: [
              { to: '/nexus', label: 'NEXUS AI Copilot', icon: BrainCircuit, badge: 'RAG' },
              { to: '/reports', label: 'Analytics Reports', icon: FileText }
            ]
          }
        ];

      case 'ROLE_VIEWER':
        return [
          {
            group: 'OBSERVATION',
            items: [
              { to: '/viewer/dashboard', label: 'Executive Overview', icon: Eye }
            ]
          },
          {
            group: 'READ-ONLY CADASTRE',
            items: [
              { to: '/command-center', label: 'Map Explorer', icon: Compass, badge: 'READ' },
              { to: '/dashboard', label: 'Mine Concessions', icon: LayoutDashboard }
            ]
          },
          {
            group: 'STATUTORY SUMMARIES',
            items: [
              { to: '/exploration', label: 'Geological Insights', icon: MapPin },
              { to: '/production', label: 'Production Overview', icon: Activity },
              { to: '/satellite', label: 'Satellite Overview', icon: Satellite }
            ]
          },
          {
            group: 'PUBLIC BRIEFINGS',
            items: [
              { to: '/reports', label: 'Approved Reports', icon: FileText },
              { to: '/nexus', label: 'NEXUS AI (Read-Only)', icon: BrainCircuit }
            ]
          }
        ];

      case 'ROLE_ADMIN':
      default:
        return [
          {
            group: 'CONTROL CENTER',
            items: [
              { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard }
            ]
          },
          {
            group: 'GOVERNANCE & IAM',
            items: [
              { to: '/admin/users', label: 'User & Access Control', icon: Users },
              { to: '/settings', label: 'Platform Settings', icon: Settings }
            ]
          },
          {
            group: 'SPATIAL & MINES',
            items: [
              { to: '/command-center', label: 'Map Explorer', icon: Compass, badge: 'GIS' },
              { to: '/subsurface', label: 'Subsurface 3D', icon: Box },
              { to: '/exploration', label: 'Geology & Reserves', icon: MapPin }
            ]
          },
          {
            group: 'OPERATIONS & RISK',
            items: [
              { to: '/production', label: 'Production Overview', icon: Activity },
              { to: '/risk-center', label: 'Risk Intelligence', icon: AlertTriangle, badge: 'ALERT' }
            ]
          },
          {
            group: 'DATA & AI CORE',
            items: [
              { to: '/data-hub', label: 'Data Hub & Ingestion', icon: Database },
              { to: '/intelligence', label: 'AI Models & Audit', icon: Sliders },
              { to: '/nexus', label: 'NEXUS AI Copilot', icon: BrainCircuit, badge: 'RAG' },
              { to: '/reports', label: 'Reports & Briefings', icon: FileText }
            ]
          }
        ];
    }
  };

  const sections = getSectionsForRole(role);

  const getRoleBadgeStyle = (r: UserRole) => {
    switch (r) {
      case 'ROLE_ADMIN': return { bg: 'bg-[#54D8E8]/15', text: 'text-[#54D8E8]', border: 'border-[#54D8E8]/30', label: 'ADMIN' };
      case 'ROLE_GEOLOGIST': return { bg: 'bg-[#A78BFA]/15', text: 'text-[#A78BFA]', border: 'border-[#A78BFA]/30', label: 'GEOLOGIST' };
      case 'ROLE_ENGINEER': return { bg: 'bg-[#F4B860]/15', text: 'text-[#F4B860]', border: 'border-[#F4B860]/30', label: 'MINING ENG' };
      case 'ROLE_ANALYST': return { bg: 'bg-[#168BFF]/15', text: 'text-[#168BFF]', border: 'border-[#168BFF]/30', label: 'ANALYST' };
      case 'ROLE_VIEWER': return { bg: 'bg-[#43D6A0]/15', text: 'text-[#43D6A0]', border: 'border-[#43D6A0]/30', label: 'VIEWER' };
      default: return { bg: 'bg-[#54D8E8]/15', text: 'text-[#54D8E8]', border: 'border-[#54D8E8]/30', label: 'USER' };
    }
  };

  const badge = getRoleBadgeStyle(role);

  return (
    <aside
      className={`h-full border-r border-[#1C3045] bg-[#090D16] flex flex-col justify-between transition-all duration-300 z-20 select-none ${
        collapsed ? 'w-[68px]' : 'w-[240px]'
      }`}
    >
      {/* Role Profile Badge at top */}
      {!collapsed && (
        <div className="p-3 border-b border-[#1C3045]/60 bg-[#0B0F19]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-md bg-[#152235] flex items-center justify-center shrink-0">
                <ShieldCheck className={`w-3.5 h-3.5 ${badge.text}`} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white truncate">
                  {user?.fullName || 'Authenticated User'}
                </div>
                <div className="text-[9px] font-mono text-[#657A90] truncate">
                  {user?.organization || 'MOIL Limited'}
                </div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
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
              <div className="px-3 text-[9px] font-mono tracking-widest text-[#657A90] uppercase font-bold">
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
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-[#101927] text-[#54D8E8] border border-[#54D8E8]/40 shadow-[0_0_12px_rgba(84,216,232,0.15)] font-bold'
                        : 'text-[#9BAFC1] hover:text-[#F2F6FA] hover:bg-[#101927]/60 border border-transparent'
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
                            item.badge === 'ALERT'
                              ? 'bg-[#FF6878]/20 text-[#FF6878] border border-[#FF6878]/40 animate-pulse'
                              : item.badge === 'AI' || item.badge === 'RAG' || item.badge === 'ML'
                              ? 'bg-[#A78BFA]/20 text-[#A78BFA] border border-[#A78BFA]/40'
                              : item.badge === 'READ'
                              ? 'bg-[#43D6A0]/20 text-[#43D6A0] border border-[#43D6A0]/40'
                              : 'bg-[#54D8E8]/20 text-[#54D8E8] border border-[#54D8E8]/40'
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
      <div className="p-2 border-t border-[#1C3045] bg-[#0B0F19] space-y-1">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 rounded-lg bg-[#101927] hover:bg-[#FF6878]/15 text-[#9BAFC1] hover:text-[#FF6878] text-xs font-mono transition-colors cursor-pointer border border-transparent hover:border-[#FF6878]/30"
          title="Sign out of current account"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>SIGN OUT</span>}
        </button>

        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-[#101927] hover:bg-[#152235] text-[#9BAFC1] hover:text-[#F2F6FA] text-xs font-mono transition-colors cursor-pointer"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : (
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
