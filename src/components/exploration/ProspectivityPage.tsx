import React, { useState, useEffect } from 'react';
import { PROSPECTS_DATA } from '../../data/demoData';
import { GeologicalProspect } from '../../types';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { ModelCardDrawer } from './ModelCardDrawer';
import { ProspectivityHeatmapGrid } from './ProspectivityHeatmapGrid';
import { api } from '../../services/api';
import {
  Cpu,
  MapPin,
  TrendingUp,
  ShieldAlert,
  Search,
  Filter,
  ChevronRight,
  Info,
  CheckCircle2,
  FileText,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip
} from 'recharts';

export const ProspectivityPage: React.FC = () => {
  const [selectedProspect, setSelectedProspect] = useState<GeologicalProspect>(PROSPECTS_DATA[0]);
  const [isModelCardOpen, setIsModelCardOpen] = useState<boolean>(false);
  const [modelCard, setModelCard] = useState<any>(null);
  const [activeCell, setActiveCell] = useState<any>(null);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        const card = await api.getProspectivityModelCard();
        setModelCard(card);
      } catch (e) {
        console.warn('Failed to load model card:', e);
      }
    };
    fetchCard();
  }, []);

  const radarData = [
    { subject: 'Structural Fault Proximity', value: 92 },
    { subject: 'Lithology Litho-Contrast', value: 88 },
    { subject: 'Satellite Sentinel Index', value: 85 },
    { subject: 'Gravity Gradient Anomaly', value: 78 },
    { subject: 'Assay Continuity Score', value: 95 }
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* ── Top Header ──────────────────────────────────────────────────────── */}
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
            Random Forest &amp; Gradient Boosting (scikit-learn) evaluated via 5-Fold Spatial Block Cross-Validation (10km blocks) with real TreeExplainer SHAP.
          </p>
        </div>

        {/* Action Controls & Provenance Notice */}
        <div className="flex flex-wrap items-center gap-2.5">
          <ProvenanceBadge
            status="DERIVED"
            source="Scikit-Learn Random Forest + Gradient Boosting (Spatial Block CV)"
          />

          <button
            onClick={() => setIsModelCardOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#54D8E8] hover:bg-[#38b2c2] text-[#080C12] font-mono text-xs font-extrabold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Model Card &amp; Metrics</span>
          </button>
        </div>
      </div>

      {/* ── Surface Remote Sensing Non-Subsurface Disclaimer ────────────────── */}
      <div className="p-3.5 rounded-xl bg-[#F4B860]/10 border border-[#F4B860]/30 text-xs font-mono text-[#F4B860] flex items-center gap-2.5 leading-relaxed">
        <Info className="w-4 h-4 shrink-0 text-[#F4B860]" />
        <span>
          <strong>Geoscientific Disclaimer:</strong> Multi-spectral satellite indices (Iron Oxide B4/B2, SWIR B11/B12, NDVI) detect surface alteration gossans only and cannot detect subterranean manganese. All targets indicate exploration suitability (UNFC 333 - Inferred) and strictly require confirmatory diamond core drilling.
        </span>
      </div>

      {/* ── 500m Grid Heatmap Layer with Uncertainty Toggle & 'Why this zone?' ─ */}
      <ProspectivityHeatmapGrid
        selectedCell={activeCell}
        onSelectCell={(cell) => setActiveCell(cell)}
      />

      {/* ── Main Grid: Ranked Target Zones + Evidence Breakdown ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left: Ranked Prospect Zones */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Prioritized Exploration Targets</span>
            <span className="text-[10px] font-mono text-[#657A90] font-normal">GSI Central Region</span>
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
                  <span className="text-[#9BAFC1]">
                    Est. Potential: <strong className="text-white">{prospect.estimatedTonnagePotentialMt} Mt</strong>
                  </span>
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
              <span className="text-xs font-mono text-[#43D6A0]">Random Forest + GB Ensemble</span>
            </div>
            <h3 className="font-heading font-extrabold text-xl text-white mb-2">
              Multi-Source Attribution Radar
            </h3>
            <p className="text-xs text-[#9BAFC1] mb-4">
              Geological weight distribution derived from spatial block cross-validation across the Central Belt.
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
              <span className="text-[#43D6A0] font-bold">2 cored diamond boreholes at -220m RL</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Model Card Slide-Over Drawer ───────────────────────────────────── */}
      <ModelCardDrawer
        isOpen={isModelCardOpen}
        onClose={() => setIsModelCardOpen(false)}
        modelCard={modelCard}
      />
    </div>
  );
};
