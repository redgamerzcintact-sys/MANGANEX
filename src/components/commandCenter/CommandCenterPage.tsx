import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import { InteractiveMap } from './InteractiveMap';
import { EarthXRayModal } from './EarthXRayModal';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import {
  MineralCrystal3D,
  HaulTruck3D,
  HazardTriangle3D,
  ShieldScore3D,
  RobotMascot3D,
} from '../brand/VisualAssets';
import {
  Layers,
  Calendar,
  Sliders,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Check,
} from 'lucide-react';

export const CommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedMine, toggleNexus } = useAppStore();

  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [isPlayingYear, setIsPlayingYear] = useState<boolean>(false);
  const [isXRayModalOpen, setIsXRayModalOpen] = useState<boolean>(false);
  const [topRiskAlerts, setTopRiskAlerts] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    api.getAlerts().then((res) => {
      if (active && res?.top_risk_mines?.length) {
        setTopRiskAlerts(res.top_risk_mines);
      }
    }).catch((e) => console.warn('Could not fetch risk alerts:', e));
    return () => { active = false; };
  }, []);

  // Layer toggles
  const [activeLayers, setActiveLayers] = useState({
    boreholes: true,
    seismic: true,
    groundwater: false,
    haulage: true,
    riskHeatmap: true,
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

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#120F0D] text-[#FFF8F0] select-none font-sans">
      {/* ========================================================================= */}
      {/* CLEAN FULL-VIEWPORT GIS EXPLORER: WARM SKIN & HIGH-CONTRAST PALETTE       */}
      {/* ========================================================================= */}
      <div className="flex flex-1 min-h-0 h-full overflow-hidden relative">
        
        {/* ----------------------------------------------------------------------- */}
        {/* A. LEFT PANEL: CONTROL HUB                                              */}
        {/* ----------------------------------------------------------------------- */}
        <div className="w-[220px] shrink-0 h-full border-r border-[#4D4037] bg-[#1A1613] flex flex-col justify-between p-3 overflow-y-auto">
          <div className="space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#FFF8F0] tracking-wide font-heading">
                  Control Hub
                </span>
                <span className="text-[9.5px] font-mono text-[#FB923C] font-bold">
                  v2.5-HACKATHON
                </span>
              </div>
              <div className="mt-1">
                <ProvenanceBadge
                  status="DERIVED"
                  source="MOIL Spatial Cadastre & Geological Boreholes"
                />
              </div>
            </div>

            {/* 1. DATA LAYERS */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#DEC8B7] mb-1.5 uppercase tracking-wider">
                <Layers className="w-3 h-3 text-[#FB923C]" />
                <span>Data Layers</span>
              </div>
              <div className="space-y-1.5 text-[10.5px]">
                {/* Borehole Data */}
                <div
                  onClick={() => toggleLayer('boreholes')}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] cursor-pointer transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.boreholes ? 'bg-[#FB923C] text-[#120F0D]' : 'border border-[#FB923C]/50'
                      }`}
                    >
                      {activeLayers.boreholes && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#FFF8F0] font-medium truncate">Borehole Data</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#A69282]">142 pts</span>
                    <ChevronRight className="w-3 h-3 text-[#A69282]" />
                  </div>
                </div>

                {/* Seismic Surveys */}
                <div
                  onClick={() => toggleLayer('seismic')}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] cursor-pointer transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.seismic ? 'bg-[#C084FC] text-[#120F0D]' : 'border border-[#C084FC]/50'
                      }`}
                    >
                      {activeLayers.seismic && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#FFF8F0] font-medium truncate">Seismic Surveys</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#A69282]">18 lines</span>
                    <ChevronRight className="w-3 h-3 text-[#A69282]" />
                  </div>
                </div>

                {/* Groundwater Table */}
                <div
                  onClick={() => toggleLayer('groundwater')}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] cursor-pointer transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.groundwater ? 'bg-[#10B981] text-[#120F0D]' : 'border border-[#10B981]/50'
                      }`}
                    >
                      {activeLayers.groundwater && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#FFF8F0] font-medium truncate">Groundwater Table</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#10B981] font-semibold">Active</span>
                    <ChevronRight className="w-3 h-3 text-[#A69282]" />
                  </div>
                </div>

                {/* Haulage & Roads */}
                <div
                  onClick={() => toggleLayer('haulage')}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] cursor-pointer transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.haulage ? 'bg-[#F59E0B] text-[#120F0D]' : 'border border-[#F59E0B]/50'
                      }`}
                    >
                      {activeLayers.haulage && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#FFF8F0] font-medium truncate">Haulage & Roads</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#A69282]">24 km</span>
                    <ChevronRight className="w-3 h-3 text-[#A69282]" />
                  </div>
                </div>

                {/* Risk Heatmap */}
                <div
                  onClick={() => toggleLayer('riskHeatmap')}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] cursor-pointer transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-colors ${
                        activeLayers.riskHeatmap ? 'bg-[#EF4444] text-[#FFF8F0]' : 'border border-[#EF4444]/50'
                      }`}
                    >
                      {activeLayers.riskHeatmap && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                    </div>
                    <span className="text-[#FFF8F0] font-medium truncate">Risk Heatmap</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] text-[#EF4444] font-semibold">Live</span>
                    <ChevronRight className="w-3 h-3 text-[#A69282]" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. TIME CONTROL */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#DEC8B7] mb-1.5 uppercase tracking-wider">
                <Calendar className="w-3 h-3 text-[#FB923C]" />
                <span>Time Control</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#DEC8B7]">Year:</span>
                  <span className="text-[#FB923C] font-bold text-sm">{selectedYear}</span>
                </div>
                {/* Horizontal slider */}
                <div className="relative h-1.5 bg-[#4D4037] rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-[#FB923C] to-[#F59E0B] rounded-full shadow-[0_0_8px_#FB923C]"
                    style={{ width: `${((selectedYear - 2020) / (2025 - 2020)) * 100}%` }}
                  />
                  <div
                    className="absolute -top-1 w-3.5 h-3.5 rounded-full bg-[#FB923C] shadow-[0_0_10px_#FB923C] border border-white"
                    style={{ left: `calc(${((selectedYear - 2020) / (2025 - 2020)) * 100}% - 7px)` }}
                  />
                </div>
                {/* Controls: Prev, Play, Next */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <button
                    onClick={() => setSelectedYear((y) => Math.max(2020, y - 1))}
                    className="text-[#DEC8B7] hover:text-[#FB923C] cursor-pointer transition-colors"
                  >
                    ⏮
                  </button>
                  <button
                    onClick={() => setIsPlayingYear(!isPlayingYear)}
                    className="w-7 h-7 rounded-full bg-[#FB923C] text-[#120F0D] flex items-center justify-center font-bold text-xs shadow-[0_0_12px_#FB923C] hover:scale-105 transition-transform cursor-pointer"
                  >
                    {isPlayingYear ? '⏸' : '▶'}
                  </button>
                  <button
                    onClick={() => setSelectedYear((y) => Math.min(2025, y + 1))}
                    className="text-[#DEC8B7] hover:text-[#FB923C] cursor-pointer transition-colors"
                  >
                    ⏭
                  </button>
                </div>
              </div>
            </div>

            {/* 3. ANALYSIS TOOLS */}
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#DEC8B7] mb-1.5 uppercase tracking-wider">
                <Sliders className="w-3 h-3 text-[#FB923C]" />
                <span>Analysis Tools</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-[9.5px]">
                {['Measure', 'Draw', 'Query', '3D View'].map((tool) => (
                  <button
                    key={tool}
                    onClick={() => {
                      if (tool === '3D View') setIsXRayModalOpen(true);
                      else navigate('/exploration');
                    }}
                    className="py-1.5 px-1 rounded-lg bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] hover:border-[#FB923C] text-[#DEC8B7] hover:text-[#FB923C] transition-all text-center cursor-pointer shadow-sm font-medium"
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. AI ASSISTANT QUICK ACTION */}
          <div
            onClick={() => toggleNexus()}
            className="p-3 rounded-2xl bg-[#241E1A] border border-[#FB923C]/40 shadow-[0_0_14px_rgba(251,146,60,0.18)] flex items-center justify-between cursor-pointer hover:border-[#FB923C] transition-all group mt-2"
          >
            <div className="flex flex-col pr-1 min-w-0">
              <span className="text-[11px] font-bold text-[#FFF8F0] group-hover:text-[#FB923C] transition-colors font-heading">
                NEXUS AI Copilot
              </span>
              <span className="text-[8.5px] text-[#DEC8B7] leading-tight mt-0.5">
                Query reserves &amp; shortfall risk...
              </span>
            </div>
            <div className="shrink-0">
              <RobotMascot3D className="w-9 h-9 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" mini />
            </div>
          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* B. CENTER SATELLITE MAP (FULL VIEWPORT HEIGHT, EXPANSIVE & CLEAN)       */}
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
        <div className="w-[320px] shrink-0 h-full border-l border-[#4D4037] bg-[#1A1613] flex flex-col justify-between p-3 overflow-y-auto space-y-3">
          
          {/* 1. 2x2 KPI GRID */}
          <div className="grid grid-cols-2 gap-2">
            {/* Card 1: Total Reserves */}
            <div className="p-2.5 rounded-xl bg-[#241E1A] border border-[#4D4037] hover:border-[#FB923C]/50 transition-colors flex items-center gap-2 shadow-sm">
              <MineralCrystal3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[#DEC8B7] font-medium truncate">Total Reserves</span>
                <span className="text-[14px] font-extrabold text-[#FFF8F0] font-mono leading-tight">125.8 Mt</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#10B981] font-semibold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>+12.5%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Predicted Production */}
            <div className="p-2.5 rounded-xl bg-[#241E1A] border border-[#4D4037] hover:border-[#F59E0B]/50 transition-colors flex items-center gap-2 shadow-sm">
              <HaulTruck3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] text-[#DEC8B7] font-medium leading-none">Predicted Output</span>
                <span className="text-[14px] font-extrabold text-[#FFF8F0] font-mono leading-tight mt-0.5">18.7 Mt</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#10B981] font-semibold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>+8.3%</span>
                </div>
              </div>
            </div>

            {/* Card 3: Shortfall Risk */}
            <div className="p-2.5 rounded-xl bg-[#241E1A] border border-[#4D4037] hover:border-[#FB923C]/50 transition-colors flex items-center gap-2 shadow-sm">
              <HazardTriangle3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] text-[#DEC8B7] font-medium truncate">Shortfall Risk</span>
                <span className="text-[14px] font-extrabold text-[#FFF8F0] font-mono leading-tight">12%</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#10B981] font-semibold mt-0.5">
                  <TrendingDown className="w-2.5 h-2.5" />
                  <span>-6.2%</span>
                </div>
              </div>
            </div>

            {/* Card 4: Model Target Metric */}
            <div className="p-2.5 rounded-xl bg-[#241E1A] border border-[#4D4037] hover:border-[#E8B298]/50 transition-colors flex items-center gap-2 shadow-sm">
              <ShieldScore3D className="w-10 h-10 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] text-[#DEC8B7] font-medium leading-none">Geol. Confidence</span>
                <span className="text-[14px] font-extrabold text-[#FFF8F0] font-mono leading-tight mt-0.5">89.2%</span>
                <div className="flex items-center gap-0.5 text-[8.5px] text-[#10B981] font-semibold mt-0.5">
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>Borehole Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PRODUCTION TREND CHART */}
          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[#FFF8F0] font-heading">Production Trend</span>
              <div className="flex items-center gap-2.5 text-[9px] font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FB923C]" />
                  <span className="text-[#DEC8B7]">Actual</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#E8B298]" />
                  <span className="text-[#DEC8B7]">Predicted</span>
                </div>
              </div>
            </div>

            {/* Precision SVG Chart */}
            <div className="w-full h-[115px] relative">
              <svg viewBox="0 0 290 115" fill="none" className="w-full h-full">
                {/* Horizontal grid lines */}
                <line x1="25" y1="15" x2="280" y2="15" stroke="#4D4037" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="25" y1="40" x2="280" y2="40" stroke="#4D4037" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="25" y1="65" x2="280" y2="65" stroke="#4D4037" strokeWidth="0.8" strokeDasharray="3 3" />
                <line x1="25" y1="90" x2="280" y2="90" stroke="#4D4037" strokeWidth="0.8" />

                {/* Y-axis labels */}
                <text x="8" y="18" fill="#A69282" fontSize="8" fontFamily="sans-serif">20</text>
                <text x="8" y="43" fill="#A69282" fontSize="8" fontFamily="sans-serif">15</text>
                <text x="8" y="68" fill="#A69282" fontSize="8" fontFamily="sans-serif">10</text>
                <text x="12" y="93" fill="#A69282" fontSize="8" fontFamily="sans-serif">5</text>
                <text x="12" y="105" fill="#A69282" fontSize="8" fontFamily="sans-serif">0</text>

                {/* X-axis labels */}
                <text x="35" y="105" fill="#A69282" fontSize="8" fontFamily="sans-serif">2020</text>
                <text x="80" y="105" fill="#A69282" fontSize="8" fontFamily="sans-serif">2021</text>
                <text x="130" y="105" fill="#FB923C" fontSize="8" fontWeight="bold" fontFamily="sans-serif">2022</text>
                <text x="180" y="105" fill="#A69282" fontSize="8" fontFamily="sans-serif">2023</text>
                <text x="225" y="105" fill="#A69282" fontSize="8" fontFamily="sans-serif">2024</text>
                <text x="265" y="105" fill="#A69282" fontSize="8" fontFamily="sans-serif">2025</text>

                {/* Vertical reference line at 2022 */}
                <line x1="140" y1="15" x2="140" y2="90" stroke="#FB923C" strokeWidth="1" strokeDasharray="3 2" opacity="0.7" />

                {/* Actual Line (Warm Terracotta) from 2020 to 2022 */}
                <path
                  d="M45 78 L90 68 L140 45"
                  stroke="#FB923C"
                  strokeWidth="2.4"
                  fill="none"
                />
                <circle cx="45" cy="78" r="3" fill="#FB923C" stroke="#FFF8F0" strokeWidth="1" />
                <circle cx="90" cy="68" r="3" fill="#FB923C" stroke="#FFF8F0" strokeWidth="1" />
                <circle cx="140" cy="45" r="3.5" fill="#FB923C" stroke="#FFF8F0" strokeWidth="1.5" />

                {/* Predicted Line (Warm Peach / Skin tone) from 2022 to 2025 */}
                <path
                  d="M140 45 L188 38 L232 30 L272 24"
                  stroke="#E8B298"
                  strokeWidth="2.4"
                  strokeDasharray="4 2"
                  fill="none"
                />
                <circle cx="188" cy="38" r="3" fill="#E8B298" stroke="#FFF8F0" strokeWidth="1" />
                <circle cx="232" cy="30" r="3" fill="#E8B298" stroke="#FFF8F0" strokeWidth="1" />
                <circle cx="272" cy="24" r="3" fill="#E8B298" stroke="#FFF8F0" strokeWidth="1" />
              </svg>
            </div>
          </div>

          {/* 3. REAL-TIME SHORTFALL RISK ALERTS */}
          <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] shadow-sm flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#FFF8F0] font-heading">14-Day Shortfall Alerts</span>
              <button
                onClick={() => navigate('/scenario-lab')}
                className="text-[9px] font-bold text-[#FB923C] hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Scenario Lab</span>
                <span>→</span>
              </button>
            </div>

            {topRiskAlerts.length > 0 ? (
              topRiskAlerts.slice(0, 3).map((alert, i) => (
                <div
                  key={alert.mine_id || i}
                  onClick={() => navigate('/scenario-lab')}
                  className={`flex items-start gap-2 p-2 rounded-xl cursor-pointer transition-colors ${
                    alert.risk_level === 'CRITICAL'
                      ? 'bg-[#2F2722] border border-[#EF4444]/50 hover:border-[#EF4444]'
                      : 'bg-[#2F2722] border border-[#F59E0B]/50 hover:border-[#F59E0B]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.risk_level === 'CRITICAL'
                        ? 'bg-[#EF4444]/20 border border-[#EF4444] text-[#EF4444]'
                        : 'bg-[#F59E0B]/20 border border-[#F59E0B] text-[#F59E0B]'
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9.5px] font-bold text-[#FFF8F0] truncate">
                        {alert.mine_name}
                      </span>
                      <span
                        className={`text-[8.5px] font-mono font-bold shrink-0 ${
                          alert.risk_level === 'CRITICAL' ? 'text-[#EF4444]' : 'text-[#F59E0B]'
                        }`}
                      >
                        -{alert.shortfall_tonnes?.toLocaleString()}T
                      </span>
                    </div>
                    <span className="text-[8px] text-[#DEC8B7] mt-0.5 truncate leading-tight">
                      {alert.primary_cause}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Fallback default alerts while fetching */}
                <div className="flex items-start gap-2 p-2 rounded-xl bg-[#2F2722] border border-[#EF4444]/40">
                  <div className="w-5 h-5 rounded-lg bg-[#EF4444]/20 border border-[#EF4444] flex items-center justify-center shrink-0 mt-0.5">
                    <AlertTriangle className="w-3 h-3 text-[#EF4444]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9.5px] font-bold text-[#FFF8F0] leading-tight">
                      Balaghat Shortfall Warning
                    </span>
                    <span className="text-[8px] text-[#DEC8B7] mt-0.5">
                      Forecast Monsoon Inflow Spike
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 rounded-xl bg-[#2F2722] border border-[#FB923C]/40">
                  <div className="w-5 h-5 rounded-lg bg-[#FB923C]/20 border border-[#FB923C] flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-3 h-3 text-[#FB923C]" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[9.5px] font-bold text-[#FFF8F0] leading-tight">
                      Forecast Engine Synchronized
                    </span>
                    <span className="text-[8px] text-[#FB923C] mt-0.5">
                      16-Day Weather Telemetry Connected
                    </span>
                  </div>
                </div>
              </>
            )}
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
