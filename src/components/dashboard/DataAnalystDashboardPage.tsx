import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Layers,
  Database,
  Cpu,
  Sliders,
  BarChart3,
  TrendingUp,
  BrainCircuit,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Activity,
  Satellite
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

const MODEL_BENCHMARKS = [
  { model: 'XGBoost v4.8 (Prospectivity)', auc: 0.942, f1: 0.915, r2: 0.928, status: 'PRODUCTION' },
  { model: 'Random Forest (Shortfall)', auc: 0.918, f1: 0.892, r2: 0.932, status: 'PRODUCTION' },
  { model: 'Sentinel-2 MSI SWIR Engine', auc: 0.894, f1: 0.870, r2: 0.885, status: 'ACTIVE' },
  { model: 'OR-Tools SCIP Fleet Optimizer', auc: 0.965, f1: 0.950, r2: 0.960, status: 'PRODUCTION' },
  { model: 'RAG Dense Vector Indexer', auc: 0.955, f1: 0.940, r2: 0.948, status: 'ONLINE' }
];

const DATA_QUALITY_RADAR = [
  { metric: 'Completeness', score: 96 },
  { metric: 'Assay Precision', score: 94 },
  { metric: 'Spatial Accuracy', score: 98 },
  { metric: 'Temporal Cadence', score: 91 },
  { metric: 'Schema Integrity', score: 99 },
  { metric: 'UNFC Compliance', score: 95 }
];

const RECENT_DATASETS = [
  { id: 'DS-GEO-2026-01', name: 'Sauser_Belt_Boreholes_Assay_Master.csv', records: '142 Collars (8,420 Samples)', size: '42.8 MB', quality: '98.5%', updated: '2 hours ago' },
  { id: 'DS-SAT-2026-04', name: 'Sentinel2_MSI_Dongri_Buzurg_SWIR.tif', records: 'Band 4/8A/11/12 Raster', size: '128.4 MB', quality: '99.1%', updated: '6 hours ago' },
  { id: 'DS-OPS-2026-09', name: 'Balaghat_CANBus_Fleet_Telemetry.parquet', records: '1.2M rows (32 Fleet Units)', size: '84.1 MB', quality: '97.2%', updated: '12 hours ago' },
  { id: 'DS-ENV-2026-02', name: 'OpenMeteo_Monsoon_Precipitation.json', records: '24-Month Hourly Inflow', size: '14.6 MB', quality: '100%', updated: 'Yesterday' }
];

export const DataAnalystDashboardPage: React.FC = () => {
  const { theme } = useAppStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 space-y-6 max-w-7xl mx-auto ${isDark ? 'text-[#F2F6FA]' : 'text-[#172333]'}`}>
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C3045]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#168BFF]/15 border border-[#168BFF]/40 flex items-center justify-center text-[#168BFF]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Data & Model Intelligence Center
              </h1>
              <p className="text-xs font-mono text-[#657A90]">
                DATA PIPELINES, FEATURE ENGINEERING & ML OBSERVABILITY — {user?.fullName || 'Data Analyst'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/intelligence"
            className="px-3 py-1.5 rounded-lg bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-[#54D8E8]" />
            Model Observatory
          </NavLink>
          <NavLink
            to="/data-hub"
            className="px-3 py-1.5 rounded-lg bg-[#168BFF] hover:bg-[#0070e0] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            Dataset Explorer
          </NavLink>
        </div>
      </div>

      {/* ── 1. ANALYST KPI STATS ROW ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ingested Data Volume', val: '269.9 MB', sub: '18 Geopackages & Tabular Datasets', icon: Database, color: '#168BFF' },
          { label: 'Overall Data Quality Score', val: '97.4%', sub: 'Zero null collars in master assay', icon: CheckCircle2, color: '#43D6A0' },
          { label: 'Champion Model AUC-ROC', val: '0.942', sub: 'XGBoost v4.8 Sauser Prospectivity', icon: Cpu, color: '#54D8E8' },
          { label: 'Active Ingestion Pipeline', val: 'Automated 24h', sub: 'Copernicus Sentinel-2 + OpenMeteo', icon: Satellite, color: '#F4B860' }
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

      {/* ── 2. DATA QUALITY RADAR & MODEL EVALUATION ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm">Active AI Model Benchmarks & Validation Scores</h3>
              <p className="text-xs text-[#657A90]">AUC-ROC, F1-Score, and R² across supervised regressors and neural encoders</p>
            </div>
            <span className="text-xs font-mono text-[#168BFF]">5 Models Live</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Model Architecture</th>
                  <th className="py-2.5 px-3">AUC-ROC</th>
                  <th className="py-2.5 px-3">F1 Score</th>
                  <th className="py-2.5 px-3">R² Metric</th>
                  <th className="py-2.5 px-3">Deployment Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C3045]/40">
                {MODEL_BENCHMARKS.map((m, i) => (
                  <tr key={i} className="hover:bg-[#152235]/30">
                    <td className="py-2.5 px-3 font-bold text-white">{m.model}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#54D8E8]">{m.auc}</td>
                    <td className="py-2.5 px-3">{m.f1}</td>
                    <td className="py-2.5 px-3 text-[#43D6A0]">{m.r2}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#168BFF]/15 text-[#168BFF] border border-[#168BFF]/30">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Quality Multi-Axis Radar */}
        <div
          className={`p-5 rounded-2xl border space-y-2 ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-sm">Spatial Data Quality Index</h3>
            <span className="text-xs font-mono text-[#43D6A0]">Avg: 95.8%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={DATA_QUALITY_RADAR}>
                <PolarGrid stroke={isDark ? '#1C3045' : '#DCE4EC'} />
                <PolarAngleAxis dataKey="metric" stroke="#657A90" fontSize={10} />
                <PolarRadiusAxis stroke="#657A90" domain={[0, 100]} fontSize={9} />
                <Radar name="Quality Score" dataKey="score" stroke="#54D8E8" fill="#54D8E8" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 3. DATASET REPOSITORY & INGESTION PIPELINE ──────────────────────────── */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-[#168BFF]" />
              Master Geospatial & Tabular Dataset Catalog
            </h3>
            <p className="text-xs text-[#657A90]">Versioned feature sets for geochemical assay, satellite rasters, and telematics</p>
          </div>
          <NavLink to="/data-hub" className="text-xs font-mono text-[#54D8E8] hover:underline flex items-center gap-1">
            Open Ingestion Hub <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">Dataset ID</th>
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Record Count / Schema</th>
                <th className="py-2.5 px-3">Size on Disk</th>
                <th className="py-2.5 px-3">Quality Index</th>
                <th className="py-2.5 px-3">Last Synchronized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/40">
              {RECENT_DATASETS.map((ds) => (
                <tr key={ds.id} className="hover:bg-[#152235]/30">
                  <td className="py-2.5 px-3 font-bold text-[#168BFF]">{ds.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{ds.name}</td>
                  <td className="py-2.5 px-3 text-[#9BAFC1]">{ds.records}</td>
                  <td className="py-2.5 px-3 text-[#657A90]">{ds.size}</td>
                  <td className="py-2.5 px-3 font-bold text-[#43D6A0]">{ds.quality}</td>
                  <td className="py-2.5 px-3 text-[#657A90]">{ds.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

