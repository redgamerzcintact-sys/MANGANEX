import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import {
  Layers, Calendar, CloudRain, Thermometer, Droplets,
  Eye, AlertTriangle, Satellite, RefreshCw, Activity, MapPin
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const MINE_IDS = [
  { id: 'mine-balaghat', name: 'Balaghat', lat: 21.8049, lon: 80.2033 },
  { id: 'mine-ukwa',     name: 'Ukwa',     lat: 21.7210, lon: 79.8830 },
  { id: 'mine-dongri',   name: 'Dongri',   lat: 21.4780, lon: 79.3200 },
  { id: 'mine-kandri',   name: 'Kandri',   lat: 21.5080, lon: 79.3450 },
  { id: 'mine-munsar',   name: 'Munsar',   lat: 21.3930, lon: 79.3700 },
  { id: 'mine-chikla',   name: 'Chikla',   lat: 21.4000, lon: 79.1700 },
  { id: 'mine-tirodi',   name: 'Tirodi',   lat: 21.6600, lon: 79.9400 },
];

const SENSORS = ['Sentinel-2 MSI', 'Sentinel-1 SAR', 'Landsat-9 OLI'] as const;
type Sensor = typeof SENSORS[number];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111c27] border border-[#1e3045] rounded p-3 text-xs font-mono">
      <p className="text-[#54D8E8] mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}</p>
      ))}
    </div>
  );
};

const IndexBadge: React.FC<{ label: string; value: number | string; unit?: string; color?: string }> = ({ label, value, unit = '', color = '#54D8E8' }) => (
  <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-3">
    <div className="text-[9px] text-[#4A7A9A] mb-1">{label}</div>
    <div className="text-xl font-bold font-mono" style={{ color }}>{value}{unit}</div>
  </div>
);

