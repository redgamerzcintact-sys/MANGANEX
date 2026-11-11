import React, { useState } from 'react';
import { PROSPECTS_DATA } from '../../data/demoData';
import { GeologicalProspect } from '../../types';
import {
  Cpu,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Search,
  Filter,
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export const ProspectivityPage: React.FC = () => {
  const [selectedProspect, setSelectedProspect] = useState<GeologicalProspect>(PROSPECTS_DATA[0]);

  const radarData = [
    { subject: 'Structural Fault Proximity', value: 92 },
    { subject: 'Lithology Litho-Contrast', value: 88 },
    { subject: 'Satellite Sentinel Index', value: 85 },
    { subject: 'Gravity Gradient Anomaly', value: 78 },
    { subject: 'Assay Continuity Score', value: 95 }
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C3045] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#A78BFA]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#A78BFA] uppercase">
              EXPLAINABLE MACHINE LEARNING INFERENCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            AI Prospectivity & Anomaly Ranking
          </h1>
          <p className="text-xs sm:text-sm text-[#9BAFC1] mt-0.5">
            XGBoost & Random Forest multi-layered spatial prediction models for blind manganese discovery.
          </p>
        </div>

        {/* Disclaimer Notice */}
        <div className="px-3.5 py-2 rounded-xl bg-[#F4B860]/10 border border-[#F4B860]/30 text-xs font-mono text-[#F4B860] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>SCORES INDICATE EXPLORATION POTENTIAL &bull; NOT UNFC RESERVES</span>
        </div>
      </div>

      {/* Main Grid: Zone List + Detailed Model Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ranked Prospect Zones */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-2">
            Prioritized Exploration Targets
          </h3>

          {PROSPECTS_DATA.map((prospect) => {
            const isSelected = selectedProspect.id === prospect.id;
            return (
              <div
                key={prospect.id}
                onClick={() => setSelectedProspect(prospect)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#152235] border-[#54D8E8] shadow-[0_0_15px_rgba(84,216,232,0.15)]'
                    : 'bg-[#101927] border-[#1C3045] hover:border-[#2C4866]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#54D8E8]" />
                    <span className="text-xs font-bold text-white">{prospect.name}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-[#FF6878]/15 text-[#FF6878] border border-[#FF6878]/30">
                    {prospect.prospectivityScore}% SCORE
                  </span>
                </div>

                <p className="text-[11px] text-[#9BAFC1] mb-2 leading-relaxed">
                  {prospect.primaryLithology} &bull; Lat: {prospect.coordinates[1].toFixed(3)}&deg;, Lon: {prospect.coordinates[0].toFixed(3)}&deg;
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono border-t border-[#1C3045] pt-2">
                  <span className="text-[#9BAFC1]">Est. Potential: <strong className="text-white">{prospect.estimatedTonnagePotentialMt} Mt</strong></span>
                  <span className="text-[#43D6A0]">Confidence: {prospect.confidenceScore}%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: SHAP / Feature Radar Explainability */}
        <div className="lg:col-span-7 p-6 rounded-2xl border border-[#1C3045] bg-[#101927] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#54D8E8] font-bold">
                EVIDENCE BREAKDOWN: {selectedProspect.name.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-[#43D6A0]">XGBoost v2.4</span>
            </div>
            <h3 className="font-heading font-extrabold text-xl text-white mb-2">
              Multi-Source Attribution Radar
            </h3>
            <p className="text-xs text-[#9BAFC1] mb-4">
              Geological weight distribution derived from 142 training boreholes across the Central Belt.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#1C3045" />
                  <PolarAngleAxis dataKey="subject" stroke="#9BAFC1" fontSize={10} fontFamily="monospace" />
                  <PolarRadiusAxis stroke="#657A90" fontSize={9} domain={[0, 100]} />
                  <Radar
                    name="Evidence Weight"
                    dataKey="value"
                    stroke="#54D8E8"
                    fill="#54D8E8"
                    fillOpacity={0.35}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D16',
                      border: '1px solid #1C3045',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1C3045] bg-[#090D16] p-3.5 rounded-xl border border-[#1C3045]/60 text-xs font-mono space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[#9BAFC1]">Primary Driver:</span>
              <span className="text-white font-bold">Steep synclinal fold axis contact</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9BAFC1]">Mineralogy Expectation:</span>
              <span className="text-[#54D8E8] font-bold">Pyrolusite &amp; Braunite reef</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9BAFC1]">Recommended Drilling:</span>
              <span className="text-[#43D6A0] font-bold">2 cored boreholes at -220m RL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
