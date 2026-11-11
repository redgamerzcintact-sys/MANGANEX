import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { InteractiveMap } from './InteractiveMap';
import { EarthXRayModal } from './EarthXRayModal';
import {
  MineralCrystal3D,
  HaulTruck3D,
  HazardTriangle3D,
  ShieldScore3D,
  RobotMascot3D,
  EarthXRayBlock3D,
  SatelliteSpaceGraphic,
  RegionalHeatmapGraphic,
  MobileViewMockup3D
} from '../brand/VisualAssets';
import {
  Layers,
  Calendar,
  Sliders,
  ChevronRight,
  Box,
  Compass,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Send,
  Check
} from 'lucide-react';

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMine, toggleNexus } = useAppStore();

  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [isPlayingYear, setIsPlayingYear] = useState<boolean>(false);
  const [isXRayModalOpen, setIsXRayModalOpen] = useState<boolean>(false);

  // Layer toggles
  const [activeLayers, setActiveLayers] = useState({
    boreholes: true,
    seismic: true,
    groundwater: false,
    haulage: true,
    riskHeatmap: true
  });

  const toggleLayer = (key: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Timeline scrubber
  useEffect(() => {
    let interval: any;
    if (isPlayingYear) {
      interval = setInterval(() => {
        setSelectedYear((curr) => (curr >= 2025 ? 2020 : curr + 1));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlayingYear]);

  // NEXUS Chat preview state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'user',
      text: 'Show me high potential Manganese zones in Mandla region.'
    },
    {
      sender: 'ai',
      text: '3 high-potential zones identified with 92% confidence. Estimated reserves: 42.5 Mt'
    }
  ]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'user', text: chatInput };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Analysis complete: 3 high-potential zones verified with 92% confidence. Braunite reef confirmed at -180m depth.`
        }
      ]);
    }, 900);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#020712] text-[#F1F5F9] select-none font-sans">
      {/* ========================================================================= */}
      {/* 1. UPPER SECTION: CONTROL HUB (215px) + MAP (FLEX) + INTELLIGENCE (320px)   */}
      {/* ========================================================================= */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative border-b border-[#14233A]">
        
        {/* ----------------------------------------------------------------------- */}
        {/* A. LEFT PANEL: CONTROL HUB                                              */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-[215px] shrink-0 h-full border-r border-[#14233A] bg-[#06101D] flex flex-col justify-between p-3 overflow-y-auto">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#FFFFFF] tracking-wide">
                  Control Hub
                </span>
                <span className="text-[9.5px] font-mono text-[#00D9FF]">
                  v2.4-SIH
                </span>
              </div>
            </div>

            {/* 1. DATA LAYERS */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                <Layers className="w-3 h-3 text-[#00D9FF]" />
                <span>Data Layers</span>
              </div>
              <div className="space-y-1.5 text-[10.5px]">
                {/* Borehole Data */}
                <div
                  onClick={() => toggleLayer('boreholes')}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#09172A] hover:bg-[#0E223D] border border-[#14233A] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.boreholes ? 'bg-[#00D9FF] text-[#020712]' : 'border border-[#38BDF8]'
                      }`}
                    >
                      {activeLayers.boreholes && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#E2E8F0] font-medium truncate">Borehole Data</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#64748B]">142 pts</span>
                    <ChevronRight className="w-3 h-3 text-[#64748B]" />
                  </div>
                </div>

                {/* Seismic Surveys */}
                <div
                  onClick={() => toggleLayer('seismic')}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#09172A] hover:bg-[#0E223D] border border-[#14233A] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.seismic ? 'bg-[#A855F7] text-[#FFFFFF]' : 'border border-[#A855F7]'
                      }`}
                    >
                      {activeLayers.seismic && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#E2E8F0] font-medium truncate">Seismic Surveys</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#64748B]">18 lines</span>
                    <ChevronRight className="w-3 h-3 text-[#64748B]" />
                  </div>
                </div>

                {/* Groundwater Table */}
                <div
                  onClick={() => toggleLayer('groundwater')}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#09172A] hover:bg-[#0E223D] border border-[#14233A] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.groundwater ? 'bg-[#00E69A] text-[#020712]' : 'border border-[#00E69A]'
                      }`}
                    >
                      {activeLayers.groundwater && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#E2E8F0] font-medium truncate">Groundwater Table</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#00E69A] font-semibold">Active</span>
                    <ChevronRight className="w-3 h-3 text-[#64748B]" />
                  </div>
                </div>

                {/* Haulage & Roads */}
                <div
                  onClick={() => toggleLayer('haulage')}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#09172A] hover:bg-[#0E223D] border border-[#14233A] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.haulage ? 'bg-[#00D9FF] text-[#020712]' : 'border border-[#38BDF8]'
                      }`}
                    >
                      {activeLayers.haulage && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#E2E8F0] font-medium truncate">Haulage & Roads</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#64748B]">24 km</span>
                    <ChevronRight className="w-3 h-3 text-[#64748B]" />
                  </div>
                </div>

                {/* Risk Heatmap */}
                <div
                  onClick={() => toggleLayer('riskHeatmap')}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-[#09172A] hover:bg-[#0E223D] border border-[#14233A] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.riskHeatmap ? 'bg-[#FF9B32] text-[#020712]' : 'border border-[#FF9B32]'
                      }`}
                    >
                      {activeLayers.riskHeatmap && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#E2E8F0] font-medium truncate">Risk Heatmap</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#FF9B32] font-semibold">Live</span>
                    <ChevronRight className="w-3 h-3 text-[#64748B]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TIME CONTROL */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                <Calendar className="w-3 h-3 text-[#00D9FF]" />
                <span>Time Control</span>
              </div>
              <div className="p-2 rounded-lg bg-[#09172A] border border-[#14233A] space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#94A3B8]">Year:</span>
                  <span className="text-[#00D9FF] font-bold">{selectedYear}</span>
                </div>
                {/* Horizontal slider */}
                <div className="relative h-1.5 bg-[#14233A] rounded-full">
                  <div
                    className="h-full bg-[#00D9FF] rounded-full shadow-[0_0_6px_#00D9FF]"
                    style={{ width: `${((selectedYear - 2020) / (2025 - 2020)) * 100}%` }}
                  />
                  <div
                    className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-[#00D9FF] shadow-[0_0_8px_#00D9FF] border border-white"
                    style={{ left: `calc(${((selectedYear - 2020) / (2025 - 2020)) * 100}% - 7px)` }}
                  />
                </div>
                {/* Controls: Prev, Play, Next */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    onClick={() => setSelectedYear((y) => Math.max(2020, y - 1))}
                    className="text-[#94A3B8] hover:text-[#00D9FF] cursor-pointer"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={() => setIsPlayingYear(!isPlayingYear)}
                    className="w-6 h-6 rounded-full bg-[#00D9FF] text-[#020712] flex items-center justify-center font-bold text-xs shadow-[0_0_8px_#00D9FF] hover:scale-105 transition-transform cursor-pointer"
                  >
                    {isPlayingYear ? '⏸' : '▶'}
                  </button>
                  <button
                    onClick={() => setSelectedYear((y) => Math.min(2025, y + 1))}
                    className="text-[#94A3B8] hover:text-[#00D9FF] cursor-pointer"
                  >
                    ⏭
                  </button>
                </div>
              </div>
            </div>

            {/* 3. ANALYSIS TOOLS */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#94A3B8] mb-1.5 uppercase tracking-wider">
                <Sliders className="w-3 h-3 text-[#00D9FF]" />
                <span>Analysis Tools</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[9.5px]">
                {['Measure', 'Draw', 'Query', '3D View'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => {
                      if (tool === '3D View') setIsXRayModalOpen(true);
                      else navigate('/exploration');
                    }}
                    className="py-1 px-1 rounded bg-[#09172A] hover:bg-[#0E223D] border border-[#14233A] hover:border-[#00D9FF] text-[#CBD5E1] hover:text-[#00D9FF] transition-all text-center cursor-pointer"
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. AI ASSISTANT CARD (Bottom of Control Hub) */}
          <div
            onClick={() => toggleNexus()}
            className="p-2.5 rounded-xl bg-[#09172A] border border-[#3B82F6]/50 shadow-[0_0_12px_rgba(59,130,246,0.25)] flex items-center justify-between cursor-pointer hover:border-[#00D9FF] transition-all group mt-2"
          >
            <div className="flex flex-col pr-1 min-w-0">
              <span className="text-[11px] font-bold text-[#FFFFFF] group-hover:text-[#00D9FF] transition-colors">
                AI Assistant
              </span>
              <span className="text-[8px] text-[#94A3B8] leading-tight mt-0.5">
                Ask anything about Manganese Reserves...
              </span>
            </div>
            <div className="shrink-0">
              <RobotMascot3D className="w-9 h-9 drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]" mini />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* B. CENTER SATELLITE MAP                                                 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="flex-1 h-full relative overflow-hidden">
          <InteractiveMap
            selectedYear={selectedYear}
            onYearChange={(y) => setSelectedYear(y)}
            isPlayingYear={isPlayingYear}
            onTogglePlayYear={() => setIsPlayingYear(!isPlayingYear)}
            activeLayers={activeLayers}
          />
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* C. RIGHT INTELLIGENCE & TELEMETRY PANEL                                 */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-[320px] shrink-0 h-full border-l border-[#14233A] bg-[#06101D] flex flex-col justify-between p-3 overflow-y-auto space-y-3">
          
          {/* 1. 2x2 KPI GRID */}
          <div className="grid grid-cols-2 gap-2">
            {/* Card 1: Total Reserves */}
            <div className="p-2 rounded-xl bg-[#09172A] border border-[#14233A] hover:border-[#00D9FF]/50 transition-colors flex items-center gap-2 shadow-sm">
              <MineralCrystal3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[#94A3B8] font-medium truncate">Total Reserves</span>
                <span className="text-[14px] font-extrabold text-[#FFFFFF] font-mono leading-tight">125.8 Mt</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#00E69A] font-semibold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>+12.5%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Predicted Production */}
            <div className="p-2 rounded-xl bg-[#09172A] border border-[#14233A] hover:border-[#F59E0B]/50 transition-colors flex items-center gap-2 shadow-sm">
              <HaulTruck3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] text-[#94A3B8] font-medium leading-none">Predicted Production</span>
                <span className="text-[14px] font-extrabold text-[#FFFFFF] font-mono leading-tight mt-0.5">18.7 Mt</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#00E69A] font-semibold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>+8.3%</span>
                </div>
              </div>
            </div>

            {/* Card 3: Shortfall Risk */}
            <div className="p-2 rounded-xl bg-[#09172A] border border-[#14233A] hover:border-[#FF9B32]/50 transition-colors flex items-center gap-2 shadow-sm">
              <HazardTriangle3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[#94A3B8] font-medium truncate">Shortfall Risk</span>
                <span className="text-[14px] font-extrabold text-[#FFFFFF] font-mono leading-tight">12%</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#00E69A] font-semibold mt-0.5">
                  <TrendingDown className="w-2.5 h-2.5" />
                  <span>-6.2%</span>
                </div>
              </div>
            </div>

            {/* Card 4: Confidence Score */}
            <div className="p-2 rounded-xl bg-[#09172A] border border-[#14233A] hover:border-[#00D9FF]/50 transition-colors flex items-center gap-2 shadow-sm">
              <ShieldScore3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] text-[#94A3B8] font-medium leading-none">Confidence Score</span>
                <span className="text-[14px] font-extrabold text-[#FFFFFF] font-mono leading-tight mt-0.5">94.7%</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#00E69A] font-semibold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>+2.1%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PRODUCTION TREND CHART (High-fidelity inline vector chart) */}
          <div className="p-2.5 rounded-xl bg-[#09172A] border border-[#14233A] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#FFFFFF]">Production Trend</span>
              <div className="flex items-center gap-2.5 text-[9px] font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00D9FF]" />
                  <span className="text-[#CBD5E1]">Actual</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
                  <span className="text-[#CBD5E1]">Predicted</span>
                </div>
              </div>
            </div>

            {/* Precision SVG Chart */}
            <div className="w-full h-[115px] relative">
              <svg viewBox="0 0 290 115" fill="none" className="w-full h-full">
                {/* Horizontal grid lines */}
                <line x1="25" y1="15" x2="280" y2="15" stroke="#14233A" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="25" y1="40" x2="280" y2="40" stroke="#14233A" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="25" y1="65" x2="280" y2="65" stroke="#14233A" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="25" y1="90" x2="280" y2="90" stroke="#14233A" strokeWidth="0.8" />

                {/* Y-axis labels */}
                <text x="8" y="18" fill="#64748B" fontSize="8" fontFamily="sans-serif">20</text>
                <text x="8" y="43" fill="#64748B" fontSize="8" fontFamily="sans-serif">15</text>
                <text x="8" y="68" fill="#64748B" fontSize="8" fontFamily="sans-serif">10</text>
                <text x="12" y="93" fill="#64748B" fontSize="8" fontFamily="sans-serif">5</text>
                <text x="12" y="105" fill="#64748B" fontSize="8" fontFamily="sans-serif">0</text>

                {/* X-axis labels */}
                <text x="35" y="105" fill="#64748B" fontSize="8" fontFamily="sans-serif">2020</text>
                <text x="80" y="105" fill="#64748B" fontSize="8" fontFamily="sans-serif">2021</text>
                <text x="130" y="105" fill="#00D9FF" fontSize="8" fontWeight="bold" fontFamily="sans-serif">2022</text>
                <text x="180" y="105" fill="#64748B" fontSize="8" fontFamily="sans-serif">2023</text>
                <text x="225" y="105" fill="#64748B" fontSize="8" fontFamily="sans-serif">2024</text>
                <text x="265" y="105" fill="#64748B" fontSize="8" fontFamily="sans-serif">2025</text>

                {/* Vertical reference line at 2022 */}
                <line x1="140" y1="15" x2="140" y2="90" stroke="#00D9FF" strokeWidth="1" strokeDasharray="3 2" opacity="0.6" />

                {/* Actual Line (Cyan) from 2020 to 2022 */}
                <path
                  d="M45 78 L90 68 L140 45"
                  stroke="#00D9FF"
                  strokeWidth="2.2"
                  fill="none"
                />
                <circle cx="45" cy="78" r="3" fill="#00D9FF" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="90" cy="68" r="3" fill="#00D9FF" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="140" cy="45" r="3.5" fill="#00D9FF" stroke="#FFFFFF" strokeWidth="1.5" />

                {/* Predicted Line (Purple) from 2022 to 2025 */}
                <path
                  d="M140 45 L188 38 L232 30 L272 24"
                  stroke="#A855F7"
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  fill="none"
                />
                <circle cx="188" cy="38" r="3" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="232" cy="30" r="3" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1" />
                <circle cx="272" cy="24" r="3" fill="#A855F7" stroke="#FFFFFF" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* 3. REAL-TIME ALERTS */}
          <div className="p-2.5 rounded-xl bg-[#09172A] border border-[#14233A] shadow-sm flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFFFFF]">Real-Time Alerts</span>
              <button
                onClick={() => navigate('/risk-center')}
                className="text-[9px] font-medium text-[#00D9FF] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>View All</span>
                <span>→</span>
              </button>
            </div>

            {/* Alert 1 */}
            <div className="flex items-start gap-2 p-2 rounded-lg bg-[#0E1F36] border border-[#DC2626]/30">
              <div className="w-5 h-5 rounded bg-[#DC2626]/20 border border-[#DC2626] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] font-bold text-[#FFFFFF] leading-tight">
                  High Risk Zone Detected
                </span>
                <span className="text-[8px] text-[#94A3B8] mt-0.5">
                  North Ridge Sector · 2 min ago
                </span>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="flex items-start gap-2 p-2 rounded-lg bg-[#0E1F36] border border-[#00D9FF]/30">
              <div className="w-5 h-5 rounded bg-[#00D9FF]/20 border border-[#00D9FF] flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-3 h-3 text-[#00D9FF]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9.5px] font-bold text-[#FFFFFF] leading-tight">
                  Production Forecast Updated
                </span>
                <span className="text-[8px] text-[#00D9FF] mt-0.5">
                  18.7 Mt · 3 min ago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM VISUAL STRIP (5 EXACT CARDS MATCHING REFERENCE)                  */}
      {/* ========================================================================= */}
      <div className="h-[250px] shrink-0 bg-[#040A15] p-2.5 flex items-stretch gap-2.5 overflow-x-auto">
        
        {/* CARD 1: EARTH X-RAY VIEW (~23% width) */}
        <div className="flex-1 min-w-[240px] max-w-[25%] rounded-2xl bg-[#071324] border border-[#142642] p-3 flex flex-col justify-between relative overflow-hidden group shadow-md hover:border-[#00D9FF]/40 transition-colors">
          <div>
            <div className="text-[12.5px] font-bold text-[#FFFFFF] tracking-wide">Earth X-Ray View</div>
            <div className="text-[9px] text-[#94A3B8]">Explore the hidden layers</div>
          </div>

          {/* 3D Isometric Strata Block */}
          <div className="relative flex-1 flex items-center justify-center py-1">
            <EarthXRayBlock3D className="w-full h-full max-h-[145px]" />
          </div>

          {/* 3D Layer View Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsXRayModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00D9FF]/15 hover:bg-[#00D9FF]/30 border border-[#00D9FF] text-[9.5px] font-bold text-[#00D9FF] shadow-[0_0_8px_rgba(0,217,255,0.3)] transition-all cursor-pointer"
            >
              <Box className="w-3 h-3" />
              <span>3D Layer View</span>
            </button>
          </div>
        </div>

        {/* CARD 2: SATELLITE INTELLIGENCE (~19% width) */}
        <div className="flex-1 min-w-[210px] max-w-[20%] rounded-2xl bg-[#071324] border border-[#142642] p-3 flex flex-col justify-between relative overflow-hidden shadow-md hover:border-[#00D9FF]/40 transition-colors">
          <div>
            <div className="text-[12.5px] font-bold text-[#FFFFFF] tracking-wide">Satellite Intelligence</div>
            <div className="text-[9px] text-[#94A3B8]">Powered by Space Technology</div>
          </div>

          {/* Orbiting Satellite Scene */}
          <div className="relative flex-1 rounded-xl overflow-hidden my-1.5 border border-[#142642]">
            <SatelliteSpaceGraphic className="w-full h-full object-cover" />

            {/* Bottom-Left Telemetry Inset */}
            <div className="absolute bottom-1.5 left-1.5 space-y-0.5 text-[8.5px] font-medium bg-[#020611]/85 p-1.5 rounded-lg border border-[#14233A] backdrop-blur-sm">
              <div className="flex items-center gap-1 text-[#FFFFFF]">
                <Check className="w-2.5 h-2.5 text-[#00E69A]" />
                <span>NDVI: 0.72</span>
              </div>
              <div className="flex items-center gap-1 text-[#FFFFFF]">
                <Check className="w-2.5 h-2.5 text-[#00E69A]" />
                <span>Soil Moisture: 68%</span>
              </div>
              <div className="flex items-center gap-1 text-[#FFFFFF]">
                <Check className="w-2.5 h-2.5 text-[#00E69A]" />
                <span>Rainfall: 842 mm</span>
              </div>
            </div>

            {/* Bottom-Right Inset NDVI false-color map */}
            <div className="absolute bottom-1.5 right-1.5 w-11 h-11 rounded-lg overflow-hidden border border-[#00E69A] shadow-md bg-[#020611]">
              <div className="absolute top-0.5 left-1 text-[6.5px] font-bold text-[#00E69A] bg-[#020611]/80 px-0.5 rounded">
                NDVI
              </div>
              <div className="w-full h-full bg-gradient-to-br from-[#FF1E1E] via-[#FFD600] to-[#00E676] opacity-85" />
            </div>
          </div>
        </div>

        {/* CARD 3: GEOLOGICAL HEATMAP (~18% width) */}
        <div className="flex-1 min-w-[200px] max-w-[19%] rounded-2xl bg-[#071324] border border-[#142642] p-3 flex flex-col justify-between relative overflow-hidden shadow-md hover:border-[#00D9FF]/40 transition-colors">
          <div>
            <div className="text-[12.5px] font-bold text-[#FFFFFF] tracking-wide">Geological Heatmap</div>
            <div className="text-[9px] text-[#94A3B8]">Find the richest zones</div>
          </div>

          {/* Regional Heatmap Graphic */}
          <div className="relative flex-1 rounded-xl overflow-hidden my-1.5 border border-[#142642]">
            <RegionalHeatmapGraphic className="w-full h-full" />

            {/* Bottom-Right Color Legend */}
            <div className="absolute bottom-1.5 right-1.5 bg-[#020611]/85 p-1 rounded-md border border-[#14233A] text-[8px] space-y-0.5">
              <div className="flex items-center gap-1 text-[#CBD5E1]">
                <span className="w-2 h-2 rounded-sm bg-[#FF1E1E]" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-1 text-[#CBD5E1]">
                <span className="w-2 h-2 rounded-sm bg-[#FFDE00]" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1 text-[#CBD5E1]">
                <span className="w-2 h-2 rounded-sm bg-[#00D9FF]" />
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: NEXUS AI ASSISTANT (~26% width) */}
        <div className="flex-1 min-w-[270px] max-w-[27%] rounded-2xl bg-[#071324] border border-[#142642] p-3 flex flex-col justify-between relative overflow-hidden shadow-md hover:border-[#3B82F6]/50 transition-colors">
          <div>
            <div className="text-[12.5px] font-bold text-[#FFFFFF] tracking-wide">NEXUS AI Assistant</div>
            <div className="text-[9px] text-[#94A3B8]">Your Geo-Intelligence Copilot</div>
          </div>

          <div className="flex items-center gap-2 flex-1 my-1">
            {/* Left side: Dialogue snippet & audio waveform */}
            <div className="flex-1 flex flex-col justify-between h-full space-y-1">
              {/* User Bubble */}
              <div className="p-1.5 rounded-xl bg-[#0D1E36] border border-[#1E3A8A] text-[8px] text-[#E2E8F0] flex items-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#1E3A8A] flex items-center justify-center shrink-0">
                  <Compass className="w-2 h-2 text-[#00D9FF]" />
                </div>
                <span className="truncate">Show me high potential Manganese zones in Mandla region.</span>
              </div>

              {/* AI Bubble */}
              <div className="p-1.5 rounded-xl bg-[#0B2544] border border-[#00D9FF]/40 text-[8px] text-[#00D9FF] flex items-start gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#00E69A]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2 h-2 text-[#00E69A]" />
                </div>
                <span className="leading-tight">
                  3 high-potential zones identified with 92% confidence. Estimated reserves: 42.5 Mt
                </span>
              </div>

              {/* Glowing Soundwave Equalizer */}
              <div className="flex items-center justify-center gap-1 h-3 py-0.5">
                {[4, 8, 12, 6, 10, 14, 7, 11, 5, 9, 13, 6, 12, 8].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-[#00D9FF] rounded-full animate-pulse"
                    style={{
                      height: `${h}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Right side: 3D Robot Mascot */}
            <div className="w-20 shrink-0 flex items-center justify-center">
              <RobotMascot3D className="w-18 h-22 drop-shadow-[0_0_12px_rgba(0,217,255,0.4)]" />
            </div>
          </div>

          {/* Interactive Chat Input Bar */}
          <form onSubmit={handleSendMessage} className="relative flex items-center mt-0.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full h-7 pl-3 pr-8 rounded-full bg-[#030914] border border-[#1E3A8A] text-[9.5px] text-[#FFFFFF] placeholder-[#64748B] focus:outline-none focus:border-[#00D9FF] transition-colors"
            />
            <button
              type="submit"
              className="absolute right-1 w-5 h-5 rounded-full bg-[#0284C7] hover:bg-[#00D9FF] text-[#FFFFFF] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Send className="w-2.5 h-2.5 ml-0.5" />
            </button>
          </form>
        </div>

        {/* CARD 5: MOBILE VIEW (~14% width) */}
        <div className="flex-1 min-w-[140px] max-w-[15%] rounded-2xl bg-[#071324] border border-[#142642] p-3 flex flex-col justify-between relative overflow-hidden shadow-md hover:border-[#00D9FF]/40 transition-colors">
          <div>
            <div className="text-[12.5px] font-bold text-[#FFFFFF] tracking-wide">Mobile View</div>
            <div className="text-[9px] text-[#94A3B8]">On the Go. Always.</div>
          </div>

          {/* 3D Tilted Smartphone Mockup */}
          <div className="relative flex-1 flex items-center justify-center py-1">
            <MobileViewMockup3D className="w-full h-full max-h-[175px]" />
          </div>
        </div>
      </div>

      {/* 3. EARTH X-RAY FULL 3D INTERACTIVE MODAL */}
      {isXRayModalOpen && (
        <EarthXRayModal mine={selectedMine} onClose={() => setIsXRayModalOpen(false)} />
      )}
    </div>
  );
};
