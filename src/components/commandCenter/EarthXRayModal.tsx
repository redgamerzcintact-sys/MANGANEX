import React, { useState } from 'react';
import { Mine } from '../../types';
import {
  X,
  Layers,
  Sliders,
  Maximize2,
  Info,
  CheckCircle2,
  HelpCircle,
  Eye,
  Crosshair
} from 'lucide-react';

interface EarthXRayModalProps {
  mine: Mine;
  onClose: () => void;
}

export const EarthXRayModal: React.FC<EarthXRayModalProps> = ({ mine, onClose }) => {
  const [dividerPosition, setDividerPosition] = useState(50);
  const [selectedDepthM, setSelectedDepthM] = useState(210);
  const [selectedStrata, setSelectedStrata] = useState<string | null>('High-Grade Braunite-Pyrolusite Reef');
  const [isDragging, setIsDragging] = useState(false);

  // Cross-section strata model
  const strataLayers = [
    { name: 'Laterite & Weathered Topsoil', from: 0, to: 25, color: '#C28251', classification: 'Observed Surface', grade: '4.2% Mn' },
    { name: 'Muscovite Schist & Quartzite', from: 25, to: 85, color: '#7E8B92', classification: 'Borehole Confirmed', grade: '7.1% Mn' },
    { name: 'Gondite / Spessartite Bed', from: 85, to: 140, color: '#5C4A6F', classification: 'Borehole Confirmed', grade: '24.8% Mn' },
    { name: 'High-Grade Braunite-Pyrolusite Reef', from: 140, to: 245, color: '#9A85FF', classification: 'AI-Inferred & Borehole Verified', grade: '48.4% Mn' },
    { name: 'Manganiferous Quartzite Interbed', from: 245, to: 310, color: '#6A5688', classification: 'Model-Interpolated', grade: '31.2% Mn' },
    { name: 'Tirodi Gneiss Basement Complex', from: 310, to: 400, color: '#3A4856', classification: 'Observed Bedrock', grade: '2.1% Mn' }
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(rect.width - 10, e.clientX - rect.left));
    setDividerPosition((x / rect.width) * 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col w-full max-w-6xl h-[88vh] rounded-2xl bg-[#101925] border border-[#26384A] shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#26384A] bg-[#152130]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#37D9FF] flex items-center justify-center text-black font-bold">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-base text-[#EDF5FC]">
                  EARTH X-RAY SCANNER
                </h2>
                <span className="px-2 py-0.5 rounded bg-[#9A85FF]/20 text-[#9A85FF] text-[10px] font-mono border border-[#9A85FF]/40">
                  SUBSURFACE RADAR CROSS-SECTION
                </span>
              </div>
              <p className="text-xs text-[#96AABD] font-mono">
                Cross-Section Profile: {mine.name} [385m Depth Scan]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Scientific Provenance Indicators */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#080D14] border border-[#26384A] text-[11px] font-mono">
              <span className="flex items-center gap-1 text-[#38D9A9]">
                <CheckCircle2 className="h-3 w-3" /> Borehole Confirmed
              </span>
              <span className="text-[#26384A]">|</span>
              <span className="flex items-center gap-1 text-[#9A85FF]">
                <Crosshair className="h-3 w-3" /> Model Inferred
              </span>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#26384A] text-[#96AABD] hover:text-[#EDF5FC] hover:bg-[#1B2A3A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Center Split Screen: Satellite Surface vs Subsurface Cross Section */}
        <div
          className="relative flex-1 bg-[#080D14] overflow-hidden select-none cursor-ew-resize"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleMouseMove}
        >
          {/* LEFT HALF: High-Resolution Satellite Surface View */}
          <div
            className="absolute inset-y-0 left-0 bg-[#080D14] border-r border-[#37D9FF] overflow-hidden"
            style={{ width: `${dividerPosition}%` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1B2A3A] via-[#101925] to-[#080D14] p-6 flex flex-col justify-between">
              {/* Top Surface Badge */}
              <div className="flex items-center justify-between z-10">
                <span className="px-2.5 py-1 rounded bg-[#101925]/90 border border-[#26384A] text-xs font-mono text-[#37D9FF]">
                  SURFACE REFLECTANCE (SENTINEL-2 RGB)
                </span>
                <span className="text-xs font-mono text-[#96AABD]">COLLAR ELEVATION: 345m</span>
              </div>

              {/* Surface Simulated Map Graphic */}
              <div className="relative flex-1 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full border border-[#37D9FF]/20 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#9A85FF]/40 animate-spin" style={{ animationDuration: '30s' }} />
                  <div className="h-40 w-40 rounded-full bg-[#37D9FF]/5 flex items-center justify-center border border-[#37D9FF]/30">
                    <div className="text-center">
                      <div className="text-xs font-mono font-bold text-[#EDF5FC]">{mine.name}</div>
                      <div className="text-[10px] font-mono text-[#38D9A9]">Shaft Headframe #1</div>
                    </div>
                  </div>
                </div>

                {/* Connector line pointing towards the subsurface divider */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent to-[#37D9FF]" />
              </div>

              <div className="z-10 text-[11px] font-mono text-[#96AABD]">
                Drag divider left / right to reveal cross-section geology.
              </div>
            </div>
          </div>

          {/* RIGHT HALF: Subsurface Geological Cross-Section */}
          <div
            className="absolute inset-y-0 right-0 bg-[#101925] overflow-hidden"
            style={{ left: `${dividerPosition}%` }}
          >
            <div className="absolute inset-0 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between z-10">
                <span className="px-2.5 py-1 rounded bg-[#101925]/90 border border-[#26384A] text-xs font-mono text-[#9A85FF]">
                  GEOLOGICAL SECTION (0m to -400m RL)
                </span>
                <span className="text-xs font-mono text-[#38D9A9]">CONFIDENCE: 94%</span>
              </div>

              {/* Interactive Strata Column */}
              <div className="relative flex-1 my-4 flex items-center justify-center">
                <div className="w-full max-w-xl h-full flex flex-col rounded-xl overflow-hidden border border-[#26384A]">
                  {strataLayers.map((layer) => (
                    <div
                      key={layer.name}
                      onClick={() => setSelectedStrata(layer.name)}
                      className={`relative flex items-center justify-between px-4 transition-all cursor-pointer border-b border-[#26384A]/30 ${
                        selectedStrata === layer.name
                          ? 'ring-2 ring-white ring-inset brightness-125'
                          : 'hover:brightness-110'
                      }`}
                      style={{
                        backgroundColor: layer.color,
                        flex: layer.to - layer.from
                      }}
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                        <span>{layer.name}</span>
                        <span className="text-[10px] opacity-80">({layer.from}m - {layer.to}m)</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px] font-bold">
                          {layer.grade}
                        </span>
                        <span className="text-[10px] font-mono text-black font-semibold uppercase">
                          {layer.classification}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Strata Intelligence Footer */}
              <div className="z-10 p-3 rounded-lg bg-[#152130] border border-[#26384A] text-xs font-mono flex items-center justify-between">
                <div>
                  <span className="text-[#96AABD]">INSPECTED FORMATION: </span>
                  <span className="text-[#37D9FF] font-bold">{selectedStrata}</span>
                </div>
                <div className="text-[#38D9A9]">
                  DIAMOND DRILLHOLE REF: BH-BG-2023-14
                </div>
              </div>
            </div>
          </div>

          {/* Draggable Divider Line */}
          <div
            className="absolute inset-y-0 w-1 bg-[#37D9FF] shadow-[0_0_15px_#37D9FF] pointer-events-none"
            style={{ left: `${dividerPosition}%` }}
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#101925] border-2 border-[#37D9FF] flex items-center justify-center text-[10px] text-[#37D9FF] font-bold">
              ↔
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 border-t border-[#26384A] bg-[#152130] flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-[#96AABD]">SCAN DEPTH:</span>
            <input
              type="range"
              min="50"
              max="400"
              value={selectedDepthM}
              onChange={(e) => setSelectedDepthM(parseInt(e.target.value))}
              className="w-48 accent-[#37D9FF] h-1.5 bg-[#080D14] rounded cursor-pointer"
            />
            <span className="text-[#37D9FF] font-bold">{selectedDepthM} METRES</span>
          </div>

          <div className="flex items-center gap-4 text-[#96AABD]">
            <span>STRIKE: N 65° E</span>
            <span>DIP: 75° SE</span>
            <span className="text-[#38D9A9]">UNFC CODE: 111 (PROVEN RESERVES)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

