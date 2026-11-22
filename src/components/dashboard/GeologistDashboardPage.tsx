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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-[#FFF8F0] font-sans">
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#4D4037]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FB923C]/15 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-[#FFF8F0]">
                Geological Exploration Workspace
              </h1>
              <p className="text-xs font-mono text-[#DEC8B7]">
                SAUSER BELT STRATIGRAPHY, DRILL TARGETS & PROSPECTIVITY — {user?.fullName || 'Chief Geologist'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/prospectivity"
            className="px-3 py-1.5 rounded-lg bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] hover:border-[#FB923C] text-xs font-mono font-semibold text-[#FB923C] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Prospectivity AI
          </NavLink>
          <NavLink
            to="/command-center"
            className="px-3 py-1.5 rounded-lg bg-[#FB923C] hover:bg-[#ea7e26] text-[#120F0D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5" />
            Cadastral GIS Map
          </NavLink>
        </div>
      </div>

      {/* ── 1. GEOLOGICAL KPI STATS ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {[
          { label: 'Proven Reserves (UNFC-111)', val: '48.2 Mt', sub: 'Average In-Situ Grade 43.8% Mn', icon: Layers, color: '#FB923C' },
          { label: 'Logged Borehole Collars', val: '142 Boreholes', sub: 'Total cored depth: 38,420m', icon: Compass, color: '#E8B298' },
          { label: 'Active Exploration Prospects', val: '6 Target Zones', sub: 'Sauser North, Bharweli Deep, Ukwa East', icon: Cpu, color: '#F59E0B' },
          { label: 'Mapped Fault Displacements', val: '14 Structures', sub: 'Hydrothermal gouge & winze ingress', icon: Activity, color: '#10B981' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-xl border bg-[#1A1613] border-[#4D4037] shadow-sm hover:border-[#FB923C]/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#DEC8B7] uppercase">{stat.label}</span>
                <Icon className="w-4 h-4" style={{ color: stat.color }} />
              </div>
              <div className="text-xl font-bold font-heading text-[#FFF8F0] mt-2">{stat.val}</div>
              <div className="text-[11px] text-[#A69282] mt-1">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── 2. LITHOLOGY & STRATIGRAPHIC SUCCESSION ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#FFF8F0]">Lithological Reserve Allocation (Mt)</h3>
              <p className="text-xs text-[#DEC8B7]">Economic braunite-pyrolusite reef vs sub-economic gondite horizons</p>
            </div>
            <span className="text-xs font-mono text-[#FB923C] font-bold">Total: 100 Mt Measured</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LITHOLOGY_DISTRIBUTION} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#4D4037" horizontal={false} />
                <XAxis type="number" stroke="#DEC8B7" fontSize={11} unit=" Mt" />
                <YAxis dataKey="name" type="category" stroke="#DEC8B7" fontSize={10} width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#120F0D',
                    borderColor: '#4D4037',
                    borderRadius: 8,
                    color: '#FFF8F0'
                  }}
                />
                <Bar dataKey="tonnes" fill="#FB923C" radius={[0, 6, 6, 0]} name="Reserve (Mt)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stratigraphic Formations & Sauser Group Hierarchy */}
        <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FB923C]" />
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
                    ? 'bg-[#FB923C]/10 border-[#FB923C]/50 text-[#FFF8F0]'
                    : 'bg-[#241E1A] border-[#4D4037] text-[#DEC8B7]'
                }`}
              >
                <div className="flex justify-between font-bold">
                  <span>{st.unit}</span>
                  <span className="text-[10px] text-[#FB923C]">{st.depth}</span>
                </div>
                <div className="text-[11px] mt-0.5 text-[#A69282]">{st.rock}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. BOREHOLE CORE RECOVERY & ASSAY LOGS ───────────────────────────────── */}
      <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FB923C]" />
              Active Exploratory Drillholes & Assay Registry
            </h3>
            <p className="text-xs text-[#DEC8B7]">Diamond wireline core recoveries and atomic absorption assay grades</p>
          </div>
          <NavLink to="/prospectivity" className="text-xs font-mono text-[#FB923C] hover:underline flex items-center gap-1 font-bold">
            Next-Drill Targets <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#4D4037] text-[#DEC8B7] uppercase text-[10px]">
                <th className="py-2.5 px-3">Borehole Collar</th>
                <th className="py-2.5 px-3">Concession</th>
                <th className="py-2.5 px-3">Drilled Depth</th>
                <th className="py-2.5 px-3">Core Recovery</th>
                <th className="py-2.5 px-3">Assayed Grade</th>
                <th className="py-2.5 px-3">Principal Lithology</th>
                <th className="py-2.5 px-3">UNFC Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4037]/60">
              {BOREHOLES_SUMMARY.map((bh) => (
                <tr key={bh.id} className="hover:bg-[#241E1A]/60">
                  <td className="py-2.5 px-3 font-bold text-[#FB923C]">{bh.id}</td>
                  <td className="py-2.5 px-3 text-[#FFF8F0]">{bh.mine}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{bh.depth}m</td>
                  <td className="py-2.5 px-3 text-[#10B981] font-bold">{bh.recovery}</td>
                  <td className="py-2.5 px-3 font-bold text-[#FFF8F0]">{bh.grade}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{bh.lithology}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#E8B298]/15 text-[#E8B298] border border-[#E8B298]/30">
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

