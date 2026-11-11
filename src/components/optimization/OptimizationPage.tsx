import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  Sliders,
  CheckCircle2,
  Calendar,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Flame,
  Cpu,
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const OptimizationPage: React.FC = () => {
  const { selectedMine } = useAppStore();

  const [equipmentAllocations, setEquipmentAllocations] = useState([
    { id: 'LHD-01', name: 'Sandvik LH410 (Electric LHD)', currentSector: 'Stope 4B (Delayed)', recommendedSector: 'Upper Level 2 Drive' },
    { id: 'LHD-02', name: 'Caterpillar R1300G (Diesel LHD)', currentSector: 'Haulage Crosscut 7', recommendedSector: 'Waste Tramming Incline' },
    { id: 'RIG-01', name: 'Tamrock Monomatic Jumbo', currentSector: 'Development Drift 12', recommendedSector: 'Sub-Level 7 Face Advance' },
    { id: 'DMP-01', name: 'Volvo FMX 460 Tipper Convoy', currentSector: 'Stockpile Bay #3', recommendedSector: 'Direct Railhead Dispatch' }
  ]);

  const [optimizing, setOptimizing] = useState(false);
  const [solverResult, setSolverResult] = useState<any | null>(null);

  // Trigger Google OR-Tools SCIP solver
  const runOrTools = async () => {
    setOptimizing(true);
    const res = await api.runOptimization({
      mineId: selectedMine.id,
      availableHaulers: 18,
      primaryShaftCapacityTonnes: 1600,
      targetTonnageTonnes: selectedMine.plannedMonthlyTargetTonnes / 30,
      activeStopingFaces: ['Stope 4B', 'Sub-Level 7 Face', 'Level 2 Drive', 'Upper Crosscut 9']
    });
    setSolverResult(res);
    setOptimizing(false);
  };

  useEffect(() => {
    runOrTools();
  }, [selectedMine.id]);

  const scheduleTasks = [
    { name: 'Wireline Exploratory Drilling', startDay: 1, endDay: 8, progress: 85, color: '#54D8E8' },
    { name: 'Sub-Level 7 Ring Blast Prep', startDay: 4, endDay: 12, progress: 60, color: '#F4B860' },
    { name: 'Stope 4B Void Grouting & Fill', startDay: 9, endDay: 18, progress: 40, color: '#A78BFA' },
    { name: 'Shaft #2 Guide Rope Refurbish', startDay: 15, endDay: 24, progress: 15, color: '#43D6A0' }
  ];

  const handleReallocate = (id: string) => {
    setEquipmentAllocations((prev) =>
      prev.map((eq) =>
        eq.id === id ? { ...eq, currentSector: eq.recommendedSector } : eq
      )
    );
  };

  return (
    <div className="flex h-full w-full overflow-y-auto bg-[#060911] text-[#F2F6FA] p-6 space-y-6 select-none font-sans">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-[#54D8E8]" />
              <h1 className="font-heading font-bold text-lg text-[#F2F6FA]">
                Mine Operational Optimization Studio
              </h1>
            </div>
            <p className="text-xs font-mono text-[#9BAFC1] mt-0.5">
              Google OR-Tools SCIP Mixed-Integer Solver & Fleet Scheduling for {selectedMine.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={runOrTools}
              disabled={optimizing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#54D8E8] text-[#060911] font-heading font-bold text-xs tracking-wider shadow-[0_0_12px_rgba(84,216,232,0.25)] hover:opacity-95 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${optimizing ? 'animate-spin' : ''}`} />
              <span>{optimizing ? 'SOLVING MIP...' : 'RE-RUN OR-TOOLS'}</span>
            </button>
            <span className="px-2.5 py-1 rounded bg-[#43D6A0]/20 text-[#43D6A0] text-xs font-mono font-bold border border-[#43D6A0]/40">
              OR-TOOLS SCIP ACTIVE
            </span>
          </div>
        </div>

        {/* OR-TOOLS SOLVER OUTPUT BANNER */}
        {solverResult && (
          <div className="p-4 rounded-xl bg-[#090D16] border border-[#54D8E8]/40 shadow-lg flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-[#54D8E8]" />
                <span className="font-heading font-bold text-sm text-[#F2F6FA]">
                  Optimal Allocation Found ({solverResult.solverStatus})
                </span>
                <span className="text-[10px] font-mono text-[#43D6A0]">
                  Solve Time: {solverResult.solveTimeMs}ms
                </span>
              </div>
              <p className="text-xs text-[#9BAFC1] mt-0.5 font-mono">
                Engine: {solverResult.solverEngine} • Projected Recovery: +{solverResult.projectedMonthlyRecoveryTonnes?.toLocaleString()} Tonnes/Mo
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[#9BAFC1] text-[10px]">Optimal Daily Tonnage:</span>
                <div className="font-bold text-[#43D6A0] text-base">{solverResult.optimalDailyProductionTonnes?.toLocaleString()} TPD</div>
              </div>
              <div className="text-right">
                <span className="text-[#9BAFC1] text-[10px]">Shortfall Mitigation:</span>
                <div className="font-bold text-[#54D8E8] text-base">{solverResult.shortfallReductionPercent}%</div>
              </div>
            </div>
          </div>
        )}

        {/* FLEET REALLOCATION CHESSBOARD */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1C3045]">
            <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#54D8E8]" />
              UNDERGROUND FLEET DYNAMIC REALLOCATION
            </span>
            <span className="text-xs font-mono text-[#9BAFC1]">Constraint: Hoist Winch Throughput</span>
          </div>

          <div className="space-y-3">
            {equipmentAllocations.map((eq) => {
              const isRecommended = eq.currentSector === eq.recommendedSector;
              return (
                <div
                  key={eq.id}
                  className="p-3.5 rounded-lg bg-[#090D16] border border-[#1C3045] flex flex-wrap items-center justify-between gap-4 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#54D8E8]" />
                    <div>
                      <div className="font-bold text-[#F2F6FA]">{eq.id} — {eq.name}</div>
                      <div className="text-[11px] text-[#9BAFC1]">Current Assignment: <b className="text-[#F2F6FA]">{eq.currentSector}</b></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-[#9BAFC1]">OR-Tools Recommendation:</span>
                      <div className="font-bold text-[#54D8E8]">{eq.recommendedSector}</div>
                    </div>

                    <button
                      onClick={() => handleReallocate(eq.id)}
                      disabled={isRecommended}
                      className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors flex items-center gap-1.5 ${
                        isRecommended
                          ? 'bg-[#43D6A0]/20 text-[#43D6A0] border border-[#43D6A0]/40 cursor-default'
                          : 'bg-[#54D8E8] text-[#060911] hover:bg-[#54D8E8]/90'
                      }`}
                    >
                      {isRecommended ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>OPTIMIZED</span>
                        </>
                      ) : (
                        <>
                          <span>REALLOCATE</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 30-DAY CRITICAL PATH GANTT TIMELINE */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#1C3045]">
            <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#A78BFA]" />
              30-DAY RECOVERY SCHEDULE & CRITICAL MAINTENANCE PATH
            </span>
            <span className="text-xs font-mono text-[#43D6A0]">CONSTRAINTS SATISFIED</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {scheduleTasks.map((t, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#9BAFC1]">
                  <span>{t.name}</span>
                  <span className="text-[#F2F6FA]">Day {t.startDay} - Day {t.endDay} ({t.progress}% Progress)</span>
                </div>
                <div className="h-3 w-full bg-[#090D16] rounded border border-[#1C3045] overflow-hidden flex">
                  <div
                    style={{
                      marginLeft: `${(t.startDay / 30) * 100}%`,
                      width: `${((t.endDay - t.startDay) / 30) * 100}%`,
                      backgroundColor: t.color
                    }}
                    className="h-full rounded relative"
                  >
                    <div
                      style={{ width: `${t.progress}%` }}
                      className="h-full bg-white/30"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1C3045] flex items-center justify-between text-[10px] font-mono text-[#9BAFC1]">
            <span>Day 1: Mon</span>
            <span>Day 10</span>
            <span>Day 20</span>
            <span>Day 30: Target Recovery Date</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-[#F4B860]/10 border border-[#F4B860]/20 text-[11px] font-mono text-[#F4B860] flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#F4B860]" />
          <span><b>Operational Governance Notice:</b> All OR-Tools recommendations provide decision-support scheduling only. Physical relocation of heavy equipment requires manual shift boss authorization and mine surveyor gas checks.</span>
        </div>
      </div>
    </div>
  );
};
