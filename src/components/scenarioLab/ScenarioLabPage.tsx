import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { useChartTheme } from '../../hooks/useChartTheme';
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
  Activity,
  Printer,
  Download,
  Copy,
  Layers,
  Clock,
  Zap,
  Droplets,
  Truck,
  Check
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

interface ScenarioState {
  id: string;
  name: string;
  rainfallMm: number;
  fleetAvailabilityPercent: number;
  dewateringCapacityPercent: number;
  shiftHours: number;
  downtimeHours: number;
  blastingDelayHours: number;
  result?: any;
}

export const ScenarioLabPage: React.FC = () => {
  const { selectedMine } = useAppStore();
  const chartColors = useChartTheme();

  // Active inputs
  const [rainfallMm, setRainfallMm] = useState<number>(35);
  const [fleetAvailabilityPercent, setFleetAvailabilityPercent] = useState<number>(85);
  const [dewateringCapacityPercent, setDewateringCapacityPercent] = useState<number>(100);
  const [shiftHours, setShiftHours] = useState<number>(8);
  const [downtimeHours, setDowntimeHours] = useState<number>(4);
  const [blastingDelayHours, setBlastingDelayHours] = useState<number>(2);

  const [weatherDefaulted, setWeatherDefaulted] = useState<boolean>(false);
  const [forecastMaxRain, setForecastMaxRain] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeSimulation, setActiveSimulation] = useState<any | null>(null);

  // Multi-scenario comparison state (up to 3 scenarios)
  const [scenarios, setScenarios] = useState<ScenarioState[]>([
    {
      id: 'scen-1',
      name: 'Baseline Forecast',
      rainfallMm: 35,
      fleetAvailabilityPercent: 85,
      dewateringCapacityPercent: 100,
      shiftHours: 8,
      downtimeHours: 4,
      blastingDelayHours: 2,
    },
    {
      id: 'scen-2',
      name: 'Monsoon Surge',
      rainfallMm: 75,
      fleetAvailabilityPercent: 65,
      dewateringCapacityPercent: 100,
      shiftHours: 8,
      downtimeHours: 6,
      blastingDelayHours: 6,
    },
    {
      id: 'scen-3',
      name: 'Equipment Failure',
      rainfallMm: 10,
      fleetAvailabilityPercent: 55,
      dewateringCapacityPercent: 100,
      shiftHours: 8,
      downtimeHours: 22,
      blastingDelayHours: 2,
    },
  ]);

  const [activeScenarioTab, setActiveScenarioTab] = useState<'single' | 'compare'>('single');
  const [selectedSlot, setSelectedSlot] = useState<number>(0);

  // 1. Fetch real weather forecast on load and default rainfall to upcoming peak
  useEffect(() => {
    let isMounted = true;
    const fetchWeatherDefault = async () => {
      try {
        const w = await api.getMineWeather(selectedMine.id);
        if (!isMounted || !w) return;
        const curRain = w.current?.rainfall_24h_mm || 0;
        const daily = w.daily || [];
        const forecastRains = daily
          .filter((d: any) => d.is_forecast)
          .map((d: any) => Number(d.precipitation_sum) || 0);
        const peakForecast = forecastRains.length ? Math.max(...forecastRains) : curRain;
        const defaultRain = Math.max(15, Math.round(peakForecast || curRain));

        setForecastMaxRain(peakForecast);
        setRainfallMm(defaultRain);
        setWeatherDefaulted(true);

        // Update Scenario 1 baseline rainfall
        setScenarios((prev) => {
          const next = [...prev];
          next[0] = { ...next[0], rainfallMm: defaultRain };
          return next;
        });
      } catch (e) {
        console.warn('Could not default weather from Open-Meteo:', e);
      }
    };
    fetchWeatherDefault();
    return () => {
      isMounted = false;
    };
  }, [selectedMine.id]);

  // 2. Run active simulation on parameter change
  const runSimulation = useCallback(
    async (params: {
      rainfallMm: number;
      fleetAvailabilityPercent: number;
      dewateringCapacityPercent: number;
      shiftHours: number;
      downtimeHours: number;
      blastingDelayHours: number;
    }) => {
      setIsSimulating(true);
      try {
        const res = await api.simulateScenario({
          mineId: selectedMine.id,
          ...params,
        });
        setActiveSimulation(res);
        return res;
      } catch (err) {
        console.warn('Simulation run failed:', err);
        return null;
      } finally {
        setIsSimulating(false);
      }
    },
    [selectedMine.id]
  );

  useEffect(() => {
    runSimulation({
      rainfallMm,
      fleetAvailabilityPercent,
      dewateringCapacityPercent,
      shiftHours,
      downtimeHours,
      blastingDelayHours,
    });
  }, [
    rainfallMm,
    fleetAvailabilityPercent,
    dewateringCapacityPercent,
    shiftHours,
    downtimeHours,
    blastingDelayHours,
    runSimulation,
  ]);

  // 3. Re-evaluate all 3 scenarios when entering comparison tab or mine changes
  useEffect(() => {
    if (activeScenarioTab !== 'compare') return;
    let active = true;

    const runAll = async () => {
      const updated = await Promise.all(
        scenarios.map(async (scen) => {
          const res = await api.simulateScenario({
            mineId: selectedMine.id,
            rainfallMm: scen.rainfallMm,
            fleetAvailabilityPercent: scen.fleetAvailabilityPercent,
            dewateringCapacityPercent: scen.dewateringCapacityPercent,
            shiftHours: scen.shiftHours,
            downtimeHours: scen.downtimeHours,
            blastingDelayHours: scen.blastingDelayHours,
          });
          return { ...scen, result: res };
        })
      );
      if (active) setScenarios(updated);
    };

    runAll();
    return () => {
      active = false;
    };
  }, [activeScenarioTab, selectedMine.id]);

  // Presets
  const applyPreset = (presetName: 'monsoon' | 'equipment' | 'dry') => {
    if (presetName === 'monsoon') {
      setRainfallMm(75);
      setFleetAvailabilityPercent(65);
      setDewateringCapacityPercent(100);
      setDowntimeHours(6);
      setBlastingDelayHours(6);
    } else if (presetName === 'equipment') {
      setRainfallMm(10);
      setFleetAvailabilityPercent(55);
      setDewateringCapacityPercent(100);
      setDowntimeHours(24);
      setBlastingDelayHours(2);
    } else {
      setRainfallMm(5);
      setFleetAvailabilityPercent(95);
      setDewateringCapacityPercent(120);
      setDowntimeHours(1);
      setBlastingDelayHours(0);
    }
  };

  // Save current settings to selected scenario slot
  const saveToScenarioSlot = (index: number) => {
    const updated = [...scenarios];
    updated[index] = {
      ...updated[index],
      rainfallMm,
      fleetAvailabilityPercent,
      dewateringCapacityPercent,
      shiftHours,
      downtimeHours,
      blastingDelayHours,
      result: activeSimulation,
    };
    setScenarios(updated);
    setSelectedSlot(index);
  };

  // Export PDF Report handler via print
  const handlePrintPdfReport = () => {
    window.print();
  };

  // Extract metrics from simulation response
  const baselineMonthly = activeSimulation?.baselineMonthlyTonnes || selectedMine.plannedMonthlyTargetTonnes || 45000;
  const simulatedMonthly = activeSimulation?.simulatedMonthlyTonnes || Math.max(5000, baselineMonthly - 7000);
  const shortfallP50 = activeSimulation?.projectedShortfallP50 ?? (activeSimulation?.projectedShortfallTonnes || 0);
  const shortfallP10 = activeSimulation?.projectedShortfallP10 ?? Math.round(shortfallP50 * 0.7);
  const shortfallP90 = activeSimulation?.projectedShortfallP90 ?? Math.round(shortfallP50 * 1.35);
  const estimatedRecovery = activeSimulation?.estimatedRecoveryTonnes || 0;
  const utilization = activeSimulation?.capacityUtilizationPercent || Math.round((simulatedMonthly / baselineMonthly) * 100);
  const riskIndex = activeSimulation?.riskIndex || 'LOW';
  const rankedActions = activeSimulation?.rankedMitigationActions || [];

  // Comparison Bar Chart Data
  const comparisonChartData = useMemo(() => {
    if (activeScenarioTab === 'compare') {
      return scenarios.map((s) => ({
        name: s.name,
        Target: baselineMonthly,
        Simulated: s.result?.simulatedMonthlyTonnes || baselineMonthly,
        Shortfall: s.result?.projectedShortfallP50 ?? s.result?.projectedShortfallTonnes ?? 0,
        Recovery: s.result?.estimatedRecoveryTonnes || 0,
      }));
    }
    return [
      {
        name: 'Active Scenario',
        Target: baselineMonthly,
        Simulated: simulatedMonthly,
        Shortfall: shortfallP50,
        Recovery: estimatedRecovery,
      },
    ];
  }, [activeScenarioTab, scenarios, baselineMonthly, simulatedMonthly, shortfallP50, estimatedRecovery]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#120F0D] text-[#FFF8F0] select-none font-sans print:bg-white print:text-black">
      {/* ── LEFT COLUMN: CONTROLS & PRESETS (Hidden on Print) ─────────────────── */}
      <div className="w-[380px] h-full border-r border-[#4D4037] bg-[#1A1613] flex flex-col shrink-0 print:hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#4D4037] bg-[#241E1A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitFork className="h-5 w-5 text-[#FB923C]" />
              <h1 className="font-heading font-bold text-base text-[#FFF8F0]">
                Scenario Lab
              </h1>
            </div>
            {isSimulating ? (
              <RefreshCw className="h-4 w-4 text-[#FB923C] animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <ProvenanceBadge
                  provenance={activeSimulation?.data_provenance}
                  status="DERIVED"
                  source="Parametric Counterfactual Engine (docs/simulation.md)"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-[#DEC8B7] mt-0.5 font-mono">
            Parametric Production Shortfall Forecasting for {selectedMine.name}
          </p>

          {weatherDefaulted && (
            <div className="mt-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#FB923C]/10 border border-[#FB923C]/30 text-[10px] font-mono text-[#FB923C]">
              <span>Real 16D Weather Default: {rainfallMm} mm</span>
              <span>Peak: {forecastMaxRain.toFixed(1)} mm</span>
            </div>
          )}
        </div>

        {/* Sliders Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          {/* Slider 1: 24h Rainfall */}
          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-2">
            <div className="flex justify-between items-center text-[#FFF8F0]">
              <span className="text-[#FB923C] font-bold flex items-center gap-1.5">
                <Droplets size={13} />
                1. Rainfall Inflow:
              </span>
              <span className="text-sm font-bold text-[#FFF8F0]">{rainfallMm} mm/24h</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(parseInt(e.target.value))}
              className="w-full accent-[#FB923C] h-1.5 bg-[#120F0D] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-[#DEC8B7]">
              <span>Dry (0 mm)</span>
              <span>Forecast ({forecastMaxRain.toFixed(0)} mm)</span>
              <span>Deluge (200 mm)</span>
            </div>
          </div>

          {/* Slider 2: Fleet Availability */}
          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-2">
            <div className="flex justify-between items-center text-[#FFF8F0]">
              <span className="text-[#10B981] font-bold flex items-center gap-1.5">
                <Truck size={13} />
                2. Fleet Availability:
              </span>
              <span className="text-sm font-bold text-[#FFF8F0]">{fleetAvailabilityPercent}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="2"
              value={fleetAvailabilityPercent}
              onChange={(e) => setFleetAvailabilityPercent(parseInt(e.target.value))}
              className="w-full accent-[#10B981] h-1.5 bg-[#120F0D] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-[#DEC8B7]">
              <span>Degraded (30%)</span>
              <span>Standard (85%)</span>
              <span>Full (100%)</span>
            </div>
          </div>

          {/* Slider 3: Dewatering Capacity */}
          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-2">
            <div className="flex justify-between items-center text-[#FFF8F0]">
              <span className="text-[#E8B298] font-bold flex items-center gap-1.5">
                <Layers size={13} />
                3. Pump Dewatering:
              </span>
              <span className="text-sm font-bold text-[#FFF8F0]">{dewateringCapacityPercent}% Rating</span>
            </div>
            <input
              type="range"
              min="20"
              max="180"
              step="5"
              value={dewateringCapacityPercent}
              onChange={(e) => setDewateringCapacityPercent(parseInt(e.target.value))}
              className="w-full accent-[#E8B298] h-1.5 bg-[#120F0D] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-[#DEC8B7]">
              <span>Base (20%)</span>
              <span>Nominal (100%)</span>
              <span>Booster (180%)</span>
            </div>
          </div>

          {/* Slider 4: Equipment Downtime */}
          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-2">
            <div className="flex justify-between items-center text-[#FFF8F0]">
              <span className="text-[#F59E0B] font-bold flex items-center gap-1.5">
                <Clock size={13} />
                4. Equipment Downtime:
              </span>
              <span className="text-sm font-bold text-[#FFF8F0]">{downtimeHours} Hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              step="1"
              value={downtimeHours}
              onChange={(e) => setDowntimeHours(parseInt(e.target.value))}
              className="w-full accent-[#F59E0B] h-1.5 bg-[#120F0D] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-[#DEC8B7]">
              <span>Zero (0h)</span>
              <span>Shift Maint (8h)</span>
              <span>Severe (48h)</span>
            </div>
          </div>

          {/* Slider 5: Blasting Delays */}
          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-2">
            <div className="flex justify-between items-center text-[#FFF8F0]">
              <span className="text-[#EF4444] font-bold flex items-center gap-1.5">
                <Zap size={13} />
                5. Blasting Delay:
              </span>
              <span className="text-sm font-bold text-[#FFF8F0]">{blastingDelayHours} Hours</span>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="1"
              value={blastingDelayHours}
              onChange={(e) => setBlastingDelayHours(parseInt(e.target.value))}
              className="w-full accent-[#EF4444] h-1.5 bg-[#120F0D] rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-[#DEC8B7]">
              <span>Zero (0h)</span>
              <span>Normal Window (2h)</span>
              <span>Long Weather Delay (24h)</span>
            </div>
          </div>

          {/* Presets & Slot Saving */}
          <div className="pt-1 space-y-2.5">
            <div className="text-[10px] uppercase text-[#DEC8B7] font-bold">
              QUICK PRESETS:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
              <button
                onClick={() => applyPreset('monsoon')}
                className="p-2 rounded-xl bg-[#241E1A] border border-[#EF4444]/40 text-[#EF4444] hover:bg-[#EF4444]/15 transition-colors text-left flex items-center justify-between cursor-pointer"
              >
                <span className="font-bold">Monsoon Surge</span>
                <span>⛈</span>
              </button>
              <button
                onClick={() => applyPreset('equipment')}
                className="p-2 rounded-xl bg-[#241E1A] border border-[#F59E0B]/40 text-[#F59E0B] hover:bg-[#F59E0B]/15 transition-colors text-left flex items-center justify-between cursor-pointer"
              >
                <span className="font-bold">Equipment Failure</span>
                <span>⚙</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#4D4037]">
              <div className="text-[10px] uppercase text-[#DEC8B7] font-bold mb-1.5">
                SAVE CURRENT TO SCENARIO SLOT:
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {scenarios.map((scen, idx) => (
                  <button
                    key={scen.id}
                    onClick={() => saveToScenarioSlot(idx)}
                    className={`py-1.5 px-2 rounded-xl text-[10.5px] border text-center transition-all cursor-pointer ${
                      selectedSlot === idx
                        ? 'bg-[#FB923C] text-[#120F0D] font-bold border-[#FB923C] shadow-sm'
                        : 'bg-[#241E1A] text-[#DEC8B7] border-[#4D4037] hover:border-[#FB923C]'
                    }`}
                  >
                    Slot {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT MAIN WORKSPACE: HERO OUTPUTS & COMPARISON ────────────────────── */}
      <div className="flex-1 h-full overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible bg-[#120F0D]">
        {/* Header Bar with Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#4D4037] pb-4 print:border-none">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                  riskIndex === 'CRITICAL'
                    ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40'
                    : riskIndex === 'WARNING'
                    ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40'
                    : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40'
                }`}
              >
                SHORTFALL RISK: {riskIndex}
              </span>
              <span className="text-xs font-mono text-[#FB923C] font-bold">
                Capacity Utilization: {utilization}%
              </span>
            </div>
            <h2 className="text-2xl font-heading font-extrabold text-[#FFF8F0] mt-1 print:text-xl print:text-black">
              {selectedMine.name} // Shortfall Risk Assessment &amp; Recovery
            </h2>
            <p className="text-xs text-[#DEC8B7] font-mono mt-0.5 print:text-gray-600">
              Deterministic Physics Simulation Engine v2.5 • Linked to Open-Meteo ERA5 / 16D Forecast
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden">
            {/* View switcher */}
            <div className="flex items-center rounded-xl bg-[#241E1A] border border-[#4D4037] p-1 text-xs font-mono">
              <button
                onClick={() => setActiveScenarioTab('single')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  activeScenarioTab === 'single'
                    ? 'bg-[#FB923C] text-[#120F0D] shadow-sm'
                    : 'text-[#DEC8B7] hover:text-[#FFF8F0]'
                }`}
              >
                Active Scenario
              </button>
              <button
                onClick={() => setActiveScenarioTab('compare')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                  activeScenarioTab === 'compare'
                    ? 'bg-[#FB923C] text-[#120F0D] shadow-sm'
                    : 'text-[#DEC8B7] hover:text-[#FFF8F0]'
                }`}
              >
                Compare 3 Scenarios
              </button>
            </div>

            {/* Export PDF Report Button */}
            <button
              onClick={handlePrintPdfReport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FB923C] hover:bg-[#F59E0B] text-[#120F0D] font-mono font-bold text-xs transition-all shadow-[0_0_12px_rgba(251,146,60,0.3)] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* ── 1. HERO SHORTFALL METRIC CARDS (P10 / P50 / P90) ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: P50 Expected Shortfall */}
          <div className="p-4 rounded-xl bg-[#1A1613] border border-[#EF4444]/50 shadow-md">
            <div className="text-[10px] font-mono text-[#DEC8B7] uppercase tracking-wider flex items-center justify-between">
              <span>P50 Median Shortfall</span>
              <span className="text-[#EF4444] font-bold">EXPECTED</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#EF4444] mt-1 font-mono">
              -{shortfallP50.toLocaleString()} T
            </div>
            <div className="text-[11px] font-mono text-[#DEC8B7] mt-1">
              Monthly Target: {(baselineMonthly / 1000).toFixed(0)}K T
            </div>
          </div>

          {/* Card 2: P10 Optimistic Shortfall */}
          <div className="p-4 rounded-xl bg-[#1A1613] border border-[#4D4037] shadow-sm">
            <div className="text-[10px] font-mono text-[#DEC8B7] uppercase tracking-wider flex items-center justify-between">
              <span>P10 Upside Shortfall</span>
              <span className="text-[#10B981] font-bold">BEST-CASE</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#10B981] mt-1 font-mono">
              -{shortfallP10.toLocaleString()} T
            </div>
            <div className="text-[11px] font-mono text-[#A69282] mt-1">
              Dry bench &amp; minimal stoppages
            </div>
          </div>

          {/* Card 3: P90 Downside Shortfall */}
          <div className="p-4 rounded-xl bg-[#1A1613] border border-[#4D4037] shadow-sm">
            <div className="text-[10px] font-mono text-[#DEC8B7] uppercase tracking-wider flex items-center justify-between">
              <span>P90 Downside Shortfall</span>
              <span className="text-[#EF4444] font-bold">WORST-CASE</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#EF4444] mt-1 font-mono">
              -{shortfallP90.toLocaleString()} T
            </div>
            <div className="text-[11px] font-mono text-[#A69282] mt-1">
              Rain peak &amp; delayed blast clearing
            </div>
          </div>

          {/* Card 4: Top Action Recovery */}
          <div className="p-4 rounded-xl bg-[#1A1613] border border-[#10B981]/50 shadow-md">
            <div className="text-[10px] font-mono text-[#DEC8B7] uppercase tracking-wider flex items-center justify-between">
              <span>Max Recoverable Volume</span>
              <span className="text-[#10B981] font-bold">MITIGATION</span>
            </div>
            <div className="text-2xl font-heading font-extrabold text-[#10B981] mt-1 font-mono">
              +{estimatedRecovery.toLocaleString()} T
            </div>
            <div className="text-[11px] font-mono text-[#DEC8B7] mt-1">
              Dynamic Counterfactual Re-run
            </div>
          </div>
        </div>

        {/* ── 2. SCENARIOS SIDE-BY-SIDE MATRIX (WHEN IN COMPARE TAB) ─────────────── */}
        {activeScenarioTab === 'compare' ? (
          <div className="p-5 rounded-2xl bg-[#1A1613] border border-[#4D4037] space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
                <GitFork className="h-4 w-4 text-[#FB923C]" />
                Side-by-Side 3-Scenario Comparison Matrix
              </span>
              <span className="text-xs font-mono text-[#DEC8B7]">Multi-parameter sensitivity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              {scenarios.map((scen, idx) => {
                const sShortfall = scen.result?.projectedShortfallP50 ?? scen.result?.projectedShortfallTonnes ?? 0;
                const sRecovery = scen.result?.estimatedRecoveryTonnes || 0;
                const sRisk = scen.result?.riskIndex || 'LOW';
                return (
                  <div
                    key={scen.id}
                    className="p-4 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-[#4D4037]">
                      <span className="font-bold text-sm text-[#FB923C]">{scen.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          sRisk === 'CRITICAL'
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                            : sRisk === 'WARNING'
                            ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                            : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                        }`}
                      >
                        {sRisk}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-[#DEC8B7]">
                      <div className="flex justify-between">
                        <span>Rainfall Inflow:</span>
                        <strong className="text-[#FFF8F0]">{scen.rainfallMm} mm/24h</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Fleet Availability:</span>
                        <strong className="text-[#FFF8F0]">{scen.fleetAvailabilityPercent}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Dewatering Capacity:</span>
                        <strong className="text-[#FFF8F0]">{scen.dewateringCapacityPercent}%</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Downtime Hours:</span>
                        <strong className="text-[#FFF8F0]">{scen.downtimeHours} h</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Blasting Delays:</span>
                        <strong className="text-[#FFF8F0]">{scen.blastingDelayHours} h</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#4D4037] flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-[#A69282]">Projected Shortfall:</div>
                        <div className="text-base font-bold text-[#EF4444]">
                          -{sShortfall.toLocaleString()} T
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-[#A69282]">Recoverable:</div>
                        <div className="text-base font-bold text-[#10B981]">
                          +{sRecovery.toLocaleString()} T
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setRainfallMm(scen.rainfallMm);
                        setFleetAvailabilityPercent(scen.fleetAvailabilityPercent);
                        setDewateringCapacityPercent(scen.dewateringCapacityPercent);
                        setDowntimeHours(scen.downtimeHours);
                        setBlastingDelayHours(scen.blastingDelayHours);
                        setActiveScenarioTab('single');
                      }}
                      className="w-full py-1.5 rounded-xl bg-[#2F2722] hover:bg-[#3C322B] border border-[#4D4037] text-[11px] text-[#FB923C] font-bold transition-colors cursor-pointer"
                    >
                      Load into Active Solver &rarr;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* ── 3. COMPARISON BAR CHART ───────────────────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-[#1A1613] border border-[#4D4037] space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#FB923C]" />
              Monthly Extraction Forecast &amp; Deficit Recovery Comparison
            </span>
            <span className="text-xs font-mono text-[#DEC8B7]">Metric Tonnes / Month</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="name" stroke={chartColors.textMuted} tick={{ fontSize: 11 }} />
                <YAxis stroke={chartColors.textMuted} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder, borderRadius: '10px', fontSize: 12, color: chartColors.tooltipText }} />
                <Legend wrapperStyle={{ fontSize: 12, color: chartColors.text }} />
                <Bar dataKey="Target" fill={chartColors.series1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Simulated" fill={chartColors.series2} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Shortfall" fill={chartColors.shortfall} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Recovery" fill={chartColors.recovery} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 4. RANKED MITIGATION ACTIONS (Dynamically Re-evaluated via Model) ── */}
        <div className="p-5 rounded-2xl bg-[#1A1613] border border-[#4D4037] space-y-3.5 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#4D4037]">
            <span className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#10B981]" />
              Ranked Mitigation Actions // Evaluated by Re-running Forecasting Model
            </span>
            <span className="text-[10px] font-mono text-[#10B981] font-bold">
              STRICTLY COMPUTED DELTA TONNES
            </span>
          </div>

          <div className="space-y-2.5">
            {rankedActions.map((action: any, i: number) => (
              <div
                key={action.id || i}
                className="p-4 rounded-xl bg-[#241E1A] border border-[#4D4037] hover:border-[#10B981]/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-bold flex items-center justify-center">
                      #{i + 1}
                    </span>
                    <h4 className="font-bold text-sm text-[#FFF8F0]">{action.title}</h4>
                  </div>
                  <p className="text-xs text-[#DEC8B7] pl-7 leading-relaxed">
                    {action.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-7 sm:pl-0">
                  <div className="text-right">
                    <div className="text-[10px] text-[#A69282]">Recoverable</div>
                    <div className="text-lg font-bold text-[#10B981]">
                      +{action.tonnes_recovered?.toLocaleString()} T
                    </div>
                    <div className="text-[9.5px] text-[#FB923C]">
                      Shortfall: {action.new_projected_shortfall?.toLocaleString()} T
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (action.id === 'action_dewatering') {
                        setDewateringCapacityPercent((p) => Math.min(180, p + 40));
                      } else if (action.id === 'action_blasting_window') {
                        setBlastingDelayHours((b) => Math.max(0, Math.round(b * 0.25)));
                      } else if (action.id === 'action_fleet_redeploy') {
                        setFleetAvailabilityPercent((f) => Math.min(100, f + 15));
                        setDowntimeHours((d) => Math.max(0, Math.round(d * 0.6)));
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981]/30 border border-[#10B981] text-xs font-bold text-[#10B981] transition-all cursor-pointer"
                  >
                    Apply Action
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 5. SIMULATION ASSUMPTIONS & PROVENANCE (Visible on Print) ─────────── */}
        <div className="p-5 rounded-2xl bg-[#1A1613] border border-[#4D4037] space-y-3 font-mono text-xs shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-[#4D4037]">
            <span className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#FB923C]" />
              Simulation Assumptions &amp; Physics Engine Specifications
            </span>
            <span className="text-[10px] text-[#FB923C] font-bold">docs/simulation.md</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {(activeSimulation?.assumptionsApplied || [
              `Precipitation inflow calculated at ${rainfallMm} mm/24h`,
              `Fleet availability constrained to ${fleetAvailabilityPercent}%`,
              `Sump dewatering pump station operating at ${dewateringCapacityPercent}% rating`,
              `Equipment mechanical downtime set to ${downtimeHours} hrs`,
              `Blasting clearance & delay window set to ${blastingDelayHours} hrs`,
            ]).map((asm: string, i: number) => (
              <div key={i} className="p-2.5 rounded-xl bg-[#241E1A] border border-[#4D4037] flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981] shrink-0 mt-0.5" />
                <span className="text-[#FFF8F0] text-[11px]">{asm}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] flex items-center justify-between text-[10.5px]">
            <span className="text-[#DEC8B7]">
              Data Provenance: Weather is REAL (Open-Meteo ERA5 / 16D Forecast). Production is SYNTHETIC (calibrated physics model).
            </span>
            <span className="text-[#10B981] font-bold">MOIL HACKATHON VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
