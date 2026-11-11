import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore, UserRole as AuthUserRole } from '../../stores/authStore';
import {
  ShieldCheck,
  Compass,
  Activity,
  Eye,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  Flame,
  Globe2,
  Layers,
  Sparkles,
  Radio,
  KeyRound,
  X,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  Database,
  Cpu,
  BarChart3,
  Bot,
  Radar,
  Sliders,
  ExternalLink,
  Info,
  Box,
  AlertTriangle
} from 'lucide-react';

export type UserRole = 'ADMIN' | 'GEOLOGIST' | 'ENGINEER' | 'ANALYST' | 'VIEWER';

interface RoleProfile {
  id: UserRole;
  title: string;
  badge: string;
  desc: string;
  hintEmail: string;
  demoPassword: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  redirectUrl: string;
  permissionsList: string[];
}

const ROLES: RoleProfile[] = [
  {
    id: 'ADMIN',
    title: 'Admin',
    badge: 'FULL ACCESS',
    desc: 'Platform governance, user management, and security policies.',
    hintEmail: 'admin@moil.gov.in',
    demoPassword: 'ManganexAdmin2026!',
    icon: ShieldCheck,
    accentColor: '#54D8E8',
    redirectUrl: '/admin/dashboard',
    permissionsList: ['User Governance', 'Audit Trail', 'Security IAM']
  },
  {
    id: 'GEOLOGIST',
    title: 'Geologist',
    badge: 'EXPLORATION',
    desc: 'Borehole assays, 3D lithology, and prospectivity analytics.',
    hintEmail: 'geologist@moil.gov.in',
    demoPassword: 'ManganexGeo2026!',
    icon: Compass,
    accentColor: '#A78BFA',
    redirectUrl: '/geologist/dashboard',
    permissionsList: ['Borehole Assays', '3D Subsurface', 'Fault Analytics']
  },
  {
    id: 'ENGINEER',
    title: 'Mining Engineer',
    badge: 'MINE OPS',
    desc: 'Production monitoring, fleet telemetry, and operational planning.',
    hintEmail: 'engineer@moil.gov.in',
    demoPassword: 'ManganexEng2026!',
    icon: Activity,
    accentColor: '#F4B860',
    redirectUrl: '/operations/dashboard',
    permissionsList: ['Haulage Tracking', 'Fleet Telemetry', 'Bench Shortfall']
  },
  {
    id: 'ANALYST',
    title: 'Data Analyst',
    badge: 'AI & SATELLITE',
    desc: 'Sentinel-2 spectral indices, ML models, and analytics reports.',
    hintEmail: 'analyst@moil.gov.in',
    demoPassword: 'ManganexData2026!',
    icon: Layers,
    accentColor: '#168BFF',
    redirectUrl: '/analytics/dashboard',
    permissionsList: ['Sentinel-2 Spectral', 'SHAP Explainability', 'Model Benchmarks']
  },
  {
    id: 'VIEWER',
    title: 'Viewer',
    badge: 'READ-ONLY',
    desc: 'Read-only access to executive dashboards, maps, and reports.',
    hintEmail: 'viewer@moil.gov.in',
    demoPassword: 'ManganexViewer2026!',
    icon: Eye,
    accentColor: '#43D6A0',
    redirectUrl: '/viewer/dashboard',
    permissionsList: ['Executive Overview', 'Cadastre Viewer', 'Public Reports']
  }
];

