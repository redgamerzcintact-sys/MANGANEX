import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  Activity, TrendingDown, TrendingUp, AlertTriangle, Clock,
  RefreshCw, ChevronDown, Zap, Target, BarChart3, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, Legend
} from 'recharts';

const MINE_IDS = [
  { id: 'mine-balaghat', name: 'Balaghat (Bharweli)', code: 'MOIL-BG-01' },
  { id: 'mine-ukwa',     name: 'Ukwa',                code: 'MOIL-UK-02' },
  { id: 'mine-dongri',   name: 'Dongri Buzurg',       code: 'MOIL-DB-03' },
  { id: 'mine-kandri',   name: 'Kandri',              code: 'MOIL-KD-04' },
  { id: 'mine-munsar',   name: 'Munsar',              code: 'MOIL-MS-05' },
  { id: 'mine-chikla',   name: 'Chikla',              code: 'MOIL-CH-06' },
  { id: 'mine-tirodi',   name: 'Tirodi',              code: 'MOIL-TR-07' },
];

const HORIZON_OPTIONS = [7, 14, 30, 60, 90];

const StatusBadge: React.FC<{ level: string }> = ({ level }) => {
  const cfg: Record<string, { color: string; bg: string }> = {
    CRITICAL: { color: '#FF5252', bg: 'rgba(255,82,82,0.1)' },
    WARNING:  { color: '#FFB020', bg: 'rgba(255,176,32,0.1)' },
    LOW:      { color: '#00E676', bg: 'rgba(0,230,118,0.1)' },
    OPTIMAL:  { color: '#00E676', bg: 'rgba(0,230,118,0.1)' },
  };
  const c = cfg[level] || cfg['LOW'];
  return (
    <span style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}30` }}
      className="text-[10px] font-mono px-2 py-0.5 rounded">
      {level}
    </span>
  );
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111c27] border border-[#1e3045] rounded p-3 text-xs font-mono">
      <p className="text-[#54D8E8] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value?.toLocaleString()}T</p>
      ))}
    </div>
  );
};

export const ProductionPage: React.FC = () => {
  const { selectedMine } = useAppStore();
  const [activeMineId, setActiveMineId] = useState('mine-balaghat');
  const [horizon, setHorizon] = useState(30);
  const [forecast, setForecast] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'forecast' | 'history' | 'fleet'>('forecast');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [fc, hist, sum] = await Promise.all([
      api.getProductionForecast(activeMineId, horizon),
      api.getProductionHistory(activeMineId, 90),
      api.getProductionSummary(),
    ]);
    setForecast(fc);
    setHistory(hist);
    setSummary(sum);
    setLoading(false);
  }, [activeMineId, horizon]);

  useEffect(() => { loadData(); }, [loadData]);

  // Chart data
  const forecastChartData = forecast?.forecast_series?.slice(0, 30).map((f: any, i: number) => ({
    day: `D+${i + 1}`,
    forecast: f.forecast_tonnes,
    lower: f.lower_bound,
    upper: f.upper_bound,
    target: forecast?.summary?.monthly_target_tonnes / 30,
  })) || [];

  const historyChartData = history?.records?.slice(-30).map((r: any) => ({
    date: r.production_date?.slice(5), // MM-DD
    actual: r.actual_production_tonnes,
    planned: r.planned_production_tonnes,
    downtime: r.downtime_hours,
  })) || [];

  const mineCompData = summary?.mines?.map((m: any) => ({
    name: m.mine_name.split(' ')[0],
    actual: m.actual_monthly_tonnes,
    target: m.planned_monthly_tonnes,
    variance: m.variance_percent,
  })) || [];

  const shortfall = forecast?.summary?.projected_shortfall_tonnes || 0;
  const riskLevel = forecast?.summary?.risk_level || 'LOW';

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#070C12] text-[#C8D8E8] select-none font-mono">
      {/* LEFT: Mine Selector + System Summary */}
      <div className="w-64 shrink-0 h-full border-r border-[#1A2D40] bg-[#0A1520] flex flex-col">
        <div className="p-4 border-b border-[#1A2D40]">
          <div className="text-[10px] text-[#4A7A9A] tracking-widest mb-2">PRODUCTION INTELLIGENCE</div>
          <div className="text-sm text-[#54D8E8]">Mine Selector</div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {MINE_IDS.map(m => {
            const mineSum = summary?.mines?.find((s: any) => s.mine_id === m.id);
            const isActive = m.id === activeMineId;
            return (
              <button key={m.id} onClick={() => setActiveMineId(m.id)}
                className={`w-full text-left p-3 mb-1 rounded transition-all ${
                  isActive ? 'bg-[#0D2035] border border-[#54D8E8]30' : 'hover:bg-[#111D2A] border border-transparent'
                }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${isActive ? 'text-[#54D8E8]' : 'text-[#A0BDD0]'}`}>{m.name}</span>
                  {mineSum && <StatusBadge level={mineSum.risk_level || 'LOW'} />}
                </div>
                <div className="text-[10px] text-[#4A7A9A] mt-1">{m.code}</div>
                {mineSum && (
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#4A7A9A]">Monthly</span>
                      <span className={mineSum.variance_percent < 0 ? 'text-[#FF5252]' : 'text-[#00E676]'}>
                        {mineSum.variance_percent > 0 ? '+' : ''}{mineSum.variance_percent?.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#1A2D40] rounded mt-1">
                      <div className="h-1 rounded"
                        style={{
                          width: `${Math.min(100, (mineSum.actual_monthly_tonnes / mineSum.planned_monthly_tonnes) * 100)}%`,
                          background: mineSum.variance_percent < -10 ? '#FF5252' : mineSum.variance_percent < 0 ? '#FFB020' : '#00E676'
                        }} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* System totals */}
        {summary?.system_totals && (
          <div className="p-3 border-t border-[#1A2D40] bg-[#070C12]">
            <div className="text-[10px] text-[#4A7A9A] mb-2 tracking-wider">SYSTEM TOTALS</div>
            <div className="space-y-1">
              {[
                { label: 'Total Planned', value: `${(summary.system_totals.total_planned_tonnes/1000).toFixed(0)}K T` },
                { label: 'Total Actual', value: `${(summary.system_totals.total_actual_tonnes/1000).toFixed(0)}K T` },
                { label: 'Shortfall', value: `${(summary.system_totals.total_shortfall_tonnes/1000).toFixed(0)}K T`, alert: true },
                { label: 'Mines at Risk', value: `${summary.system_totals.mines_at_risk}` },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-[10px]">
                  <span className="text-[#4A7A9A]">{item.label}</span>
                  <span className={item.alert ? 'text-[#FF5252]' : 'text-[#C8D8E8]'}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#1A2D40] bg-[#0A1520] shrink-0">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[10px] text-[#4A7A9A] tracking-widest">PRODUCTION FORECASTING ENGINE</div>
              <div className="text-sm text-[#54D8E8]">
                {MINE_IDS.find(m => m.id === activeMineId)?.name} — ML Ensemble Forecast
              </div>
            </div>
            <div className="flex items-center gap-1 ml-4">
              {HORIZON_OPTIONS.map(h => (
                <button key={h} onClick={() => setHorizon(h)}
                  className={`px-2 py-0.5 text-[10px] rounded border transition-all ${
                    horizon === h
                      ? 'bg-[#54D8E8] text-[#070C12] border-[#54D8E8]'
                      : 'border-[#1A2D40] text-[#4A7A9A] hover:border-[#54D8E8]40'
                  }`}>
                  {h}D
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge level={riskLevel} />
            <button onClick={loadData} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D2035] border border-[#1A2D40] rounded text-[11px] text-[#54D8E8] hover:border-[#54D8E8] transition-all">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Running ML...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="flex gap-0 border-b border-[#1A2D40] shrink-0">
          {[
            {
              label: 'Forecast Total', icon: Target,
              value: forecast ? `${(forecast.summary?.forecast_total_tonnes/1000).toFixed(1)}K T` : '—',
              sub: `${horizon}-day projection`, color: '#54D8E8',
            },
            {
              label: 'Monthly Target', icon: BarChart3,
              value: forecast ? `${(forecast.summary?.monthly_target_tonnes/1000).toFixed(0)}K T` : '—',
              sub: 'Production plan', color: '#A0BDD0',
            },
            {
              label: 'Projected Shortfall', icon: TrendingDown,
              value: forecast ? `${(shortfall/1000).toFixed(1)}K T` : '—',
              sub: `${forecast?.summary?.shortfall_percent || 0}% variance`,
              color: shortfall > 5000 ? '#FF5252' : shortfall > 1000 ? '#FFB020' : '#00E676',
            },
            {
              label: 'Model R² Score', icon: Activity,
              value: forecast?.model_metadata?.r2_score || '—',
              sub: `MAE: ±${forecast?.model_metadata?.mae_tonnes || '—'}T/day`, color: '#7C4DFF',
            },
          ].map((kpi, i) => (
            <div key={i} className="flex-1 p-4 border-r border-[#1A2D40] last:border-r-0">
              <div className="flex items-center gap-2 mb-1">
                <kpi.icon size={12} style={{ color: kpi.color }} />
                <span className="text-[9px] text-[#4A7A9A] tracking-widest">{kpi.label}</span>
              </div>
              <div className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</div>
              <div className="text-[10px] text-[#4A7A9A] mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-[#1A2D40] shrink-0 bg-[#0A1520]">
          {[
            { id: 'forecast', label: 'ML Forecast' },
            { id: 'history', label: '90-Day History' },
            { id: 'fleet', label: 'Mine Comparison' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-6 py-2.5 text-[11px] border-b-2 transition-all ${
                tab === t.id
                  ? 'border-[#54D8E8] text-[#54D8E8]'
                  : 'border-transparent text-[#4A7A9A] hover:text-[#A0BDD0]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'forecast' && (
            <div className="space-y-6">
              {/* Forecast area chart */}
              <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-[#54D8E8]">Production Forecast — Next {horizon} Days</div>
                    <div className="text-[10px] text-[#4A7A9A] mt-0.5">Random Forest + Gradient Boosting Ensemble (95% CI)</div>
                  </div>
                  <div className="text-[10px] text-[#4A7A9A]">VALIDATED_SYNTHETIC_DEMO</div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={forecastChartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#54D8E8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#54D8E8" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#7C4DFF" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#7C4DFF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2D40" />
                    <XAxis dataKey="day" tick={{ fill: '#4A7A9A', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4A7A9A', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={forecastChartData[0]?.target} stroke="#FFB020" strokeDasharray="4 2" label={{ value: 'Target', fill: '#FFB020', fontSize: 10 }} />
                    <Area type="monotone" dataKey="upper" stroke="none" fill="url(#ciGrad)" name="Upper CI" />
                    <Area type="monotone" dataKey="forecast" stroke="#54D8E8" strokeWidth={2} fill="url(#forecastGrad)" name="Forecast" />
                    <Line type="monotone" dataKey="lower" stroke="#7C4DFF" strokeDasharray="3 2" dot={false} name="Lower CI" strokeWidth={1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Shortfall drivers + SHAP */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                  <div className="text-xs text-[#54D8E8] mb-3">Shortfall Drivers (ML Attribution)</div>
                  {forecast?.shortfall_drivers?.map((d: any, i: number) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-[#A0BDD0]">{d.driver}</span>
                        <span className="text-[#FFB020]">{d.importance_pct?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A2D40] rounded">
                        <div className="h-1.5 bg-gradient-to-r from-[#FFB020] to-[#FF5252] rounded"
                          style={{ width: `${d.importance_pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                  <div className="text-xs text-[#54D8E8] mb-3">Feature Importance (SHAP Proxy)</div>
                  {forecast?.shap_contributions?.slice(0, 5).map((s: any, i: number) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-[#A0BDD0]">{s.label}</span>
                        <span className="text-[#54D8E8]">{s.importance?.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A2D40] rounded">
                        <div className="h-1.5 bg-[#54D8E8] rounded opacity-70"
                          style={{ width: `${s.importance}%` }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-[#1A2D40] text-[9px] text-[#4A7A9A]">
                    Model: RF-100T-D6 + GB-100T-D4 ensemble · MAE: ±{forecast?.model_metadata?.mae_tonnes}T/day
                  </div>
                </div>
              </div>

              {/* Model disclaimer */}
              <div className="border border-[#FFB020]30 bg-[#FFB02008] rounded p-3 text-[10px] text-[#FFB020]">
                ⚠ All forecasts are ML model predictions on validated synthetic demonstration data. 
                Human expert review required before operational decisions. 
                Model: {forecast?.model_metadata?.models?.join(' + ')} | R²: {forecast?.model_metadata?.r2_score} | MAPE: {forecast?.model_metadata?.mape_percent}%
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="space-y-6">
              <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                <div className="text-xs text-[#54D8E8] mb-1">90-Day Production History — Actual vs. Planned (TPD)</div>
                <div className="text-[10px] text-[#4A7A9A] mb-4">Source: VALIDATED_SYNTHETIC_DEMO</div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={historyChartData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#54D8E8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#54D8E8" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="plannedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FFB020" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#FFB020" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2D40" />
                    <XAxis dataKey="date" tick={{ fill: '#4A7A9A', fontSize: 9 }} interval={6} />
                    <YAxis tick={{ fill: '#4A7A9A', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#A0BDD0' }} />
                    <Area type="monotone" dataKey="planned" stroke="#FFB020" strokeWidth={1} fill="url(#plannedGrad)" name="Planned (TPD)" strokeDasharray="4 2" />
                    <Area type="monotone" dataKey="actual" stroke="#54D8E8" strokeWidth={2} fill="url(#actualGrad)" name="Actual (TPD)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Summary stats */}
              {history?.records && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Days Analyzed', value: history.records.length },
                    { label: 'Avg Daily (TPD)', value: Math.round(history.records.reduce((s: number, r: any) => s + r.actual_production_tonnes, 0) / history.records.length).toLocaleString() },
                    { label: 'Best Day', value: Math.round(Math.max(...history.records.map((r: any) => r.actual_production_tonnes))).toLocaleString() + 'T' },
                    { label: 'Total Downtime', value: history.records.reduce((s: number, r: any) => s + (r.downtime_hours || 0), 0).toFixed(0) + 'h' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#0A1520] border border-[#1A2D40] rounded p-3">
                      <div className="text-[9px] text-[#4A7A9A] mb-1">{s.label}</div>
                      <div className="text-lg text-[#54D8E8] font-bold">{s.value}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'fleet' && (
            <div className="space-y-6">
              <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                <div className="text-xs text-[#54D8E8] mb-1">Monthly Production — All MOIL Mines</div>
                <div className="text-[10px] text-[#4A7A9A] mb-4">Actual vs. Planned (Tonnes/Month)</div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mineCompData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2D40" />
                    <XAxis dataKey="name" tick={{ fill: '#A0BDD0', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#4A7A9A', fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10, color: '#A0BDD0' }} />
                    <Bar dataKey="target" name="Target" fill="#FFB02040" stroke="#FFB020" strokeWidth={1} />
                    <Bar dataKey="actual" name="Actual" fill="#54D8E840" stroke="#54D8E8" strokeWidth={1} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {summary?.mines?.map((m: any) => (
                  <div key={m.mine_id} className="bg-[#0A1520] border border-[#1A2D40] rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-[#A0BDD0]">{m.mine_name}</div>
                      <div className="text-[9px] text-[#4A7A9A] mt-0.5">{m.state} · {m.ore_grade_mn_percent?.toFixed(1)}% Mn</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-bold ${m.variance_percent < 0 ? 'text-[#FF5252]' : 'text-[#00E676]'}`}>
                        {m.variance_percent > 0 ? '+' : ''}{m.variance_percent?.toFixed(1)}%
                      </div>
                      <StatusBadge level={m.risk_level || 'LOW'} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
