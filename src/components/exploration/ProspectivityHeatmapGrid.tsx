import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  HelpCircle,
  TrendingUp,
  MapPin,
  Filter,
  Eye,
  Sliders,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';

interface ProspectivityHeatmapGridProps {
  onSelectCell?: (cell: any) => void;
  selectedCell?: any;
}

export const ProspectivityHeatmapGrid: React.FC<ProspectivityHeatmapGridProps> = ({
  onSelectCell,
  selectedCell: controlledSelectedCell
}) => {
  const [gridData, setGridData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [displayMode, setDisplayMode] = useState<'probability' | 'uncertainty'>('probability');
  const [filterThreshold, setFilterThreshold] = useState<number>(0);
  const [internalSelectedCell, setInternalSelectedCell] = useState<any>(null);

  const activeCell = controlledSelectedCell ?? internalSelectedCell;

  useEffect(() => {
    let isMounted = true;
    const fetchGrid = async () => {
      try {
        setLoading(true);
        const data = await api.getProspectivityGrid();
        if (isMounted) {
          setGridData(data);
          if (data?.features?.length > 0 && !activeCell) {
            // Default to highest probability cell
            const sorted = [...data.features].sort(
              (a, b) => (b.properties.probability || 0) - (a.properties.probability || 0)
            );
            const top = sorted[0];
            setInternalSelectedCell(top);
            if (onSelectCell) onSelectCell(top);
          }
        }
      } catch (e) {
        console.warn('Failed to load prospectivity grid:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchGrid();
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
      if (p >= 0.75) return '#FF4D6A'; // Red/Pink (Top exploration priority)
      if (p >= 0.50) return '#F59E0B'; // Amber (Prospective zone)
      if (p >= 0.25) return '#00E69A'; // Green (Moderate baseline)
      return '#1E293B'; // Muted dark blue (Low background)
    } else {
      const u = props.uncertainty || 0;
      if (u >= 0.18) return '#EC4899'; // High uncertainty (Tree disagreement)
      if (u >= 0.10) return '#F59E0B'; // Moderate variance
      return '#00E69A'; // Low uncertainty (High model consensus)
    }
  };

  return (
    <div className="space-y-4 font-sans text-white">
      {/* ── Control Bar: Mode Toggle & Filter ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0C1524] border border-[#1C3045] font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-[#9BAFC1] font-bold">DISPLAY MODE:</span>
          <div className="flex bg-[#152235] p-1 rounded-lg border border-[#1C3045]">
            <button
              onClick={() => setDisplayMode('probability')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                displayMode === 'probability'
                  ? 'bg-[#54D8E8] text-[#080C12] shadow'
                  : 'text-[#9BAFC1] hover:text-white'
              }`}
            >
              Prospectivity Probability
            </button>
            <button
              onClick={() => setDisplayMode('uncertainty')}
              className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                displayMode === 'uncertainty'
                  ? 'bg-[#EC4899] text-white shadow'
                  : 'text-[#9BAFC1] hover:text-white'
              }`}
            >
              Uncertainty (RF Variance)
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-[#9BAFC1] font-bold">FILTER:</span>
          {[
            { label: 'All (500m)', val: 0 },
            { label: '>50% Prob', val: 50 },
            { label: '>75% Top', val: 75 },
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => setFilterThreshold(btn.val)}
              className={`px-2.5 py-1 rounded-lg border text-[10.5px] transition-all cursor-pointer ${
                filterThreshold === btn.val
                  ? 'bg-[#54D8E8]/20 border-[#54D8E8] text-[#54D8E8]'
                  : 'bg-[#101927] border-[#1C3045] text-[#9BAFC1] hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Interactive 500m Spatial Grid + 'Why this zone?' SHAP Split ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: 500m Grid Spatial Canvas */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#080D18] border border-[#1C3045] flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#54D8E8]" />
              <span className="font-bold text-white">Central India Manganese Belt (500m Centroids)</span>
              <span className="text-[10px] text-[#657A90]">({filteredFeatures.length} cells active)</span>
            </div>
            <span className="text-[10px] text-[#9BAFC1]">Click any cell to inspect local SHAP</span>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full h-80 bg-[#060A12] rounded-xl border border-[#1C3045] overflow-hidden flex items-center justify-center">
            {loading ? (
              <div className="text-xs font-mono text-[#9BAFC1] animate-pulse">Loading 500m spatial grid...</div>
            ) : (
              <svg
                viewBox="0 0 1000 500"
                className="w-full h-full select-none cursor-crosshair"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Background grid markings */}
                <line x1="50" y1="125" x2="950" y2="125" stroke="#121D2C" strokeDasharray="4 4" />
                <line x1="50" y1="250" x2="950" y2="250" stroke="#121D2C" strokeDasharray="4 4" />
                <line x1="50" y1="375" x2="950" y2="375" stroke="#121D2C" strokeDasharray="4 4" />

                {/* Grid Cells */}
                {filteredFeatures.map((f: any) => {
                  const [lon, lat] = f.geometry.coordinates;
                  // Project lon [79.15, 80.55] -> X [60, 940]
                  const x = 60 + ((lon - bounds.minX) / (bounds.maxX - bounds.minX || 1)) * 880;
                  // Project lat [21.32, 22.02] -> Y [440, 60] (inverted)
                  const y = 440 - ((lat - bounds.minY) / (bounds.maxY - bounds.minY || 1)) * 380;
                  const isSelected = activeCell?.properties?.cell_id === f.properties.cell_id;
                  const color = getCellColor(f.properties);

                  return (
                    <circle
                      key={f.properties.cell_id}
                      cx={x}
                      cy={y}
                      r={isSelected ? 6.5 : f.properties.is_deposit_core ? 4.5 : 3.2}
                      fill={color}
                      stroke={isSelected ? '#FFFFFF' : f.properties.is_deposit_core ? '#54D8E8' : 'none'}
                      strokeWidth={isSelected ? 2 : 1}
                      opacity={isSelected ? 1.0 : 0.85}
                      className="transition-all hover:scale-150 cursor-pointer"
                      onClick={() => handleCellClick(f)}
                    >
                      <title>
                        {`${f.properties.cell_id} | Prob: ${(f.properties.probability * 100).toFixed(1)}% | Unc: ${(f.properties.uncertainty * 100).toFixed(1)}%`}
                      </title>
                    </circle>
                  );
                })}
              </svg>
            )}

            {/* Geographical bounding labels */}
            <div className="absolute top-2 left-3 text-[9px] font-mono text-[#657A90]">
              NW: 22.02° N, 79.15° E (Ukwa Plateau)
            </div>
            <div className="absolute bottom-2 right-3 text-[9px] font-mono text-[#657A90]">
              SE: 21.32° N, 80.55° E (Dongri/Mansar Belt)
            </div>
          </div>

          {/* Color Ramp Legend */}
          <div className="p-3 rounded-xl bg-[#0C1524] border border-[#1C3045] flex flex-wrap items-center justify-between gap-3 text-[10.5px] font-mono">
            <span className="text-[#9BAFC1] font-bold">
              {displayMode === 'probability' ? 'PROSPECTIVITY COLOR RAMP:' : 'UNCERTAINTY SCALE (RF VARIANCE):'}
            </span>
            {displayMode === 'probability' ? (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#FF4D6A]" /> &gt;75% High Target</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> 50-75% Prospective</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00E69A]" /> 25-50% Inferred</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" /> &lt;25% Background</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" /> &gt;18% High Uncertainty</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> 10-18% Moderate Variance</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#00E69A]" /> &lt;10% High Consensus</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: "Why this zone?" SHAP Panel */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#080D18] border border-[#1C3045] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#1C3045] pb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#54D8E8]">
                <HelpCircle className="w-4 h-4 text-[#54D8E8]" />
                <span>WHY THIS ZONE? (SHAP EXPLAINER)</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#152235] text-[#CBD5E1]">
                {activeCell?.properties?.cell_id || 'CELL-SELECT'}
              </span>
            </div>

            {activeCell ? (
              <div className="space-y-3 text-xs font-mono">
                {/* Metric Summary */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-[#101927] border border-[#1C3045]">
                    <span className="text-[10px] text-[#9BAFC1] block">Prospectivity Score</span>
                    <span className="text-xl font-extrabold text-[#00E69A]">
                      {((activeCell.properties.probability || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#101927] border border-[#1C3045]">
                    <span className="text-[10px] text-[#9BAFC1] block">RF Tree Variance</span>
                    <span className="text-xl font-extrabold text-[#54D8E8]">
                      ±{((activeCell.properties.uncertainty || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Top 3 SHAP Drivers */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-white block">
                    Top-3 SHAP Local Feature Drivers:
                  </span>
                  {(activeCell.properties.top_shap_drivers || []).map((driver: string, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#101927] border border-[#1C3045] flex items-center justify-between text-[11px]"
                    >
                      <span className="text-[#CBD5E1] truncate">{driver.split('(')[0]}</span>
                      <span className="font-bold text-[#00E69A] shrink-0 font-mono">
                        {driver.includes('(') ? `(${driver.split('(')[1]}` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Observed Surface Indicators */}
                <div className="p-3 rounded-xl bg-[#0E1726] border border-[#1C3045] space-y-1.5 text-[10.5px]">
                  <div className="flex justify-between">
                    <span className="text-[#9BAFC1]">Iron Oxide B4/B2:</span>
                    <span className="text-white font-bold">{activeCell.properties.iron_oxide_ratio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BAFC1]">SWIR Clay B11/B12:</span>
                    <span className="text-white font-bold">{activeCell.properties.swir_ratio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BAFC1]">Vegetation Stress (NDVI):</span>
                    <span className="text-white font-bold">{activeCell.properties.ndvi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BAFC1]">Sauser Fault Distance:</span>
                    <span className="text-[#54D8E8] font-bold">{activeCell.properties.fault_dist_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9BAFC1]">SRTM Elevation:</span>
                    <span className="text-white font-bold">{activeCell.properties.elevation_m} m</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#9BAFC1]">Click a cell on the map to evaluate local SHAP feature drivers.</p>
            )}
          </div>

          {/* Geological Disclaimer Note */}
          <div className="p-2.5 rounded-lg bg-[#FFB020]/10 border border-[#FFB020]/30 text-[9.5px] font-mono text-[#FFB020] leading-tight">
            ⚠ Surface indicator only. Diamond core drilling required to confirm subsurface manganese mineralization.
          </div>
        </div>
      </div>
    </div>
  );
};

