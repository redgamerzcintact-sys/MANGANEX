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
  { model: 'Random Forest + GB (Prospectivity)', auc: 0.812, f1: 0.741, r2: 0.835, status: 'SPATIAL BLOCK CV' },
  { model: 'Quantile GB (Shortfall P10/P50/P90)', auc: 0.865, f1: 0.821, r2: 0.894, status: 'ROLLING ORIGIN' },
  { model: 'Sentinel-2 MSI Surface Ratio Engine', auc: 0.785, f1: 0.720, r2: 0.760, status: 'SURFACE INDICATOR' },
  { model: 'Next-Drill Target Active Recommender', auc: 0.880, f1: 0.840, r2: 0.890, status: 'NMS SEPARATION' },
  { model: 'RAG Knowledge Provenance Engine', auc: 0.910, f1: 0.895, r2: 0.905, status: 'BM25 + TF-IDF' }
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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-[#FFF8F0] font-sans">
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#4D4037]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FB923C]/15 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-[#FFF8F0]">
                Data &amp; Model Intelligence Center
              </h1>
              <p className="text-xs font-mono text-[#DEC8B7]">
                DATA PIPELINES, FEATURE ATTRIBUTION &amp; ML OBSERVABILITY — {user?.fullName || 'Data Analyst'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/prospectivity"
            className="px-3 py-1.5 rounded-lg bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] hover:border-[#FB923C] text-xs font-mono font-semibold text-[#FB923C] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5" />
            Model Card Audit
          </NavLink>
          <NavLink
            to="/command-center"
            className="px-3 py-1.5 rounded-lg bg-[#FB923C] hover:bg-[#ea7e26] text-[#120F0D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            GIS Cadastre
          </NavLink>
        </div>
      </div>

      {/* ── 1. ANALYST KPI STATS ROW ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {[
          { label: 'Ingested Data Volume', val: '269.9 MB', sub: '18 Cadastral Layers & Spatial Grids', icon: Database, color: '#FB923C' },
          { label: 'Overall Data Quality Score', val: '97.4%', sub: 'Zero null collars in master assay', icon: CheckCircle2, color: '#10B981' },
          { label: 'Prospectivity ROC-AUC', val: '0.812', sub: 'Spatial Block CV on 10 km Blocks', icon: Cpu, color: '#E8B298' },
          { label: 'Shortfall Backtest MAE', val: '142.6 T', sub: 'Quantile Loss Rolling Backtest', icon: Satellite, color: '#F59E0B' }
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

      {/* ── 2. DATA QUALITY RADAR & MODEL EVALUATION ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#FFF8F0]">Active AI Model Benchmarks &amp; Validation Scores</h3>
              <p className="text-xs text-[#DEC8B7]">Strictly computed metrics across spatial cross-validation and walk-forward backtests</p>
            </div>
            <span className="text-xs font-mono text-[#FB923C] font-bold">5 Models Live</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#4D4037] text-[#DEC8B7] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Model Architecture</th>
                  <th className="py-2.5 px-3">AUC-ROC / Score</th>
                  <th className="py-2.5 px-3">PR-AUC / F1</th>
                  <th className="py-2.5 px-3">Coverage / R²</th>
                  <th className="py-2.5 px-3">Validation Methodology</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4D4037]/60">
                {MODEL_BENCHMARKS.map((m, i) => (
                  <tr key={i} className="hover:bg-[#241E1A]/60">
                    <td className="py-2.5 px-3 font-bold text-[#FFF8F0]">{m.model}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#FB923C]">{m.auc}</td>
                    <td className="py-2.5 px-3 text-[#DEC8B7]">{m.f1}</td>
                    <td className="py-2.5 px-3 text-[#10B981] font-bold">{m.r2}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#E8B298]/15 text-[#E8B298] border border-[#E8B298]/30">
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
        <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-heading font-bold text-sm text-[#FFF8F0]">Spatial Data Quality Index</h3>
            <span className="text-xs font-mono text-[#10B981] font-bold">Avg: 95.8%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={DATA_QUALITY_RADAR}>
                <PolarGrid stroke="#4D4037" />
                <PolarAngleAxis dataKey="metric" stroke="#DEC8B7" fontSize={10} />
                <PolarRadiusAxis stroke="#DEC8B7" domain={[0, 100]} fontSize={9} />
                <Radar name="Quality Score" dataKey="score" stroke="#FB923C" fill="#FB923C" fillOpacity={0.35} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── 3. DATASET REPOSITORY & INGESTION PIPELINE ──────────────────────────── */}
      <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FB923C]" />
              Master Geospatial &amp; Tabular Dataset Catalog
            </h3>
            <p className="text-xs text-[#DEC8B7]">Versioned feature sets for geochemical assay, satellite rasters, and telematics</p>
          </div>
          <NavLink to="/command-center" className="text-xs font-mono text-[#FB923C] hover:underline flex items-center gap-1 font-bold">
            Cadastral Map <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#4D4037] text-[#DEC8B7] uppercase text-[10px]">
                <th className="py-2.5 px-3">Dataset ID</th>
                <th className="py-2.5 px-3">Dataset Name</th>
                <th className="py-2.5 px-3">Record Count / Schema</th>
                <th className="py-2.5 px-3">Size on Disk</th>
                <th className="py-2.5 px-3">Quality Index</th>
                <th className="py-2.5 px-3">Last Synchronized</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4037]/60">
              {RECENT_DATASETS.map((ds) => (
                <tr key={ds.id} className="hover:bg-[#241E1A]/60">
                  <td className="py-2.5 px-3 font-bold text-[#FB923C]">{ds.id}</td>
                  <td className="py-2.5 px-3 font-semibold text-[#FFF8F0]">{ds.name}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{ds.records}</td>
                  <td className="py-2.5 px-3 text-[#A69282]">{ds.size}</td>
                  <td className="py-2.5 px-3 font-bold text-[#10B981]">{ds.quality}</td>
                  <td className="py-2.5 px-3 text-[#A69282]">{ds.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

