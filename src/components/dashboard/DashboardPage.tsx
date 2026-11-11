import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import {
  Compass,
  MapPin,
  TrendingUp,
  Activity,
  AlertTriangle,
  Satellite,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const PRODUCTION_TREND_DATA = [
  { month: 'Jan', actual: 14.2, target: 14.0 },
  { month: 'Feb', actual: 15.1, target: 14.5 },
  { month: 'Mar', actual: 16.8, target: 15.0 },
  { month: 'Apr', actual: 15.9, target: 15.5 },
  { month: 'May', actual: 17.4, target: 16.0 },
  { month: 'Jun', actual: 18.2, target: 16.5 },
  { month: 'Jul', actual: 16.5, target: 17.0 },
  { month: 'Aug', actual: 17.9, target: 17.5 },
  { month: 'Sep', actual: 18.7, target: 18.0 }
];

const PROSPECTIVITY_DIST_DATA = [
  { name: 'Very High', value: 34, color: '#FF6878' },
  { name: 'High', value: 28, color: '#F4B860' },
  { name: 'Moderate', value: 24, color: '#54D8E8' },
  { name: 'Low', value: 14, color: '#168BFF' }
];

const RECENT_INVESTIGATIONS = [
  {
    id: 'INV-2026-89',
    zone: 'Dongri Buzurg North Ridge',
    type: 'Drillcore Lithology Assay',
    prospectivity: '42.5 Mt Potential',
    confidence: '94.2%',
    status: 'Verified',
    link: '/exploration'
  },
  {
    id: 'INV-2026-88',
    zone: 'Balaghat Deep Reef (-385m)',
    type: 'Braunite Schist Horizon',
    prospectivity: 'High Grade (44% Mn)',
    confidence: '96.0%',
    status: 'In Progress',
    link: '/subsurface'
  },
  {
    id: 'INV-2026-87',
    zone: 'Tirodi Southwest Syncline',
    type: 'Sentinel-2 Carbonate Ratio',
    prospectivity: '18.4 Mt Inferred',
    confidence: '88.5%',
    status: 'Pending Core',
    link: '/satellite'
  }
];

export const DashboardPage: React.FC = () => {
  const { selectedMine, startBriefing } = useAppStore();
  const [selectedTimeframe, setSelectedTimeframe] = useState('YTD 2026');

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 select-none font-sans">
      {/* 1. TOP HEADER & INTRO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1C3045] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#54D8E8]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#54D8E8] uppercase">
              OPERATIONAL INTELLIGENCE HEADQUARTERS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Mining Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#9BAFC1] mt-0.5">
            Explore geological potential. Monitor extraction rhythms. Make evidence-based decisions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#101927] border border-[#1C3045] text-xs font-mono text-[#F2F6FA]">
            <Calendar className="w-3.5 h-3.5 text-[#54D8E8]" />
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="bg-transparent border-none text-xs font-mono text-white focus:outline-none cursor-pointer"
            >
              <option value="Last 30 Days" className="bg-[#101927]">Last 30 Days</option>
              <option value="Q3 2026" className="bg-[#101927]">Q3 2026</option>
              <option value="YTD 2026" className="bg-[#101927]">YTD 2026</option>
            </select>
          </div>

          <button
            onClick={() => startBriefing()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#152235] hover:bg-[#1C3045] border border-[#54D8E8]/40 text-xs font-mono font-bold text-[#54D8E8] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXECUTIVE BRIEF</span>
          </button>
        </div>
      </div>

      {/* 2. RESTRAINED TOP KPIS (5 Core Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* KPI 1: Exploration Areas */}
        <NavLink
          to="/command-center"
          className="p-4 rounded-xl border border-[#1C3045] bg-[#101927] hover:border-[#54D8E8]/60 transition-all group"
        >
          <div className="flex items-center justify-between text-[#9BAFC1] text-xs font-mono mb-1">
            <span>EXPLORATION AREAS</span>
            <Compass className="w-3.5 h-3.5 group-hover:text-[#54D8E8] transition-colors" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-white">
            7 Mines
          </div>
          <span className="text-[10px] font-mono text-[#43D6A0] mt-1 block">
            &uarr; 1,420 km&sup2; Sausar Belt
          </span>
        </NavLink>

        {/* KPI 2: High-Prospectivity Zones */}
        <NavLink
          to="/prospectivity"
          className="p-4 rounded-xl border border-[#1C3045] bg-[#101927] hover:border-[#FF6878]/60 transition-all group"
        >
          <div className="flex items-center justify-between text-[#9BAFC1] text-xs font-mono mb-1">
            <span>HIGH PROSPECTIVITY</span>
            <MapPin className="w-3.5 h-3.5 group-hover:text-[#FF6878] transition-colors" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-white">
            42.5 Mt
          </div>
          <span className="text-[10px] font-mono text-[#FF6878] mt-1 block">
            3 High-Potential Anomalies
          </span>
        </NavLink>

        {/* KPI 3: Production Performance */}
        <NavLink
          to="/production"
          className="p-4 rounded-xl border border-[#1C3045] bg-[#101927] hover:border-[#43D6A0]/60 transition-all group"
        >
          <div className="flex items-center justify-between text-[#9BAFC1] text-xs font-mono mb-1">
            <span>ANNUAL RUN RATE</span>
            <Activity className="w-3.5 h-3.5 group-hover:text-[#43D6A0] transition-colors" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-white">
            18.7 Mt
          </div>
          <span className="text-[10px] font-mono text-[#43D6A0] mt-1 block">
            &uarr; 8.3% Above Target
          </span>
        </NavLink>

        {/* KPI 4: Equipment Availability */}
        <NavLink
          to="/equipment"
          className="p-4 rounded-xl border border-[#1C3045] bg-[#101927] hover:border-[#F4B860]/60 transition-all group"
        >
          <div className="flex items-center justify-between text-[#9BAFC1] text-xs font-mono mb-1">
            <span>EQUIPMENT UPTIME</span>
            <TrendingUp className="w-3.5 h-3.5 group-hover:text-[#F4B860] transition-colors" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-white">
            92.4%
          </div>
          <span className="text-[10px] font-mono text-[#F4B860] mt-1 block">
            48 / 52 Fleet Active
          </span>
        </NavLink>

        {/* KPI 5: Active Risk Alerts */}
        <NavLink
          to="/risk-center"
          className="p-4 rounded-xl border border-[#1C3045] bg-[#101927] hover:border-[#FF6878]/60 transition-all group col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between text-[#9BAFC1] text-xs font-mono mb-1">
            <span>ACTIVE ALERTS</span>
            <AlertTriangle className="w-3.5 h-3.5 text-[#FF6878]" />
          </div>
          <div className="text-2xl font-heading font-extrabold text-white">
            2 Alerts
          </div>
          <span className="text-[10px] font-mono text-[#FF6878] mt-1 block animate-pulse">
            Slope Stability Advisory
          </span>
        </NavLink>
      </div>

      {/* 3. ROW 2: GEOLOGICAL MAP PREVIEW + OPERATIONAL ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Explorer Preview Card */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-[#1C3045] bg-[#101927] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <span>Central Manganese Concession & Prospectivity Cadastre</span>
              </h3>
              <p className="text-xs text-[#9BAFC1] mt-0.5">
                Balaghat &ndash; Dongri Buzurg active lease boundaries with borehole heatmaps.
              </p>
            </div>
            <NavLink
              to="/command-center"
              className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#54D8E8] hover:underline"
            >
              <span>Open GIS Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          {/* Interactive GIS Preview Thumbnail */}
          <div className="relative h-64 rounded-xl overflow-hidden border border-[#1C3045] bg-[#080C12] group">
            {/* Synthetic high-detail terrain map visual */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_45%_50%,rgba(244,184,96,0.3)_0%,rgba(84,216,232,0.15)_30%,transparent_70%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1C304520_1px,transparent_1px),linear-gradient(to_bottom,#1C304520_1px,transparent_1px)] bg-[size:2rem_2rem]" />
            
            {/* Visual Markers & Concession Polygon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-36 rounded-2xl border-2 border-dashed border-[#54D8E8]/70 bg-[#54D8E8]/5 flex flex-col items-center justify-center p-3 relative shadow-[0_0_20px_rgba(84,216,232,0.15)]">
                <span className="text-[10px] font-mono text-[#54D8E8] font-bold">
                  DONGRI BUZURG CONCESSION
                </span>
                <span className="text-[11px] font-mono font-extrabold text-white mt-1">
                  High Potential Zone ~ 42.5 Mt
                </span>
                <span className="text-[9px] font-mono text-[#43D6A0] mt-0.5">
                  Braunite Ore Reef Confirmed
                </span>
              </div>
            </div>

            {/* Quick Map Action Bar */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono bg-[#090D16]/90 backdrop-blur-md px-3 py-2 rounded-lg border border-[#1C3045]">
              <span className="text-[#9BAFC1]">Lat: 21.5485&deg; N, Lon: 79.6975&deg; E</span>
              <span className="text-[#54D8E8] font-bold">ESRI Terrain &bull; 142 Boreholes Active</span>
            </div>
          </div>
        </div>

        {/* Right: Operational Intelligence & Alerts */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-[#1C3045] bg-[#101927] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-base text-white">
                Live Telemetry & Alerts
              </h3>
              <NavLink
                to="/risk-center"
                className="text-xs font-mono text-[#FF6878] hover:underline font-bold"
              >
                View Radar
              </NavLink>
            </div>
            <p className="text-xs text-[#9BAFC1] mb-4">
              Real-time InSAR satellite & sensor warnings across active sectors.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-[#FF6878]/30 bg-[#FF6878]/10">
                <div className="flex items-center justify-between text-xs font-bold text-[#FF6878] mb-1">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Pit Slope Micro-Deformation
                  </span>
                  <span className="text-[9px] font-mono">2 min ago</span>
                </div>
                <p className="text-[11px] text-[#9BAFC1] leading-relaxed">
                  Sector 4 North Wall displaced 3.4mm. Recommended routing haul trucks via Southern Ramp B.
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#54D8E8]/30 bg-[#54D8E8]/10">
                <div className="flex items-center justify-between text-xs font-bold text-[#54D8E8] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Sentinel-2 MSI Ingestion
                  </span>
                  <span className="text-[9px] font-mono">42 min ago</span>
                </div>
                <p className="text-[11px] text-[#9BAFC1] leading-relaxed">
                  Cloud-free reflectance pass processed. NDVI normalized across Mandla exploration corridor.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1C3045] flex items-center justify-between text-xs font-mono text-[#9BAFC1]">
            <span>System Integrity: Verified</span>
            <span className="text-[#43D6A0] font-bold">100% OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* 4. ROW 3: PRODUCTION TREND + PROSPECTIVITY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Production Trend Chart */}
        <div className="lg:col-span-8 p-5 rounded-2xl border border-[#1C3045] bg-[#101927]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-base text-white">
                Monthly Extraction vs Target Trend
              </h3>
              <p className="text-xs text-[#9BAFC1]">
                Metric tonnes extracted across underground and opencast benches.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-[#54D8E8]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#54D8E8]" />
                Actual Production
              </span>
              <span className="flex items-center gap-1 text-[#A78BFA]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A78BFA]" />
                Target Schedule
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PRODUCTION_TREND_DATA}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#54D8E8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#54D8E8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C3045" vertical={false} />
                <XAxis dataKey="month" stroke="#657A90" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#657A90" fontSize={11} fontFamily="monospace" unit=" Mt" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090D16',
                    border: '1px solid #1C3045',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'monospace'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  stroke="#54D8E8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#A78BFA"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Prospectivity Distribution Donut */}
        <div className="lg:col-span-4 p-5 rounded-2xl border border-[#1C3045] bg-[#101927] flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-base text-white mb-1">
              Prospectivity Classification
            </h3>
            <p className="text-xs text-[#9BAFC1] mb-3">
              Distribution of prospective anomalies across explored leases.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROSPECTIVITY_DIST_DATA}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {PROSPECTIVITY_DIST_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090D16',
                      border: '1px solid #1C3045',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-[#1C3045]">
            {PROSPECTIVITY_DIST_DATA.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[#9BAFC1]">{item.name}:</span>
                <span className="font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. BOTTOM SECTION: RECENT INVESTIGATIONS TABLE */}
      <div className="p-5 rounded-2xl border border-[#1C3045] bg-[#101927]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-base text-white">
              Recent Geological Investigations
            </h3>
            <p className="text-xs text-[#9BAFC1]">
              Core drillhole analyses, borehole assays, and satellite anomalies.
            </p>
          </div>
          <NavLink
            to="/exploration"
            className="text-xs font-mono font-bold text-[#54D8E8] hover:underline flex items-center gap-1"
          >
            <span>All Investigations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">RECORD ID</th>
                <th className="py-2.5 px-3">EXPLORATION ZONE</th>
                <th className="py-2.5 px-3">INVESTIGATION TYPE</th>
                <th className="py-2.5 px-3">ESTIMATED POTENTIAL</th>
                <th className="py-2.5 px-3">AI CONFIDENCE</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/60 text-[#F2F6FA]">
              {RECENT_INVESTIGATIONS.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#152235]/60 transition-colors">
                  <td className="py-3 px-3 font-bold text-[#54D8E8]">{inv.id}</td>
                  <td className="py-3 px-3 font-medium">{inv.zone}</td>
                  <td className="py-3 px-3 text-[#9BAFC1]">{inv.type}</td>
                  <td className="py-3 px-3 font-bold">{inv.prospectivity}</td>
                  <td className="py-3 px-3 text-[#43D6A0]">{inv.confidence}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#43D6A0]/15 text-[#43D6A0] border border-[#43D6A0]/30">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <NavLink
                      to={inv.link}
                      className="px-2.5 py-1 rounded bg-[#152235] hover:bg-[#1C3045] text-[11px] text-[#54D8E8] border border-[#1C3045] transition-colors"
                    >
                      Inspect
                    </NavLink>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