export const getTargetRouteForRole = (roleStr: string): string => {
  const r = (roleStr || '').toUpperCase();
  if (r.includes('ADMIN')) return '/admin/dashboard';
  if (r.includes('GEOLOGIST')) return '/geologist/dashboard';
  if (r.includes('ENGINEER')) return '/operations/dashboard';
  if (r.includes('ANALYST')) return '/analytics/dashboard';
  if (r.includes('VIEWER')) return '/viewer/dashboard';
  return '/admin/dashboard';
};

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useAppStore();

  const [authMode, setAuthMode] = useState<'SIGN_IN' | 'REGISTER'>('SIGN_IN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authenticatingDemoRole, setAuthenticatingDemoRole] = useState<UserRole | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Registration Form States
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regOrg, setRegOrg] = useState('MOIL Limited');
  const [regRole, setRegRole] = useState<UserRole>('GEOLOGIST');
  const [issuedVerificationToken, setIssuedVerificationToken] = useState<string | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);

  // Forgot password & reset modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [isResetStep, setIsResetStep] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 4
  };
  const pwStrength = getPasswordStrength(regPassword);

  // Canvas ref for Earth & orbital satellite animation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load remembered username if present
  useEffect(() => {
    const saved = localStorage.getItem('manganex_remembered_user');
    if (saved) {
      setUsername(saved);
    }
  }, []);

  // ── CINEMATIC EARTH & ORBITAL SATELLITES CANVAS ───────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Stars generation
    const stars: { x: number; y: number; r: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 160; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.02 + 0.005
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w * 0.5;
      const centerY = h * 0.46;
      const globeRadius = Math.min(w, h) * 0.23;

      // 1. Draw Starfield
      stars.forEach((star) => {
        star.alpha += Math.sin(angle * star.speed) * 0.01;
        const a = Math.max(0.1, Math.min(1, star.alpha));
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Earth Atmospheric Glow (Behind globe)
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, globeRadius * 0.85,
        centerX, centerY, globeRadius * 1.45
      );
      glowGrad.addColorStop(0, 'rgba(84, 216, 232, 0.35)');
      glowGrad.addColorStop(0.5, 'rgba(22, 139, 255, 0.15)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius * 1.45, 0, Math.PI * 2);
      ctx.fill();

      // 3. Central Earth Globe Body
      const earthGrad = ctx.createRadialGradient(
        centerX - globeRadius * 0.35, centerY - globeRadius * 0.35, globeRadius * 0.1,
        centerX, centerY, globeRadius
      );
      earthGrad.addColorStop(0, '#1E4068');
      earthGrad.addColorStop(0.4, '#132840');
      earthGrad.addColorStop(0.75, '#0B1626');
      earthGrad.addColorStop(1, '#050B14');

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, globeRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Earth Continent & Graticule lines (Subtle Rotating Meridian Mesh)
      ctx.strokeStyle = 'rgba(84, 216, 232, 0.12)';
      ctx.lineWidth = 1;

      // Latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        const yOffset = (lat / 90) * (globeRadius * 0.85);
        const latRadius = Math.sqrt(Math.max(0, globeRadius * globeRadius - yOffset * yOffset));
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + yOffset, latRadius, latRadius * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Rotating Longitude Meridians
      for (let i = 0; i < 6; i++) {
        const rot = angle * 0.008 + (i * Math.PI) / 6;
        const curRx = Math.cos(rot) * globeRadius;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.abs(curRx), globeRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Atmospheric Rim Highlight (Curved limb)
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(84, 216, 232, 0.45)';
      ctx.stroke();
      ctx.restore();

      // 4. Animated Satellite Orbital Paths (Gold & Cyan Ellipses)
      const orbits = [
        { rx: globeRadius * 1.65, ry: globeRadius * 0.65, tilt: -24, color: '#F4B860', speed: 0.012, offset: 0, label: 'SENTINEL-2A' },
        { rx: globeRadius * 1.95, ry: globeRadius * 0.75, tilt: 32, color: '#54D8E8', speed: -0.009, offset: Math.PI * 0.5, label: 'LANDSAT-9' },
        { rx: globeRadius * 1.45, ry: globeRadius * 0.52, tilt: 65, color: '#A78BFA', speed: 0.015, offset: Math.PI * 1.1, label: 'ASTER GDEM' },
        { rx: globeRadius * 2.15, ry: globeRadius * 0.85, tilt: -52, color: '#43D6A0', speed: -0.008, offset: Math.PI * 1.7, label: 'MOIL-SAT 1' }
      ];

      orbits.forEach((orb) => {
        const radTilt = (orb.tilt * Math.PI) / 180;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(radTilt);

        // Orbital ring path
        ctx.beginPath();
        ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${orb.color}35`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Satellite position along ellipse
        const satAngle = angle * orb.speed + orb.offset;
        const satX = Math.cos(satAngle) * orb.rx;
        const satY = Math.sin(satAngle) * orb.ry;

        // Satellite glow
        const satGlow = ctx.createRadialGradient(satX, satY, 1, satX, satY, 10);
        satGlow.addColorStop(0, orb.color);
        satGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = satGlow;
        ctx.beginPath();
        ctx.arc(satX, satY, 10, 0, Math.PI * 2);
        ctx.fill();

        // Satellite node body
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(satX, satY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Satellite miniature solar panel arms
        ctx.strokeStyle = orb.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(satX - 6, satY);
        ctx.lineTo(satX + 6, satY);
        ctx.stroke();

        ctx.restore();
      });

      angle += 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const activeRoleConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  const handleRoleSelect = (role: RoleProfile) => {
    setSelectedRole(role.id);
    setErrorMessage(null);
  };

  // Standard Login Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username/email and access key.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await api.login({
        username: username.trim(),
        password,
        role: selectedRole
      });

      if (response && response.token) {
        const respAny = response as any;
        const userObj = {
          id: respAny.id || `usr-${response.username}`,
          username: response.username,
          email: respAny.email || username.trim(),
          fullName: response.fullName,
          role: response.role as any,
          organization: respAny.organization || 'MOIL Limited'
        };

        useAuthStore.getState().setAuth(userObj, response.token);

        if (rememberMe) {
          localStorage.setItem('manganex_remembered_user', username.trim());
        } else {
          localStorage.removeItem('manganex_remembered_user');
        }

        const targetRoute = getTargetRouteForRole(response.role);
        setSuccessMessage(`Clearance confirmed for ${response.fullName} (${response.role}). Redirecting to ${targetRoute}...`);

        setTimeout(() => {
          navigate(targetRoute);
        }, 500);
      } else {
        setErrorMessage(response?.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Connection to authentication gateway failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated "Use Demo Account" Handler (Calls real backend authentication)
  const handleUseDemoAccount = async (role: RoleProfile) => {
    setAuthenticatingDemoRole(role.id);
    setSelectedRole(role.id);
    setUsername(role.hintEmail);
    setPassword(role.demoPassword);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await api.login({
        username: role.hintEmail,
        password: role.demoPassword,
        role: role.id
      });

      if (response && response.token) {
        const respAny = response as any;
        const userObj = {
          id: respAny.id || `usr-${response.username}`,
          username: response.username,
          email: respAny.email || role.hintEmail,
          fullName: response.fullName,
          role: response.role as any,
          organization: respAny.organization || 'Ministry of Steel / MOIL'
        };

        useAuthStore.getState().setAuth(userObj, response.token);

        const targetRoute = getTargetRouteForRole(response.role);
        setSuccessMessage(`Demo access confirmed: Authenticated as ${response.fullName} (${role.badge}). Redirecting to ${targetRoute}...`);

        setTimeout(() => {
          navigate(targetRoute);
        }, 400);
      } else {
        setErrorMessage(response?.message || `Demo authentication failed for ${role.title}.`);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || `Failed to authenticate demo user for ${role.title}.`);
    } finally {
      setAuthenticatingDemoRole(null);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim() || !regEmail.trim() || !regUsername.trim() || !regPassword) {
      setErrorMessage('Please complete all mandatory registration fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Password and confirmation key do not match.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMessage('Access password must be at least 8 characters with upper, numeric and special symbols.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        username: regUsername.trim(),
        password: regPassword,
        organization: regOrg.trim(),
        role: regRole
      });

      if (res && res.success) {
        setIssuedVerificationToken(res.verificationToken);
        setSuccessMessage(`Account registered for ${res.username} with role ${res.role}. Verification token generated.`);
      } else {
        setErrorMessage(res?.message || 'Registration failed.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailClick = async () => {
    if (!issuedVerificationToken) return;
    setIsVerifyingEmail(true);
    try {
      const res = await api.verifyEmail(issuedVerificationToken);
      if (res && res.success) {
        setSuccessMessage('Email verified successfully! You may now sign in.');
        setIssuedVerificationToken(null);
        // Pre-fill username and switch to sign in
        setUsername(regUsername);
        setPassword(regPassword);
        setSelectedRole(regRole);
        setAuthMode('SIGN_IN');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Email verification failed.');
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsForgotLoading(true);
    setForgotMessage(null);

    try {
      const res = await api.forgotPassword(forgotEmail.trim());
      setForgotMessage(res?.message || 'Password reset token dispatched.');
      if (res?.resetToken) {
        setResetToken(res.resetToken);
        setIsResetStep(true);
      }
    } catch (err: any) {
      setForgotMessage(err?.message || 'Unable to process reset request.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim() || !newPassword) return;

    setIsForgotLoading(true);
    setForgotMessage(null);

    try {
      const res = await api.resetPassword({
        token: resetToken.trim(),
        new_password: newPassword
      });
      setForgotMessage(res?.message || 'Password reset successful! You can now sign in.');
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setPassword(newPassword);
        setUsername(forgotEmail);
      }, 1500);
    } catch (err: any) {
      setForgotMessage(err?.message || 'Reset failed.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen w-full relative selection:bg-[#54D8E8]/30 overflow-x-hidden ${isDark ? 'bg-[#05080E] text-[#F2F6FA]' : 'bg-[#F5F7FA] text-[#172333]'}`}>
      
      {/* ── SECTION 1: CINEMATIC FULL-SCREEN ORBITAL HERO & LOGIN ───────────────── */}
      <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden">
        {/* Animated Three.js / Canvas Background (Stars, Earth, Orbiting Satellites) */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* Ambient Top & Bottom Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05080E]/70 via-transparent to-[#05080E] pointer-events-none z-0" />

        {/* Top Header */}
        <header className="h-16 px-6 sm:px-12 flex items-center justify-between z-10 border-b border-[#1C3045]/40 backdrop-blur-sm bg-[#080C12]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#54D8E8] to-[#168BFF] flex items-center justify-center shadow-[0_0_15px_rgba(84,216,232,0.4)]">
              <Flame className="w-5 h-5 text-[#080C12]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-wider text-white">
                MANGANEX
              </span>
              <span className="block text-[8px] font-mono tracking-widest text-[#54D8E8]">
                THE EARTH'S HIDDEN INTELLIGENCE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101927]/60 border border-[#1C3045]">
              <Radio className="w-3 h-3 text-[#43D6A0] animate-pulse" />
              <span className="text-[#43D6A0] font-bold text-[10.5px]">MOIL CADASTRE LIVE</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} Theme`}
              className="p-2 rounded-lg border border-[#1C3045] bg-[#101927]/60 text-[#9BAFC1] hover:text-white hover:border-[#54D8E8] transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isDark ? <Sun className="w-4 h-4 text-[#F4B860]" /> : <Moon className="w-4 h-4 text-[#7C3AED]" />}
              <span className="text-[10px] font-bold uppercase">{isDark ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </header>

        {/* ── BALANCED HORIZONTAL LOGIN PANEL (CENTERED OVER GLOBE) ─────────────── */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 z-10">
          <div className="w-full max-w-3xl bg-[#0A121E]/85 backdrop-blur-xl border border-[#1C3045]/90 rounded-2xl p-6 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            
            {/* Header of Panel & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#1C3045]/60">
              <div>
                <span className="text-[9.5px] font-mono font-bold tracking-widest text-[#54D8E8] uppercase">
                  CENTRAL IAM GATEWAY &bull; ZERO TRUST VERIFIED
                </span>
                <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white mt-0.5">
                  {authMode === 'SIGN_IN' ? 'Sign In to MANGANEX' : 'Create Intelligence Account'}
                </h1>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060B12] border border-[#1C3045]">
                <button
                  type="button"
                  onClick={() => { setAuthMode('SIGN_IN'); setErrorMessage(null); }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    authMode === 'SIGN_IN'
                      ? 'bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] shadow-[0_0_10px_rgba(84,216,232,0.3)]'
                      : 'text-[#9BAFC1] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); setErrorMessage(null); }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    authMode === 'REGISTER'
                      ? 'bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] shadow-[0_0_10px_rgba(84,216,232,0.3)]'
                      : 'text-[#9BAFC1] hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Feedback Alerts */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-[#FF6878]/15 border border-[#FF6878]/40 text-xs text-[#FF6878] flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-[#43D6A0]/15 border border-[#43D6A0]/40 text-xs text-[#43D6A0] flex items-center gap-2 font-mono">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Issued Verification Token Banner */}
            {issuedVerificationToken && (
              <div className="mb-4 p-3 rounded-xl bg-[#54D8E8]/10 border border-[#54D8E8]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs font-mono">
                  <span className="text-[#54D8E8] font-bold block">VERIFICATION TOKEN DISPATCHED:</span>
                  <span className="text-white select-all text-[11px] font-mono">{issuedVerificationToken}</span>
                </div>
                <button
                  type="button"
                  onClick={handleVerifyEmailClick}
                  disabled={isVerifyingEmail}
                  className="px-4 py-1.5 rounded-lg bg-[#54D8E8] text-[#080C12] text-xs font-heading font-extrabold shadow hover:bg-[#68e0ee] cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isVerifyingEmail ? 'Verifying...' : 'Verify & Activate Now'}
                </button>
              </div>
            )}

            {/* Form: Sign In vs Register */}
            {authMode === 'SIGN_IN' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Username / Email Field */}
                  <div>
                    <label className="block text-[11px] font-mono text-[#9BAFC1] mb-1">
                      OFFICIAL EMAIL / USERNAME
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657A90]" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="e.g. geologist@moil.gov.in"
                        className="w-full h-10 pl-10 pr-3.5 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-mono text-[#9BAFC1]">
                        ACCESS KEY
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotModalOpen(true);
                          setForgotEmail(username);
                          setForgotMessage(null);
                          setIsResetStep(false);
                        }}
                        className="text-[10px] font-mono text-[#54D8E8] hover:underline cursor-pointer"
                      >
                        Forgot key?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657A90]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Enter security access key"
                        className="w-full h-10 pl-10 pr-10 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8] transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#657A90] hover:text-[#54D8E8]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action & Remember Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-[#9BAFC1]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded bg-[#05080E] border-[#1C3045] text-[#54D8E8] focus:ring-0 cursor-pointer"
                    />
                    <span>Remember session identity</span>
                  </label>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-[#54D8E8] via-[#168BFF] to-[#A78BFA] text-[#080C12] font-heading font-extrabold text-xs tracking-wider shadow-[0_0_20px_rgba(84,216,232,0.3)] hover:shadow-[0_0_25px_rgba(84,216,232,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#080C12] border-t-transparent rounded-full animate-spin" />
                        <span>AUTHENTICATING...</span>
                      </>
                    ) : (
                      <>
                        <span>SIGN IN &bull; ENTER {activeRoleConfig.title.toUpperCase()}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* ── REGISTER FORM ────────────────────────────────────────── */
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10.5px] font-mono text-[#9BAFC1] mb-1">
                      FULL NAME
                    </label>
                    <input
                      type="text"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                      placeholder="Dr. Rajesh Sharma"
                      className="w-full h-9 px-3 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono text-[#9BAFC1] mb-1">
                      OFFICIAL EMAIL
                    </label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                      placeholder="r.sharma@moil.gov.in"
                      className="w-full h-9 px-3 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono text-[#9BAFC1] mb-1">
                      USERNAME
                    </label>
                    <input
                      type="text"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                      placeholder="rsharma"
                      className="w-full h-9 px-3 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono text-[#9BAFC1] mb-1">
                      ROLE CLEARANCE REQUEST
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full h-9 px-3 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#54D8E8]"
                    >
                      <option value="GEOLOGIST">Geologist (Exploration & 3D)</option>
                      <option value="ENGINEER">Mining Engineer (Production & Fleet)</option>
                      <option value="ANALYST">Data Analyst (Satellite & ML)</option>
                      <option value="VIEWER">Viewer (Executive Read-Only)</option>
                      <option value="ADMIN">Administrator (Governance & IAM)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono text-[#9BAFC1] mb-1">
                      PASSWORD (MIN 8 CHARS)
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      placeholder="Enter strong password"
                      className="w-full h-9 px-3 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                    />
                    {/* Password Strength Meter */}
                    <div className="flex items-center gap-1 mt-1.5">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            pwStrength >= step
                              ? step <= 2 ? 'bg-[#F4B860]' : 'bg-[#43D6A0]'
                              : 'bg-[#1C3045]'
                          }`}
                        />
                      ))}
                      <span className="text-[9px] font-mono text-[#9BAFC1] ml-1.5">
                        {pwStrength <= 1 ? 'Weak' : pwStrength <= 3 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] font-mono text-[#9BAFC1] mb-1">
                      CONFIRM PASSWORD
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter password"
                      className="w-full h-9 px-3 bg-[#05080E]/90 border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                    />
                    {regConfirmPassword && regPassword !== regConfirmPassword && (
                      <span className="text-[9px] font-mono text-[#FF6878] mt-1 block">
                        Passwords do not match
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] font-mono text-[#657A90]">
                    Organization: MOIL Ltd / Ministry of Steel
                  </span>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="h-9 px-6 rounded-xl bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] font-heading font-extrabold text-xs tracking-wider shadow hover:shadow-[0_0_15px_rgba(84,216,232,0.4)] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'REGISTERING...' : 'REGISTER CREDENTIALS'}
                  </button>
                </div>
              </form>
            )}

            {/* ── FIVE DEMO ACCOUNTS STRIP (BELOW LOGIN FORM) ────────────────────── */}
            <div className="mt-5 pt-4 border-t border-[#1C3045]/70">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-mono font-extrabold text-[#9BAFC1] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#54D8E8]" />
                  EXPLORE DEMO PROFILES (REAL SEEDED BACKEND AUTH)
                </span>
                <span className="text-[9px] font-mono text-[#657A90] hidden sm:inline">
                  BCrypt Encrypted &bull; 1-Click Session
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isAuthenticating = authenticatingDemoRole === role.id;
                  const isSelected = selectedRole === role.id;

                  return (
                    <div
                      key={role.id}
                      className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#152235] border-[#54D8E8] shadow-[0_0_12px_rgba(84,216,232,0.2)]'
                          : 'bg-[#060B12]/80 border-[#1C3045] hover:border-[#2C4866]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${role.accentColor}20`, color: role.accentColor }}
                          >
                            <Icon className="w-3 h-3" />
                          </div>
                          <span className="text-[11px] font-bold text-white truncate">{role.title}</span>
                        </div>
                        <span className="text-[8.5px] font-mono text-[#54D8E8] block truncate mb-1">
                          {role.hintEmail.split('@')[0]}
                        </span>
                        <p className="text-[8.5px] text-[#9BAFC1] line-clamp-2 leading-tight mb-2">
                          {role.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        disabled={isAuthenticating}
                        onClick={() => handleUseDemoAccount(role)}
                        className="w-full py-1 px-1.5 rounded bg-[#101927] hover:bg-[#1C3045] text-white border border-[#1C3045] text-[9.5px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                        style={{ borderLeftWidth: '2.5px', borderLeftColor: role.accentColor }}
                      >
                        {isAuthenticating ? (
                          <span className="w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Use Demo</span>
                            <ArrowRight className="w-2.5 h-2.5 text-[#54D8E8]" />
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down prompt */}
        <div className="pb-4 flex flex-col items-center justify-center text-center z-10">
          <a
            href="#public-overview"
            className="flex flex-col items-center gap-1 text-[10px] font-mono text-[#54D8E8] hover:text-white transition-colors"
          >
            <span>DISCOVER PLATFORM CAPABILITIES & WORKFLOW</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* ── SECTION 2: FULL ENTERPRISE PUBLIC INTRODUCTION ───────────────────── */}
      <section id="public-overview" className="relative z-10 border-t border-[#1C3045] bg-[#070C15] py-20 px-6 sm:px-12 max-w-7xl mx-auto space-y-24">
        
        {/* 1. Hero / Mission Statement */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101927] border border-[#54D8E8]/40 shadow-[0_0_15px_rgba(84,216,232,0.15)]">
            <Globe2 className="w-3.5 h-3.5 text-[#54D8E8]" />
            <span className="text-[11px] font-mono font-bold text-[#54D8E8] tracking-wider uppercase">
              Ministry of Steel &bull; MOIL Central Manganese Belt
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white leading-tight">
            See Beneath the Surface.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#54D8E8] via-[#168BFF] to-[#A78BFA]">
              Predict Beyond the Present.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-[#9BAFC1] leading-relaxed">
            MANGANEX is an enterprise-grade AI geological exploration and mining intelligence platform. We fuse multi-spectral satellite observations, 3D lithological models, and explainable machine learning to discover critical manganese reserves and eliminate operational shortfalls.
          </p>
        </div>

        {/* 2. How MANGANEX Works (Industrial Workflow Pipeline) */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#54D8E8] uppercase">
              END-TO-END AUTONOMOUS WORKFLOW
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              From Space Observation to Underground Extraction
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
            {[
              { step: '01', title: 'Data Acquisition', desc: 'Sentinel-2 Level-2A, Landsat-9, and ASTER GDEM elevation.' },
              { step: '02', title: 'Geological Processing', desc: 'Drillcore assays, fault fractures, and UNFC classifications.' },
              { step: '03', title: 'Spatial Analysis', desc: 'SWIR hydrothermal alteration, iron oxide, and moisture anomalies.' },
              { step: '04', title: 'Machine Learning', desc: 'Ensemble XGBoost prospectivity with SHAP explainability.' },
              { step: '05', title: '3D Subsurface Twin', desc: 'Interactive WebGL lithological digital twin and depth cross-sections.' },
              { step: '06', title: 'Exploration Intelligence', desc: 'Ranked target anomaly maps with confidence interval bounds.' },
              { step: '07', title: 'Decision Support', desc: 'Google OR-Tools fleet allocation & predictive shortfall radar.' }
            ].map((st, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#0A121E] border border-[#1C3045] flex flex-col justify-between hover:border-[#54D8E8]/50 transition-colors"
              >
                <div>
                  <span className="text-[10px] font-mono font-bold text-[#54D8E8] block mb-1">
                    STEP {st.step}
                  </span>
                  <h4 className="font-heading font-bold text-xs text-white mb-1.5">{st.title}</h4>
                  <p className="text-[10px] text-[#9BAFC1] leading-relaxed">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Platform Capabilities & Core Modules Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#54D8E8] uppercase">
              MODULAR PLATFORM CAPABILITIES
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Eight Pillars of Mining Intelligence
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Globe2, title: 'Satellite Intelligence', desc: 'Automated Sentinel-2 NDVI, soil moisture, and LST anomaly monitoring for open-cast and underground mines.' },
              { icon: Compass, title: 'Geological Exploration', desc: 'Borehole log assays, structural fault mapping, and UNFC 111 vs 333 compliance tracking across the Sauser Belt.' },
              { icon: Box, title: '3D Subsurface Visualization', desc: 'Data-driven Three.js WebGL digital twin rendering weathered regolith, braunite reefs, and basement gneisses.' },
              { icon: Radar, title: 'Manganese Prospectivity', desc: 'Multi-parameter machine learning models predicting reserve probabilities with calibrated confidence intervals.' },
              { icon: BarChart3, title: 'Production Forecasting', desc: '7/14/30-day predictive time series anticipating monsoon seepage delays and haulage bottleneck shortfalls.' },
              { icon: Activity, title: 'Equipment Intelligence', desc: 'Real-time telemetry monitoring for LHD fleets, jumbo drill rigs, tipper convoys, and dewatering pumps.' },
              { icon: AlertTriangle, title: 'Risk Intelligence Radar', desc: 'The Risk Ripple causal dependency cascade tracking weather hazards, equipment failure, and output deficits.' },
              { icon: Bot, title: 'NEXUS AI Copilot', desc: 'Autonomous geospatial LLM with dense vector RAG knowledge search, multilingual dialogue, and voice STT/TTS.' }
            ].map((mod, i) => {
              const Icon = mod.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#0A121E] border border-[#1C3045] hover:border-[#168BFF]/60 hover:shadow-[0_0_20px_rgba(22,139,255,0.15)] transition-all space-y-2.5"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#152235] border border-[#1C3045] flex items-center justify-center text-[#54D8E8]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-bold text-sm text-white">{mod.title}</h4>
                  <p className="text-xs text-[#9BAFC1] leading-relaxed">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Technology Stack Section */}
        <div className="p-8 rounded-2xl bg-[#0A121E] border border-[#1C3045] space-y-6">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#54D8E8] uppercase">
              ENTERPRISE TECHNOLOGY FOUNDATION
            </span>
            <h3 className="text-xl font-heading font-bold text-white">
              Built on High-Performance Scientific Infrastructure
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-center font-mono">
            {[
              { name: 'Copernicus Sentinel-2', role: '10m Multispectral' },
              { name: 'MapLibre GL JS', role: 'GIS Mapping Engine' },
              { name: 'Three.js / WebGL', role: '3D Subsurface Digital Twin' },
              { name: 'Spring Boot 3.3.3', role: 'Java Enterprise RBAC' },
              { name: 'FastAPI + Python', role: 'AI / ML Microservices' },
              { name: 'XGBoost & SHAP', role: 'Explainable AI Models' },
              { name: 'PostGIS + pgvector', role: 'Spatial & Vector Database' },
              { name: 'Sentence Transformers', role: 'RAG Knowledge Embeddings' },
              { name: 'Web Speech API', role: 'Multilingual STT / TTS' },
              { name: 'Google OR-Tools', role: 'Fleet & Mine Optimization' },
              { name: 'Tailwind CSS', role: 'Precision UI Design' },
              { name: 'UNFC-2009 Standards', role: 'Mineral Resource Governance' }
            ].map((tech, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#060B12] border border-[#1C3045]">
                <span className="text-xs font-bold text-white block">{tech.name}</span>
                <span className="text-[9px] text-[#54D8E8]">{tech.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Enterprise Public Footer */}
        <footer className="pt-10 border-t border-[#1C3045] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#657A90]">
          <div>
            <span className="font-heading font-bold text-white text-sm">MANGANEX</span>
            <span className="block text-[10px] mt-0.5">THE EARTH'S HIDDEN INTELLIGENCE &bull; v2.5</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>MINISTRY OF STEEL</span>
            <span>&bull;</span>
            <span>MOIL LIMITED</span>
            <span>&bull;</span>
            <span>GSI CENTRAL REGION</span>
          </div>

          <div className="text-[10px]">
            &copy; 2026 MANGANEX Platforms. All rights reserved.
          </div>
        </footer>
      </section>

      {/* ── FORGOT PASSWORD MODAL ──────────────────────────────────────────────── */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#05080E]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0A121E] border border-[#1C3045] rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsForgotModalOpen(false)}
              className="absolute top-4 right-4 text-[#657A90] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <KeyRound className="w-5 h-5 text-[#54D8E8]" />
              <h3 className="text-base font-heading font-bold text-white">
                Password Recovery Protocol
              </h3>
            </div>
            <p className="text-xs text-[#9BAFC1] mb-4">
              {isResetStep
                ? 'Enter the authorization token and choose a new secure access key.'
                : 'Enter your registered official email. The central security gateway will issue an authorized password reset token.'}
            </p>

            {forgotMessage && (
              <div className="mb-4 p-3 rounded-lg bg-[#54D8E8]/10 border border-[#54D8E8]/40 text-xs text-[#54D8E8]">
                {forgotMessage}
              </div>
            )}

            {!isResetStep ? (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9BAFC1] mb-1">
                    REGISTERED MOIL EMAIL
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="e.g. geologist@moil.gov.in"
                    className="w-full h-10 px-3.5 bg-[#05080E] border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#1C3045] text-xs font-mono text-[#9BAFC1] hover:bg-[#152235]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] text-xs font-heading font-bold hover:shadow-[0_0_12px_rgba(84,216,232,0.3)] disabled:opacity-50"
                  >
                    {isForgotLoading ? 'Dispatching...' : 'Dispatch Reset Token'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#9BAFC1] mb-1">
                    AUTHORIZATION RESET TOKEN
                  </label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    required
                    placeholder="rst-..."
                    className="w-full h-10 px-3.5 bg-[#05080E] border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-[#9BAFC1] mb-1">
                    NEW ACCESS KEY (MIN 8 CHARS)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    className="w-full h-10 px-3.5 bg-[#05080E] border border-[#1C3045] rounded-xl text-xs font-mono text-white placeholder-[#4C647D] focus:outline-none focus:border-[#54D8E8]"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsResetStep(false)}
                    className="px-4 py-2 rounded-xl border border-[#1C3045] text-xs font-mono text-[#9BAFC1] hover:bg-[#152235]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotLoading}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#43D6A0] to-[#54D8E8] text-[#080C12] text-xs font-heading font-bold hover:shadow-[0_0_12px_rgba(67,214,160,0.3)] disabled:opacity-50"
                  >
                    {isForgotLoading ? 'Updating Key...' : 'Confirm New Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};