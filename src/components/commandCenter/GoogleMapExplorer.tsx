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
  Info,
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
    <div className="relative w-full h-full overflow-hidden bg-[#050D1A] select-none font-sans">
      {/* ── 1. SPATIAL CADASTRE INFO MODAL ───────────────────────────────────────── */}
      {showInfoModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#040812]/85 backdrop-blur-md">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-[#090E18] border border-[#1C3045] shadow-[0_0_50px_rgba(84,216,232,0.18)] space-y-4 relative">
            <button
              onClick={() => setShowInfoModal(false)}
              title="Close"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9BAFC1] hover:text-white hover:bg-[#152235] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#54D8E8]/15 border border-[#54D8E8]/40 flex items-center justify-center text-[#54D8E8]">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-white">
                  MOIL Central India Spatial GIS Cadastre
                </h3>
                <p className="text-xs font-mono text-[#00E69A]">
                  HIGH-RESOLUTION ESRI SATELLITE &amp; CARTODB TACTICAL ENGINE
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1522] border border-[#1C3045] space-y-2.5 text-xs text-[#9BAFC1] leading-relaxed">
              <p>
                MANGANEX executes on a high-precision, sub-meter spatial GIS engine combining:
              </p>
              <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#E2E8F0]">
                <li><strong className="text-[#54D8E8]">ESRI World Imagery:</strong> Multi-spectral spaceborne surface indicators (NDVI, iron-oxide alteration).</li>
                <li><strong className="text-[#00E69A]">MOIL Concession Cadastre:</strong> Survey-verified mining lease boundaries for Balaghat, Dongri Buzurg, Chikla, Gumgaon, Ukwa, and Mansar.</li>
                <li><strong className="text-[#A78BFA]">Geological Borehole Array:</strong> Collar coordinates, depth assays, and lithological horizons.</li>
                <li><strong className="text-[#FF6878]">Sausar Belt Fault Traces:</strong> Structural lineaments, strike/dip kinematics, and tectonic shears.</li>
              </ul>
              <p className="text-[10px] text-[#64748B] pt-1 border-t border-[#1C3045]">
                Statutory Note: Surface indicators provide preliminary exploration targeting; underground manganese reserve certification strictly requires core diamond drilling in accordance with UNFC guidelines.
              </p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-5 py-2 rounded-xl bg-[#54D8E8] hover:bg-[#38b2c2] text-[#080C12] text-xs font-mono font-extrabold transition-all shadow-md"
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
          className="pointer-events-auto flex items-center gap-2 bg-[#080D18]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#1C3045] shadow-lg w-full sm:w-80"
        >
          <Search className="w-3.5 h-3.5 text-[#54D8E8] shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mine, borehole, or lat,lng..."
            className="w-full bg-transparent text-xs font-mono text-white placeholder-[#657A90] outline-none"
          />
        </form>

        {/* Map Type Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 bg-[#080D18]/90 backdrop-blur-md p-1 rounded-xl border border-[#1C3045] text-[11px] font-mono shadow-lg">
          {(['satellite', 'hybrid', 'terrain', 'roadmap'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleMapTypeChange(t)}
              className={`px-2.5 py-1 rounded-lg uppercase font-bold transition-all ${
                mapType === t
                  ? 'bg-[#54D8E8] text-[#080C12] shadow-sm'
                  : 'text-[#9BAFC1] hover:text-white hover:bg-[#152235]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* GIS Tools & Spatial Engine Badge */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#080D18]/90 backdrop-blur-md p-1 rounded-xl border border-[#1C3045] shadow-lg">
          <button
            onClick={() => setShowInfoModal(true)}
            title="Spatial GIS Engine Information"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-[#00E69A] bg-[#00E69A]/10 border border-[#00E69A]/25 hover:bg-[#00E69A]/20 transition-colors"
          >
            <Globe className="w-3 h-3 text-[#00E69A]" />
            <span className="hidden sm:inline">ESRI SATELLITE GIS</span>
          </button>
          <button
            onClick={handleExportGeoJSON}
            title="Export Concession Cadastre as GeoJSON"
            className="p-1.5 rounded-lg text-[#9BAFC1] hover:text-[#54D8E8] hover:bg-[#152235] transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <label
            title="Import GeoJSON Layer"
            className="p-1.5 rounded-lg text-[#9BAFC1] hover:text-[#54D8E8] hover:bg-[#152235] transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".geojson,.json" onChange={handleImportGeoJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Floating Map Zoom & Orientation Controls */}
      <div className="absolute right-4 top-20 z-20 flex flex-col gap-1.5 bg-[#080D18]/90 backdrop-blur-md p-1.5 rounded-xl border border-[#1C3045] shadow-lg">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2 rounded-lg text-white hover:bg-[#152235] hover:text-[#54D8E8] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2 rounded-lg text-white hover:bg-[#152235] hover:text-[#54D8E8] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-[#1C3045] my-0.5" />
        <button
          onClick={handleResetOrientation}
          title="Center on Active Mine"
          className="p-2 rounded-lg text-[#54D8E8] hover:bg-[#152235] transition-colors"
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
        <div className="absolute bottom-16 right-4 z-20 w-80 p-4 rounded-2xl bg-[#080D18]/95 backdrop-blur-md border border-[#54D8E8]/50 shadow-2xl space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#54D8E8] font-bold uppercase">{selectedFeature.type}</span>
            <button onClick={() => setSelectedFeature(null)} className="text-[#657A90] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-heading font-bold text-sm text-white">{selectedFeature.name}</h4>
          <p className="text-[11px] text-[#9BAFC1]">{selectedFeature.details}</p>
          <div className="text-[10px] text-[#657A90] pt-1 border-t border-[#1C3045]">
            {selectedFeature.location}
          </div>
        </div>
      )}

      {/* ── 5. BOTTOM HUD: COORDINATES & SCALE ──────────────────────────────────── */}
      <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none flex items-center justify-between text-[10.5px] font-mono text-[#657A90]">
        <div className="pointer-events-auto px-3 py-1 rounded-lg bg-[#080D18]/85 backdrop-blur-md border border-[#1C3045] flex items-center gap-3">
          <span>
            LAT: <strong className="text-white">{activeCoords.lat.toFixed(5)}° N</strong>
          </span>
          <span>
            LNG: <strong className="text-white">{activeCoords.lng.toFixed(5)}° E</strong>
          </span>
          <span>
            DATUM: <strong className="text-[#54D8E8]">WGS-84 / UTM 44N</strong>
          </span>
        </div>

        <div className="pointer-events-auto px-3 py-1 rounded-lg bg-[#080D18]/85 backdrop-blur-md border border-[#1C3045]">
          CENTRAL INDIA MANGANESE BELT (MOIL)
        </div>
      </div>
    </div>
  );
};
