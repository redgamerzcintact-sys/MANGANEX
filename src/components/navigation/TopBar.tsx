import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { LiveFeedDrawer } from '../livefeed/LiveFeedDrawer';
import { MINES_DATA } from '../../data/demoData';
import {
  Sparkles,
  Layers,
  Box,
  Cloud,
  Sun,
  Moon,
  Compass,
  LayoutDashboard,
  Search,
  HelpCircle,
  Bell,
  User,
  LogOut,
  Sliders,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const {
    startBriefing,
    theme,
    toggleTheme,
    selectedMine,
    setSelectedMineId,
    setCommandPaletteOpen
  } = useAppStore();

  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMineDropdownOpen, setIsMineDropdownOpen] = useState(false);

  // Read authenticated user dynamically
  const authUser = (() => {
    try {
      const saved = localStorage.getItem('manganex_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();

  const userInitials = authUser?.fullName
    ? authUser.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
    : 'DG';

  const userRoleTitle = authUser?.role?.replace('ROLE_', '') || 'ADMIN';

  const mines = MINES_DATA;

  return (
    <header className="h-[56px] border-b border-[#1C3045] bg-[#090D16] px-4 sm:px-6 flex items-center justify-between z-30 select-none shrink-0">
      {/* 1. LEFT BRAND: M LOGO + BRAND NAME */}
      <div className="flex items-center gap-4">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          {/* Luminous Geometric M Logo */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 drop-shadow-[0_0_8px_rgba(84,216,232,0.6)]">
              <defs>
                <linearGradient id="logoBlueGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#54D8E8" />
                  <stop offset="50%" stopColor="#168BFF" />
                  <stop offset="100%" stopColor="#A78BFA" />
                </linearGradient>
              </defs>
              <path
                d="M6 34 L6 8 L16 8 L20 18 L24 8 L34 8 L34 34 L27 34 L27 18 L22 28 L18 28 L13 18 L13 34 Z"
                fill="url(#logoBlueGrad)"
                stroke="#E0F2FE"
                strokeWidth="0.8"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-heading text-[15px] font-extrabold tracking-wider text-[#FFFFFF] group-hover:text-[#54D8E8] transition-colors">
              MANGANEX
            </span>
            <span className="text-[8.5px] font-mono tracking-widest text-[#54D8E8] font-semibold mt-0.5">
              THE EARTH'S HIDDEN INTELLIGENCE
            </span>
          </div>
        </NavLink>

        {/* Global Mine / Concession Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsMineDropdownOpen(!isMineDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#101927] border border-[#1C3045] hover:border-[#54D8E8] text-xs font-mono text-[#F2F6FA] transition-all cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-[#43D6A0]" />
            <span className="text-[#9BAFC1]">MINE:</span>
            <span className="font-bold">{selectedMine?.name || 'Balaghat Mine'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#657A90]" />
          </button>

          {isMineDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-[#090D16] border border-[#1C3045] shadow-2xl p-1.5 z-50">
              <div className="px-2.5 py-1 text-[9px] font-mono text-[#657A90] uppercase tracking-wider font-bold">
                SELECT CONCESSION
              </div>
              {mines.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMineId(m.id);
                    setIsMineDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-mono transition-colors text-left ${
                    selectedMine?.id === m.id
                      ? 'bg-[#54D8E8]/15 text-[#54D8E8] font-bold'
                      : 'text-[#9BAFC1] hover:text-white hover:bg-[#101927]'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-[9px] text-[#657A90]">{m.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER: GLOBAL SEARCH PALETTE TRIGGER */}
      <div className="flex-1 max-w-md mx-4 hidden lg:block">
        <div
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#101927] border border-[#1C3045] text-xs font-mono text-[#9BAFC1] cursor-pointer hover:border-[#54D8E8]/50 hover:bg-[#152235] transition-all"
          title="Click or press Ctrl+K to open Global Search"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#657A90]" />
            <span>Search drillholes, faults, minerals, or AI models...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[#152235] text-[10px] text-[#657A90] border border-[#1C3045]">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* 3. RIGHT CONTROLS: NOTIFICATIONS, LIVE FEED, THEME, PROFILE */}
      <div className="flex items-center gap-3">
        {/* Live Operational Feed Button */}
        <button
          onClick={() => setIsLiveFeedOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#F2F6FA] hover:bg-[#101927] rounded-full border border-transparent hover:border-[#43D6A0]/40 transition-colors cursor-pointer"
          title="Open Live Operational Stream"
        >
          <span className="h-2 w-2 rounded-full bg-[#43D6A0] shadow-[0_0_8px_#43D6A0] animate-pulse" />
          <span className="text-[11.5px] text-[#43D6A0] font-semibold hidden sm:inline">Live Feed</span>
        </button>

        {/* Demo Briefing Mode Button */}
        <button
          onClick={() => startBriefing()}
          className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-[#152235] hover:bg-[#1B2D46] border border-[#168BFF]/60 text-xs font-semibold text-[#FFFFFF] shadow-[0_0_10px_rgba(22,139,255,0.25)] transition-all cursor-pointer items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#54D8E8]" />
          <span>Demo Briefing</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="h-8 w-8 rounded-full bg-[#101927] border border-[#1C3045] flex items-center justify-center text-[#9BAFC1] hover:text-[#54D8E8] hover:border-[#54D8E8]/50 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="h-8 w-8 rounded-full bg-[#152235] border border-[#168BFF] flex items-center justify-center text-xs font-bold text-[#FFFFFF] shadow-[0_0_8px_rgba(22,139,255,0.4)] cursor-pointer hover:border-[#54D8E8] transition-colors"
            title="User Profile & Role Gateway"
          >
            AD
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#090D16] border border-[#1C3045] shadow-2xl p-2.5 z-50">
              <div className="px-2 py-1.5 border-b border-[#1C3045] mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#54D8E8]" />
                  <span>Director General</span>
                </div>
                <span className="text-[10px] font-mono text-[#9BAFC1]">
                  admin@moil.gov.in
                </span>
                <span className="block mt-1 text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-[#54D8E8]/15 text-[#54D8E8] w-fit font-bold">
                  ROLE_ADMIN &bull; FULL CLEARANCE
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[#9BAFC1] hover:text-white hover:bg-[#101927] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Switch Role Portal</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[#9BAFC1] hover:text-white hover:bg-[#101927] transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#F4B860]" />
                  <span>Platform Settings</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('manganex_auth_user');
                    setIsProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[#FF6878] hover:bg-[#FF6878]/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Operational Feed Drawer */}
      <LiveFeedDrawer
        isOpen={isLiveFeedOpen}
        onClose={() => setIsLiveFeedOpen(false)}
      />
    </header>
  );
};
