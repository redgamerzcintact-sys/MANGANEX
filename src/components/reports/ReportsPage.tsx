import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  Layers,
  Activity,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { selectedMine } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateReport(selectedMine.id);
      if (res) {
        setReportData(res);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[#080C12] p-6 text-[#F2F6FA] select-none">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#273747]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#54D8E8] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BAFC1]">
              INTELLIGENCE & BRIEFINGS DISPATCH
            </span>
          </div>
          <h1 className="text-xl font-heading font-bold text-[#F2F6FA] mt-1">
            Executive Mission Briefing & Decision Report
          </h1>
          <p className="text-xs text-[#9BAFC1] font-mono mt-0.5">
            Ministry of Steel & MOIL Limited // UNFC-1997 Compliance Framework
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3.5 py-2 rounded bg-[#54D8E8] hover:bg-[#54D8E8]/90 text-[#080C12] text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(84,216,232,0.25)]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'COMPILING LIVE AUDIT...' : 'GENERATE BRIEFING'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded bg-[#121D29] border border-[#273747] text-[#9BAFC1] hover:text-[#F2F6FA] text-xs font-mono transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">PRINT / EXPORT</span>
          </button>
        </div>
      </div>

      {/* Structured Document Workspace */}
      <div className="max-w-5xl mx-auto w-full mt-6 space-y-6">
        {/* Document Header Card */}
        <div className="p-6 rounded-lg bg-[#121D29] border border-[#273747] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#54D8E8]/10 to-transparent pointer-events-none" />

          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-[#273747]">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#54D8E8]/15 text-[#54D8E8] border border-[#54D8E8]/30 font-bold uppercase">
                CONFIDENTIAL // OPERATIONAL INTELLIGENCE
              </span>
              <h2 className="text-lg font-heading font-bold text-[#F2F6FA] mt-2">
                {reportData?.title || `MANGANEX EXECUTIVE BRIEFING // ${selectedMine.name.toUpperCase()}`}
              </h2>
              <div className="text-xs text-[#9BAFC1] font-mono mt-1">
                SCOPE: {reportData?.cadastreScope || `${selectedMine.district}, ${selectedMine.state} • Central India Manganese Belt`}
              </div>
            </div>

            <div className="text-right font-mono text-[11px] text-[#9BAFC1] space-y-1">
              <div>REPORT ID: <b className="text-[#F2F6FA]">{reportData?.reportId || 'MOIL-MBR-20261106-LIVE'}</b></div>
              <div>DATE: <b className="text-[#F2F6FA]">{new Date().toLocaleDateString('en-GB')}</b></div>
              <div className="text-[#43D6A0] flex items-center justify-end gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>UNFC 111/122 CERTIFIED</span>
              </div>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="mt-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BAFC1] font-semibold">
              1. EXECUTIVE OPERATIONAL AUDIT
            </span>
            <p className="mt-1 text-xs text-[#F2F6FA] leading-relaxed font-sans">
              {reportData?.executiveSummary ||
                `${selectedMine.name} is currently tracking at ${selectedMine.actualMonthlyProductionTonnes.toLocaleString()} tonnes against a monthly planned target of ${selectedMine.plannedMonthlyTargetTonnes.toLocaleString()} tonnes (${selectedMine.forecastVariancePercent}% variance). Heavy monsoon precipitation (${selectedMine.rainfallMm24h} mm/24h) has elevated underground water table seepage on deep Sub-Level 7, causing skip hoisting throughput limitations.`}
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid (Geology, Satellite, Production, Optimization) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pillar 1: Geological Prospectivity */}
          <div className="p-4 rounded-lg bg-[#121D29] border border-[#273747]">
            <div className="flex items-center justify-between pb-2 border-b border-[#273747]">
              <span className="text-xs font-mono font-bold text-[#A78BFA] flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span>GEOLOGICAL PROSPECTIVITY</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#A78BFA]/15 text-[#A78BFA] border border-[#A78BFA]/30">
                UNFC 333
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Inferred Formation:</span>
                <span className="text-[#F2F6FA] font-bold">Mansar Gondite Bed</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>AI Prospectivity Score:</span>
                <span className="text-[#A78BFA] font-bold">91.4% (Ensemble)</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Estimated Potential:</span>
                <span className="text-[#43D6A0] font-bold">14.2 Million Tonnes</span>
              </div>
              <div className="pt-2 border-t border-[#273747]/60 text-[11px] text-[#9BAFC1] font-sans">
                Exploratory diamond core wireline drilling on 200m grid intervals recommended along anticlinal fold axis.
              </div>
            </div>
          </div>

          {/* Pillar 2: Satellite Cadence */}
          <div className="p-4 rounded-lg bg-[#121D29] border border-[#273747]">
            <div className="flex items-center justify-between pb-2 border-b border-[#273747]">
              <span className="text-xs font-mono font-bold text-[#54D8E8] flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>SATELLITE & METEOROLOGY</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#54D8E8]/15 text-[#54D8E8] border border-[#54D8E8]/30">
                SENTINEL-2
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#9BAFC1]">
                <span>24h Rainfall Inflow:</span>
                <span className="text-[#F2F6FA] font-bold">{selectedMine.rainfallMm24h} mm</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Soil Moisture Saturation:</span>
                <span className="text-[#54D8E8] font-bold">88% (Runoff Plume)</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Inundation Exposure:</span>
                <span className="text-[#FF6878] font-bold">Sub-Level 7 Winzes</span>
              </div>
              <div className="pt-2 border-t border-[#273747]/60 text-[11px] text-[#9BAFC1] font-sans">
                Multispectral SWIR alteration confirms high-grade pyrolusite surface float signature.
              </div>
            </div>
          </div>

          {/* Pillar 3: Production Pulse */}
          <div className="p-4 rounded-lg bg-[#121D29] border border-[#273747]">
            <div className="flex items-center justify-between pb-2 border-b border-[#273747]">
              <span className="text-xs font-mono font-bold text-[#F4B860] flex items-center gap-1.5">
                <Activity className="h-4 w-4" />
                <span>PRODUCTION VARIANCE</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4B860]/15 text-[#F4B860] border border-[#F4B860]/30">
                {selectedMine.status.toUpperCase()}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Target Throughput:</span>
                <span className="text-[#F2F6FA] font-bold">{selectedMine.plannedMonthlyTargetTonnes.toLocaleString()} T</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Actual Extracted:</span>
                <span className="text-[#F2F6FA] font-bold">{selectedMine.actualMonthlyProductionTonnes.toLocaleString()} T</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Shortfall Gap:</span>
                <span className="text-[#FF6878] font-bold">
                  {(selectedMine.plannedMonthlyTargetTonnes - selectedMine.actualMonthlyProductionTonnes).toLocaleString()} T
                </span>
              </div>
              <div className="pt-2 border-t border-[#273747]/60 text-[11px] text-[#9BAFC1] font-sans">
                Ore skips currently running 40% below capacity due to standing water in drive 4B.
              </div>
            </div>
          </div>

          {/* Pillar 4: Optimization Strategy */}
          <div className="p-4 rounded-lg bg-[#121D29] border border-[#273747]">
            <div className="flex items-center justify-between pb-2 border-b border-[#273747]">
              <span className="text-xs font-mono font-bold text-[#43D6A0] flex items-center gap-1.5">
                <Sliders className="h-4 w-4" />
                <span>OR-TOOLS OPTIMIZATION</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#43D6A0]/15 text-[#43D6A0] border border-[#43D6A0]/30">
                RECOMMENDED
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Solver Engine:</span>
                <span className="text-[#F2F6FA] font-bold">Google OR-Tools SCIP</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Estimated Recovery:</span>
                <span className="text-[#43D6A0] font-bold">+6,800 Tonnes</span>
              </div>
              <div className="flex justify-between text-[#9BAFC1]">
                <span>Key Dispatch Action:</span>
                <span className="text-[#54D8E8] font-bold">Reroute to Upper Level 4</span>
              </div>
              <div className="pt-2 border-t border-[#273747]/60 text-[11px] text-[#9BAFC1] font-sans">
                Linear program satisfies safety constraints while mitigating locomotive tramming bottlenecks.
              </div>
            </div>
          </div>
        </div>

        {/* Sign-off & Human Review Governance */}
        <div className="p-4 rounded-lg bg-[#121D29] border border-[#273747] text-xs font-mono text-[#9BAFC1] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#43D6A0]" />
            <span>MANGANEX Scientific Governance: Human approval mandatory prior to stope blast modification.</span>
          </div>
          <div className="text-[11px] text-[#54D8E8]">
            MOIL AIR-GAPPED AUDIT ACTIVE
          </div>
        </div>
      </div>
    </div>
  );
};
