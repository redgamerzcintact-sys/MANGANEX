import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  AlertTriangle,
  Flame,
  CloudRain,
  Wrench,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Layers,
  Activity,
  RefreshCw,
  Cpu,
  ShieldAlert,
  Search,
  Filter,
  ArrowRight,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export interface NormalizedRisk {
  id: string;
  mineId: string;
  mineName: string;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  probabilityPercent: number;
  estimatedShortfallTonnes: number;
  forecastDate: string;
  workflowRipple: Array<{ node: string; status: string; impact: string }>;
  recommendedAction: string;
  acknowledged: boolean;
  evidence?: string;
  timestamp?: string;
}

// ── Error Boundary Component ────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RiskCenterErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('RiskCenter caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[var(--bg-primary,#060911)] text-[var(--text-primary,#F2F6FA)] font-sans">
          <div className="max-w-md p-6 rounded-2xl bg-[var(--panel-surface,#101927)] border border-[#FF6878]/40 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#FF6878]/15 border border-[#FF6878]/30 flex items-center justify-center mx-auto text-[#FF6878]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-heading font-bold text-white">Risk Center Recovery Engine</h2>
            <p className="text-xs text-[#9BAFC1] leading-relaxed">
              The risk analysis matrix encountered an unexpected format. The safety system intercepted the event to prevent application crash.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#54D8E8] to-[#168BFF] text-[#080C12] text-xs font-mono font-bold hover:shadow-[0_0_15px_rgba(84,216,232,0.4)] cursor-pointer"
            >
              Reset Risk Matrix
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Normalization Helper ────────────────────────────────────────────────────
function normalizeRiskItem(item: any): NormalizedRisk {
  if (!item) {
    return {
      id: 'risk-fallback',
      mineId: 'mine-balaghat',
      mineName: 'Balaghat Mine',
      category: 'Production Shortfall',
      severity: 'warning',
      title: 'Monitored Production Disruption',
      description: 'System anomaly flagged for standard review.',
      probabilityPercent: 50,
      estimatedShortfallTonnes: 1200,
      forecastDate: new Date().toISOString().slice(0, 10),
      workflowRipple: [
        { node: 'Telemetry Trigger', status: 'warning', impact: 'Anomaly observed' },
        { node: 'Operational Response', status: 'info', impact: 'Review ongoing' }
      ],
      recommendedAction: 'Verify hoist winch and maintain secondary sump drainage.',
      acknowledged: false,
      timestamp: new Date().toISOString()
    };
  }

  const rawRipple = item.workflowRipple || item.workflow_ripple;
  let rippleArray: Array<{ node: string; status: string; impact: string }> = [];

  if (Array.isArray(rawRipple) && rawRipple.length > 0) {
    rippleArray = rawRipple.map((r: any) => ({
      node: String(r?.node || r?.name || 'Operational Step'),
      status: String(r?.status || 'warning').toLowerCase(),
      impact: String(r?.impact || 'Projected variance')
    }));
  } else {
    rippleArray = [
      { node: 'Atmospheric Inflow', status: 'critical', impact: '+35% seepage' },
      { node: 'Dewatering Threshold', status: 'warning', impact: 'Pump capacity load' },
      { node: 'Haulage Throttle', status: 'warning', impact: '-18% advance' },
      { node: 'Tonnage Shortfall', status: 'critical', impact: 'Expected deficit' }
    ];
  }

  const prob = Number(item.probabilityPercent ?? item.probability_percent ?? 50);
  const shortfall = Number(item.estimatedShortfallTonnes ?? item.estimated_shortfall_tonnes ?? 0);
  const sev = String(item.severity || (prob >= 75 ? 'critical' : prob >= 40 ? 'warning' : 'info')).toLowerCase() as any;

  return {
    id: String(item.id || `risk-${Date.now()}`),
    mineId: String(item.mineId || item.mine_id || 'mine-balaghat'),
    mineName: String(item.mineName || item.mine_name || 'Balaghat Operations'),
    category: String(item.category || item.risk_type || 'Operational Delay'),
    severity: ['critical', 'warning', 'info'].includes(sev) ? sev : 'warning',
    title: String(item.title || 'Operational Risk Assessment'),
    description: String(item.description || 'Continuous monitoring active.'),
    probabilityPercent: isNaN(prob) ? 50 : Math.min(100, Math.max(0, prob)),
    estimatedShortfallTonnes: isNaN(shortfall) ? 0 : shortfall,
    forecastDate: String(item.forecastDate || item.forecast_date || new Date().toISOString().slice(0, 10)),
    workflowRipple: rippleArray,
    recommendedAction: String(item.recommendedAction || item.recommended_action || 'Execute standard mitigation protocol.'),
    acknowledged: Boolean(item.acknowledged),
    evidence: item.evidence || item.description,
    timestamp: item.timestamp || new Date().toISOString()
  };
}