export const SatellitePage: React.FC = () => {
  const { selectedMine } = useAppStore();
  const [activeMineId, setActiveMineId] = useState('mine-balaghat');
  const [sensor, setSensor] = useState<Sensor>('Sentinel-2 MSI');
  const [observations, setObservations] = useState<any>(null);
  const [composite, setComposite] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any>(null);
  const [satStatus, setSatStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'timeseries' | 'anomalies' | 'coverage'>('timeseries');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [obs, comp, anom, stat] = await Promise.all([
      api.getSatelliteObservations(activeMineId, 30),
      api.getSatelliteComposite(activeMineId, 30),
      api.getSatelliteAnomalies(),
      api.getSatelliteStatus(),
    ]);
    setObservations(obs);
    setComposite(comp);
    setAnomalies(anom);
    setSatStatus(stat);
    setLoading(false);
  }, [activeMineId]);

  useEffect(() => { loadData(); }, [loadData]);

  // Build chart data from valid observations
  const validObs = observations?.observations?.filter((o: any) => o.valid_observation) || [];
  const timeSeriesData = validObs.map((o: any) => ({
    date: o.observation_date?.slice(5),
    ndvi: o.ndvi,
    moisture: o.soil_moisture,
    lst: o.land_surface_temperature_c,
    rainfall: o.rainfall_mm,
    swir: o.swir_alteration_index,
  }));

  const mineStatus = satStatus?.mines || [];
  const compData = composite?.composite;
  const mineAnomalies = anomalies?.anomalies?.filter((a: any) => a.mine_id === activeMineId) || [];
  const allAnomalies = anomalies?.anomalies || [];

  const activeMine = MINE_IDS.find(m => m.id === activeMineId);

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#070C12] text-[#C8D8E8] font-mono">
      {/* LEFT: Mine + Sensor panel */}
      <div className="w-56 shrink-0 h-full border-r border-[#1A2D40] bg-[#0A1520] flex flex-col">
        <div className="p-4 border-b border-[#1A2D40]">
          <div className="flex items-center gap-2">
            <Satellite size={14} className="text-[#54D8E8]" />
            <span className="text-[10px] text-[#4A7A9A] tracking-widest">SATELLITE INTEL</span>
          </div>
          <div className="text-xs text-[#54D8E8] mt-1">ESA Copernicus · 5-Day Revisit</div>
        </div>

        {/* Mine selector */}
        <div className="p-2 border-b border-[#1A2D40]">
          <div className="text-[9px] text-[#4A7A9A] px-2 mb-1 tracking-wider">TARGET SITE</div>
          {MINE_IDS.map(m => {
            const status = mineStatus.find((s: any) => s.mine_id === m.id);
            return (
              <button key={m.id} onClick={() => setActiveMineId(m.id)}
                className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition-all mb-0.5 ${
                  m.id === activeMineId
                    ? 'bg-[#54D8E8]15 text-[#54D8E8] border border-[#54D8E8]30'
                    : 'text-[#A0BDD0] hover:bg-[#111D2A] border border-transparent'
                }`}>
                <div className="flex items-center justify-between">
                  <span>{m.name}</span>
                  {status && (
                    <span className={`w-1.5 h-1.5 rounded-full ${status.telemetry_status === 'ACTIVE' ? 'bg-[#00E676]' : 'bg-[#4A7A9A]'}`} />
                  )}
                </div>
                {status && (
                  <div className="text-[9px] text-[#4A7A9A] mt-0.5">
                    {status.telemetry_status === 'ACTIVE' ? `NDVI ${status.ndvi?.toFixed(3)}` : 'CLOUD MASKED'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sensor selector */}
        <div className="p-2">
          <div className="text-[9px] text-[#4A7A9A] px-2 mb-1 tracking-wider">SENSOR</div>
          {SENSORS.map(s => (
            <button key={s} onClick={() => setSensor(s)}
              className={`w-full text-left px-2 py-1.5 rounded text-[10px] transition-all mb-0.5 ${
                sensor === s ? 'bg-[#54D8E8]15 text-[#54D8E8]' : 'text-[#4A7A9A] hover:bg-[#111D2A]'
              }`}>
              {s}
            </button>
          ))}
        </div>

        {/* Current indices */}
        {satStatus?.mines?.find((m: any) => m.mine_id === activeMineId)?.telemetry_status === 'ACTIVE' && (() => {
          const s = satStatus.mines.find((m: any) => m.mine_id === activeMineId);
          return (
            <div className="p-3 mt-auto border-t border-[#1A2D40] space-y-2">
              <div className="text-[9px] text-[#4A7A9A] tracking-wider">LATEST INDICES</div>
              {[
                { label: 'NDVI', value: s.ndvi?.toFixed(4), color: '#00E676' },
                { label: 'Moisture', value: s.soil_moisture?.toFixed(3), color: '#54D8E8' },
                { label: 'LST', value: `${s.land_surface_temperature_c?.toFixed(1)}°C`, color: '#FFB020' },
                { label: 'Rainfall', value: `${s.rainfall_mm?.toFixed(1)}mm`, color: '#7C4DFF' },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-[10px]">
                  <span className="text-[#4A7A9A]">{item.label}</span>
                  <span style={{ color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#1A2D40] bg-[#0A1520] shrink-0">
          <div>
            <div className="text-[10px] text-[#4A7A9A] tracking-widest">SATELLITE INTELLIGENCE ENGINE</div>
            <div className="text-sm text-[#54D8E8]">{activeMine?.name} — {sensor}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[10px] text-[#4A7A9A]">
              Valid: {validObs.length}/{observations?.total_count || 0} obs
            </div>
            <button onClick={loadData} disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D2035] border border-[#1A2D40] rounded text-[11px] text-[#54D8E8] hover:border-[#54D8E8] transition-all">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Composite KPIs */}
        {compData && (
          <div className="grid grid-cols-5 gap-0 border-b border-[#1A2D40] shrink-0">
            {[
              { label: 'Valid Obs', value: compData.valid_observations, unit: `/${compData.total_observations}`, color: '#00E676' },
              { label: 'Mean NDVI', value: compData.ndvi_composite?.mean?.toFixed(3), color: '#00E676' },
              { label: 'Mean LST', value: `${compData.lst_composite?.mean_c?.toFixed(1)}°C`, color: '#FFB020' },
              { label: 'Total Rainfall', value: `${compData.rainfall_composite?.total_mm?.toFixed(0)}mm`, color: '#54D8E8' },
              { label: 'Anomalies', value: compData.anomaly_detections, unit: ' detected', color: mineAnomalies.length > 0 ? '#FF5252' : '#00E676' },
            ].map((kpi, i) => (
              <div key={i} className="p-4 border-r border-[#1A2D40] last:border-r-0">
                <div className="text-[9px] text-[#4A7A9A] mb-1">{kpi.label}</div>
                <div className="text-xl font-bold" style={{ color: kpi.color }}>
                  {kpi.value}<span className="text-xs text-[#4A7A9A]">{kpi.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#1A2D40] shrink-0 bg-[#0A1520]">
          {[
            { id: 'timeseries', label: 'Spectral Time-Series' },
            { id: 'anomalies', label: `Anomaly Log (${allAnomalies.length})` },
            { id: 'coverage', label: 'System Coverage' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-6 py-2.5 text-[11px] border-b-2 transition-all ${
                tab === t.id ? 'border-[#54D8E8] text-[#54D8E8]' : 'border-transparent text-[#4A7A9A] hover:text-[#A0BDD0]'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'timeseries' && (
            <div className="space-y-5">
              {/* NDVI + Moisture */}
              <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                <div className="text-xs text-[#54D8E8] mb-1">NDVI & Soil Moisture — 30-Day Time Series</div>
                <div className="text-[10px] text-[#4A7A9A] mb-4">Valid acquisitions only · Cloud-masked</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2D40" />
                    <XAxis dataKey="date" tick={{ fill: '#4A7A9A', fontSize: 9 }} />
                    <YAxis domain={[0, 1]} tick={{ fill: '#4A7A9A', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="ndvi" stroke="#00E676" strokeWidth={2} dot={false} name="NDVI" />
                    <Line type="monotone" dataKey="moisture" stroke="#54D8E8" strokeWidth={1.5} dot={false} name="Soil Moisture" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* LST + Rainfall */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                  <div className="text-xs text-[#54D8E8] mb-3">Land Surface Temperature (°C)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lstGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FFB020" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#FFB020" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#4A7A9A', fontSize: 8 }} />
                      <YAxis tick={{ fill: '#4A7A9A', fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="lst" stroke="#FFB020" fill="url(#lstGrad)" name="LST (°C)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                  <div className="text-xs text-[#54D8E8] mb-3">Precipitation — CHIRPS Fusion (mm)</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fill: '#4A7A9A', fontSize: 8 }} />
                      <YAxis tick={{ fill: '#4A7A9A', fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#7C4DFF" opacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SWIR alteration */}
              <div className="bg-[#0A1520] border border-[#1A2D40] rounded p-4">
                <div className="text-xs text-[#54D8E8] mb-1">SWIR Hydrothermal Alteration Index</div>
                <div className="text-[10px] text-[#4A7A9A] mb-3">Elevated SWIR/NIR ratio indicates kaolinite-smectite alteration associated with Mn gossans · Threshold: 0.72</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={timeSeriesData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="swirGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF5252" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#FF5252" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A2D40" />
                    <XAxis dataKey="date" tick={{ fill: '#4A7A9A', fontSize: 9 }} />
                    <YAxis domain={[0, 1]} tick={{ fill: '#4A7A9A', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="swir" stroke="#FF5252" fill="url(#swirGrad)" name="SWIR Index" strokeWidth={1.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-[#1A2D40]30 bg-[#0A152060] rounded p-3 text-[10px] text-[#4A7A9A]">
                📡 Source: {sensor} · Processing: Level-2A BOA Reflectance (Sen2Cor 2.11) · 
                Constellation: Sentinel-2A/2B · Revisit: 5 days · Spatial resolution: 10–20m · 
                VALIDATED_SYNTHETIC_DEMO — not real ESA imagery
              </div>
            </div>
          )}

          {tab === 'anomalies' && (
            <div className="space-y-3">
              <div className="text-xs text-[#4A7A9A]">Spectral anomalies from last 14 days across all MOIL mines. SWIR &gt; 0.72 + Iron Oxide Ratio &gt; 1.75</div>
              {allAnomalies.length === 0 ? (
                <div className="text-center py-16 text-[#4A7A9A]">No spectral anomalies detected in current monitoring window</div>
              ) : allAnomalies.map((a: any, i: number) => (
                <div key={i} className="bg-[#0A1520] border border-[#FF525220] rounded p-4 flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#FF5252] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs text-[#FF5252]">{a.anomaly_type}</div>
                        <div className="text-[11px] text-[#A0BDD0] mt-0.5">{a.mine_name}</div>
                      </div>
                      <div className="text-[10px] text-[#4A7A9A]">{a.observation_date}</div>
                    </div>
                    <div className="mt-2 flex gap-4 text-[10px]">
                      <span className="text-[#4A7A9A]">SWIR: <span className="text-[#FF5252]">{a.swir_alteration_index?.toFixed(3)}</span></span>
                      <span className="text-[#4A7A9A]">Iron Oxide: <span className="text-[#FFB020]">{a.iron_oxide_ratio?.toFixed(3)}</span></span>
                      <span className="text-[#4A7A9A]">Lat/Lon: {a.latitude?.toFixed(4)}, {a.longitude?.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'coverage' && (
            <div className="space-y-3">
              <div className="text-xs text-[#4A7A9A] mb-4">
                Active satellite coverage across {mineStatus.length} MOIL monitoring sites
              </div>
              {mineStatus.map((s: any, i: number) => (
                <div key={i} className="bg-[#0A1520] border border-[#1A2D40] rounded p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${s.telemetry_status === 'ACTIVE' ? 'bg-[#00E676]' : 'bg-[#4A7A9A]'}`} />
                    <div>
                      <div className="text-xs text-[#A0BDD0]">{s.mine_name}</div>
                      <div className="text-[10px] text-[#4A7A9A]">Last obs: {s.last_valid_observation || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-[10px]">
                    <span className="text-[#4A7A9A]">Cloud: <span className="text-[#C8D8E8]">{s.cloud_coverage_percent?.toFixed(0)}%</span></span>
                    {s.ndvi && <span className="text-[#4A7A9A]">NDVI: <span className="text-[#00E676]">{s.ndvi?.toFixed(3)}</span></span>}
                    {s.rainfall_mm && <span className="text-[#4A7A9A]">Rain: <span className="text-[#54D8E8]">{s.rainfall_mm?.toFixed(1)}mm</span></span>}
                    {s.anomaly_detected && <span className="text-[#FF5252]">⚠ ANOMALY</span>}
                    <span className={`text-[9px] px-2 py-0.5 rounded border ${
                      s.telemetry_status === 'ACTIVE'
                        ? 'text-[#00E676] border-[#00E676]30 bg-[#00E67610]'
                        : 'text-[#4A7A9A] border-[#1A2D40]'
                    }`}>{s.telemetry_status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
