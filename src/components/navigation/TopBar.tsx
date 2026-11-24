import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/appStore';
import { LiveFeedDrawer } from '../livefeed/LiveFeedDrawer';
import { MINES_DATA } from '../../data/demoData';
import { SUPPORTED_LANGUAGES, setAppLanguage, SupportedLanguage } from '../../i18n';
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
  Globe,
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const currentLang = (i18n.language || 'en') as SupportedLanguage;

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
    <header className="h-[56px] border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 sm:px-6 flex items-center justify-between z-30 select-none shrink-0 font-sans transition-colors">
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
                stroke="var(--text-primary)"
                strokeWidth="0.9"
              />
            </svg>
          </div>

          <div className="flex flex-col leading-none">
            <span className="font-heading text-[15px] font-extrabold tracking-wider text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
              {t('brand.name')}
            </span>
            <span className="text-[8.5px] font-mono tracking-widest text-[var(--accent-skin)] font-semibold mt-0.5">
              {t('brand.tagline')}
            </span>
          </div>
        </NavLink>

        {/* National Hackathon Pill Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-skin)]/10 border border-[var(--accent-skin)]/30 text-[10px] font-mono text-[var(--accent-skin)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse" />
          <span>{t('brand.hackathonBadge')}</span>
        </div>

        {/* Global Mine / Concession Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsMineDropdownOpen(!isMineDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--panel-surface)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-xs font-mono text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-success)] shadow-[0_0_6px_var(--color-success)]" />
            <span className="text-[var(--text-secondary)]">{t('topbar.mine')}:</span>
            <span className="font-bold">{selectedMine?.name || 'Balaghat Mine'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>

          {isMineDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl bg-[var(--panel-surface)] border border-[var(--border-color)] shadow-2xl p-1.5 z-50">
              <div className="px-2.5 py-1 text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider font-bold">
                {t('topbar.selectConcession')}
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
                      ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold border border-[var(--accent-primary)]/30'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated-surface)]'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">{m.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. CENTER: GLOBAL SEARCH */}
      <div className="flex-1 flex items-center justify-center gap-2 max-w-xl mx-2 hidden lg:flex">
        {/* Global Search palette button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="p-1.5 px-2.5 rounded-xl bg-[var(--panel-surface)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/60 transition-all cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-mono"
          title={t('topbar.searchPlaceholder')}
        >
          <Search className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <kbd className="text-[9px] px-1 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* 3. RIGHT CONTROLS: NOTIFICATIONS, LIVE FEED, THEME, PROFILE */}
      <div className="flex items-center gap-3">
        {/* Live Operational Feed Button */}
        <button
          onClick={() => setIsLiveFeedOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] bg-[var(--panel-surface)] hover:bg-[var(--elevated-surface)] rounded-full border border-[var(--border-color)] hover:border-[var(--color-success)]/60 transition-colors cursor-pointer shadow-sm"
          title="Open Live Operational Stream"
        >
          <span className="h-2 w-2 rounded-full bg-[var(--color-success)] shadow-[0_0_8px_var(--color-success)] animate-pulse" />
          <span className="text-[11.5px] text-[var(--color-success)] font-semibold hidden sm:inline">{t('topbar.liveFeed')}</span>
        </button>

        {/* Demo Briefing Mode Button */}
        <button
          onClick={() => startBriefing()}
          className="hidden sm:flex px-3.5 py-1.5 rounded-full bg-[var(--elevated-surface)] hover:bg-[var(--panel-surface)] border border-[var(--accent-primary)]/60 text-xs font-semibold text-[var(--text-primary)] shadow-[var(--glow-warm)] transition-all cursor-pointer items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span>{t('topbar.demoBriefing')}</span>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={t('topbar.toggleTheme')}
          className="h-8 w-8 rounded-full bg-[var(--panel-surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/50 transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>

        {/* Language Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-xl bg-[var(--panel-surface)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-primary)] transition-all cursor-pointer shadow-sm"
            title="Language / भाषा / भाषा निवडा"
          >
            <Globe className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="font-bold uppercase">{currentLang}</span>
            <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
          </button>

          {isLangMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl bg-[var(--panel-surface)] border border-[var(--border-color)] shadow-xl p-1 z-50 font-mono text-xs">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setAppLanguage(lang.code);
                    setIsLangMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors text-left ${
                    currentLang === lang.code
                      ? 'bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated-surface)]'
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-[var(--text-muted)] uppercase">{lang.code}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="h-8 w-8 rounded-full bg-[var(--elevated-surface)] border border-[var(--accent-primary)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)] shadow-sm cursor-pointer hover:border-[var(--accent-warm)] transition-colors"
            title="User Profile & Role Gateway"
          >
            {userInitials}
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[var(--panel-surface)] border border-[var(--border-color)] shadow-2xl p-2.5 z-50">
              <div className="px-2 py-1.5 border-b border-[var(--border-color)] mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                  <span>{authUser?.fullName || 'Chief Exploration Geologist'}</span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {authUser?.email || 'geologist@moil.gov.in'}
                </span>
                <span className="block mt-1 text-[8.5px] font-mono px-1.5 py-0.5 rounded bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 text-[var(--accent-primary)] w-fit font-bold">
                  {userRoleTitle} &bull; MOIL CADASTRE
                </span>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated-surface)] transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[var(--accent-skin)]" />
                  <span>Switch Role Portal</span>
                </button>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated-surface)] transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-[var(--accent-warm)]" />
                  <span>Platform Settings</span>
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem('manganex_auth_user');
                    setIsProfileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-[var(--color-critical)] hover:bg-[var(--color-critical)]/10 transition-colors cursor-pointer"
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
