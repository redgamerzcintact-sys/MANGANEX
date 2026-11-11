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
  const isDark = theme === 'dark';

  const [systemStatus, setSystemStatus] = useState<any>({
    javaBackend: 'ONLINE (Port 8080)',
    pythonAI: 'ONLINE (Port 8000)',
    database: 'CONNECTED (PostgreSQL/H2)',
    spatialIndex: 'READY (PostGIS)',
    ragStatus: 'ACTIVE (4 Docs Index)'
  });

  return (
    <div className={`p-6 space-y-6 max-w-7xl mx-auto ${isDark ? 'text-[#F2F6FA]' : 'text-[#172333]'}`}>
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C3045]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#54D8E8]/15 border border-[#54D8E8]/40 flex items-center justify-center text-[#54D8E8]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Platform Control Center
              </h1>
              <p className="text-xs font-mono text-[#657A90]">
                ENTERPRISE GOVERNANCE & SECURITY AUDIT — {user?.fullName || 'Administrator'} ({user?.organization || 'MOIL Limited'})
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-[#43D6A0]/15 border border-[#43D6A0]/30 text-[#43D6A0] text-xs font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#43D6A0] animate-pulse" />
            ALL ENGINES OPERATIONAL
          </span>
          <NavLink
            to="/admin/users"
            className="px-3 py-1.5 rounded-lg bg-[#54D8E8] hover:bg-[#38b2c2] text-[#080C12] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            Manage Users
          </NavLink>
        </div>
      </div>

      {/* ── 1. KPI STATS ROW ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Mines Monitored', val: '5 Concessions', sub: 'Balaghat, Dongri, Chikla, Ukwa, Munsar', icon: Server, color: '#54D8E8' },
          { label: 'Registered Enterprise Users', val: '5 Active Roles', sub: 'Zero security policy violations', icon: Users, color: '#A78BFA' },
          { label: 'AI Intelligence Engines', val: '5 ML Models', sub: 'XGBoost, RF, SARIMA, SCIP, RAG', icon: Cpu, color: '#F4B860' },
          { label: 'Spatial Datasets Indexed', val: '18 Geopackages', sub: 'Boreholes, UNFC, Faults, Sentinel-2', icon: Database, color: '#43D6A0' }
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

      {/* ── 2. SYSTEM TELEMETRY & GATEWAYS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm">Enterprise API Traffic & Ingestion Latency</h3>
              <p className="text-xs text-[#657A90]">Real-time request throughput across Java and Python microservices</p>
            </div>
            <span className="text-xs font-mono text-[#54D8E8]">Mean: 34ms</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PLATFORM_TRAFFIC_DATA}>
                <defs>
                  <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#54D8E8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#54D8E8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1C3045' : '#E2E8F0'} />
                <XAxis dataKey="hour" stroke="#657A90" fontSize={11} />
                <YAxis stroke="#657A90" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#090D16' : '#FFFFFF',
                    borderColor: '#1C3045',
                    borderRadius: 8
                  }}
                />
                <Area type="monotone" dataKey="requests" stroke="#54D8E8" strokeWidth={2} fill="url(#reqGrad)" name="Requests/min" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Microservice Gateway Health Matrix */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <h3 className="font-heading font-bold text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-[#54D8E8]" />
            Gateway Health Matrix
          </h3>

          <div className="space-y-3">
            {[
              { name: 'Java Spring Boot Core (8080)', status: 'HEALTHY', ping: '12ms', color: '#43D6A0' },
              { name: 'Python AI Engine (8000)', status: 'HEALTHY', ping: '18ms', color: '#43D6A0' },
              { name: 'PostgreSQL / PostGIS Spatial DB', status: 'CONNECTED', ping: '4ms', color: '#43D6A0' },
              { name: 'Vite Frontend Web Server (3000)', status: 'SERVING', ping: '2ms', color: '#54D8E8' },
              { name: 'Copernicus Sentinel-2 Client', status: 'POLLING', ping: '120ms', color: '#F4B860' },
              { name: 'NEXUS Vector Knowledge Base', status: 'SYNCHRONIZED', ping: '8ms', color: '#43D6A0' }
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#152235]/40 border border-[#1C3045]/60 text-xs font-mono">
                <div>
                  <div className="font-semibold text-white">{node.name}</div>
                  <div className="text-[10px] text-[#657A90]">Latency: {node.ping}</div>
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
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F4B860]" />
              Immutable Platform Audit Log
            </h3>
            <p className="text-xs text-[#657A90]">Security and administrative access events across Ministry of Steel network</p>
          </div>
          <span className="text-xs font-mono text-[#657A90]">ISO-27001 Compliance Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/40">
              {AUDIT_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-[#152235]/30">
                  <td className="py-2.5 px-3 font-bold text-[#54D8E8]">{log.id}</td>
                  <td className="py-2.5 px-3">{log.user}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{log.action}</td>
                  <td className="py-2.5 px-3 text-[#9BAFC1]">{log.target}</td>
                  <td className="py-2.5 px-3 text-[#657A90]">{log.ip}</td>
                  <td className="py-2.5 px-3 text-[#657A90]">{log.time}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#43D6A0]/15 text-[#43D6A0] border border-[#43D6A0]/30">
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

