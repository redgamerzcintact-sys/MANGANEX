import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  HelpCircle,
  Crosshair,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';

interface ProspectivityHeatmapGridProps {
  onSelectCell?: (cell: any) => void;
  selectedCell?: any;
}

export const ProspectivityHeatmapGrid: React.FC<ProspectivityHeatmapGridProps> = ({
  onSelectCell,
  selectedCell: controlledSelectedCell,
}) => {
  const [gridData, setGridData] = useState<any>(null);
  const [drillTargets, setDrillTargets] = useState<any[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'probability' | 'uncertainty'>('probability');
  const [filterThreshold, setFilterThreshold] = useState<number>(0);
  const [internalSelectedCell, setInternalSelectedCell] = useState<any>(null);

  const activeCell = controlledSelectedCell ?? internalSelectedCell;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [gridRes, targetsRes] = await Promise.all([
          api.getProspectivityGrid(),
          api.getDrillTargets().catch(() => null),
        ]);
        if (!isMounted) return;

        setGridData(gridRes);
        if (targetsRes?.targets?.length) {
          setDrillTargets(targetsRes.targets);
          setSelectedTarget(targetsRes.targets[0]);
        }

        if (gridRes?.features?.length > 0 && !activeCell) {
          const sorted = [...gridRes.features].sort(
            (a, b) => (b.properties.probability || 0) - (a.properties.probability || 0)
          );
          const top = sorted[0];
          setInternalSelectedCell(top);
          if (onSelectCell) onSelectCell(top);
        }
      } catch (e) {
        console.warn('Failed to load prospectivity grid:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const features = useMemo(() => gridData?.features || [], [gridData]);

  const filteredFeatures = useMemo(() => {
    if (filterThreshold === 0) return features;
    return features.filter((f: any) => (f.properties?.probability || 0) * 100 >= filterThreshold);
  }, [features, filterThreshold]);

  // Coordinate bounding box for 2D spatial canvas
  const bounds = useMemo(() => {
    if (!features.length) return { minX: 79.15, maxX: 80.55, minY: 21.32, maxY: 22.02 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    features.forEach((f: any) => {
      const [lon, lat] = f.geometry.coordinates;
      if (lon < minX) minX = lon;
      if (lon > maxX) maxX = lon;
      if (lat < minY) minY = lat;
      if (lat > maxY) maxY = lat;
    });
    return { minX, maxX, minY, maxY };
  }, [features]);

  const handleCellClick = (feat: any) => {
    setInternalSelectedCell(feat);
    if (onSelectCell) onSelectCell(feat);
  };

  const getCellColor = (props: any) => {
    if (displayMode === 'probability') {
      const p = props.probability || 0;
      if (p >= 0.75) return '#EF4444'; // Hot red core (Top exploration priority)
      if (p >= 0.50) return '#FB923C'; // Warm terracotta (High manganese alteration)
      if (p >= 0.25) return '#FBBF24'; // Warm amber/gold (Prospective horizon)
      return '#382D24'; // Warm dark earth (Low baseline background)
    } else {
      const u = props.uncertainty || 0;
      if (u >= 0.18) return '#F43F5E'; // High variance (Active learning drilling target)
      if (u >= 0.10) return '#F59E0B'; // Moderate variance
      return '#10B981'; // High model consensus
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#FFF8F0]">
      {/* ── Control Bar: Mode Toggle & Filter ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1A1613] border border-[#4D4037] font-mono text-xs shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-[#DEC8B7] font-bold">DISPLAY MODE:</span>
          <div className="flex bg-[#241E1A] p-1 rounded-xl border border-[#4D4037]">
            <button
              onClick={() => setDisplayMode('probability')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                displayMode === 'probability'
                  ? 'bg-[#FB923C] text-[#120F0D] shadow-md'
                  : 'text-[#DEC8B7] hover:text-[#FFF8F0]'
              }`}
            >
              Prospectivity Heatmap
            </button>
            <button
              onClick={() => setDisplayMode('uncertainty')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                displayMode === 'uncertainty'
                  ? 'bg-[#F43F5E] text-[#FFF8F0] shadow-md'
                  : 'text-[#DEC8B7] hover:text-[#FFF8F0]'
              }`}
            >
              Uncertainty (RF Variance)
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-[#DEC8B7] font-bold">FILTER:</span>
          {[
            { label: 'All (500m)', val: 0 },
            { label: '>50% Prob', val: 50 },
            { label: '>75% Top', val: 75 },
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => setFilterThreshold(btn.val)}
              className={`px-3 py-1.5 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${
                filterThreshold === btn.val
                  ? 'bg-[#FB923C]/20 border-[#FB923C] text-[#FB923C] font-bold shadow-sm'
                  : 'bg-[#241E1A] border-[#4D4037] text-[#DEC8B7] hover:text-[#FFF8F0]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive 500m Spatial Grid + 'Why this zone?' SHAP Split ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: 500m Grid Spatial Canvas with Numbered Drill Target Overlays */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#1A1613] border border-[#4D4037] flex flex-col justify-between space-y-3 shadow-md">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FB923C]" />
              <span className="font-bold text-[#FFF8F0] font-heading text-sm">
                Central India Manganese Belt (500m Centroids)
              </span>
              <span className="text-[10px] text-[#A69282]">({filteredFeatures.length} cells active)</span>
            </div>
            <div className="flex items-center gap-3 text-[10.5px] text-[#DEC8B7]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block shadow-[0_0_6px_#10B981]" />
                Numbered Markers: Next-Drill Targets (1-5)
              </span>
            </div>
          </div>

          {/* SVG Map Canvas with Animated Scanning Beam */}
          <div className="relative w-full h-80 bg-[#14110F] rounded-xl border border-[#4D4037] overflow-hidden flex items-center justify-center">
            {/* Live Geological Scanning Beam */}
            <div className="geological-scanline animate-scan-beam" />

            {loading ? (
              <div className="text-xs font-mono text-[#DEC8B7] animate-pulse">Loading 500m spatial grid...</div>
            ) : (
              <svg
                viewBox="0 0 1000 500"
                className="w-full h-full select-none cursor-crosshair relative z-10"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background grid markings */}
                <line x1="50" y1="125" x2="950" y2="125" stroke="#2D241E" strokeDasharray="4 4" />
                <line x1="50" y1="250" x2="950" y2="250" stroke="#2D241E" strokeDasharray="4 4" />
                <line x1="50" y1="375" x2="950" y2="375" stroke="#2D241E" strokeDasharray="4 4" />

                {/* Grid Cells */}
                {filteredFeatures.map((f: any) => {
                  const [lon, lat] = f.geometry.coordinates;
                  const x = 60 + ((lon - bounds.minX) / (bounds.maxX - bounds.minX || 1)) * 880;
                  const y = 440 - ((lat - bounds.minY) / (bounds.maxY - bounds.minY || 1)) * 380;
                  const isSelected = activeCell?.properties?.cell_id === f.properties.cell_id;
                  const color = getCellColor(f.properties);

                  return (
                    <circle
                      key={f.properties.cell_id}
                      cx={x}
                      cy={y}
                      r={isSelected ? 7 : f.properties.is_deposit_core ? 5 : 3.4}
                      fill={color}
                      stroke={isSelected ? '#FFF8F0' : f.properties.is_deposit_core ? '#FB923C' : 'none'}
                      strokeWidth={isSelected ? 2.5 : 1}
                      opacity={isSelected ? 1.0 : 0.88}
                      className="transition-all hover:scale-150 cursor-pointer"
                      onClick={() => handleCellClick(f)}
                    >
                      <title>
                        {`${f.properties.cell_id} | Prob: ${(f.properties.probability * 100).toFixed(1)}% | Unc: ${(f.properties.uncertainty * 100).toFixed(1)}%`}
                      </title>
                    </circle>
                  );
                })}

                {/* Numbered Drill Target Markers (1 - 5) with Warm Glowing Halos */}
                {drillTargets.map((target) => {
                  const [lat, lon] = target.coordinates;
                  const x = 60 + ((lon - bounds.minX) / (bounds.maxX - bounds.minX || 1)) * 880;
                  const y = 440 - ((lat - bounds.minY) / (bounds.maxY - bounds.minY || 1)) * 380;
                  const isTargetSelected = selectedTarget?.target_id === target.target_id;

                  return (
                    <g
                      key={target.target_id}
                      className="cursor-pointer group"
                      onClick={() => setSelectedTarget(target)}
                    >
                      {/* Pulse Ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isTargetSelected ? 18 : 13}
                        fill="none"
                        stroke="#FB923C"
                        strokeWidth={isTargetSelected ? 2.2 : 1.5}
                        strokeDasharray={isTargetSelected ? '3 2' : 'none'}
                        opacity={0.85}
                      />
                      {/* Center Pin */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isTargetSelected ? 10.5 : 8.5}
                        fill={isTargetSelected ? '#FB923C' : '#241E1A'}
                        stroke="#FB923C"
                        strokeWidth={2}
                      />
                      {/* Number Text */}
                      <text
                        x={x}
                        y={y + 3.2}
                        textAnchor="middle"
                        fill={isTargetSelected ? '#120F0D' : '#FFF8F0'}
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {target.rank}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}

            {/* Geographical bounding labels */}
            <div className="absolute top-2 left-3 text-[9px] font-mono text-[#A69282] z-20">
              NW: 22.02° N, 79.15° E (Ukwa Plateau)
            </div>
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#A69282] z-20">
              SE: 21.32° N, 80.55° E (Dongri/Mansar Belt)
            </div>
          </div>

          {/* Color Ramp Legend */}
          <div className="p-3.5 rounded-xl bg-[#241E1A] border border-[#4D4037] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono">
            <span className="text-[#DEC8B7] font-bold">
              {displayMode === 'probability' ? 'MANGANESE THERMAL COLOR RAMP:' : 'UNCERTAINTY SCALE (RF VARIANCE):'}
            </span>
            {displayMode === 'probability' ? (
              <div className="flex items-center gap-3.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" /> &gt;75% High Core</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FB923C]" /> 50-75% Prospective</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]" /> 25-50% Inferred</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#382D24]" /> &lt;25% Background</span>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" /> &gt;18% High Uncertainty</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> 10-18% Moderate Variance</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" /> &lt;10% High Consensus</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: "Why this zone?" SHAP Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#1A1613] border border-[#4D4037] flex flex-col justify-between space-y-4 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#4D4037] pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#FB923C]">
                <HelpCircle className="w-4 h-4 text-[#FB923C]" />
                <span>WHY THIS ZONE? (SHAP EXPLAINER)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#241E1A] border border-[#4D4037] text-[#DEC8B7] font-bold">
                {activeCell?.properties?.cell_id || 'CELL-SELECT'}
              </span>
            </div>

            {activeCell ? (
              <div className="space-y-3 text-xs font-mono">
                {/* Metric Summary */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037]">
                    <span className="text-[10px] text-[#DEC8B7] block font-medium">Prospectivity Score</span>
                    <span className="text-xl font-extrabold text-[#10B981]">
                      {((activeCell.properties.probability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037]">
                    <span className="text-[10px] text-[#DEC8B7] block font-medium">RF Tree Variance</span>
                    <span className="text-xl font-extrabold text-[#FB923C]">
                      ±{((activeCell.properties.uncertainty || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Top 3 SHAP Drivers */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-[#FFF8F0] block">
                    Top-3 SHAP Local Feature Drivers:
                  </span>
                  {(activeCell.properties.top_shap_drivers || []).map((driver: string, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-[#241E1A] border border-[#4D4037] flex items-center justify-between text-[11px]"
                    >
                      <span className="text-[#DEC8B7] truncate">{driver.split('(')[0]}</span>
                      <span className="font-bold text-[#FB923C] shrink-0 font-mono">
                        {driver.includes('(') ? `(${driver.split('(')[1]}` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Observed Surface Indicators */}
                <div className="p-3 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-1.5 text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-[#DEC8B7]">Iron Oxide B4/B2:</span>
                    <span className="text-[#FFF8F0] font-bold">{activeCell.properties.iron_oxide_ratio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#DEC8B7]">SWIR Clay B11/B12:</span>
                    <span className="text-[#FFF8F0] font-bold">{activeCell.properties.swir_ratio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#DEC8B7]">Vegetation Stress (NDVI):</span>
                    <span className="text-[#FFF8F0] font-bold">{activeCell.properties.ndvi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#DEC8B7]">Sauser Fault Distance:</span>
                    <span className="text-[#FB923C] font-bold">{activeCell.properties.fault_dist_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#DEC8B7]">SRTM Elevation:</span>
                    <span className="text-[#FFF8F0] font-bold">{activeCell.properties.elevation_m} m</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#DEC8B7]">Click a cell on the map to evaluate local SHAP feature drivers.</p>
            )}
          </div>

          {/* Geological Disclaimer Note */}
          <div className="p-2.5 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[9.5px] font-mono text-[#F59E0B] leading-tight">
            ⚠ Surface indicator only. Diamond core drilling required to confirm subsurface manganese mineralization.
          </div>
        </div>
      </div>

      {/* ── 3. RANKED NEXT-DRILL-TARGET RECOMMENDER SECTION ──────────────────── */}
      <div className="p-6 rounded-2xl bg-[#1A1613] border border-[#4D4037] space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#4D4037]">
          <div>
            <div className="flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-[#FB923C]" />
              <h3 className="font-heading font-extrabold text-base text-[#FFF8F0]">
                Next-Drill-Target Recommender
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FB923C]/15 text-[#FB923C] border border-[#FB923C]/30 font-bold">
                ACTIVE LEARNING SOLVER
              </span>
            </div>
            <p className="text-xs text-[#DEC8B7] font-mono mt-0.5">
              Cell Score = P(mineralization) × Uncertainty-Aware Info Gain ÷ Drilling-Cost Proxy (Depth, Road &amp; Collar Proximity)
            </p>
          </div>

          <div className="text-[10px] font-mono text-[#E8B298] bg-[#E8B298]/10 px-3 py-1 rounded-full border border-[#E8B298]/30 font-bold">
            Spatial NMS Separation: &ge;1.5 km
          </div>
        </div>

        {/* Targets Table & "Why this target?" Detail Drawer Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Table (8 cols) */}
          <div className="lg:col-span-8 overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#4D4037] text-[#DEC8B7] text-[10.5px]">
                  <th className="py-2.5 px-3">RANK</th>
                  <th className="py-2.5 px-3">TARGET ID &amp; ZONE</th>
                  <th className="py-2.5 px-3">COORDINATES</th>
                  <th className="py-2.5 px-3">P(MINERAL)</th>
                  <th className="py-2.5 px-3">UNCERTAINTY</th>
                  <th className="py-2.5 px-3">COST CLASS</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4D4037]/60 text-[11.5px]">
                {drillTargets.map((t) => {
                  const isSelected = selectedTarget?.target_id === t.target_id;
                  return (
                    <tr
                      key={t.target_id}
                      onClick={() => setSelectedTarget(t)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-[#2F2722] text-[#FFF8F0]' : 'hover:bg-[#241E1A] text-[#DEC8B7]'
                      }`}
                    >
                      <td className="py-3 px-3">
                        <span className="w-6 h-6 rounded-full bg-[#FB923C]/20 text-[#FB923C] font-bold flex items-center justify-center text-xs">
                          #{t.rank}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#FFF8F0]">{t.target_name}</div>
                        <div className="text-[10px] text-[#A69282]">{t.target_id}</div>
                      </td>
                      <td className="py-3 px-3 text-[#FB923C]">
                        {t.coordinates[0]?.toFixed(4)}°N, {t.coordinates[1]?.toFixed(4)}°E
                      </td>
                      <td className="py-3 px-3 font-bold text-[#10B981]">
                        {(t.probability * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-[#C084FC]">
                        ±{(t.uncertainty * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.cost_class === 'LOW'
                              ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                              : t.cost_class === 'MODERATE'
                              ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                              : 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                          }`}
                        >
                          {t.cost_class} COST
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTarget(t);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#241E1A] hover:bg-[#2F2722] border border-[#4D4037] hover:border-[#FB923C] text-[#FB923C] text-[10.5px] transition-colors font-bold cursor-pointer"
                        >
                          Why Target #{t.rank}?
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Right: "Why this target?" Detail Panel (4 cols) */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-3 font-mono text-xs shadow-sm">
            {selectedTarget ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#4D4037]">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#FB923C]/20 text-[#FB923C] font-bold text-xs flex items-center justify-center">
                      #{selectedTarget.rank}
                    </span>
                    <span className="font-bold text-[#FFF8F0] text-xs">
                      {selectedTarget.target_name}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#FB923C] font-bold">
                    Score: {selectedTarget.score?.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#1A1613] border border-[#4D4037] space-y-1.5 text-[11px]">
                  <div className="text-[10px] text-[#DEC8B7] uppercase tracking-wider font-bold">
                    EXPLORATION RATIONALE:
                  </div>
                  <p className="text-[#DEC8B7] leading-relaxed">
                    {selectedTarget.rationale}
                  </p>
                </div>

                {/* Drilling Parameters */}
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div className="p-2 rounded-lg bg-[#1A1613] border border-[#4D4037]">
                    <span className="text-[#A69282] block text-[9.5px]">Target Depth</span>
                    <strong className="text-[#FFF8F0]">~{selectedTarget.estimated_depth_m} m</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1A1613] border border-[#4D4037]">
                    <span className="text-[#A69282] block text-[9.5px]">Haul Road Dist.</span>
                    <strong className="text-[#FFF8F0]">{selectedTarget.distance_to_road_km} km</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1A1613] border border-[#4D4037]">
                    <span className="text-[#A69282] block text-[9.5px]">Step-Out Dist.</span>
                    <strong className="text-[#FFF8F0]">{selectedTarget.distance_to_borehole_km} km</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#1A1613] border border-[#4D4037]">
                    <span className="text-[#A69282] block text-[9.5px]">Info Gain Metric</span>
                    <strong className="text-[#10B981]">{selectedTarget.information_gain}</strong>
                  </div>
                </div>

                {/* Top SHAP reasons */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] text-[#DEC8B7] uppercase tracking-wider font-bold block">
                    Top SHAP Anomaly Drivers:
                  </span>
                  {(selectedTarget.top_shap_drivers || []).slice(0, 3).map((driver: string, i: number) => (
                    <div
                      key={i}
                      className="p-1.5 rounded-lg bg-[#1A1613] border border-[#4D4037] text-[10.5px] text-[#FFF8F0] flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FB923C]" />
                      <span className="truncate">{driver}</span>
                    </div>
                  ))}
                </div>

                {/* Recommended Drill Collar Specification */}
                <div className="p-2.5 rounded-lg bg-[#1A1613] border border-[#FB923C]/40 text-[10.5px] text-[#FB923C] space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Recommended Drillhole Specification:</span>
                  </div>
                  <p className="text-[10px] text-[#DEC8B7] leading-relaxed">
                    {selectedTarget.recommended_action}
                  </p>
                </div>

                {/* Statutory Disclaimer */}
                <div className="text-[9.5px] text-[#F59E0B] leading-tight">
                  ⚠ Indicative exploration recommendation only. Core drilling &amp; chemical assaying strictly required for UNFC reserve certification.
                </div>
              </div>
            ) : (
              <p className="text-[#A69282] text-xs">Select a target row to review exploration rationale and collar specs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
