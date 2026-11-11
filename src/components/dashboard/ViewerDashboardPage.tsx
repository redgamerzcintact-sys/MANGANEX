import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Eye,
  ShieldCheck,
  Compass,
  Layers,
  Activity,
  FileText,
  BrainCircuit,
  ArrowRight,
  Lock,
  Sparkles,
  Info,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

const EXECUTIVE_PRODUCTION_DATA = [
  { month: 'Apr', tonnes: 14200, target: 14000 },
  { month: 'May', tonnes: 15400, target: 15000 },
  { month: 'Jun', tonnes: 16100, target: 15500 },
  { month: 'Jul', tonnes: 14900, target: 16000 },
  { month: 'Aug', tonnes: 15800, target: 16500 },
  { month: 'Sep', tonnes: 16900, target: 17000 }
];

const VERIFIED_MINES_OVERVIEW = [
  { name: 'Balaghat Underground Mine', state: 'Madhya Pradesh', grade: '44.8% Mn', reserve: '24.5 Mt', status: 'ACTIVE', type: 'Underground' },
  { name: 'Dongri Buzurg Mine', state: 'Maharashtra', grade: '41.2% Mn', reserve: '18.2 Mt', status: 'ACTIVE', type: 'Open-Cast' },
  { name: 'Chikla Manganese Mine', state: 'Maharashtra', grade: '43.5% Mn', reserve: '14.8 Mt', status: 'ACTIVE', type: 'Underground' },
  { name: 'Ukwa Hillside Mine', state: 'Madhya Pradesh', grade: '39.4% Mn', reserve: '9.6 Mt', status: 'ACTIVE', type: 'Open-Cast' },
  { name: 'Munsar Mine', state: 'Maharashtra', grade: '42.0% Mn', reserve: '11.4 Mt', status: 'ACTIVE', type: 'Underground' }
];

export const ViewerDashboardPage: React.FC = () => {
  const { theme, selectedMine } = useAppStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 space-y-6 max-w-7xl mx-auto ${isDark ? 'text-[#F2F6FA]' : 'text-[#172333]'}`}>
      {/* ── READ-ONLY SECURITY NOTICE BANNER ───────────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-[#43D6A0]/10 border border-[#43D6A0]/30 flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#43D6A0]">
          <Eye className="w-4 h-4 shrink-0" />
          <span>
            <strong>READ-ONLY EXECUTIVE CLEARANCE:</strong> You have authorized observation access to platform telemetry, verified geological datasets, and published executive reports. Data mutation, model retraining, and administrative controls are restricted.
          </span>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#43D6A0]/20 text-[#43D6A0] font-bold text-[10px] shrink-0">
          CLEARANCE: VIEWER
        </span>
      </div>

      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C3045]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#43D6A0]/15 border border-[#43D6A0]/40 flex items-center justify-center text-[#43D6A0]">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Executive Mineral Observatory
              </h1>
              <p className="text-xs font-mono text-[#657A90]">
                READ-ONLY INTELLIGENCE & PRODUCTION BRIEFINGS — {user?.fullName || 'Executive Observer'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/reports"
            className="px-3 py-1.5 rounded-lg bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#54D8E8]" />
            Approved Reports
          </NavLink>
          <NavLink
            to="/command-center"
            className="px-3 py-1.5 rounded-lg bg-[#43D6A0] hover:bg-[#38b2c2] text-[#080C12] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            Open Cadastre Map
          </NavLink>
        </div>
      </div>

      {/* ── 1. VIEWER KPI STATS ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Verified Reserves', val: '78.5 Mt', sub: 'Average In-Situ Grade 42.8% Mn', icon: Layers, color: '#43D6A0' },
          { label: 'YTD Finished Production', val: '93,300 T', sub: '97.2% of FY-2026 Target Achieved', icon: Activity, color: '#54D8E8' },
          { label: 'Monitored Concessions', val: '5 Mines', sub: 'Madhya Pradesh & Maharashtra', icon: Compass, color: '#F4B860' },
          { label: 'Environmental Compliance', val: '100% Certified', sub: 'Zero active DGMS statutory notices', icon: ShieldCheck, color: '#A78BFA' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#0E1724] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#657A90] uppercase">{stat.label}</span>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-xl font-bold font-heading mt-2">{stat.val}</div>
              <div className="text-[11px] text-[#8297AA] mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── 2. PRODUCTION SUMMARY & HIGH-LEVEL TRENDS ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm">Monthly Ore Extraction vs National Demand Target</h3>
              <p className="text-xs text-[#657A90]">Consolidated extraction tonnage across all 5 MOIL operating concessions</p>
            </div>
            <span className="text-xs font-mono text-[#43D6A0]">Published Metric</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EXECUTIVE_PRODUCTION_DATA}>
                <defs>
                  <linearGradient id="tonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#43D6A0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#43D6A0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1C3045' : '#E2E8F0'} />
                <XAxis dataKey="month" stroke="#657A90" fontSize={11} />
                <YAxis stroke="#657A90" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#090D16' : '#FFFFFF',
                    borderColor: '#1C3045',
                    borderRadius: 8
                  }}
                />
                <Area type="monotone" dataKey="tonnes" stroke="#43D6A0" strokeWidth={2} fill="url(#tonGrad)" name="Ore Extracted (T)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Intelligence Highlights */}
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <h3 className="font-heading font-bold text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#54D8E8]" />
            Executive Intelligence Highlights
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {[
              { title: 'Balaghat Deep Winze Shaft', note: 'Shaft deepening to -300m level has intersected high-grade 46.5% Mn ore reef.' },
              { title: 'Dongri Buzurg Beneficiation', note: 'Heavy Media Separation (HMS) plant achieved 94.2% recovery efficiency.' },
              { title: 'Sauser Belt Exploration', note: 'GSI joint core exploration confirmed 6.4 Mt extension under UNFC-122 category.' }
            ].map((h, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-[#152235]/40 border border-[#1C3045]/60">
                <div className="font-semibold text-white">{h.title}</div>
                <div className="text-[11px] text-[#9BAFC1] mt-0.5">{h.note}</div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <NavLink
              to="/nexus"
              className="w-full py-2 px-3 rounded-lg bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-xs font-mono text-[#54D8E8] flex items-center justify-between transition-colors"
            >
              <span>Consult NEXUS AI Copilot</span>
              <BrainCircuit className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── 3. APPROVED MINE ASSET REGISTER ─────────────────────────────────────── */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#F4B860]" />
              Approved Concessions & Mining Lease Register
            </h3>
            <p className="text-xs text-[#657A90]">Verified statutory mining lease boundaries, reserve estimations, and mineral grades</p>
          </div>
          <span className="text-xs font-mono text-[#43D6A0]">IBM Certified Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">Concession Name</th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Mine Type</th>
                <th className="py-2.5 px-3">Average In-Situ Grade</th>
                <th className="py-2.5 px-3">Measured Reserves</th>
                <th className="py-2.5 px-3">Statutory Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/40">
              {VERIFIED_MINES_OVERVIEW.map((m, i) => (
                <tr key={i} className="hover:bg-[#152235]/30">
                  <td className="py-2.5 px-3 font-bold text-white">{m.name}</td>
                  <td className="py-2.5 px-3 text-[#9BAFC1]">{m.state}</td>
                  <td className="py-2.5 px-3">{m.type}</td>
                  <td className="py-2.5 px-3 font-bold text-[#54D8E8]">{m.grade}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#43D6A0]">{m.reserve}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#43D6A0]/15 text-[#43D6A0] border border-[#43D6A0]/30">
                      APPROVED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

