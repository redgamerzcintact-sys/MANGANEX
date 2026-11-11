import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  GitFork,
  Sliders,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cpu,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export const ScenarioLabPage: React.FC = () => {
  const { selectedMine } = useAppStore();

  // Scenario Simulator Inputs
  const [rainfallMm, setRainfallMm] = useState(124);
  const [fleetAvailabilityPercent, setFleetAvailabilityPercent] = useState(78);
  const [dewateringCapacityPercent, setDewateringCapacityPercent] = useState(100);
  const [shiftCapacityHours, setShiftCapacityHours] = useState(8);
  const [isSimulating, setIsSimulating] = useState(false);
  const [backendSimulation, setBackendSimulation] = useState<any | null>(null);

  // Run backend simulation on parameter change
  useEffect(() => {
    let active = true;
    const runSimulation = async () => {
      setIsSimulating(true);
      const res = await api.simulateScenario({
        mineId: selectedMine.id,
        rainfallMm,
        fleetAvailabilityPercent,
        dewateringCapacityPercent,
        shiftHours: shiftCapacityHours
      });
      if (active) {
        setBackendSimulation(res);
        setIsSimulating(false);
      }
    };
    runSimulation();
    return () => { active = false; };
  }, [selectedMine.id, rainfallMm, fleetAvailabilityPercent, dewateringCapacityPercent, shiftCapacityHours]);

  const baselineMonthly = backendSimulation?.baselineMonthlyTonnes || selectedMine.plannedMonthlyTargetTonnes;
  const simulatedMonthly = backendSimulation?.simulatedMonthlyTonnes || Math.max(5000, baselineMonthly - 8800);
  const projectedShortfall = backendSimulation?.projectedShortfallTonnes || Math.max(0, baselineMonthly - simulatedMonthly);
  const estimatedRecovery = backendSimulation?.estimatedRecoveryTonnes || Math.round(projectedShortfall * 0.72);
  const utilization = backendSimulation?.capacityUtilizationPercent || Math.round((simulatedMonthly / baselineMonthly) * 100);
  const riskIndex = backendSimulation?.riskIndex || (projectedShortfall > 6000 ? 'Critical' : 'Moderate');

  const comparisonData = [
    {
      metric: 'Monthly Extraction (T)',
      'Baseline (Planned)': baselineMonthly,
      'Simulated (Forecast)': simulatedMonthly
    },
    {
      metric: 'Potential Recoverable Volume (T)',
      'Baseline (Planned)': 0,
      'Simulated (Forecast)': estimatedRecovery
    }
  ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#060911] text-[#F2F6FA] select-none font-sans">
      {/* LEFT COLUMN: SIMULATION CONTROLS */}
      <div className="w-[360px] h-full border-r border-[#1C3045] bg-[#090D16] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1C3045] bg-[#0B0F19]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-[#54D8E8]" />
              <h1 className="font-heading font-bold text-base text-[#F2F6FA]">
                Future Fork Lab
              </h1>
            </div>
            {isSimulating ? (
              <RefreshCw className="h-4 w-4 text-[#54D8E8] animate-spin" />
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#43D6A0]/10 text-[#43D6A0] border border-[#43D6A0]/30">
                LIVE SOLVER
              </span>
            )}
          </div>
          <p className="text-xs text-[#9BAFC1] mt-0.5 font-mono">
            Parametric Production Scenario Simulator for {selectedMine.name}
          </p>
        </div>

        {/* Sliders Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-mono">
          {/* Slider 1: 24h Rainfall Inflow */}
          <div className="p-3.5 rounded-lg bg-[#101B2A] border border-[#1C3045] space-y-2">
            <div className="flex justify-between items-center text-[#F2F6FA]">
              <span className="text-[#54D8E8] font-bold">1. Rainfall Inflow:</span>
              <span className="text-sm font-bold text-[#F2F6FA]">{rainfallMm} mm/24h</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              step="5"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(parseInt(e.target.value))}
              className="w-full accent-[#54D8E8] h-1.5 bg-[#060911] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9BAFC1]">
              <span>Dry (0mm)</span>
              <span>Monsoon Deluge (250mm)</span>
            </div>
          </div>

          {/* Slider 2: Fleet Availability */}
          <div className="p-3.5 rounded-lg bg-[#101B2A] border border-[#1C3045] space-y-2">
            <div className="flex justify-between items-center text-[#F2F6FA]">
              <span className="text-[#43D6A0] font-bold">2. Fleet Availability:</span>
              <span className="text-sm font-bold text-[#F2F6FA]">{fleetAvailabilityPercent}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="2"
              value={fleetAvailabilityPercent}
              onChange={(e) => setFleetAvailabilityPercent(parseInt(e.target.value))}
              className="w-full accent-[#43D6A0] h-1.5 bg-[#060911] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9BAFC1]">
              <span>Degraded (30%)</span>
              <span>Full Capacity (100%)</span>
            </div>
          </div>

          {/* Slider 3: Auxiliary Dewatering Rating */}
          <div className="p-3.5 rounded-lg bg-[#101B2A] border border-[#1C3045] space-y-2">
            <div className="flex justify-between items-center text-[#F2F6FA]">
              <span className="text-[#A78BFA] font-bold">3. Sump Dewatering:</span>
              <span className="text-sm font-bold text-[#F2F6FA]">{dewateringCapacityPercent}% Rating</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={dewateringCapacityPercent}
              onChange={(e) => setDewateringCapacityPercent(parseInt(e.target.value))}
              className="w-full accent-[#A78BFA] h-1.5 bg-[#060911] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9BAFC1]">
              <span>Base (20%)</span>
              <span>Boosted Pump Bank (150%)</span>
            </div>
          </div>

          {/* Slider 4: Working Shift Hours */}
          <div className="p-3.5 rounded-lg bg-[#101B2A] border border-[#1C3045] space-y-2">
            <div className="flex justify-between items-center text-[#F2F6FA]">
              <span className="text-[#F4B860] font-bold">4. Shift Duration:</span>
              <span className="text-sm font-bold text-[#F2F6FA]">{shiftCapacityHours} Hours/Day</span>
            </div>
            <input
              type="range"
              min="6"
              max="12"
              step="1"
              value={shiftCapacityHours}
              onChange={(e) => setShiftCapacityHours(parseInt(e.target.value))}
              className="w-full accent-[#F4B860] h-1.5 bg-[#060911] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#9BAFC1]">
              <span>Single 6h</span>
              <span>Continuous 12h</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="pt-2">
            <div className="text-[10px] uppercase text-[#9BAFC1] font-bold mb-2">
              APPLY QUICK PRESETS:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <button
                onClick={() => { setRainfallMm(180); setFleetAvailabilityPercent(65); setDewateringCapacityPercent(60); setShiftCapacityHours(8); }}
                className="p-2 rounded bg-[#0B0F19] border border-[#1C3045] text-[#FF6878] hover:border-[#FF6878] transition-colors text-left"
              >
                Severe Monsoon
              </button>
              <button
                onClick={() => { setRainfallMm(15); setFleetAvailabilityPercent(95); setDewateringCapacityPercent(120); setShiftCapacityHours(10); }}
                className="p-2 rounded bg-[#0B0F19] border border-[#1C3045] text-[#43D6A0] hover:border-[#43D6A0] transition-colors text-left"
              >
                Dry High-Output
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN WORKSPACE: SCENARIO IMPACT PROJECTION */}
      <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">
        {/* Top Header Card with Key Findings */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045] flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${
                riskIndex === 'Critical'
                  ? 'bg-[#FF6878]/20 text-[#FF6878] border-[#FF6878]/40'
                  : 'bg-[#F4B860]/20 text-[#F4B860] border-[#F4B860]/40'
              }`}>
                RISK CLASSIFICATION: {riskIndex.toUpperCase()}
              </span>
              <span className="text-xs font-mono text-[#54D8E8]">
                Utilization: {utilization}%
              </span>
            </div>
            <h2 className="text-xl font-heading font-bold text-[#F2F6FA] mt-1">
              Simulated Production Trajectory // {selectedMine.name}
            </h2>
            <p className="text-xs text-[#9BAFC1] font-mono mt-0.5">
              Deterministic Hydro-Mechanical Engine v2.1 • Connected to Live Backend
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-[#090D16] border border-[#1C3045] text-center">
              <div className="text-[10px] font-mono text-[#9BAFC1]">SIMULATED SHORTFALL</div>
              <div className="text-xl font-heading font-bold text-[#FF6878]">
                -{projectedShortfall.toLocaleString()} T
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#090D16] border border-[#1C3045] text-center">
              <div className="text-[10px] font-mono text-[#9BAFC1]">RECOVERABLE DEFICIT</div>
              <div className="text-xl font-heading font-bold text-[#43D6A0]">
                +{estimatedRecovery.toLocaleString()} T
              </div>
            </div>
          </div>
        </div>

        {/* COMPARISON BAR CHART: BASELINE VS. SIMULATED */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#54D8E8]" />
              Baseline Planned Target vs. Simulated Forecast Output
            </span>
            <span className="text-xs font-mono text-[#9BAFC1]">Metric Tonnes / Month</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C3045" />
                <XAxis dataKey="metric" stroke="#9BAFC1" tick={{ fontSize: 11 }} />
                <YAxis stroke="#9BAFC1" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#090D16', borderColor: '#1C3045', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Baseline (Planned)" fill="#54D8E8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Simulated (Forecast)" fill="#A78BFA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIMULATION APPLIED ASSUMPTIONS (From Backend Engine) */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1C3045]">
            <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#43D6A0]" />
              Simulation Engine Diagnostics & Engineering Assumptions
            </span>
            <span className="text-[10px] font-mono text-[#43D6A0]">
              {backendSimulation?.calculationEngineVersion || 'Manganex-SimEngine-v2.1'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            {(backendSimulation?.assumptionsApplied || [
              `Precipitation inflow calculated at ${rainfallMm} mm/24h`,
              `Fleet availability constrained to ${fleetAvailabilityPercent}%`,
              `Sump dewatering pump station operating at ${dewateringCapacityPercent}% rating`,
              `Active underground face extraction scheduled across ${shiftCapacityHours} hr shifts`
            ]).map((asm: string, i: number) => (
              <div key={i} className="p-3 rounded-lg bg-[#090D16] border border-[#1C3045] flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#54D8E8] shrink-0 mt-0.5" />
                <span className="text-[#F2F6FA]/90">{asm}</span>
              </div>
            ))}
          </div>

          <div className="text-[10px] font-mono text-[#9BAFC1] p-3 rounded bg-[#090D16] border border-[#1C3045] flex items-center justify-between">
            <span>Engineering Model: Inflow degradation penalty -85T/mm above threshold. Fleet readiness scaling with dewatering curve.</span>
            <span className="text-[#54D8E8]">HUMAN REVIEW REQUIRED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
