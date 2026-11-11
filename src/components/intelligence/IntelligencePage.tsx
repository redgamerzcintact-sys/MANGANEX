import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  BrainCircuit,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  ShieldCheck,
  TrendingUp,
  FileCode,
  Cpu,
  RefreshCw,
  GitBranch,
  Database,
  BarChart3,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const IntelligencePage: React.FC = () => {
  const { selectedMine } = useAppStore();
  const [forecastData, setForecastData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchForecast = async () => {
      setLoading(true);
      const res = await api.getProductionForecast(selectedMine.id, 30);
      if (active) {
        setForecastData(res);
        setLoading(false);
      }
    };
    fetchForecast();
    return () => { active = false; };
  }, [selectedMine.id]);

  // Model Registry Metadata
  const modelRegistry = [
    {
      name: 'Prospectivity Ensemble (MANGANEX-GEO-v4.8)',
      type: 'RandomForest + XGBoost Stacking',
      target: 'Blind Mn Mineral Suitability Index',
      trainingSamples: '500 labeled drill/structural samples',
      metrics: { aucRoc: 0.942, f1: 0.891, precision: 0.912 },
      status: 'PRODUCTION DEPLOYED',
      freshness: 'Daily Sentinel-2 Pass Sync'
    },
    {
      name: 'Hydro-Mechanical Production Forecaster',
      type: 'GradientBoosting Regressor + SARIMA Residuals',
      target: '30-Day TPD Output & Sump Inflow Loss',
      trainingSamples: '90-Day Telemetry Stream (2,187 Records)',
      metrics: { r2: 0.914, maeTonnes: 42.5, mapePercent: 4.8 },
      status: 'PRODUCTION DEPLOYED',
      freshness: 'Sub-Hourly Scada Link'
    },
    {
      name: 'OR-Tools Mixed-Integer Allocation Engine',
      type: 'Google OR-Tools SCIP MIP Solver',
      target: 'Multi-Stope Heavy Loader Dispatch',
      trainingSamples: 'Deterministic Linear Constraints',
      metrics: { solveTimeMs: 14, optimalityGap: '0.00%', satisfiedConstraints: '100%' },
      status: 'ONLINE SOLVER',
      freshness: 'Real-Time Re-solve'
    }
  ];

  const featureImportance = forecastData?.shap_contributions ? (
    forecastData.shap_contributions.map((s: any) => ({
      feature: s.label || s.feature,
      impact: s.importance / 100,
      color: '#54D8E8'
    }))
  ) : [
    { feature: 'Landsat-9 SWIR Hydrothermal Band Ratio', impact: 0.34, color: '#54D8E8' },
    { feature: 'Ground Magnetic Contact Gradient', impact: 0.28, color: '#A78BFA' },
    { feature: 'Anticlinal Fold Axial Plane Tracing', impact: 0.22, color: '#43D6A0' },
    { feature: 'Diamond Core Assay Historical Proximity', impact: 0.16, color: '#F4B860' }
  ];

  return (
    <div className="flex h-full w-full overflow-y-auto bg-[#060911] text-[#F2F6FA] p-6 space-y-6 select-none font-sans">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-[#A78BFA]" />
              <h1 className="font-heading font-bold text-lg text-[#F2F6FA]">
                AI Model Observatory & Scientific Explainability
              </h1>
            </div>
            <p className="text-xs font-mono text-[#9BAFC1] mt-0.5">
              Transparent Model Registry, SHAP Feature Attribution & Uncertainty Provenance for {selectedMine.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-[#A78BFA]/20 text-[#A78BFA] text-xs font-mono font-bold border border-[#A78BFA]/40 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5" />
              SHAP INTERPRETER v4.8
            </span>
          </div>
        </div>

        {/* MODEL REGISTRY CARDS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {modelRegistry.map((mod, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#101B2A] border border-[#1C3045] space-y-3 font-mono text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] text-[#54D8E8] font-bold">MODEL #{i + 1}</div>
                  <h3 className="font-heading font-bold text-sm text-[#F2F6FA] mt-0.5">{mod.name}</h3>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#43D6A0]/20 text-[#43D6A0] border border-[#43D6A0]/40">
                  {mod.status}
                </span>
              </div>

              <div className="space-y-1 text-[11px] text-[#9BAFC1]">
                <div><b>Type:</b> {mod.type}</div>
                <div><b>Target:</b> {mod.target}</div>
                <div><b>Dataset:</b> {mod.trainingSamples}</div>
                <div><b>Freshness:</b> {mod.freshness}</div>
              </div>

              <div className="p-2.5 rounded bg-[#090D16] border border-[#1C3045] grid grid-cols-2 gap-2 text-[10px]">
                {Object.entries(mod.metrics).map(([k, v]) => (
                  <div key={k}>
                    <span className="text-[#9BAFC1] uppercase">{k}:</span>
                    <div className="font-bold text-[#54D8E8]">{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SHAP FEATURE IMPORTANCE CHART */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div className="flex items-center justify-between mb-4">
            <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#54D8E8]" />
              Relative Feature Importance (Manganese Prospectivity & Production Forecaster)
            </span>
            <span className="text-xs font-mono text-[#9BAFC1]">SHAP Contribution Weights (0 - 1.0)</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={featureImportance} margin={{ top: 5, right: 30, left: 160, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C3045" />
                <XAxis type="number" domain={[0, 0.45]} stroke="#9BAFC1" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" width={160} stroke="#9BAFC1" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1C3045', fontSize: 12 }} />
                <Bar dataKey="impact" fill="#54D8E8" radius={[0, 4, 4, 0]} name="SHAP Attribution" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIGNATURE FEATURE: THE TRUST LENS */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1C3045]">
            <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#43D6A0]" />
              THE TRUST LENS — SCIENTIFIC PROVENANCE & UNCERTAINTY AUDIT
            </span>
            <span className="text-xs font-mono text-[#43D6A0]">RESPONSIBLE AI PROTOCOL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {/* Box 1: Observed */}
            <div className="p-4 rounded-lg bg-[#090D16] border border-[#43D6A0]/40 space-y-2">
              <span className="text-[#43D6A0] font-bold text-sm flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                1. Observed Ground Truth
              </span>
              <p className="text-[#F2F6FA]/90 text-[11px] leading-relaxed">
                4 wireline diamond drill cores (BH-BG series) drilled by MOIL and GSI between 2022-2024 with certified laboratory XRF assays.
              </p>
              <div className="text-[10px] text-[#43D6A0]">Confidence Level: 98% (Measured)</div>
            </div>

            {/* Box 2: Interpolated */}
            <div className="p-4 rounded-lg bg-[#090D16] border border-[#54D8E8]/40 space-y-2">
              <span className="text-[#54D8E8] font-bold text-sm flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                2. Model-Interpolated
              </span>
              <p className="text-[#F2F6FA]/90 text-[11px] leading-relaxed">
                Ordinary Kriging 3D block model estimating Braunite reef thickness between drillholes with 85m search ellipsoids.
              </p>
              <div className="text-[10px] text-[#54D8E8]">Confidence Level: 84% (Interpolated)</div>
            </div>

            {/* Box 3: Model Inferred */}
            <div className="p-4 rounded-lg bg-[#090D16] border border-[#A78BFA]/40 space-y-2">
              <span className="text-[#A78BFA] font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                3. Model Inferred AI
              </span>
              <p className="text-[#F2F6FA]/90 text-[11px] leading-relaxed">
                Deep learning fold axial continuation predicting hidden blind orebody plunging 2.8 km eastward under quartzite cap.
              </p>
              <div className="text-[10px] text-[#A78BFA]">Confidence Level: 71% (Inferred)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
