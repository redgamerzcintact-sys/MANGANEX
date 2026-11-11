import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { PROSPECTS_DATA } from '../../data/demoData';
import { GeologicalProspect } from '../../types';
import { api } from '../../services/api';
import {
  Flame,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Search,
  Sliders,
  ChevronRight,
  GitCompare,
  TrendingUp,
  FileText,
  Shield,
  Activity,
  Cpu,
  RefreshCw
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const ExplorationPage: React.FC = () => {
  const [selectedProspect, setSelectedProspect] = useState<GeologicalProspect>(PROSPECTS_DATA[0]);
  const [compareProspect, setCompareProspect] = useState<GeologicalProspect | null>(null);
  const [filterRegion, setFilterRegion] = useState<string>('All');
  const [aiExplanation, setAiExplanation] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Fetch ML explanation from backend when prospect changes
  useEffect(() => {
    let active = true;
    const fetchExplanation = async () => {
      setLoadingAi(true);
      const res = await api.explainProspect(selectedProspect.id);
      if (active) {
        setAiExplanation(res);
        setLoadingAi(false);
      }
    };
    fetchExplanation();
    return () => { active = false; };
  }, [selectedProspect.id]);

  // Format radar data for Prospect DNA
  const radarData = [
    { subject: 'Geology', A: selectedProspect.radarMetrics.geological, fullMark: 100 },
    { subject: 'Structure', A: selectedProspect.radarMetrics.structural, fullMark: 100 },
    { subject: 'Satellite', A: selectedProspect.radarMetrics.satellite, fullMark: 100 },
    { subject: 'Borehole', A: selectedProspect.radarMetrics.borehole, fullMark: 100 },
    { subject: 'Completeness', A: selectedProspect.radarMetrics.completeness, fullMark: 100 },
    { subject: 'Confidence', A: selectedProspect.radarMetrics.confidence, fullMark: 100 }
  ];

  // Convert SHAP contributions for horizontal bar chart
  const shapData = aiExplanation?.shap_contributions ? (
    Array.isArray(aiExplanation.shap_contributions)
      ? aiExplanation.shap_contributions.map((s: any) => ({
          name: s.label || s.feature,
          contribution: s.contribution
        }))
      : Object.entries(aiExplanation.shap_contributions).map(([k, v]) => ({
          name: k,
          contribution: typeof v === 'number' ? Math.round(v * 100) : v
        }))
  ) : [
    { name: 'SWIR Hydrothermal Alteration', contribution: 35 },
    { name: 'Anticlinal Fold Integrity', contribution: 30 },
    { name: 'Ground Magnetic Gradient', contribution: 20 },
    { name: 'Core Assay Proximity', contribution: 15 }
  ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#060911] text-[#F2F6FA] select-none font-sans">
      {/* LEFT COLUMN: Prospect List & Filtration */}
      <div className="w-[340px] h-full border-r border-[#1C3045] bg-[#090D16] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1C3045] bg-[#0B0F19]">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#A78BFA]" />
            <h1 className="font-heading font-bold text-base text-[#F2F6FA]">
              Manganese Exploration
            </h1>
          </div>
          <p className="text-xs text-[#9BAFC1] mt-0.5 font-mono">
            AI Multi-Spectral & Structural Prospect Discovery
          </p>

          {/* Region Filter */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto text-xs no-scrollbar">
            {['All', 'Balaghat-Bhandara Belt', 'Nagpur Manganese Zone'].map((reg) => (
              <button
                key={reg}
                onClick={() => setFilterRegion(reg)}
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-mono whitespace-nowrap transition-colors ${
                  filterRegion === reg
                    ? 'bg-[#A78BFA] text-[#060911] font-bold shadow-[0_0_8px_rgba(167,139,250,0.3)]'
                    : 'bg-[#101B2A] text-[#9BAFC1] hover:text-[#F2F6FA] border border-[#1C3045]'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>

        {/* Prospect List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {PROSPECTS_DATA.filter((p) => filterRegion === 'All' || p.region === filterRegion).map((p) => {
            const isSelected = p.id === selectedProspect.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProspect(p)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#101B2A] border-[#A78BFA] shadow-[0_0_15px_rgba(167,139,250,0.2)]'
                    : 'bg-[#090D16] border-[#1C3045] hover:border-[#A78BFA]/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-sm text-[#F2F6FA]">{p.name}</h3>
                    <p className="text-[11px] text-[#9BAFC1] font-mono">{p.region}, {p.state}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-mono font-bold text-[#A78BFA]">
                      {p.prospectivityScore}%
                    </span>
                    <span className="text-[9px] font-mono text-[#9BAFC1]">PROSPECTIVITY</span>
                  </div>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-[#1C3045] pt-2 text-[#9BAFC1]">
                  <span>Potential: <b className="text-[#43D6A0]">{p.estimatedTonnagePotentialMt} MT</b></span>
                  <span>Depth: <b className="text-[#F2F6FA]">{p.depthMetersEstimated[0]}-{p.depthMetersEstimated[1]}m</b></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT MAIN WORKSPACE: PROSPECT DNA & EVIDENCE TRACE */}
      <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">
        {/* Top Header Card */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-[#A78BFA]/20 text-[#A78BFA] text-xs font-mono font-bold border border-[#A78BFA]/30">
                {selectedProspect.unfcStatus}
              </span>
              <span className="text-xs font-mono text-[#43D6A0]">
                {selectedProspect.validationPriority}
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold text-[#F2F6FA] mt-1">
              {selectedProspect.name}
            </h2>
            <p className="text-xs text-[#9BAFC1] font-mono mt-0.5">
              Coordinates: {selectedProspect.coordinates[0].toFixed(4)}°N, {selectedProspect.coordinates[1].toFixed(4)}°E | Primary Lithology: {selectedProspect.primaryLithology}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setCompareProspect(compareProspect ? null : PROSPECTS_DATA[1])}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#1C3045] bg-[#090D16] text-xs font-mono text-[#9BAFC1] hover:text-[#54D8E8] hover:border-[#54D8E8]/40 transition-colors"
            >
              <GitCompare className="h-4 w-4" />
              <span>{compareProspect ? 'CLOSE COMPARISON' : 'COMPARE PROSPECTS'}</span>
            </button>

            <div className="p-3 rounded-lg bg-[#090D16] border border-[#1C3045] text-center">
              <div className="text-xs font-mono text-[#9BAFC1]">CONFIDENCE</div>
              <div className="text-lg font-heading font-bold text-[#43D6A0]">
                {selectedProspect.confidenceScore}%
              </div>
            </div>
          </div>
        </div>

        {/* PROSPECT DNA (RADAR FINGERPRINT) & EVIDENCE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Visual Fingerprint: Radar Chart */}
          <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045] flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#A78BFA]" />
                PROSPECT DNA FINGERPRINT
              </span>
              <span className="text-[11px] font-mono text-[#9BAFC1]">Multimodal Compatibility</span>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1C3045" />
                  <PolarAngleAxis dataKey="subject" stroke="#9BAFC1" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#1C3045" />
                  <Radar
                    name="Prospect DNA"
                    dataKey="A"
                    stroke="#A78BFA"
                    fill="#A78BFA"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="text-xs font-mono text-[#9BAFC1] text-center mt-2">
              Every vertex represents fused geological, satellite, and geophysical compatibility indicators.
            </div>
          </div>

          {/* Evidence Trace List */}
          <div className="p-5 rounded-xl bg-[#101925] border border-[#1C3045] flex flex-col justify-between">
            <div>
              <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-[#54D8E8]" />
                EVIDENCE TRACE & VALIDATION TRAIL
              </span>

              <div className="space-y-2.5">
                {selectedProspect.surfaceIndicators.map((ind, i) => (
                  <div key={i} className="p-3 rounded-lg bg-[#090D16] border border-[#1C3045] text-xs">
                    <div className="flex items-center gap-2 text-[#54D8E8] font-semibold mb-1 font-mono">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#43D6A0]" />
                      <span>OBSERVATION #{i + 1}</span>
                    </div>
                    <p className="text-[#F2F6FA]/90">{ind}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-lg bg-[#A78BFA]/10 border border-[#A78BFA]/30 text-xs font-mono">
              <span className="text-[#A78BFA] font-bold">RECOMMENDED EXPEDITION ACTION:</span>
              <p className="text-[#F2F6FA] mt-1">{selectedProspect.recommendedAction}</p>
            </div>
          </div>
        </div>

        {/* SHAP EXPLAINABILITY PANEL (Direct from ML Backend) */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045] space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C3045]">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#54D8E8]" />
              <span className="font-heading font-bold text-sm text-[#F2F6FA]">
                XGBoost + Random Forest Feature Attribution (SHAP Analysis)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {loadingAi && <RefreshCw className="h-3.5 w-3.5 text-[#54D8E8] animate-spin" />}
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#54D8E8]/10 text-[#54D8E8] border border-[#54D8E8]/30">
                BACKEND ML ENGINE
              </span>
            </div>
          </div>

          <p className="text-xs text-[#9BAFC1] leading-relaxed">
            {aiExplanation?.scientific_rationale ||
              "High SWIR hydrothermal alteration matching the Mansar Gondite bedded horizon indicates strong structural conformity along the regional strike plunge."}
          </p>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 140, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C3045" />
                <XAxis type="number" stroke="#9BAFC1" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#9BAFC1" tick={{ fontSize: 10 }} width={130} />
                <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1C3045', fontSize: 11 }} />
                <Bar dataKey="contribution" fill="#54D8E8" radius={[0, 4, 4, 0]} name="SHAP Impact %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[10px] font-mono text-[#F4B860] p-2.5 rounded bg-[#F4B860]/10 border border-[#F4B860]/20">
            ⚠️ <b>Scientific Responsibility Notice:</b> Prospectivity score ({selectedProspect.prospectivityScore}%) reflects geological suitability only. It is NOT proof of an economic underground reserve (UNFC 111). Confirmation requires diamond wireline drilling, core recovery, and chemical assay.
          </div>
        </div>

        {/* SIDE-BY-SIDE PROSPECT COMPARISON (If Active) */}
        {compareProspect && (
          <div className="p-5 rounded-xl bg-[#090D16] border border-[#54D8E8]/40 shadow-2xl">
            <h3 className="font-heading font-bold text-base text-[#F2F6FA] mb-4">
              Side-by-Side Geological Comparison: {selectedProspect.name} vs {compareProspect.name}
            </h3>

            <div className="grid grid-cols-2 gap-6 text-xs font-mono">
              <div className="p-4 rounded-lg bg-[#101B2A] border border-[#1C3045]">
                <h4 className="font-bold text-[#A78BFA] text-sm">{selectedProspect.name}</h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between border-b border-[#1C3045] pb-1">
                    <span className="text-[#9BAFC1]">Prospectivity:</span>
                    <span className="font-bold text-[#F2F6FA]">{selectedProspect.prospectivityScore}%</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1C3045] pb-1">
                    <span className="text-[#9BAFC1]">Tonnage Potential:</span>
                    <span className="font-bold text-[#43D6A0]">{selectedProspect.estimatedTonnagePotentialMt} MT</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1C3045] pb-1">
                    <span className="text-[#9BAFC1]">Target Depth:</span>
                    <span className="font-bold text-[#F2F6FA]">{selectedProspect.depthMetersEstimated[0]}-{selectedProspect.depthMetersEstimated[1]}m</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#101B2A] border border-[#1C3045]">
                <h4 className="font-bold text-[#54D8E8] text-sm">{compareProspect.name}</h4>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between border-b border-[#1C3045] pb-1">
                    <span className="text-[#9BAFC1]">Prospectivity:</span>
                    <span className="font-bold text-[#F2F6FA]">{compareProspect.prospectivityScore}%</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1C3045] pb-1">
                    <span className="text-[#9BAFC1]">Tonnage Potential:</span>
                    <span className="font-bold text-[#43D6A0]">{compareProspect.estimatedTonnagePotentialMt} MT</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1C3045] pb-1">
                    <span className="text-[#9BAFC1]">Target Depth:</span>
                    <span className="font-bold text-[#F2F6FA]">{compareProspect.depthMetersEstimated[0]}-{compareProspect.depthMetersEstimated[1]}m</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
