import React, { useMemo, useRef, useState } from 'react';
import {
  Compass,
  Search,
  Download,
  Upload,
  X,
  Plus,
  Minus,
  Globe,
} from 'lucide-react';
import { Mine, GeologicalProspect } from '../../types';
import { useAppStore } from '../../stores/appStore';
import { LeafletSpatialMap, SpatialZoomCommand } from './LeafletSpatialMap';
import {
  ActiveLayersConfig,
  MOIL_CONCESSIONS,
  MapTypeId,
  SelectedMapFeature,
  searchSpatialFeatures,
} from './moilSpatialData';

interface GoogleMapExplorerProps {
  selectedMine?: Mine;
  onSelectMine?: (mineId: string) => void;
  selectedProspect?: GeologicalProspect | null;
  onSelectProspect?: (prospectId: string) => void;
  selectedYear: number;
  activeLayers: ActiveLayersConfig;
}

export const GoogleMapExplorer: React.FC<GoogleMapExplorerProps> = ({
  selectedMine: selectedMineProp,
  onSelectMine,
  selectedProspect,
  selectedYear,
  activeLayers,
}) => {
  const storeSelectedMine = useAppStore((s) => s.selectedMine);
  const storeSetSelectedMineId = useAppStore((s) => s.setSelectedMineId);

  const effectiveMine = selectedMineProp ?? storeSelectedMine;
  const selectMine = onSelectMine ?? storeSetSelectedMineId;

  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Shared HUD & Map state
  const [mapType, setMapType] = useState<MapTypeId>('hybrid');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<SelectedMapFeature | null>(null);
  const [importedGeoJson, setImportedGeoJson] = useState<unknown | null>(null);
  const [zoomCommand, setZoomCommand] = useState<SpatialZoomCommand | null>(null);
  const [zoomSeq, setZoomSeq] = useState(0);

  const activeCenter = useMemo<[number, number]>(() => {
    if (selectedProspect?.coordinates) return selectedProspect.coordinates;
    if (effectiveMine?.coordinates) return effectiveMine.coordinates;
    return [21.8049, 80.2033];
  }, [selectedProspect?.coordinates, effectiveMine?.coordinates]);

  const issueZoomCommand = (
    type: SpatialZoomCommand['type'],
    target?: [number, number],
    zoom?: number
  ) => {
    const nextSeq = zoomSeq + 1;
    setZoomSeq(nextSeq);
    setZoomCommand({ type, seq: nextSeq, target, zoom });
  };

  const handleZoomIn = () => issueZoomCommand('in');
  const handleZoomOut = () => issueZoomCommand('out');
  const handleResetOrientation = () => issueZoomCommand('reset', activeCenter, 12);

  const handleMapTypeChange = (type: MapTypeId) => {
    setMapType(type);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const match = searchSpatialFeatures(searchQuery);
    if (match) {
      if (match.storeMineId) {
        selectMine(match.storeMineId);
      }
      setSelectedFeature(match.feature);
      issueZoomCommand('focus', match.center, match.zoom);
      return;
    }

    setSelectedFeature({
      type: 'Spatial Search Lookup',
      name: `"${searchQuery.trim()}"`,
      details: 'No direct match found. Try Balaghat, Dongri Buzurg, Chikla, Ukwa, Munsar, BH-BL-01, or lat,lng coordinates.',
      location: 'Central India Manganese Belt Index',
    });
  };

  const handleExportGeoJSON = () => {
    const geojson = {
      type: 'FeatureCollection',
      name: 'MANGANEX_Central_India_Manganese_Cadastre',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features: MOIL_CONCESSIONS.map((c) => ({
        type: 'Feature',
        properties: {
          id: c.id,
          name: c.name,
          grade: c.grade,
          reserves: c.reserves,
          state: c.state,
          district: c.district,
        },
        geometry: {
          type: 'Polygon',
          coordinates: [c.coords.map((pt) => [pt.lng, pt.lat])],
        },
      })),
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MANGANEX_Concessions_${Date.now()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportGeoJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setImportedGeoJson(parsed);
        const count = Array.isArray(parsed?.features) ? parsed.features.length : 1;
        setSelectedFeature({
          type: 'GeoJSON Overlay Loaded',
          name: file.name,
          details: `${count} spatial feature(s) loaded into active GIS viewport.`,
          location: 'Custom Cadastre Layer',
        });
      } catch {
        setSelectedFeature({
          type: 'GeoJSON Error',
          name: file.name,
          details: 'Invalid GeoJSON file format. Please upload valid GeoJSON.',
          location: 'Import Cancelled',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeCoords = cursorCoords ?? { lat: activeCenter[0], lng: activeCenter[1] };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#120F0D] select-none font-sans">
      {/* ── 1. SPATIAL CADASTRE INFO MODAL ───────────────────────────────────────── */}
      {showInfoModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#120F0D]/85 backdrop-blur-md">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-[#1A1613] border border-[#4D4037] shadow-[0_0_50px_rgba(251,146,60,0.22)] space-y-4 relative">
            <button
              onClick={() => setShowInfoModal(false)}
              title="Close"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#DEC8B7] hover:text-[#FFF8F0] hover:bg-[#241E1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FB923C]/15 border border-[#FB923C]/40 flex items-center justify-center text-[#FB923C]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-[#FFF8F0]">
                  MOIL Central India Spatial GIS Cadastre
                </h3>
                <p className="text-xs font-mono text-[#FB923C] font-semibold">
                  HIGH-RESOLUTION ESRI SATELLITE &amp; CARTODB TACTICAL ENGINE
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#241E1A] border border-[#4D4037] space-y-2.5 text-xs text-[#DEC8B7] leading-relaxed">
              <p>
                MANGANEX executes on a high-precision, sub-meter spatial GIS engine combining:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#FFF8F0]">
                <li><strong className="text-[#FB923C]">ESRI World Imagery:</strong> Multi-spectral spaceborne surface indicators (NDVI, iron-oxide alteration).</li>
                <li><strong className="text-[#10B981]">MOIL Concession Cadastre:</strong> Survey-verified mining lease boundaries for Balaghat, Dongri Buzurg, Chikla, Gumgaon, Ukwa, and Mansar.</li>
                <li><strong className="text-[#E8B298]">Geological Borehole Array:</strong> Collar coordinates, depth assays, and lithological horizons.</li>
                <li><strong className="text-[#F59E0B]">Sausar Belt Fault Traces:</strong> Structural lineaments, strike/dip kinematics, and tectonic shears.</li>
              </ul>
              <p className="text-[10px] text-[#A69282] pt-1 border-t border-[#4D4037]">
                Statutory Note: Surface indicators provide preliminary exploration targeting; underground manganese reserve certification strictly requires core diamond drilling in accordance with UNFC guidelines.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-[#FB923C] hover:bg-[#F59E0B] text-[#120F0D] text-xs font-mono font-extrabold transition-all shadow-md"
              >
                Close Engine View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TOP FLOATING HUD & SEARCH BAR ────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <form
          onSubmit={handleSearch}
          className="pointer-events-auto flex items-center gap-2 bg-[#1A1613]/92 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#4D4037] shadow-lg w-full sm:w-80"
        >
          <Search className="w-3.5 h-3.5 text-[#FB923C] shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mine, borehole, or lat,lng..."
            className="w-full bg-transparent text-xs font-mono text-[#FFF8F0] placeholder-[#A69282] outline-none"
          />
        </form>

        {/* Map Type Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#1A1613]/92 backdrop-blur-md p-1 rounded-xl border border-[#4D4037] text-[11px] font-mono shadow-lg">
          {(['satellite', 'hybrid', 'terrain', 'roadmap'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleMapTypeChange(t)}
              className={`px-3 py-1 rounded-lg uppercase font-bold transition-all ${
                mapType === t
                  ? 'bg-[#FB923C] text-[#120F0D] shadow-sm'
                  : 'text-[#DEC8B7] hover:text-[#FFF8F0] hover:bg-[#241E1A]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* GIS Tools & Spatial Engine Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#1A1613]/92 backdrop-blur-md p-1 rounded-xl border border-[#4D4037] shadow-lg">
          <button
            onClick={() => setShowInfoModal(true)}
            title="Spatial GIS Engine Information"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/15 border border-[#10B981]/30 hover:bg-[#10B981]/25 transition-colors"
          >
            <Globe className="w-3 h-3 text-[#10B981]" />
            <span className="hidden sm:inline">ESRI SATELLITE GIS</span>
          </button>
          <button
            onClick={handleExportGeoJSON}
            title="Export Concession Cadastre as GeoJSON"
            className="p-1.5 rounded-lg text-[#DEC8B7] hover:text-[#FB923C] hover:bg-[#241E1A] transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <label
            title="Import GeoJSON Layer"
            className="p-1.5 rounded-lg text-[#DEC8B7] hover:text-[#FB923C] hover:bg-[#241E1A] transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".geojson,.json" onChange={handleImportGeoJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Floating Map Zoom & Orientation Controls */}
      <div className="absolute right-4 top-20 z-20 flex flex-col gap-1.5 bg-[#1A1613]/92 backdrop-blur-md p-1.5 rounded-xl border border-[#4D4037] shadow-lg">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-lg text-[#FFF8F0] hover:bg-[#241E1A] hover:text-[#FB923C] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-lg text-[#FFF8F0] hover:bg-[#241E1A] hover:text-[#FB923C] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-[#4D4037] my-0.5" />
        <button
          onClick={handleResetOrientation}
          title="Center on Active Mine"
          className="p-2 rounded-lg text-[#FB923C] hover:bg-[#241E1A] transition-colors"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* ── 3. BULLETPROOF NATIVE GIS MAP ENGINE ───────────────────────────────── */}
      <div className="absolute inset-0 z-0 isolate w-full h-full">
        <LeafletSpatialMap
          center={activeCenter}
          mapType={mapType}
          selectedMineId={effectiveMine?.id}
          selectedYear={selectedYear}
          activeLayers={activeLayers}
          importedGeoJson={importedGeoJson}
          zoomCommand={zoomCommand}
          onCursorMove={setCursorCoords}
          onSelectFeature={setSelectedFeature}
          onSelectMine={selectMine}
        />
      </div>

      {/* ── 4. SELECTED FEATURE DETAILS POPUP ──────────────────────────────────── */}
      {selectedFeature && (
        <div className="absolute bottom-16 right-4 z-20 w-80 p-4 rounded-2xl bg-[#1A1613]/96 backdrop-blur-md border border-[#FB923C]/50 shadow-2xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#FB923C] font-bold uppercase">{selectedFeature.type}</span>
            <button onClick={() => setSelectedFeature(null)} className="text-[#A69282] hover:text-[#FFF8F0]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-heading font-bold text-sm text-[#FFF8F0]">{selectedFeature.name}</h4>
          <p className="text-[11px] text-[#DEC8B7]">{selectedFeature.details}</p>
          <div className="text-[10px] text-[#A69282] pt-1 border-t border-[#4D4037]">
            {selectedFeature.location}
          </div>
        </div>
      )}

      {/* ── 5. BOTTOM HUD: COORDINATES & SCALE ──────────────────────────────────── */}
      <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none flex items-center justify-between text-[10.5px] font-mono text-[#A69282]">
        <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-[#1A1613]/90 backdrop-blur-md border border-[#4D4037] flex items-center gap-3 shadow-md">
          <span>
            LAT: <strong className="text-[#FFF8F0] font-bold">{activeCoords.lat.toFixed(5)}° N</strong>
          </span>
          <span>
            LNG: <strong className="text-[#FFF8F0] font-bold">{activeCoords.lng.toFixed(5)}° E</strong>
          </span>
          <span>
            DATUM: <strong className="text-[#FB923C] font-bold">WGS-84 / UTM 44N</strong>
          </span>
        </div>

        <div className="pointer-events-auto px-3.5 py-1.5 rounded-xl bg-[#1A1613]/90 backdrop-blur-md border border-[#4D4037] text-[#DEC8B7] font-bold shadow-md">
          CENTRAL INDIA MANGANESE BELT (MOIL)
        </div>
      </div>
    </div>
  );
};
