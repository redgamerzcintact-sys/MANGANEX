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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-[#FFF8F0] font-sans">
      {/* ── READ-ONLY SECURITY NOTICE BANNER ───────────────────────────────────── */}
      <div className="p-3.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-between gap-3 text-xs font-mono shadow-sm">
        <div className="flex items-center gap-2 text-[#10B981]">
          <Eye className="w-4 h-4 shrink-0" />
          <span>
            <strong>READ-ONLY EXECUTIVE CLEARANCE:</strong> You have authorized observation access to platform telemetry, verified geological datasets, and published executive reports. Data mutation, model retraining, and administrative controls are restricted.
          </span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold text-[10px] shrink-0 border border-[#10B981]/40">
          CLEARANCE: VIEWER
        </span>
      </div>

      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#4D4037]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FB923C]/15 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-[#FFF8F0]">
                Executive Mineral Observatory
              </h1>
              <p className="text-xs font-mono text-[#DEC8B7]">
                READ-ONLY INTELLIGENCE &amp; PRODUCTION BRIEFINGS — {user?.fullName || 'Executive Observer'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/reports"
            className="px-3 py-1.5 rounded-lg bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] hover:border-[#FB923C] text-xs font-mono font-semibold text-[#FB923C] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Approved Reports
          </NavLink>
          <NavLink
            to="/command-center"
            className="px-3 py-1.5 rounded-lg bg-[#FB923C] hover:bg-[#ea7e26] text-[#120F0D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            Cadastral GIS Map
          </NavLink>
        </div>
      </div>

      {/* ── 1. VIEWER KPI STATS ROW ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {[
          { label: 'Total Verified Reserves', val: '78.5 Mt', sub: 'Average In-Situ Grade 42.8% Mn', icon: Layers, color: '#FB923C' },
          { label: 'YTD Finished Production', val: '93,300 T', sub: '97.2% of FY-2026 Target Achieved', icon: Activity, color: '#10B981' },
          { label: 'Monitored Concessions', val: '7 Mines', sub: 'Madhya Pradesh & Maharashtra', icon: Compass, color: '#E8B298' },
          { label: 'Environmental Compliance', val: '100% Certified', sub: 'Zero active DGMS statutory notices', icon: ShieldCheck, color: '#F59E0B' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl border bg-[#1A1613] border-[#4D4037] shadow-sm hover:border-[#FB923C]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#DEC8B7] uppercase">{stat.label}</span>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-xl font-bold font-heading text-[#FFF8F0] mt-2">{stat.val}</div>
              <div className="text-[11px] text-[#A69282] mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── 2. PRODUCTION SUMMARY & HIGH-LEVEL TRENDS ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#FFF8F0]">Monthly Ore Extraction vs National Demand Target</h3>
              <p className="text-xs text-[#DEC8B7]">Consolidated extraction tonnage across MOIL operating concessions</p>
            </div>
            <span className="text-xs font-mono text-[#10B981] font-bold">Published Metric</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EXECUTIVE_PRODUCTION_DATA}>
                <defs>
                  <linearGradient id="tonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4D4037" />
                <XAxis dataKey="month" stroke="#DEC8B7" fontSize={11} />
                <YAxis stroke="#DEC8B7" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#120F0D',
                    borderColor: '#4D4037',
                    borderRadius: 8,
                    color: '#FFF8F0'
                  }}
                />
                <Area type="monotone" dataKey="tonnes" stroke="#FB923C" strokeWidth={2.5} fill="url(#tonGrad)" name="Ore Extracted (T)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Intelligence Highlights */}
        <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FB923C]" />
            Executive Intelligence Highlights
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {[
              { title: 'Balaghat Deep Winze Shaft', note: 'Shaft deepening to -300m level has intersected high-grade 46.5% Mn ore reef.' },
              { title: 'Dongri Buzurg Beneficiation', note: 'Heavy Media Separation (HMS) plant achieved verified high recovery efficiency.' },
              { title: 'Sauser Belt Exploration', note: 'GSI joint core exploration confirmed 6.4 Mt extension under UNFC-122 category.' }
            ].map((h, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-[#241E1A] border border-[#4D4037]">
                <div className="font-semibold text-[#FFF8F0]">{h.title}</div>
                <div className="text-[11px] text-[#DEC8B7] mt-0.5">{h.note}</div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <NavLink
              to="/nexus"
              className="w-full py-2.5 px-3 rounded-xl bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] hover:border-[#FB923C] text-xs font-mono text-[#FB923C] flex items-center justify-between transition-colors shadow-sm font-bold"
            >
              <span>Consult NEXUS AI Copilot</span>
              <BrainCircuit className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── 3. APPROVED MINE ASSET REGISTER ─────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#F59E0B]" />
              Approved Concessions &amp; Mining Lease Register
            </h3>
            <p className="text-xs text-[#DEC8B7]">Verified statutory mining lease boundaries, reserve estimations, and mineral grades</p>
          </div>
          <span className="text-xs font-mono text-[#10B981] font-bold">IBM Certified Data</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#4D4037] text-[#DEC8B7] uppercase text-[10px]">
                <th className="py-2.5 px-3">Concession Name</th>
                <th className="py-2.5 px-3">Jurisdiction</th>
                <th className="py-2.5 px-3">Mine Type</th>
                <th className="py-2.5 px-3">Average In-Situ Grade</th>
                <th className="py-2.5 px-3">Measured Reserves</th>
                <th className="py-2.5 px-3">Statutory Clearance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4037]/60">
              {VERIFIED_MINES_OVERVIEW.map((m, i) => (
                <tr key={i} className="hover:bg-[#241E1A]/60">
                  <td className="py-2.5 px-3 font-bold text-[#FFF8F0]">{m.name}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{m.state}</td>
                  <td className="py-2.5 px-3 text-[#A69282]">{m.type}</td>
                  <td className="py-2.5 px-3 font-bold text-[#FB923C]">{m.grade}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#10B981]">{m.reserve}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
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

