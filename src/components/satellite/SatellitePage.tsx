import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import {
  Layers,
  Calendar,
  CloudRain,
  Thermometer,
  Droplets,
  Eye,
  AlertTriangle,
  Satellite,
  RefreshCw,
  Activity,
  MapPin,
  Shield,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

const MINE_IDS = [
  { id: 'mine-balaghat', name: 'Balaghat Mine', lat: 21.8049, lon: 80.2033 },
  { id: 'mine-ukwa',     name: 'Ukwa Mine',     lat: 21.7210, lon: 79.8830 },
  { id: 'mine-dongri',   name: 'Dongri Buzurg', lat: 21.4780, lon: 79.3200 },
  { id: 'mine-kandri',   name: 'Kandri Mine',   lat: 21.5080, lon: 79.3450 },
  { id: 'mine-munsar',   name: 'Munsar Mine',   lat: 21.3930, lon: 79.3700 },
  { id: 'mine-chikla',   name: 'Chikla Mine',   lat: 21.4000, lon: 79.1700 },
  { id: 'mine-tirodi',   name: 'Tirodi Mine',   lat: 21.6600, lon: 79.9400 },
];

const SENSORS = ['Sentinel-2 MSI', 'Sentinel-1 SAR', 'Landsat-9 OLI'] as const;
type Sensor = typeof SENSORS[number];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#120F0D] border border-[#4D4037] rounded-xl p-3 text-xs font-mono shadow-xl text-[#FFF8F0]">
      <p className="text-[#FB923C] font-bold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
        </p>
      ))}
    </div>
  );
};

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
    <div className="flex h-full w-full overflow-hidden bg-[#120F0D] text-[#FFF8F0] font-sans select-none">
      {/* LEFT: Mine + Sensor panel */}
      <div className="w-60 shrink-0 h-full border-r border-[#4D4037] bg-[#1A1613] flex flex-col font-mono">
        <div className="p-4 border-b border-[#4D4037]">
          <div className="flex items-center gap-2">
            <Satellite size={16} className="text-[#FB923C]" />
            <span className="text-[11px] text-[#DEC8B7] tracking-widest font-bold font-heading">
              SATELLITE INTEL
            </span>
          </div>
          <div className="text-xs text-[#FB923C] mt-1 font-bold">ESA Copernicus · 5-Day Revisit</div>
        </div>

        {/* Mine selector */}
        <div className="p-2 border-b border-[#4D4037] overflow-y-auto flex-1">
          <div className="text-[9px] text-[#A69282] px-2 mb-1.5 tracking-wider font-bold">TARGET SITE</div>
          {MINE_IDS.map(m => {
            const status = mineStatus.find((s: any) => s.mine_id === m.id);
            const isSelected = m.id === activeMineId;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMineId(m.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all mb-1 cursor-pointer ${
                  isSelected
                    ? 'bg-[#FB923C]/15 text-[#FB923C] border border-[#FB923C]/40 font-bold shadow-sm'
                    : 'text-[#DEC8B7] hover:bg-[#241E1A] hover:text-[#FFF8F0] border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{m.name}</span>
                  {status && (
                    <span className={`w-2 h-2 rounded-full ${status.telemetry_status === 'ACTIVE' ? 'bg-[#10B981]' : 'bg-[#A69282]'}`} />
                  )}
                </div>
                {status && (
                  <div className="text-[9.5px] text-[#A69282] mt-0.5">
                    {status.telemetry_status === 'ACTIVE' ? `NDVI ${status.ndvi?.toFixed(3)}` : 'CLOUD MASKED'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sensor selector */}
        <div className="p-3 border-t border-[#4D4037]">
          <div className="text-[9px] text-[#A69282] px-1 mb-1.5 tracking-wider font-bold">MULTISPECTRAL SENSOR</div>
          {SENSORS.map(s => (
            <button
              key={s}
              onClick={() => setSensor(s)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-all mb-1 cursor-pointer ${
                sensor === s
                  ? 'bg-[#FB923C] text-[#120F0D] font-bold shadow-sm'
                  : 'text-[#DEC8B7] hover:bg-[#241E1A] hover:text-[#FFF8F0]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#4D4037] bg-[#1A1613] shrink-0 font-mono">
          <div>
            <div className="text-[10px] text-[#DEC8B7] tracking-widest font-bold">EARTH OBSERVATION TELEMETRY</div>
            <div className="text-base text-[#FFF8F0] font-heading font-extrabold">{activeMine?.name} — {sensor}</div>
          </div>
          <div className="flex items-center gap-3">
            <ProvenanceBadge
              status="REAL"
              source="Copernicus Sentinel-2 MSI Surface Indices"
            />
            <div className="text-xs text-[#DEC8B7] font-mono">
              Valid: <strong className="text-[#10B981]">{validObs.length}</strong>/{observations?.total_count || 0} obs
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#241E1A] border border-[#4D4037] hover:border-[#FB923C] rounded-xl text-xs text-[#FB923C] hover:text-[#FFF8F0] transition-all cursor-pointer font-bold shadow-sm"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Cadence</span>
            </button>
          </div>
        </div>

        {/* GEOSCIENTIFIC REALITY GUARD BANNER */}
        <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-[#FB923C]/10 border border-[#FB923C]/30 flex items-start gap-3 text-xs shadow-sm">
          <AlertTriangle className="w-4 h-4 text-[#FB923C] shrink-0 mt-0.5" />
          <div className="text-[11.5px] text-[#DEC8B7] leading-relaxed">
            <strong className="text-[#FFF8F0]">GEOSCIENTIFIC REALITY GUARD (UNFC &amp; MOIL COMPLIANCE):</strong> Satellite remote sensing captures <em>surface alteration indices only</em> (Sentinel-2 B4/B2 iron oxide ratio, B11/B12 SWIR clay absorption, and NDVI vegetative stress). Satellite sensors <strong>CANNOT detect subsurface manganese ore deposits</strong>. Subsurface reserve estimation strictly requires wireline diamond core drilling and chemical assay per UNFC-1997 / CRIRSCO standards.
          </div>
        </div>

        {/* Composite KPIs */}
        {compData && (
          <div className="grid grid-cols-5 gap-0 border-b border-[#4D4037] mt-4 px-6 shrink-0 font-mono">
            {[
              { label: 'Valid Observations', value: compData.valid_observations, unit: `/${compData.total_observations}`, color: '#10B981' },
              { label: 'Mean NDVI Index', value: compData.ndvi_composite?.mean?.toFixed(3), color: '#10B981' },
              { label: 'Mean LST Temp', value: `${compData.lst_composite?.mean_c?.toFixed(1)}°C`, color: '#F59E0B' },
              { label: 'Precipitation Sum', value: `${compData.rainfall_composite?.total_mm?.toFixed(0)}mm`, color: '#FB923C' },
              { label: 'Spectral Anomalies', value: compData.anomaly_detections, unit: ' detected', color: mineAnomalies.length > 0 ? '#EF4444' : '#10B981' },
            ].map((kpi, i) => (
              <div key={i} className="p-3 border-r border-[#4D4037] last:border-r-0 bg-[#1A1613] first:rounded-l-xl last:rounded-r-xl">
                <div className="text-[10px] text-[#DEC8B7] mb-1">{kpi.label}</div>
                <div className="text-xl font-bold font-mono" style={{ color: kpi.color }}>
                  {kpi.value}<span className="text-xs text-[#A69282]">{kpi.unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#4D4037] shrink-0 bg-[#1A1613] px-6 mt-4 font-mono text-xs">
          {[
            { id: 'timeseries', label: 'Spectral Time-Series' },
            { id: 'anomalies', label: `Spectral Anomaly Log (${allAnomalies.length})` },
            { id: 'coverage', label: 'Beltwide Satellite Coverage' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`px-5 py-2.5 text-xs border-b-2 font-bold transition-all cursor-pointer ${
                tab === t.id
                  ? 'border-[#FB923C] text-[#FB923C]'
                  : 'border-transparent text-[#DEC8B7] hover:text-[#FFF8F0]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 font-mono space-y-4">
          {tab === 'timeseries' && (
            <div className="space-y-4">
              {/* NDVI + Moisture */}
              <div className="bg-[#1A1613] border border-[#4D4037] rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-[#FFF8F0] font-bold mb-1">NDVI &amp; Soil Moisture — 30-Day Time Series</div>
                <div className="text-[10.5px] text-[#A69282] mb-3">Valid acquisitions only · Cloud-masked per Scene Classification Layer</div>
                <ResponsiveContainer width="100%" height={190}>
                  <LineChart data={timeSeriesData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4D4037" />
                    <XAxis dataKey="date" tick={{ fill: '#DEC8B7', fontSize: 9 }} />
                    <YAxis domain={[0, 1]} tick={{ fill: '#DEC8B7', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="ndvi" stroke="#10B981" strokeWidth={2.5} dot={false} name="NDVI" />
                    <Line type="monotone" dataKey="moisture" stroke="#FB923C" strokeWidth={1.8} dot={false} name="Soil Moisture" strokeDasharray="4 2" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* LST + Rainfall */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1A1613] border border-[#4D4037] rounded-2xl p-4 shadow-sm">
                  <div className="text-xs text-[#FFF8F0] font-bold mb-2">Land Surface Temperature (°C)</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="lstGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                          <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: '#DEC8B7', fontSize: 8 }} />
                      <YAxis tick={{ fill: '#DEC8B7', fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="lst" stroke="#F59E0B" fill="url(#lstGrad)" name="LST (°C)" strokeWidth={1.8} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[#1A1613] border border-[#4D4037] rounded-2xl p-4 shadow-sm">
                  <div className="text-xs text-[#FFF8F0] font-bold mb-2">Precipitation Telemetry (mm)</div>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={timeSeriesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fill: '#DEC8B7', fontSize: 8 }} />
                      <YAxis tick={{ fill: '#DEC8B7', fontSize: 9 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#FB923C" opacity={0.85} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SWIR alteration */}
              <div className="bg-[#1A1613] border border-[#4D4037] rounded-2xl p-4 shadow-sm">
                <div className="text-xs text-[#FFF8F0] font-bold mb-1">SWIR Hydrothermal Alteration Index (B11 / B12 Ratio)</div>
                <div className="text-[10px] text-[#A69282] mb-3">Elevated SWIR/NIR ratio indicates kaolinite-smectite alteration associated with surface Mn gossans · Alteration Threshold: 0.72</div>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={timeSeriesData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="swirGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#EF4444" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4D4037" />
                    <XAxis dataKey="date" tick={{ fill: '#DEC8B7', fontSize: 9 }} />
                    <YAxis domain={[0, 1]} tick={{ fill: '#DEC8B7', fontSize: 9 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="swir" stroke="#EF4444" fill="url(#swirGrad)" name="SWIR Index" strokeWidth={1.8} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-[#4D4037] bg-[#1A1613] rounded-xl p-3 text-[10.5px] text-[#A69282]">
                📡 Source: {sensor} · Processing: Level-2A BOA Reflectance (Sen2Cor 2.11) · Constellation: Sentinel-2A/2B · Revisit: 5 days · Spatial resolution: 10–20m.
              </div>
            </div>
          )}

          {tab === 'anomalies' && (
            <div className="space-y-3 font-mono">
              <div className="text-xs text-[#DEC8B7]">Spectral anomalies from last 14 days across all MOIL mines (SWIR &gt; 0.72 + Iron Oxide Ratio &gt; 1.75):</div>
              {allAnomalies.length === 0 ? (
                <div className="text-center py-16 text-[#A69282]">No spectral anomalies detected in current monitoring window</div>
              ) : allAnomalies.map((a: any, i: number) => (
                <div key={i} className="bg-[#1A1613] border border-[#EF4444]/30 rounded-xl p-4 flex items-start gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444] mt-1 shrink-0 animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-[#EF4444]">{a.anomaly_type}</div>
                        <div className="text-xs font-bold text-[#FFF8F0] mt-0.5">{a.mine_name}</div>
                      </div>
                      <div className="text-[10px] text-[#A69282]">{a.observation_date}</div>
                    </div>
                    <div className="mt-2 flex gap-4 text-xs">
                      <span className="text-[#DEC8B7]">SWIR: <strong className="text-[#EF4444]">{a.swir_alteration_index?.toFixed(3)}</strong></span>
                      <span className="text-[#DEC8B7]">Iron Oxide: <strong className="text-[#F59E0B]">{a.iron_oxide_ratio?.toFixed(3)}</strong></span>
                      <span className="text-[#DEC8B7]">Lat/Lon: {a.latitude?.toFixed(4)}, {a.longitude?.toFixed(4)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'coverage' && (
            <div className="space-y-3 font-mono">
              <div className="text-xs text-[#DEC8B7] mb-4">
                Active satellite coverage across {mineStatus.length} MOIL monitoring sites:
              </div>
              {mineStatus.map((s: any, i: number) => (
                <div key={i} className="bg-[#1A1613] border border-[#4D4037] rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.telemetry_status === 'ACTIVE' ? 'bg-[#10B981]' : 'bg-[#A69282]'}`} />
                    <div>
                      <div className="text-xs font-bold text-[#FFF8F0]">{s.mine_name}</div>
                      <div className="text-[10px] text-[#A69282]">Last observation: {s.last_valid_observation || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <span className="text-[#DEC8B7]">Cloud: <strong className="text-[#FFF8F0]">{s.cloud_coverage_percent?.toFixed(0)}%</strong></span>
                    {s.ndvi && <span className="text-[#DEC8B7]">NDVI: <strong className="text-[#10B981]">{s.ndvi?.toFixed(3)}</strong></span>}
                    {s.rainfall_mm && <span className="text-[#DEC8B7]">Rain: <strong className="text-[#FB923C]">{s.rainfall_mm?.toFixed(1)}mm</strong></span>}
                    {s.anomaly_detected && <span className="text-[#EF4444] font-bold">⚠ ANOMALY</span>}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                      s.telemetry_status === 'ACTIVE'
                        ? 'text-[#10B981] border-[#10B981]/40 bg-[#10B981]/15'
                        : 'text-[#A69282] border-[#4D4037]'
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
