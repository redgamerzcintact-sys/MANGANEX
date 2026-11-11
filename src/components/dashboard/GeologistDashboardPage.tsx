import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Compass,
  MapPin,
  Layers,
  Box,
  Cpu,
  FileText,
  BrainCircuit,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Eye
} from 'lucide-react';
import {
  ResponsiveContainer,
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

const BOREHOLES_SUMMARY = [
  { id: 'BH-BL-101', mine: 'Balaghat Deep', depth: 420, recovery: '92.4%', grade: '44.8% Mn', lithology: 'Massive Braunite Reef', unfc: 'UNFC-111' },
  { id: 'BH-DB-204', mine: 'Dongri Buzurg', depth: 280, recovery: '88.5%', grade: '41.2% Mn', lithology: 'Gondite Alteration Zone', unfc: 'UNFC-111' },
  { id: 'BH-CH-305', mine: 'Chikla North', depth: 350, recovery: '94.1%', grade: '46.1% Mn', lithology: 'Mansar Quartz Mica Schist', unfc: 'UNFC-122' },
  { id: 'BH-UK-412', mine: 'Ukwa Hillside', depth: 195, recovery: '85.2%', grade: '38.6% Mn', lithology: 'Pyrolusite Supergene Crust', unfc: 'UNFC-333' },
  { id: 'BH-MN-519', mine: 'Munsar West', depth: 310, recovery: '89.7%', grade: '43.5% Mn', lithology: 'Manganiferous Quartzite', unfc: 'UNFC-122' }
];

const LITHOLOGY_DISTRIBUTION = [
  { name: 'Braunite-Pyrolusite Reef', tonnes: 48.5, color: '#A78BFA' },
  { name: 'Gondite / Spessartine Horizon', tonnes: 26.2, color: '#F4B860' },
  { name: 'Mansar Mica-Schist', tonnes: 15.4, color: '#54D8E8' },
  { name: 'Tirodi Biotite Gneiss', tonnes: 9.9, color: '#168BFF' }
];

export const GeologistDashboardPage: React.FC = () => {
  const { theme, selectedMine } = useAppStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 space-y-6 max-w-7xl mx-auto ${isDark ? 'text-[#F2F6FA]' : 'text-[#172333]'}`}>
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C3045]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/15 border border-[#A78BFA]/40 flex items-center justify-center text-[#A78BFA]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Geological Exploration Workspace
              </h1>
              <p className="text-xs font-mono text-[#657A90]">
                SAUSER BELT STRATIGRAPHY, BOREHOLE ASSAYS & PROSPECTIVITY — {user?.fullName || 'Chief Geologist'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/subsurface"
            className="px-3 py-1.5 rounded-lg bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <Box className="w-3.5 h-3.5 text-[#54D8E8]" />
            Earth X-Ray 3D
          </NavLink>
          <NavLink
            to="/command-center"
            className="px-3 py-1.5 rounded-lg bg-[#A78BFA] hover:bg-[#906fe8] text-[#080C12] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            Launch Map Explorer
          </NavLink>
        </div>
      </div>

      {/* ── 1. GEOLOGICAL KPI STATS ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Proven Reserves (UNFC-111)', val: '48.2 Mt', sub: 'Average In-Situ Grade 43.8% Mn', icon: Layers, color: '#A78BFA' },
          { label: 'Logged Borehole Collars', val: '142 Boreholes', sub: 'Total cored depth: 38,420m', icon: Compass, color: '#54D8E8' },
          { label: 'Active Exploration Prospects', val: '6 Target Zones', sub: 'Sauser North, Bharweli Deep, Ukwa East', icon: Cpu, color: '#F4B860' },
          { label: 'Mapped Fault Displacements', val: '14 Structures', sub: 'Hydrothermal gouge & winze ingress', icon: Activity, color: '#43D6A0' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-[#0E1724] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#657A90] uppercase">{stat.label}</span>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-xl font-bold font-heading mt-2">{stat.val}</div>
              <div className="text-[11px] text-[#8297AA] mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── 2. LITHOLOGY & STRATIGRAPHIC SUCCESSION ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm">Lithological Reserve Allocation (Mt)</h3>
              <p className="text-xs text-[#657A90]">Economic braunite-pyrolusite reef vs sub-economic gondite horizons</p>
            </div>
            <span className="text-xs font-mono text-[#A78BFA]">Total: 100 Mt Measured</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LITHOLOGY_DISTRIBUTION} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1C3045' : '#E2E8F0'} horizontal={false} />
                <XAxis type="number" stroke="#657A90" fontSize={11} unit=" Mt" />
                <YAxis dataKey="name" type="category" stroke="#657A90" fontSize={10} width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#090D16' : '#FFFFFF',
                    borderColor: '#1C3045',
                    borderRadius: 8
                  }}
                />
                <Bar dataKey="tonnes" fill="#A78BFA" radius={[0, 6, 6, 0]} name="Reserve (Mt)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stratigraphic Formations & Sauser Group Hierarchy */}
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <h3 className="font-heading font-bold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#A78BFA]" />
            Sauser Group Stratigraphy
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {[
              { unit: 'Bichua Formation', rock: 'Dolomitic marble & calc-silicate', age: 'Proterozoic', depth: '0 - 50m' },
              { unit: 'Mansar Formation', rock: 'Mica-schist & Primary Mn Reef', age: 'Proterozoic', depth: '50 - 320m', highlight: true },
              { unit: 'Chorbaoli Formation', rock: 'Quartzite & quartz-muscovite schist', age: 'Proterozoic', depth: '320 - 450m' },
              { unit: 'Tirodi Biotite Gneiss', rock: 'Basement granitic complex', age: 'Archaean', depth: '> 450m' }
            ].map((st, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-lg border ${
                  st.highlight
                    ? 'bg-[#A78BFA]/10 border-[#A78BFA]/40 text-white'
                    : 'bg-[#152235]/40 border-[#1C3045]/60 text-[#9BAFC1]'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>{st.unit}</span>
                  <span className="text-[10px] text-[#A78BFA]">{st.depth}</span>
                </div>
                <div className="text-[11px] mt-0.5">{st.rock}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. BOREHOLE CORE RECOVERY & ASSAY LOGS ───────────────────────────────── */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#54D8E8]" />
              Active Exploratory Drillholes & Assay Registry
            </h3>
            <p className="text-xs text-[#657A90]">Diamond wireline core recoveries and atomic absorption assay grades</p>
          </div>
          <NavLink to="/exploration" className="text-xs font-mono text-[#54D8E8] hover:underline flex items-center gap-1">
            View All Boreholes <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">Borehole Collar</th>
                <th className="py-2.5 px-3">Concession</th>
                <th className="py-2.5 px-3">Drilled Depth</th>
                <th className="py-2.5 px-3">Core Recovery</th>
                <th className="py-2.5 px-3">Assayed Grade</th>
                <th className="py-2.5 px-3">Principal Lithology</th>
                <th className="py-2.5 px-3">UNFC Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/40">
              {BOREHOLES_SUMMARY.map((bh) => (
                <tr key={bh.id} className="hover:bg-[#152235]/30">
                  <td className="py-2.5 px-3 font-bold text-[#A78BFA]">{bh.id}</td>
                  <td className="py-2.5 px-3">{bh.mine}</td>
                  <td className="py-2.5 px-3">{bh.depth}m</td>
                  <td className="py-2.5 px-3 text-[#43D6A0]">{bh.recovery}</td>
                  <td className="py-2.5 px-3 font-bold text-white">{bh.grade}</td>
                  <td className="py-2.5 px-3 text-[#9BAFC1]">{bh.lithology}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#54D8E8]/15 text-[#54D8E8] border border-[#54D8E8]/30">
                      {bh.unfc}
                    </span>
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

