import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  Wrench,
  Truck,
  Flame,
  ArrowRight,
  Sparkles,
  GitFork,
  CheckCircle2,
  Calendar,
  Compass,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const PRODUCTION_FORECAST_DATA = [
  { day: 'Day 1', actual: 480, target: 500, forecast: 490 },
  { day: 'Day 5', actual: 510, target: 500, forecast: 505 },
  { day: 'Day 10', actual: 460, target: 500, forecast: 475 },
  { day: 'Day 15', actual: 420, target: 500, forecast: 430 },
  { day: 'Day 20', actual: null, target: 500, forecast: 410 },
  { day: 'Day 25', actual: null, target: 500, forecast: 440 },
  { day: 'Day 30', actual: null, target: 500, forecast: 465 }
];

const FLEET_STATUS = [
  { unit: 'LHD-01 (Sandvik LH410)', stope: 'Balaghat Winze 4', status: 'OPERATIONAL', oee: '84.2%', fuelLph: '14.2' },
  { unit: 'LHD-02 (Sandvik LH410)', stope: 'Dongri Bench 3', status: 'MAINTENANCE', oee: '52.1%', fuelLph: '0.0' },
  { unit: 'JUMBO-01 (DD321 Drill)', stope: 'Chikla Deep Stope', status: 'OPERATIONAL', oee: '79.5%', fuelLph: '18.5' },
  { unit: 'TIPPER-09 (Volvo FMX)', stope: 'Haul Road Main', status: 'OPERATIONAL', oee: '88.0%', fuelLph: '22.1' },
  { unit: 'PUMP-SUB-04 (Flygt 90kW)', stope: '-250m Sump Station', status: 'HIGH LOAD', oee: '96.4%', fuelLph: 'Electric' }
];

