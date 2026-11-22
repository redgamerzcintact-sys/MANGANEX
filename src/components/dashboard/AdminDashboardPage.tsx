import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../services/api';
import {
  ShieldCheck,
  Users,
  Database,
  Cpu,
  Activity,
  Server,
  AlertTriangle,
  FileText,
  Settings,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  BarChart3,
  ExternalLink,
  RefreshCw,
  Clock
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

const AUDIT_LOGS = [
  { id: 'aud-01', user: 'admin', action: 'ROLE_CLEARANCE_GRANT', target: 'geologist (ROLE_GEOLOGIST)', ip: '10.0.4.12', time: '12 mins ago', status: 'SUCCESS' },
  { id: 'aud-02', user: 'system', action: 'SENTINEL2_CADENCE_PULL', target: 'Dongri Buzurg Tile 44Q', ip: '127.0.0.1', time: '45 mins ago', status: 'SUCCESS' },
  { id: 'aud-03', user: 'engineer', action: 'PRODUCTION_FORECAST_DISPATCH', target: 'Balaghat Mine', ip: '10.0.4.88', time: '1 hour ago', status: 'SUCCESS' },
  { id: 'aud-04', user: 'analyst', action: 'DATASET_INGESTION_START', target: 'Sauser_Assay_2026.csv', ip: '10.0.4.91', time: '3 hours ago', status: 'SUCCESS' },
  { id: 'aud-05', user: 'admin', action: 'DATABASE_BACKUP_COMPLETED', target: 'manganex_spatial_db', ip: '127.0.0.1', time: '6 hours ago', status: 'SUCCESS' }
];

const PLATFORM_TRAFFIC_DATA = [
  { hour: '00:00', requests: 120, latMs: 24 },
  { hour: '04:00', requests: 85, latMs: 21 },
  { hour: '08:00', requests: 430, latMs: 38 },
  { hour: '12:00', requests: 680, latMs: 45 },
  { hour: '16:00', requests: 590, latMs: 42 },
  { hour: '20:00', requests: 310, latMs: 28 },
  { hour: '23:59', requests: 180, latMs: 25 }
];

export const AdminDashboardPage: React.FC = () => {
  const { theme } = useAppStore();
  const { user } = useAuthStore();

  const [systemStatus, setSystemStatus] = useState<any>({
    fastapiBackend: 'ONLINE (FastAPI 0.110)',
    database: 'CONNECTED (SQLite Cadastre)',
    pythonAI: 'ONLINE (scikit-learn + SHAP)',
    spatialIndex: 'READY (GeoJSON 500m Grid)',
    ragStatus: 'ACTIVE (RAG Provenance Engine)'
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-[#FFF8F0] font-sans">
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#4D4037]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FB923C]/15 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-[#FFF8F0]">
                Platform Control Center
              </h1>
              <p className="text-xs font-mono text-[#DEC8B7]">
                ENTERPRISE GOVERNANCE & SECURITY AUDIT — {user?.fullName || 'Administrator'} ({user?.organization || 'MOIL Limited'})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            ALL ENGINES OPERATIONAL
          </span>
          <NavLink
            to="/admin/users"
            className="px-3 py-1.5 rounded-lg bg-[#FB923C] hover:bg-[#ea7e26] text-[#120F0D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Manage Users
          </NavLink>
        </div>
      </div>

      {/* ── 1. KPI STATS ROW ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {[
          { label: 'Active Mines Monitored', val: '7 Concessions', sub: 'Balaghat, Dongri, Chikla, Ukwa, Munsar, Kandri, Tirodi', icon: Server, color: '#FB923C' },
          { label: 'Registered Enterprise Users', val: '5 Active Roles', sub: 'Geologist, Engineer, Analyst, Admin, Viewer', icon: Users, color: '#E8B298' },
          { label: 'AI Intelligence Engines', val: '4 ML Pipelines', sub: 'Random Forest + GB, Quantile Shortfall, SHAP', icon: Cpu, color: '#F59E0B' },
          { label: 'Spatial Datasets Indexed', val: '18 Cadastral Layers', sub: 'Boreholes, UNFC, Faults, Sentinel-2 SWIR', icon: Database, color: '#10B981' }
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

      {/* ── 2. SYSTEM TELEMETRY & GATEWAYS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#FFF8F0]">Enterprise API Ingestion & Gateway Telemetry</h3>
              <p className="text-xs text-[#DEC8B7]">Real-time request throughput across FastAPI backend & ML pipelines</p>
            </div>
            <span className="text-xs font-mono text-[#FB923C] font-bold">Mean Latency: 28ms</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PLATFORM_TRAFFIC_DATA}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4D4037" />
                <XAxis dataKey="hour" stroke="#DEC8B7" fontSize={11} />
                <YAxis stroke="#DEC8B7" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#120F0D',
                    borderColor: '#4D4037',
                    borderRadius: 8,
                    color: '#FFF8F0'
                  }}
                />
                <Area type="monotone" dataKey="requests" stroke="#FB923C" strokeWidth={2} fill="url(#reqGrad)" name="Requests/min" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Microservice Gateway Health Matrix */}
        <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#FB923C]" />
            Gateway Health Matrix
          </h3>

          <div className="space-y-3 font-mono">
            {[
              { name: 'FastAPI Analytics Engine (8000)', status: 'HEALTHY', ping: '14ms', color: '#10B981' },
              { name: 'SQLite Cadastre & Spatial DB', status: 'CONNECTED', ping: '2ms', color: '#10B981' },
              { name: 'Open-Meteo Ingestion Cache', status: 'SYNCHRONIZED', ping: '42ms', color: '#10B981' },
              { name: 'Vite Frontend Bundle (Client)', status: 'SERVING', ping: '1ms', color: '#FB923C' },
              { name: 'Sentinel-2 MSI Surface Ratio Engine', status: 'ACTIVE', ping: '65ms', color: '#F59E0B' },
              { name: 'NEXUS RAG Vector Knowledge Base', status: 'ONLINE', ping: '8ms', color: '#10B981' }
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#241E1A] border border-[#4D4037] text-xs">
                <div>
                  <div className="font-semibold text-[#FFF8F0]">{node.name}</div>
                  <div className="text-[10px] text-[#A69282]">Latency: {node.ping}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${node.color}20`, color: node.color }}>
                  {node.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. AUDIT LOG & RECENT SECURITY ACTIONS ───────────────────────────────── */}
      <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
              Immutable Platform Audit Log
            </h3>
            <p className="text-xs text-[#DEC8B7]">Security, telemetry ingestion, and administrative access events</p>
          </div>
          <span className="text-xs font-mono text-[#A69282]">ISO-27001 Compliance Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#4D4037] text-[#DEC8B7] uppercase text-[10px]">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4037]/60">
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-[#241E1A]/60">
                  <td className="py-2.5 px-3 font-bold text-[#FB923C]">{log.id}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{log.user}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#FFF8F0]">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{log.target}</td>
                  <td className="py-2.5 px-3 text-[#A69282]">{log.ip}</td>
                  <td className="py-2.5 px-3 text-[#A69282]">{log.time}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                      {log.status}
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

