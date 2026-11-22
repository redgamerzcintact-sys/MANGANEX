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

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto text-[#FFF8F0] font-sans">
      {/* ── TOP HEADER ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#4D4037]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FB923C]/15 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-[#FFF8F0]">
                Mining Operations Center
              </h1>
              <p className="text-xs font-mono text-[#DEC8B7]">
                PRODUCTION TARGETS, FLEET TELEMETRY &amp; DISPATCH INTELLIGENCE — {user?.fullName || 'Mining Engineer'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/production"
            className="px-3 py-1.5 rounded-lg bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] hover:border-[#FB923C] text-xs font-mono font-semibold text-[#FB923C] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Shortfall Forecast
          </NavLink>
          <NavLink
            to="/scenario-lab"
            className="px-3 py-1.5 rounded-lg bg-[#FB923C] hover:bg-[#ea7e26] text-[#120F0D] text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <GitFork className="w-3.5 h-3.5" />
            Scenario Lab (HERO)
          </NavLink>
        </div>
      </div>

      {/* ── 1. OPERATIONS KPI STATS ROW ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {[
          { label: 'Monthly Output Actual', val: '14,250 T', sub: 'Target: 15,000 T (-5.0% variance)', icon: TrendingUp, color: '#FB923C' },
          { label: 'Projected 30-Day Deficit', val: '2,200 T', sub: 'Water Ingress & Monsoon Seepage', icon: AlertTriangle, color: '#EF4444' },
          { label: 'Fleet Overall Equipment Eff.', val: '81.4%', sub: '28 / 32 Units Operating Online', icon: Wrench, color: '#10B981' },
          { label: 'Active Mine Focus', val: selectedMine.name, sub: `Type: ${selectedMine.type} | Reserve: ${selectedMine.reservesMt} Mt`, icon: Compass, color: '#E8B298' }
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

      {/* ── 2. PRODUCTION VS TARGET & 30-DAY FORECAST ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-bold text-sm text-[#FFF8F0]">30-Day Daily Production vs Target &amp; ML Forecast</h3>
              <p className="text-xs text-[#DEC8B7]">Quantile Gradient Boosting extraction curve (P10 / P50 / P90 Tonnes/day)</p>
            </div>
            <span className="text-xs font-mono text-[#FB923C] font-bold">MAE: 142.6T | MAPE: 6.4%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRODUCTION_FORECAST_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4D4037" />
                <XAxis dataKey="day" stroke="#DEC8B7" fontSize={11} />
                <YAxis stroke="#DEC8B7" fontSize={11} domain={[350, 550]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#120F0D',
                    borderColor: '#4D4037',
                    borderRadius: 8,
                    color: '#FFF8F0'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} name="Actual Daily (T)" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="target" stroke="#A69282" strokeWidth={2} strokeDasharray="4 4" name="Target (T)" dot={false} />
                <Line type="monotone" dataKey="forecast" stroke="#FB923C" strokeWidth={2.5} name="Quantile P50 Forecast (T)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortfall Attribution Radar */}
        <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm space-y-3">
          <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
            Shortfall Driver Cascade
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {[
              { driver: 'Monsoon Ingress (-250m winze)', impact: '-1,240 T', severity: 'HIGH', color: '#EF4444' },
              { driver: 'LHD-02 Transmission Maintenance', impact: '-520 T', severity: 'MEDIUM', color: '#F59E0B' },
              { driver: 'Stope 5 Blasting Delay', impact: '-310 T', severity: 'MEDIUM', color: '#F59E0B' },
              { driver: 'Haulage Tipper Congestion', impact: '-130 T', severity: 'LOW', color: '#E8B298' }
            ].map((d, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-[#241E1A] border border-[#4D4037] flex justify-between items-center">
                <div>
                  <div className="font-semibold text-[#FFF8F0]">{d.driver}</div>
                  <div className="text-[10px] text-[#A69282]">Impact: {d.impact}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: `${d.color}20`, color: d.color }}>
                  {d.severity}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-[#FB923C]/10 border border-[#FB923C]/30 text-[11px] text-[#FB923C]">
            <strong>Recommended Action:</strong> Energize pump station 4 and redeploy LHD-01 to Stope 5 to recover 1,400T deficit.
          </div>

          <NavLink
            to="/scenario-lab"
            className="w-full py-2 px-3 rounded-xl bg-[#FB923C] hover:bg-[#ea7e26] text-[#120F0D] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md mt-2"
          >
            <span>Simulate in Scenario Lab (HERO)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* ── 3. FLEET STATUS & TELEMETRY ─────────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border bg-[#1A1613] border-[#4D4037] shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-heading font-bold text-sm text-[#FFF8F0] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#FB923C]" />
              Heavy Machinery &amp; Fleet Availability Telemetry
            </h3>
            <p className="text-xs text-[#DEC8B7]">Real-time CAN-bus telemetry, Overall Equipment Effectiveness (OEE) and maintenance state</p>
          </div>
          <NavLink to="/equipment" className="text-xs font-mono text-[#FB923C] hover:underline flex items-center gap-1 font-bold">
            Open Fleet Hub <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#4D4037] text-[#DEC8B7] uppercase text-[10px]">
                <th className="py-2.5 px-3">Equipment Unit</th>
                <th className="py-2.5 px-3">Active Location / Stope</th>
                <th className="py-2.5 px-3">Operational Status</th>
                <th className="py-2.5 px-3">OEE Rating</th>
                <th className="py-2.5 px-3">Fuel / Energy Cons.</th>
                <th className="py-2.5 px-3">Telemetry Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4D4037]/60">
              {FLEET_STATUS.map((f, i) => (
                <tr key={i} className="hover:bg-[#241E1A]/60">
                  <td className="py-2.5 px-3 font-bold text-[#FFF8F0]">{f.unit}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{f.stope}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        f.status === 'OPERATIONAL'
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : f.status === 'MAINTENANCE'
                          ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                          : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#FB923C]">{f.oee}</td>
                  <td className="py-2.5 px-3 text-[#DEC8B7]">{f.fuelLph}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-[#10B981] font-bold">ACTIVE (CAN-2.0B)</span>
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