export const MiningEngineerDashboardPage: React.FC = () => {
  const { theme, selectedMine } = useAppStore();
  const { user } = useAuthStore();
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 space-y-6 max-w-7xl mx-auto ${isDark ? 'text-[#F2F6FA]' : 'text-[#172333]'}`}>
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1C3045]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F4B860]/15 border border-[#F4B860]/40 flex items-center justify-center text-[#F4B860]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight">
                Mining Operations Center
              </h1>
              <p className="text-xs font-mono text-[#657A90]">
                PRODUCTION TARGETS, FLEET TELEMETRY & DISPATCH INTELLIGENCE — {user?.fullName || 'Mining Engineer'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/scenario-lab"
            className="px-3 py-1.5 rounded-lg bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-xs font-mono font-semibold transition-all flex items-center gap-1.5"
          >
            <GitFork className="w-3.5 h-3.5 text-[#54D8E8]" />
            Scenario Lab
          </NavLink>
          <NavLink
            to="/risk-center"
            className="px-3 py-1.5 rounded-lg bg-[#F4B860] hover:bg-[#e0a44b] text-[#080C12] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Shortfall Radar
          </NavLink>
        </div>
      </div>

      {/* ── 1. OPERATIONS KPI STATS ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Output Actual', val: '14,250 T', sub: 'Target: 15,000 T (-5.0% variance)', icon: TrendingUp, color: '#F4B860' },
          { label: 'Projected 30-Day Deficit', val: '2,200 T', sub: 'Water Ingress & Monsoon Seepage', icon: AlertTriangle, color: '#FF6878' },
          { label: 'Fleet Overall Equipment Eff.', val: '81.4%', sub: '28 / 32 Units Operating Online', icon: Wrench, color: '#43D6A0' },
          { label: 'Active Mine Focus', val: selectedMine.name, sub: `Type: ${selectedMine.type} | Reserve: ${selectedMine.reservesMt} Mt`, icon: Compass, color: '#54D8E8' }
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

      {/* ── 2. PRODUCTION VS TARGET & 30-DAY FORECAST ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm">30-Day Daily Production vs Target & ML Forecast</h3>
              <p className="text-xs text-[#657A90]">Random Forest + Gradient Boosting short-term extraction curve (Tonnes/day)</p>
            </div>
            <span className="text-xs font-mono text-[#F4B860]">R²: 0.932 | RMSE: 28.4T</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRODUCTION_FORECAST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1C3045' : '#E2E8F0'} />
                <XAxis dataKey="day" stroke="#657A90" fontSize={11} />
                <YAxis stroke="#657A90" fontSize={11} domain={[350, 550]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#090D16' : '#FFFFFF',
                    borderColor: '#1C3045',
                    borderRadius: 8
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#43D6A0" strokeWidth={3} name="Actual Daily (T)" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="target" stroke="#657A90" strokeDasharray="5 5" strokeWidth={2} name="Shift Target (T)" />
                <Line type="monotone" dataKey="forecast" stroke="#F4B860" strokeWidth={2} name="ML Projected (T)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortfall Attribution Radar */}
        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
          }`}
        >
          <h3 className="font-heading font-bold text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF6878]" />
            Shortfall Driver Cascade
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {[
              { driver: 'Monsoon Ingress (-250m winze)', impact: '-1,240 T', severity: 'HIGH', color: '#FF6878' },
              { driver: 'LHD-02 Transmission Maintenance', impact: '-520 T', severity: 'MEDIUM', color: '#F4B860' },
              { driver: 'Stope 5 Blasting Delay', impact: '-310 T', severity: 'MEDIUM', color: '#F4B860' },
              { driver: 'Haulage Tipper Congestion', impact: '-130 T', severity: 'LOW', color: '#54D8E8' }
            ].map((d, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-[#152235]/40 border border-[#1C3045]/60 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-white">{d.driver}</div>
                  <div className="text-[10px] text-[#657A90]">Impact: {d.impact}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: `${d.color}20`, color: d.color }}>
                  {d.severity}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#F4B860]/10 border border-[#F4B860]/30 text-[11px] text-[#F4B860]">
            <strong>Recommended Action:</strong> Energize pump station 4 and redeploy LHD-01 to Stope 5 to recover 1,400T deficit.
          </div>
        </div>
      </div>

      {/* ── 3. FLEET STATUS & TELEMETRY ─────────────────────────────────────────── */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark ? 'bg-[#0B111C] border-[#1C3045]' : 'bg-white border-[#DCE4EC] shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#43D6A0]" />
              Heavy Machinery & Fleet Availability Telemetry
            </h3>
            <p className="text-xs text-[#657A90]">Real-time CAN-bus telemetry, Overall Equipment Effectiveness (OEE) and maintenance state</p>
          </div>
          <NavLink to="/equipment" className="text-xs font-mono text-[#54D8E8] hover:underline flex items-center gap-1">
            Open Fleet Hub <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1C3045] text-[#657A90] uppercase text-[10px]">
                <th className="py-2.5 px-3">Equipment Unit</th>
                <th className="py-2.5 px-3">Active Location / Stope</th>
                <th className="py-2.5 px-3">Operational Status</th>
                <th className="py-2.5 px-3">OEE Rating</th>
                <th className="py-2.5 px-3">Fuel / Energy Cons.</th>
                <th className="py-2.5 px-3">Telemetry Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C3045]/40">
              {FLEET_STATUS.map((f, i) => (
                <tr key={i} className="hover:bg-[#152235]/30">
                  <td className="py-2.5 px-3 font-bold text-white">{f.unit}</td>
                  <td className="py-2.5 px-3 text-[#9BAFC1]">{f.stope}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        f.status === 'OPERATIONAL'
                          ? 'bg-[#43D6A0]/15 text-[#43D6A0]'
                          : f.status === 'MAINTENANCE'
                          ? 'bg-[#FF6878]/15 text-[#FF6878]'
                          : 'bg-[#F4B860]/15 text-[#F4B860]'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#54D8E8]">{f.oee}</td>
                  <td className="py-2.5 px-3">{f.fuelLph}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[#43D6A0] font-bold">ACTIVE (CAN-2.0B)</span>
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