export const RiskCenterPageContent: React.FC = () => {
  const { activeRiskAlerts, acknowledgeAlert, theme } = useAppStore();
  const [risks, setRisks] = useState<NormalizedRisk[]>([]);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [systemRiskIndex, setSystemRiskIndex] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'critical' | 'warning' | 'info'>('ALL');

  // Load risks from backend with store fallback
  const fetchRiskData = async () => {
    setLoading(true);
    try {
      const [allRisksRes, indexRes] = await Promise.allSettled([
        api.getRisks(),
        api.getRiskSystemIndex()
      ]);

      if (indexRes.status === 'fulfilled' && indexRes.value) {
        setSystemRiskIndex(indexRes.value);
      }

      let rawList: any[] = [];
      if (allRisksRes.status === 'fulfilled' && allRisksRes.value?.risks && Array.isArray(allRisksRes.value.risks)) {
        rawList = allRisksRes.value.risks;
      } else if (Array.isArray(activeRiskAlerts) && activeRiskAlerts.length > 0) {
        rawList = activeRiskAlerts;
      }

      const normalized = rawList.map(normalizeRiskItem);
      setRisks(normalized);
      if (normalized.length > 0 && !selectedRiskId) {
        setSelectedRiskId(normalized[0].id);
      }
    } catch (err) {
      console.warn('Failed to fetch backend risks, using safe store fallback:', err);
      const fallback = (activeRiskAlerts || []).map(normalizeRiskItem);
      setRisks(fallback);
      if (fallback.length > 0) setSelectedRiskId(fallback[0].id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  // Filtered risks
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      const matchesSearch =
        searchFilter === '' ||
        r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.mineName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.category.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesCategory =
        categoryFilter === 'ALL' ||
        r.category.toUpperCase().includes(categoryFilter.toUpperCase());

      const matchesSeverity =
        severityFilter === 'ALL' || r.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [risks, searchFilter, categoryFilter, severityFilter]);

  const selectedRisk = useMemo(() => {
    return risks.find((r) => r.id === selectedRiskId) || filteredRisks[0] || risks[0] || null;
  }, [risks, selectedRiskId, filteredRisks]);

  const handleAcknowledge = (id: string) => {
    setRisks((prev) =>
      prev.map((r) => (r.id === id ? { ...r, acknowledged: true } : r))
    );
    acknowledgeAlert(id);
  };

  const isDark = theme === 'dark';

  // Chart data for shortfall comparison across active threats
  const chartData = useMemo(() => {
    return filteredRisks.slice(0, 6).map((r) => ({
      name: r.mineName.split(' ')[0],
      shortfall: r.estimatedShortfallTonnes,
      probability: r.probabilityPercent,
      severity: r.severity
    }));
  }, [filteredRisks]);

  const totalExposure = useMemo(() => {
    if (systemRiskIndex?.total_shortfall_exposure) {
      return Number(systemRiskIndex.total_shortfall_exposure);
    }
    return risks.reduce((acc, r) => acc + (r.estimatedShortfallTonnes || 0), 0);
  }, [systemRiskIndex, risks]);

  return (
    <div
      className={`flex h-full w-full overflow-hidden select-none font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#060911] text-[#F2F6FA]' : 'bg-[#F5F7FA] text-[#172333]'
      }`}
    >
      {/* ── LEFT COLUMN: ACTIVE SHORTFALL RISKS ─────────────────────────────────── */}
      <div
        className={`w-[380px] h-full border-r flex flex-col shrink-0 transition-colors duration-200 ${
          isDark ? 'border-[#1C3045] bg-[#090D16]' : 'border-[#DCE4EC] bg-white'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-[#1C3045] bg-[#0B0F19]' : 'border-[#DCE4EC] bg-[#F8FAFC]'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FF6878]/15 border border-[#FF6878]/30 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-[#FF6878]" />
              </div>
              <div>
                <h1 className={`font-heading font-extrabold text-sm ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                  Shortfall Radar & Risk Center
                </h1>
                <span className="text-[9px] font-mono text-[#657A90]">PROBABILISTIC THREAT OBSERVATORY</span>
              </div>
            </div>

            <button
              onClick={fetchRiskData}
              disabled={loading}
              title="Refresh Live Risk Index"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isDark
                  ? 'border-[#1C3045] text-[#9BAFC1] hover:text-white hover:bg-[#152235]'
                  : 'border-[#DCE4EC] text-[#64748B] hover:text-[#172333] hover:bg-[#F1F5F9]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#54D8E8]' : ''}`} />
            </button>
          </div>

          {/* System shortfall exposure summary */}
          <div
            className={`mt-3 p-3 rounded-xl border flex items-center justify-between text-xs font-mono ${
              isDark ? 'bg-[#101927] border-[#1C3045]' : 'bg-white border-[#DCE4EC]'
            }`}
          >
            <div>
              <span className={`text-[10px] block ${isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}`}>
                SYSTEM-WIDE EXPOSURE
              </span>
              <span className="font-heading font-extrabold text-base text-[#FF6878]">
                -{totalExposure.toLocaleString()} T
              </span>
            </div>
            <div className="text-right">
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                  (systemRiskIndex?.system_risk_level || 'CRITICAL') === 'CRITICAL'
                    ? 'bg-[#FF6878]/15 text-[#FF6878] border-[#FF6878]/30'
                    : 'bg-[#F4B860]/15 text-[#F4B860] border-[#F4B860]/30'
                }`}
              >
                {systemRiskIndex?.system_risk_level || 'CRITICAL'} RISK
              </span>
              <span className={`block text-[9px] mt-1 ${isDark ? 'text-[#657A90]' : 'text-[#94A3B8]'}`}>
                {risks.length} THREATS IDENTIFIED
              </span>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${isDark ? 'text-[#657A90]' : 'text-[#94A3B8]'}`} />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by mine, category, or threat..."
                className={`w-full h-8 pl-8 pr-3 rounded-lg text-[11px] font-mono border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-[#080C12] border-[#1C3045] text-white placeholder-[#4C647D] focus:border-[#54D8E8]'
                    : 'bg-white border-[#DCE4EC] text-[#172333] placeholder-[#94A3B8] focus:border-[#087F9B]'
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[9.5px] font-mono">
              {(['ALL', 'CRITICAL', 'WARNING'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev.toLowerCase() as any)}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer shrink-0 ${
                    severityFilter === (sev.toLowerCase() as any)
                      ? 'bg-[#54D8E8]/20 text-[#54D8E8] border-[#54D8E8]'
                      : isDark
                      ? 'bg-[#080C12] text-[#9BAFC1] border-[#1C3045]'
                      : 'bg-white text-[#64748B] border-[#DCE4EC]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk Alerts List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filteredRisks.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-[#657A90]">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#F4B860]" />
              <span>No threats matching current filter criteria.</span>
            </div>
          ) : (
            filteredRisks.map((risk) => {
              const isSelected = risk.id === selectedRisk?.id;
              const isCrit = risk.severity === 'critical';

              return (
                <div
                  key={risk.id}
                  onClick={() => setSelectedRiskId(risk.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? isDark
                        ? 'bg-[#152235] border-[#FF6878] shadow-[0_0_15px_rgba(255,104,120,0.25)]'
                        : 'bg-[#FEF2F2] border-[#EF4444] shadow-sm'
                      : isDark
                      ? 'bg-[#101927] border-[#1C3045] hover:border-[#2C4866]'
                      : 'bg-[#FAFCFE] border-[#DCE4EC] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                          isCrit
                            ? 'bg-[#FF6878]/15 text-[#FF6878] border-[#FF6878]/30'
                            : 'bg-[#F4B860]/15 text-[#F4B860] border-[#F4B860]/30'
                        }`}
                      >
                        {risk.category}
                      </span>
                      <h3 className={`font-heading font-bold text-xs mt-1 ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                        {risk.mineName}
                      </h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-mono font-extrabold ${isCrit ? 'text-[#FF6878]' : 'text-[#F4B860]'}`}>
                        {risk.probabilityPercent}%
                      </span>
                      <span className="block text-[8px] font-mono text-[#657A90]">PROBABILITY</span>
                    </div>
                  </div>

                  <p className={`mt-1.5 text-[11px] leading-relaxed line-clamp-2 ${isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}`}>
                    {risk.title}
                  </p>

                  <div className={`mt-2 flex items-center justify-between text-[10px] font-mono border-t pt-2 ${isDark ? 'border-[#1C3045]' : 'border-[#DCE4EC]'}`}>
                    <span className={isDark ? 'text-[#657A90]' : 'text-[#94A3B8]'}>Est. Deficit:</span>
                    <span className="font-bold text-[#FF6878]">
                      -{risk.estimatedShortfallTonnes.toLocaleString()} Tonnes
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT MAIN WORKSPACE: THE RISK RIPPLE CAUSAL WORKFLOW ───────────────── */}
      <div className="flex-1 h-full overflow-y-auto p-6 space-y-6">
        {selectedRisk ? (
          <>
            {/* Selected Risk Header Card */}
            <div
              className={`p-5 rounded-2xl border shadow-lg flex flex-wrap items-center justify-between gap-4 ${
                isDark ? 'bg-[#101927] border-[#1C3045]' : 'bg-white border-[#DCE4EC]'
              }`}
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      selectedRisk.severity === 'critical'
                        ? 'bg-[#FF6878]/20 text-[#FF6878] border-[#FF6878]/40'
                        : 'bg-[#F4B860]/20 text-[#F4B860] border-[#F4B860]/40'
                    }`}
                  >
                    THREAT: {selectedRisk.category.toUpperCase()}
                  </span>
                  <span className={`text-xs font-mono flex items-center gap-1 ${isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}`}>
                    <Clock className="w-3 h-3 text-[#54D8E8]" />
                    Forecast Horizon: {selectedRisk.forecastDate}
                  </span>
                </div>

                <h2 className={`text-xl font-heading font-extrabold ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                  {selectedRisk.title}
                </h2>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}`}>
                  {selectedRisk.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleAcknowledge(selectedRisk.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedRisk.acknowledged
                      ? 'bg-[#43D6A0]/20 text-[#43D6A0] border-[#43D6A0]/40'
                      : 'bg-[#FF6878]/20 text-[#FF6878] border-[#FF6878]/40 hover:bg-[#FF6878]/30 shadow-[0_0_12px_rgba(255,104,120,0.25)]'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{selectedRisk.acknowledged ? 'ACKNOWLEDGED' : 'ACKNOWLEDGE ALERT'}</span>
                </button>
              </div>
            </div>

            {/* THE RISK RIPPLE — CAUSAL DEPENDENCY GRAPH */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                isDark ? 'bg-[#101927] border-[#1C3045]' : 'bg-white border-[#DCE4EC]'
              }`}
            >
              <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-[#1C3045]' : 'border-[#DCE4EC]'}`}>
                <span className={`font-heading font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                  <Activity className="h-4 w-4 text-[#FF6878]" />
                  THE RISK RIPPLE — CAUSAL DEPENDENCY GRAPH
                </span>
                <span className={`text-[11px] font-mono ${isDark ? 'text-[#9BAFC1]' : 'text-[#64748B]'}`}>
                  Probabilistic Multi-Tier Cascade
                </span>
              </div>

              {/* Visual Step-by-Step Chain */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
                {selectedRisk.workflowRipple.map((ripple, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl border relative flex flex-col justify-between ${
                      isDark ? 'bg-[#080C12] border-[#1C3045]' : 'bg-[#F8FAFC] border-[#DCE4EC]'
                    }`}
                  >
                    <div>
                      <div className={`flex items-center justify-between text-[10px] font-mono mb-1 ${isDark ? 'text-[#657A90]' : 'text-[#94A3B8]'}`}>
                        <span>TIER 0{i + 1}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                            ripple.status === 'critical'
                              ? 'bg-[#FF6878]/20 text-[#FF6878]'
                              : 'bg-[#F4B860]/20 text-[#F4B860]'
                          }`}
                        >
                          {ripple.status.toUpperCase()}
                        </span>
                      </div>
                      <div className={`font-bold text-xs mt-1 ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                        {ripple.node}
                      </div>
                      <div className="text-xs font-mono text-[#FF6878] mt-2 font-bold">
                        {ripple.impact}
                      </div>
                    </div>

                    {i < selectedRisk.workflowRipple.length - 1 && (
                      <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                        <ChevronRight className="h-5 w-5 text-[#54D8E8]" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SHORTFALL EXPOSURE CHART & MITIGATION PROTOCOL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Shortfall Distribution Chart */}
              <div
                className={`lg:col-span-6 p-5 rounded-2xl border space-y-3 ${
                  isDark ? 'bg-[#101927] border-[#1C3045]' : 'bg-white border-[#DCE4EC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-heading font-bold text-xs uppercase tracking-wider ${isDark ? 'text-white' : 'text-[#172333]'}`}>
                    SHORTFALL DISTRIBUTION BY CONCESSION
                  </span>
                  <span className="text-[10px] font-mono text-[#54D8E8]">Tonnes at Risk</span>
                </div>

                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1C3045' : '#E2E8F0'} vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: isDark ? '#9BAFC1' : '#64748B', fontSize: 10 }} />
                      <YAxis tick={{ fill: isDark ? '#9BAFC1' : '#64748B', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#101927' : '#FFFFFF',
                          borderColor: isDark ? '#1C3045' : '#DCE4EC',
                          borderRadius: '8px',
                          fontSize: '11px'
                        }}
                      />
                      <Bar dataKey="shortfall" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.severity === 'critical' ? '#FF6878' : '#F4B860'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RECOMMENDED OPERATIONAL MITIGATION PROTOCOL */}
              <div
                className={`lg:col-span-6 p-5 rounded-2xl border space-y-3 flex flex-col justify-between ${
                  isDark ? 'bg-[#101927] border-[#1C3045]' : 'bg-white border-[#DCE4EC]'
                }`}
              >
                <div>
                  <span className="font-heading font-bold text-xs text-[#43D6A0] flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    RECOMMENDED OPERATIONAL MITIGATION PROTOCOL
                  </span>
                  <div
                    className={`p-3.5 rounded-xl border text-xs font-mono leading-relaxed ${
                      isDark ? 'bg-[#080C12] border-[#1C3045] text-white' : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#172333]'
                    }`}
                  >
                    {selectedRisk.recommendedAction}
                  </div>
                </div>

                <div
                  className={`text-[9.5px] font-mono p-2.5 rounded-lg border ${
                    isDark ? 'bg-[#080C12] border-[#1C3045] text-[#9BAFC1]' : 'bg-[#F8FAFC] border-[#DCE4EC] text-[#64748B]'
                  }`}
                >
                  ℹ️ <b>Protocol Authorization:</b> Execution of auxiliary high-capacity pump banks or crosscut traffic diversion requires Shift Supervisor concurrence under MOIL Directorate Standard Operating Procedure 14-B.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center p-8 text-center text-xs font-mono text-[#657A90]">
            <span>Select a threat from the radar to inspect its causal cascade and mitigation protocol.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const RiskCenterPage: React.FC = () => {
  return (
    <RiskCenterErrorBoundary>
      <RiskCenterPageContent />
    </RiskCenterErrorBoundary>
  );
};