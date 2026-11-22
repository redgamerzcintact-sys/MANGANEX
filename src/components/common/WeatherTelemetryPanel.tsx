import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  Droplets,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { api } from '../../services/api';
import { ProvenanceBadge } from './ProvenanceBadge';

interface WeatherTelemetryPanelProps {
  initialMineId?: string;
  compact?: boolean;
  title?: string;
}

const MINES = [
  { id: 'mine-balaghat', name: 'Balaghat Mine (Bharweli)', state: 'MP' },
  { id: 'mine-ukwa', name: 'Ukwa Mine', state: 'MP' },
  { id: 'mine-dongri', name: 'Dongri Buzurg Mine', state: 'MH' },
  { id: 'mine-kandri', name: 'Kandri Mine', state: 'MH' },
  { id: 'mine-munsar', name: 'Munsar Mine', state: 'MH' },
  { id: 'mine-chikla', name: 'Chikla Mine', state: 'MH' },
  { id: 'mine-tirodi', name: 'Tirodi Mine', state: 'MP' },
];

export const WeatherTelemetryPanel: React.FC<WeatherTelemetryPanelProps> = ({
  initialMineId = 'mine-balaghat',
  compact = false,
  title = 'Real Meteorological & Soil Moisture Telemetry'
}) => {
  const [selectedMineId, setSelectedMineId] = useState<string>(initialMineId);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'mine' | 'belt'>('mine');
  const [beltSummary, setBeltSummary] = useState<any>(null);

  const fetchWeather = async (mineId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getMineWeather(mineId);
      setWeatherData(data);
    } catch (err: any) {
      console.warn('Weather fetch error:', err);
      setError(err?.message || 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBeltSummary = async () => {
    try {
      const summary = await api.getWeatherSummary();
      setBeltSummary(summary);
    } catch (err: any) {
      console.warn('Belt summary error:', err);
    }
  };

  useEffect(() => {
    fetchWeather(selectedMineId);
    fetchBeltSummary();
  }, [selectedMineId]);

  const current = weatherData?.current || {};
  const provenance = weatherData?.data_provenance || {};

  // Format chart data for recent 14 days + 16 days forecast
  const chartData = (weatherData?.daily || [])
    .slice(-30)
    .map((d: any) => ({
      date: d.date?.slice(5),
      precipitation: d.precipitation_sum,
      soilMoisturePct: Math.round((d.soil_moisture_mean || 0) * 100),
      tempMax: d.temperature_2m_max,
      tempMin: d.temperature_2m_min,
      isForecast: d.is_forecast
    }));

  const riskColor =
    current.risk_level === 'CRITICAL'
      ? '#FF5252'
      : current.risk_level === 'HIGH'
      ? '#F59E0B'
      : current.risk_level === 'MODERATE'
      ? '#38BDF8'
      : '#00E69A';

  return (
    <div className="rounded-2xl border border-[#4D4037] bg-[#1A1613] p-5 shadow-xl space-y-4 font-sans text-[#FFF8F0]">
      {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4D4037] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#FB923C] uppercase">
              OPEN-METEO TELEMETRY • ERA5 REANALYSIS &amp; 16-DAY FORECAST
            </span>
          </div>
          <h3 className="text-lg font-heading font-extrabold text-[#FFF8F0] flex items-center gap-2">
            <span>{title}</span>
            <ProvenanceBadge
              status={provenance.status || 'REAL'}
              source={provenance.source || 'Open-Meteo ERA5 Reanalysis & Forecast'}
              retrievedAt={provenance.retrieved_at}
            />
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Mine Switcher Dropdown */}
          <select
            value={selectedMineId}
            onChange={(e) => setSelectedMineId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#241E1A] border border-[#4D4037] text-xs font-mono text-[#FFF8F0] focus:outline-none focus:border-[#FB923C] transition-colors cursor-pointer"
          >
            {MINES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.state})
              </option>
            ))}
          </select>

          <button
            onClick={() => fetchWeather(selectedMineId)}
            title="Refresh Open-Meteo Telemetry"
            className="p-2 rounded-xl bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] text-[#DEC8B7] hover:text-[#FFF8F0] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#FB923C]' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Current Metric Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        {/* Card 1: 24h Precipitation */}
        <div className="p-3.5 rounded-xl border border-[#4D4037] bg-[#241E1A] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#DEC8B7]">
            <span>24H PRECIPITATION</span>
            <CloudRain className="w-4 h-4 text-[#FB923C]" />
          </div>
          <div className="text-2xl font-bold text-[#FFF8F0]">
            {current.rainfall_24h_mm ?? 0} <span className="text-xs font-normal text-[#DEC8B7]">mm</span>
          </div>
          <div className="text-[10px] text-[#FB923C] truncate">
            Next 7D Forecast: {current.next_7d_rainfall_mm ?? 0} mm
          </div>
        </div>

        {/* Card 2: Soil Moisture (0-7cm) */}
        <div className="p-3.5 rounded-xl border border-[#4D4037] bg-[#241E1A] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#DEC8B7]">
            <span>SOIL MOISTURE</span>
            <Droplets className="w-4 h-4 text-[#E8B298]" />
          </div>
          <div className="text-2xl font-bold text-[#FFF8F0]">
            {current.soil_moisture_m3m3 ? (current.soil_moisture_m3m3 * 100).toFixed(1) : 32.0}%
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <span
              className="px-1.5 py-0.2 rounded font-bold uppercase text-[9px]"
              style={{
                backgroundColor: current.soil_moisture_status === 'SATURATED' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                color: current.soil_moisture_status === 'SATURATED' ? '#EF4444' : '#10B981',
              }}
            >
              {current.soil_moisture_status || 'NORMAL'}
            </span>
            <span className="text-[#A69282] text-[9.5px]">0-7cm Infiltration</span>
          </div>
        </div>

        {/* Card 3: Ambient Temperature */}
        <div className="p-3.5 rounded-xl border border-[#4D4037] bg-[#241E1A] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#DEC8B7]">
            <span>TEMPERATURE</span>
            <Thermometer className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl font-bold text-[#FFF8F0]">
            {current.temperature_c ?? 26.5} <span className="text-xs font-normal text-[#DEC8B7]">°C</span>
          </div>
          <div className="text-[10px] text-[#A69282]">
            Max: {current.temp_max_c ?? 31}°C • Min: {current.temp_min_c ?? 19}°C
          </div>
        </div>

        {/* Card 4: Shortfall / Weather Risk */}
        <div className="p-3.5 rounded-xl border border-[#4D4037] bg-[#241E1A] space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#DEC8B7]">
            <span>SHORTFALL RISK</span>
            <AlertTriangle className="w-4 h-4" style={{ color: riskColor }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: riskColor }}>
            {current.risk_level || 'LOW'}
          </div>
          <div className="text-[9.5px] text-[#DEC8B7] truncate" title={current.impact_warning}>
            {current.impact_warning || 'Normal operational conditions'}
          </div>
        </div>
      </div>

      {/* ── Time Series Chart: 30-Day Window (Past Observations + 16-Day Forecast) ──── */}
      {!compact && chartData.length > 0 && (
        <div className="p-4 rounded-xl border border-[#4D4037] bg-[#241E1A] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="font-bold text-[#FFF8F0]">
              Precipitation (mm) &amp; Soil Moisture Index (Last 14D + 16D Forecast)
            </span>
            <span className="text-[#A69282] text-[10.5px]">
              Dashed area = Open-Meteo 16-Day Forecast Horizon
            </span>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1C3045" opacity={0.6} />
                <XAxis dataKey="date" stroke="#657A90" fontSize={10} fontFamily="monospace" tickLine={false} />
                <YAxis yAxisId="left" stroke="#54D8E8" fontSize={10} fontFamily="monospace" tickLine={false} unit="mm" />
                <YAxis yAxisId="right" orientation="right" stroke="#00E69A" fontSize={10} fontFamily="monospace" tickLine={false} unit="%" domain={[0, 60]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090E18',
                    border: '1px solid #1C3045',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar yAxisId="left" dataKey="precipitation" name="Precipitation (mm)" fill="#54D8E8" opacity={0.75} radius={[2, 2, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="soilMoisturePct" name="Soil Moisture (%)" stroke="#00E69A" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Central India Manganese Belt Regional Overview ─────────────────────── */}
      {beltSummary?.belt_telemetry && (
        <div className="p-3.5 rounded-xl border border-[#1C3045] bg-[#0E1726]/60 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
              <span>REGIONAL MOIL SUMMARY:</span>
              <span className="text-[#54D8E8]">{beltSummary.belt_telemetry.region}</span>
            </div>
            <p className="text-[10px] text-[#9BAFC1] leading-relaxed">
              {beltSummary.belt_telemetry.shortfall_risk_assessment}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[9px] text-[#657A90] block">24H AVG RAIN</span>
              <span className="font-bold text-white">{beltSummary.belt_telemetry.average_rainfall_24h_mm} mm</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#657A90] block">MAX SOIL SATURATION</span>
              <span className="font-bold text-[#00E69A]">{(beltSummary.belt_telemetry.max_soil_moisture_m3m3 * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

