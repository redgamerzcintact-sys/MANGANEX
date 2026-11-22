import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { LiveFeedDrawer } from '../livefeed/LiveFeedDrawer';
import { MINES_DATA } from '../../data/demoData';
import {
  Sparkles,
  Layers,
  Sun,
  Moon,
  Search,
  User,
  LogOut,
  Sliders,
  ShieldCheck,
  ChevronDown,
  Flame,
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
    setCommandPaletteOpen,
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
    <header className="h-[56px] border-b border-[#4D4037] bg-[#1A1613] px-4 sm:px-6 flex items-center justify-between z-30 select-none shrink-0 font-sans">
      {/* 1. LEFT BRAND: M LOGO + BRAND NAME + ACTIVE MINE SELECTOR */}
      <div className="flex items-center gap-4">
        <NavLink to="/dashboard" className="flex items-center gap-2.5 group">
          {/* Luminous Warm Terracotta & Amber Geometric M Logo */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(251,146,60,0.65)]">
              <defs>
                <linearGradient id="logoWarmGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="50%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#E8B298" />
                </linearGradient>
              </defs>
              <path
                d="M6 34 L6 8 L16 8 L20 18 L24 8 L34 8 L34 34 L27 34 L27 18 L22 28 L18 28 L13 18 L13 34 Z"
                fill="url(#logoWarmGrad)"
                stroke="#FFF8F0"
                strokeWidth="0.9"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-heading text-[15px] font-extrabold tracking-wider text-[#FFF8F0] group-hover:text-[#FB923C] transition-colors">
              MANGANEX
            </span>
            <span className="text-[8.5px] font-mono tracking-widest text-[#E8B298] font-semibold mt-0.5">
              THE EARTH'S HIDDEN INTELLIGENCE
            </span>
          </div>
        </NavLink>

        {/* National Hackathon Pill Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8B298]/10 border border-[#E8B298]/30 text-[10px] font-mono text-[#E8B298]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FB923C] animate-pulse" />
          <span>NATIONAL HACKATHON MVP &bull; MOIL</span>
        </div>

        {/* Global Mine / Concession Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsMineDropdownOpen(!isMineDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#241E1A] border border-[#4D4037] hover:border-[#FB923C] text-xs font-mono text-[#FFF8F0] transition-all cursor-pointer shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_6px_#10B981]" />
            <span className="text-[#DEC8B7]">MINE:</span>
            <span className="font-bold">{selectedMine?.name || 'Balaghat Mine'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#A69282]" />
          </button>

          {isMineDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-[#1A1613] border border-[#4D4037] shadow-2xl p-1.5 z-50">
              <div className="px-2.5 py-1 text-[9px] font-mono text-[#A69282] uppercase tracking-wider font-bold">
                SELECT MOIL CONCESSION
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
                      ? 'bg-[#FB923C]/15 text-[#FB923C] font-bold border border-[#FB923C]/30'
                      : 'text-[#DEC8B7] hover:text-[#FFF8F0] hover:bg-[#241E1A]'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-[9px] text-[#A69282]">{m.type}</span>
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
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#241E1A] border border-[#4D4037] text-xs font-mono text-[#DEC8B7] cursor-pointer hover:border-[#FB923C]/60 hover:bg-[#2F2722] transition-all shadow-sm"
          title="Click or press Ctrl+K to open Global Search"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#A69282]" />
            <span>Search drillholes, faults, minerals, or AI models...</span>
          </div>
          <kbd className="px-1.5 py-0.5 rounded bg-[#1A1613] text-[10px] text-[#DEC8B7] border border-[#4D4037]">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* 3. RIGHT CONTROLS: NOTIFICATIONS, LIVE FEED, THEME, PROFILE */}
      <div className="flex items-center gap-3">
        {/* Live Operational Feed Button */}
        <button
          onClick={() => setIsLiveFeedOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FFF8F0] bg-[#241E1A] hover:bg-[#2F2722] rounded-full border border-[#4D4037] hover:border-[#10B981]/60 transition-colors cursor-pointer shadow-sm"
          title="Open Live Operational Stream"
        >
          <span className="h-2 w-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
          <span className="text-[11.5px] text-[#10B981] font-semibold hidden sm:inline">Live Feed</span>
        </button>

        {/* Demo Briefing Mode Button */}
        <button
          onClick={() => startBriefing()}
          className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-[#2F2722] hover:bg-[#3C322B] border border-[#FB923C]/60 text-xs font-semibold text-[#FFF8F0] shadow-[0_0_12px_rgba(251,146,60,0.25)] transition-all cursor-pointer items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FB923C]" />
          <span>Demo Briefing</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title="Toggle Theme"
          className="h-8 w-8 rounded-full bg-[#241E1A] border border-[#4D4037] flex items-center justify-center text-[#DEC8B7] hover:text-[#FB923C] hover:border-[#FB923C]/50 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="h-8 w-8 rounded-full bg-[#2F2722] border border-[#FB923C] flex items-center justify-center text-xs font-bold text-[#FFF8F0] shadow-[0_0_10px_rgba(251,146,60,0.4)] cursor-pointer hover:border-[#F59E0B] transition-colors"
            title="User Profile & Role Gateway"
          >
            {userInitials}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#1A1613] border border-[#4D4037] shadow-2xl p-2.5 z-50">
              <div className="px-2 py-1.5 border-b border-[#4D4037] mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFF8F0]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FB923C]" />
                  <span>{authUser?.fullName || 'Chief Exploration Geologist'}</span>
                </div>
                <span className="text-[10px] font-mono text-[#DEC8B7]">
                  {authUser?.email || 'geologist@moil.gov.in'}
                </span>
                <span className="block mt-1 text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-[#FB923C]/15 border border-[#FB923C]/30 text-[#FB923C] w-fit font-bold">
                  {userRoleTitle} &bull; MOIL CADASTRE
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[#DEC8B7] hover:text-[#FFF8F0] hover:bg-[#241E1A] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#E8B298]" />
                  <span>Switch Role Portal</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[#DEC8B7] hover:text-[#FFF8F0] hover:bg-[#241E1A] transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Platform Settings</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('manganex_auth_user');
                    setIsProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
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
