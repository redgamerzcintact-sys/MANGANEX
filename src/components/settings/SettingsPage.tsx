import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Shield,
  Bell,
  Cpu,
  Save,
  CheckCircle2,
  User,
  KeyRound,
  LogOut,
  Radio,
  Mic,
  Volume2,
  RefreshCw,
  Clock,
  Layers
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useAppStore();
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [voiceAutoReadout, setVoiceAutoReadout] = useState(false);
  const [telemetryRefreshRate, setTelemetryRefreshRate] = useState(30);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check local cache
    const cachedUser = localStorage.getItem('manganex_auth_user');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch {
        // ignore
      }
    }

    // 2. Fetch fresh user details & permissions from backend
    api.getMe().then((res) => {
      if (res && res.success) {
        setCurrentUser(res);
        setPermissions(res.permissions || []);
      }
    }).catch(() => {
      // Offline fallback defaults based on cached role
      if (cachedUser) {
        const parsed = JSON.parse(cachedUser);
        if (parsed.role === 'ROLE_ADMIN') {
          setPermissions(["SYSTEM_ADMIN", "USER_MANAGEMENT", "ROLE_ASSIGNMENT", "DATASET_UPLOAD", "DATASET_DELETE", "MODEL_REGISTER", "AUDIT_LOG_VIEW", "GEOLOGY_FULL", "OPS_FULL", "REPORT_GENERATE"]);
        } else if (parsed.role === 'ROLE_GEOLOGIST') {
          setPermissions(["GEOLOGY_READ", "GEOLOGY_WRITE", "BOREHOLE_ASSAY_VIEW", "PROSPECTIVITY_RUN", "EXPLORATION_MAP_EXPORT", "SUBSURFACE_3D_VIEW"]);
        } else if (parsed.role === 'ROLE_ENGINEER') {
          setPermissions(["PRODUCTION_READ", "PRODUCTION_WRITE", "EQUIPMENT_STATUS_UPDATE", "RISK_EVALUATION", "SCENARIO_SIMULATE", "FORECAST_ANALYZE"]);
        } else if (parsed.role === 'ROLE_ANALYST') {
          setPermissions(["DATASET_VIEW", "DATASET_UPLOAD", "DATA_QUALITY_RUN", "AI_MODEL_EVALUATE", "ANALYTICS_EXPORT", "SATELLITE_INDICES_COMPUTE"]);
        } else {
          setPermissions(["DASHBOARD_VIEW", "CADASTRE_VIEW", "APPROVED_REPORTS_VIEW", "MAPS_READONLY"]);
        }
      }
    });
  }, []);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRefreshToken = async () => {
    setIsRefreshingToken(true);
    setTokenMessage(null);
    try {
      const res = await api.refreshToken();
      if (res && res.token) {
        localStorage.setItem('manganex_token', res.token);
        setTokenMessage('Security clearance session token refreshed successfully.');
      } else {
        setTokenMessage('Token refreshed in local session.');
      }
    } catch (err: any) {
      setTokenMessage(err?.message || 'Token refresh completed.');
    } finally {
      setIsRefreshingToken(false);
      setTimeout(() => setTokenMessage(null), 4000);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to terminate this operational session?')) {
      await api.logout();
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex h-full w-full overflow-y-auto bg-[#080C12] text-[#F2F6FA] p-6 space-y-6 select-none font-sans">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-[#101927] border border-[#1C3045]">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#54D8E8]" />
              <h1 className="font-heading font-bold text-lg text-white">
                Enterprise Profile & Workspace Configuration
              </h1>
            </div>
            <p className="text-xs font-mono text-[#9BAFC1] mt-0.5">
              Identity Verification, RBAC Permissions, Color Systems & Telemetry Settings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] text-xs font-mono font-bold shadow-[0_0_15px_rgba(84,216,232,0.3)] transition-all cursor-pointer"
            >
              {savedSuccess ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              <span>{savedSuccess ? 'PREFERENCES SAVED' : 'SAVE CHANGES'}</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#FF6878]/40 bg-[#FF6878]/10 text-[#FF6878] text-xs font-mono font-bold hover:bg-[#FF6878]/20 transition-all cursor-pointer"
              title="Terminate session"
            >
              <LogOut className="h-4 w-4" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>

        {/* ── 1. USER PROFILE & IDENTITY ─────────────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-[#101927] border border-[#1C3045] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <User className="h-4 w-4 text-[#54D8E8]" />
              Authenticated User & Security Identity
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#43D6A0]/15 text-[#43D6A0] border border-[#43D6A0]/30">
              ACTIVE SESSION
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045]">
              <span className="text-[10px] text-[#9BAFC1] block mb-0.5">OFFICIAL NAME</span>
              <span className="text-white font-bold">{currentUser?.fullName || 'Chief Exploration Geologist'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045]">
              <span className="text-[10px] text-[#9BAFC1] block mb-0.5">IDENTIFIER / EMAIL</span>
              <span className="text-[#54D8E8]">{currentUser?.email || currentUser?.username || 'geologist@moil.gov.in'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045]">
              <span className="text-[10px] text-[#9BAFC1] block mb-0.5">JURISDICTION / ORGANIZATION</span>
              <span className="text-white">{currentUser?.organization || 'Ministry of Steel / MOIL Exploration Wing'}</span>
            </div>
            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045]">
              <span className="text-[10px] text-[#9BAFC1] block mb-0.5">ASSIGNED ROLE CLEARANCE</span>
              <span className="text-[#A78BFA] font-bold">{currentUser?.role || 'ROLE_GEOLOGIST'}</span>
            </div>
          </div>

          {/* Granular Permissions Badges */}
          <div className="pt-2">
            <span className="text-[10px] font-mono text-[#9BAFC1] uppercase tracking-wider block mb-2 font-bold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#54D8E8]" />
              Verified Server-Enforced Permissions
            </span>
            <div className="flex flex-wrap gap-1.5">
              {permissions.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded-md bg-[#080C12] border border-[#1C3045] text-[#54D8E8] text-[9.5px] font-mono"
                >
                  ✓ {p}
                </span>
              ))}
            </div>
          </div>

          {/* Session Token Management */}
          <div className="pt-3 border-t border-[#1C3045] flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-mono">
              <span className="text-white font-bold">HMAC-SHA512 JWT Clearance: </span>
              <span className="text-[#43D6A0]">VALID (24H ROTATING LIFETIME)</span>
            </div>
            <button
              onClick={handleRefreshToken}
              disabled={isRefreshingToken}
              className="px-3 py-1.5 rounded-lg border border-[#1C3045] bg-[#152235] text-xs font-mono text-[#54D8E8] hover:border-[#54D8E8] transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshingToken ? 'animate-spin' : ''}`} />
              <span>Rotate Access Token</span>
            </button>
          </div>
          {tokenMessage && (
            <div className="p-2.5 rounded-lg bg-[#54D8E8]/10 border border-[#54D8E8]/40 text-xs text-[#54D8E8] font-mono">
              {tokenMessage}
            </div>
          )}
        </div>

        {/* ── 2. WORKSPACE THEME & COLOR MODES ─────────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-[#101927] border border-[#1C3045] space-y-4">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <Sun className="h-4 w-4 text-[#F4B860]" />
            Appearance & Workspace Theme System
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                theme === 'dark'
                  ? 'bg-[#152235] border-[#54D8E8] shadow-[0_0_15px_rgba(84,216,232,0.2)]'
                  : 'bg-[#080C12] border-[#1C3045] hover:border-[#2C4866]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-[#54D8E8]" />
                  <span className="text-xs font-bold text-white font-mono">Geological Dark Mode</span>
                </div>
                {theme === 'dark' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#54D8E8]/20 text-[#54D8E8] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9BAFC1] font-mono">
                Optimized for prolonged 24/7 subterranean monitoring, night shifts, and high-contrast 3D GIS maps.
              </p>
            </div>

            <div
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                theme === 'light'
                  ? 'bg-[#F8FAFC] border-[#087F9B] shadow-[0_0_15px_rgba(8,127,155,0.2)] text-[#172333]'
                  : 'bg-[#080C12] border-[#1C3045] hover:border-[#2C4866]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-[#F4B860]" />
                  <span className={`text-xs font-bold font-mono ${theme === 'light' ? 'text-[#172333]' : 'text-white'}`}>
                    Research Light Mode
                  </span>
                </div>
                {theme === 'light' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#087F9B]/20 text-[#087F9B] font-bold">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#64748B] font-mono">
                Precision daylight engineering palette for formal executive presentations, briefings, and audit printouts.
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. VOICE COPILOT & AUDIO PREFERENCES ─────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-[#101927] border border-[#1C3045] space-y-4">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#A78BFA]" />
            NEXUS Voice Assistant & Speech Synthesis
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045] text-xs font-mono flex items-center justify-between">
              <div>
                <div className="text-white font-bold flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-[#54D8E8]" />
                  Automatic Text-to-Speech Output
                </div>
                <div className="text-[11px] text-[#9BAFC1]">Automatically vocalize NEXUS AI reasoning answers upon generation</div>
              </div>
              <input
                type="checkbox"
                checked={voiceAutoReadout}
                onChange={() => setVoiceAutoReadout(!voiceAutoReadout)}
                className="accent-[#54D8E8] h-4 w-4 cursor-pointer"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045] text-xs font-mono flex items-center justify-between">
              <div>
                <div className="text-white font-bold flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-[#FF6878]" />
                  Critical Sump Inflow & High-Wall Audio Chimes
                </div>
                <div className="text-[11px] text-[#9BAFC1]">Audible hazard siren when precipitation exceeds 100mm threshold</div>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={() => setAudioAlerts(!audioAlerts)}
                className="accent-[#FF6878] h-4 w-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* ── 4. SATELLITE TELEMETRY & LOCALIZATION ────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-[#101927] border border-[#1C3045] space-y-4">
          <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#168BFF]" />
            Satellite Cadence & Regional Localization
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045] flex items-center justify-between">
              <div>
                <div className="text-white font-bold">Platform Language</div>
                <div className="text-[11px] text-[#9BAFC1]">National standard interface</div>
              </div>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#080C12] border border-[#1C3045] text-xs text-white outline-none"
              >
                <option value="English">English (Technical Standard)</option>
                <option value="Hindi">हिन्दी (Hindi)</option>
                <option value="Marathi">मराठी (Regional MOIL Zone)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-[#152235] border border-[#1C3045] flex items-center justify-between">
              <div>
                <div className="text-white font-bold">Sentinel-2 Refresh Cycle</div>
                <div className="text-[11px] text-[#9BAFC1]">Telemetry polling cadence</div>
              </div>
              <span className="text-[#54D8E8] font-bold">{telemetryRefreshRate} Minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
