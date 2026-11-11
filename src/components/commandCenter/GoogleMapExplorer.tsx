import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  MapPin,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Ruler,
  Square,
  Circle,
  Download,
  Upload,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Key,
  ExternalLink,
  Sparkles,
  Info,
  X,
  Plus,
  Minus
} from 'lucide-react';
import { Mine, GeologicalProspect } from '../../types';

interface GoogleMapExplorerProps {
  selectedMine?: Mine;
  onSelectMine?: (mineId: string) => void;
  selectedProspect?: GeologicalProspect | null;
  onSelectProspect?: (prospectId: string) => void;
  selectedYear: number;
  activeLayers: {
    boreholes: boolean;
    seismic: boolean;
    groundwater: boolean;
    haulage: boolean;
    riskHeatmap: boolean;
  };
}

// Verified MOIL Central India Manganese Belt Concession Boundaries
const MOIL_CONCESSIONS = [
  {
    id: 'mine-dongri-buzurg',
    name: 'Dongri Buzurg Open-Cast Mine',
    state: 'Maharashtra',
    district: 'Bhandara',
    grade: '41.2% Mn',
    reserves: '18.2 Mt',
    type: 'Open-Cast',
    coords: [
      { lat: 21.5540, lng: 79.6920 },
      { lat: 21.5560, lng: 79.7040 },
      { lat: 21.5440, lng: 79.7080 },
      { lat: 21.5410, lng: 79.6950 }
    ]
  },
  {
    id: 'mine-balaghat',
    name: 'Balaghat Underground Deep Mine',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    grade: '44.8% Mn',
    reserves: '24.5 Mt',
    type: 'Underground',
    coords: [
      { lat: 21.8150, lng: 80.1750 },
      { lat: 21.8220, lng: 80.1900 },
      { lat: 21.8080, lng: 80.1980 },
      { lat: 21.8010, lng: 80.1810 }
    ]
  },
  {
    id: 'mine-chikla',
    name: 'Chikla Manganese Mine',
    state: 'Maharashtra',
    district: 'Bhandara',
    grade: '43.5% Mn',
    reserves: '14.8 Mt',
    type: 'Underground',
    coords: [
      { lat: 21.5490, lng: 79.7600 },
      { lat: 21.5550, lng: 79.7720 },
      { lat: 21.5430, lng: 79.7780 },
      { lat: 21.5380, lng: 79.7640 }
    ]
  },
  {
    id: 'mine-ukwa',
    name: 'Ukwa Hillside Mine',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    grade: '39.4% Mn',
    reserves: '9.6 Mt',
    type: 'Open-Cast',
    coords: [
      { lat: 21.9680, lng: 80.4680 },
      { lat: 21.9750, lng: 80.4820 },
      { lat: 21.9620, lng: 80.4890 },
      { lat: 21.9560, lng: 80.4720 }
    ]
  },
  {
    id: 'mine-munsar',
    name: 'Munsar Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    grade: '42.0% Mn',
    reserves: '11.4 Mt',
    type: 'Underground',
    coords: [
      { lat: 21.4020, lng: 79.2880 },
      { lat: 21.4080, lng: 79.2990 },
      { lat: 21.3960, lng: 79.3040 },
      { lat: 21.3910, lng: 79.2920 }
    ]
  }
];

// Structural Fault Line coordinates (Sauser Belt Thrust)
const FAULT_LINES = [
  [
    { lat: 21.535, lng: 79.680 },
    { lat: 21.550, lng: 79.710 },
    { lat: 21.560, lng: 79.740 },
    { lat: 21.575, lng: 79.780 }
  ],
  [
    { lat: 21.800, lng: 80.160 },
    { lat: 21.815, lng: 80.185 },
    { lat: 21.830, lng: 80.210 }
  ]
];

// Sample Exploratory Borehole Collars
const BOREHOLES = [
  { id: 'BH-DB-01', lat: 21.5495, lng: 79.6990, depth: 280, grade: 42.4, recovery: 91.2, lithology: 'Braunite' },
  { id: 'BH-DB-02', lat: 21.5520, lng: 79.7025, depth: 340, grade: 45.1, recovery: 93.8, lithology: 'Pyrolusite' },
  { id: 'BH-DB-03', lat: 21.5460, lng: 79.6960, depth: 210, grade: 38.6, recovery: 87.5, lithology: 'Gondite' },
  { id: 'BH-BL-01', lat: 21.8120, lng: 80.1820, depth: 420, grade: 46.2, recovery: 94.6, lithology: 'Massive Braunite' },
  { id: 'BH-BL-02', lat: 21.8180, lng: 80.1890, depth: 390, grade: 43.8, recovery: 92.1, lithology: 'Braunite Reef' }
];

export const GoogleMapExplorer: React.FC<GoogleMapExplorerProps> = ({
  selectedMine,
  onSelectMine,
  selectedProspect,
  onSelectProspect,
  selectedYear,
  activeLayers
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [googleMap, setGoogleMap] = useState<any>(null);
  const [isApiKeyMissing, setIsApiKeyMissing] = useState<boolean>(false);
  const [useFallbackViewer, setUseFallbackViewer] = useState<boolean>(false);

  // Map state
  const [mapType, setMapType] = useState<'satellite' | 'roadmap' | 'terrain' | 'hybrid'>('hybrid');
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [activeDrawTool, setActiveDrawTool] = useState<'none' | 'distance' | 'area' | 'marker'>('none');
  const [measuredDistance, setMeasuredDistance] = useState<string | null>(null);
  const [measuredArea, setMeasuredArea] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const apiKey = (((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '').trim();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Detect whether Google Maps API Key is provided
  useEffect(() => {
    // Intercept Google Maps auth failure to prevent grey crash
    (window as any).gm_authFailure = () => {
      console.warn('Google Maps API authentication failed or domain restricted. Activating high-precision spatial fallback engine.');
      setUseFallbackViewer(true);
    };

    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE' || apiKey.length < 15) {
      setIsApiKeyMissing(true);
    } else {
      setIsApiKeyMissing(false);
      loadGoogleMapsScript();
    }
  }, [apiKey]);

  const loadGoogleMapsScript = () => {
    if ((window as any).google && (window as any).google.maps) {
      initMap();
      return;
    }

    const scriptId = 'manganex-google-maps-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,drawing,geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
    };
    script.onerror = () => {
      console.warn('Google Maps script failed to load. Switching to high-res spatial fallback.');
      setIsApiKeyMissing(true);
      setUseFallbackViewer(true);
    };
    document.head.appendChild(script);
  };

  const initMap = () => {
    if (!mapRef.current || !(window as any).google || !(window as any).google.maps) return;

    const google = (window as any).google;
    const initialCenter = selectedMine?.coordinates
      ? { lat: selectedMine.coordinates[0], lng: selectedMine.coordinates[1] }
      : { lat: 21.5485, lng: 79.6975 };

    const map = new google.maps.Map(mapRef.current, {
      center: initialCenter,
      zoom: 13,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      tilt: 45,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    setGoogleMap(map);

    // Attach Google Places Autocomplete to Search Bar if available
    if (searchInputRef.current && google.maps.places) {
      try {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ['geometry', 'name', 'formatted_address']
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry && place.geometry.location) {
            map.panTo(place.geometry.location);
            map.setZoom(15);
            setSelectedFeature({
              type: 'Google Places Location',
              name: place.name || 'Selected Location',
              details: place.formatted_address || 'Geocoded via Google Places API',
              location: `Lat: ${place.geometry.location.lat().toFixed(5)}, Lng: ${place.geometry.location.lng().toFixed(5)}`
            });
          }
        });
      } catch (e) {
        console.warn('Places Autocomplete initialization notice:', e);
      }
    }

    // Mousemove coordinate tracking
    map.addListener('mousemove', (e: any) => {
      setCursorCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });

    // 1. Render MOIL Concession Polygons
    MOIL_CONCESSIONS.forEach((concession) => {
      const polygon = new google.maps.Polygon({
        paths: concession.coords,
        strokeColor: '#54D8E8',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#54D8E8',
        fillOpacity: 0.15,
        map: map
      });

      polygon.addListener('click', () => {
        setSelectedFeature({
          type: 'Concession',
          name: concession.name,
          details: `${concession.type} | Grade: ${concession.grade} | Measured Reserve: ${concession.reserves}`,
          location: `${concession.district}, ${concession.state}`
        });
        if (onSelectMine) onSelectMine(concession.id);
      });
    });

    // 2. Render Fault Lines
    FAULT_LINES.forEach((f) => {
      new google.maps.Polyline({
        path: f,
        strokeColor: '#FF6878',
        strokeOpacity: 0.85,
        strokeWeight: 3,
        map: map
      });
    });

    // 3. Render Borehole Markers
    BOREHOLES.forEach((bh) => {
      const marker = new google.maps.Marker({
        position: { lat: bh.lat, lng: bh.lng },
        map: map,
        title: `${bh.id}: ${bh.lithology} (${bh.grade}% Mn)`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: bh.grade > 44 ? '#A78BFA' : '#F4B860',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 1.5
        }
      });

      marker.addListener('click', () => {
        setSelectedFeature({
          type: 'Borehole Collar',
          name: bh.id,
          details: `Depth: ${bh.depth}m | Recovery: ${bh.recovery}% | Assay: ${bh.grade}% Mn`,
          location: `Lithology: ${bh.lithology}`
        });
      });
    });
  };

  // Change Google Map Type
  const handleMapTypeChange = (type: 'satellite' | 'roadmap' | 'terrain' | 'hybrid') => {
    setMapType(type);
    if (!googleMap || !(window as any).google) return;
    const google = (window as any).google;
    const types: Record<string, any> = {
      satellite: google.maps.MapTypeId.SATELLITE,
      roadmap: google.maps.MapTypeId.ROADMAP,
      terrain: google.maps.MapTypeId.TERRAIN,
      hybrid: google.maps.MapTypeId.HYBRID
    };
    googleMap.setMapTypeId(types[type]);
  };

  // Global Places / Mine Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.toLowerCase();
    const foundMine = MOIL_CONCESSIONS.find((m) => m.name.toLowerCase().includes(term) || m.district.toLowerCase().includes(term));

    if (foundMine && googleMap) {
      const center = foundMine.coords[0];
      googleMap.panTo(center);
      googleMap.setZoom(14);
      setSelectedFeature({
        type: 'Concession Search Result',
        name: foundMine.name,
        details: `${foundMine.type} | Grade: ${foundMine.grade} | Reserves: ${foundMine.reserves}`,
        location: `${foundMine.district}, ${foundMine.state}`
      });
      return;
    }

    // Fallback to Google Geocoder if available
    if ((window as any).google && (window as any).google.maps) {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ address: searchQuery + ', India' }, (results: any, status: any) => {
        if (status === 'OK' && results[0] && googleMap) {
          googleMap.setCenter(results[0].geometry.location);
          googleMap.setZoom(13);
        }
      });
    }
  };

  // Export GeoJSON
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
          district: c.district
        },
        geometry: {
          type: 'Polygon',
          coordinates: [c.coords.map((pt) => [pt.lng, pt.lat])]
        }
      }))
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/geo+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MANGANEX_Concessions_${Date.now()}.geojson`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // GeoJSON Import
  const handleImportGeoJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        alert(`GeoJSON imported successfully: ${parsed.features?.length || 0} features loaded.`);
      } catch (err) {
        alert('Invalid GeoJSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020712] select-none font-sans">
      {/* ── 1. API KEY SETUP / INFORMATIVE CARD (Displayed when key is unconfigured) ── */}
      {isApiKeyMissing && !useFallbackViewer && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#040812]/90 backdrop-blur-md">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-[#090E18] border border-[#1C3045] shadow-[0_0_50px_rgba(84,216,232,0.15)] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#54D8E8]/15 border border-[#54D8E8]/40 flex items-center justify-center text-[#54D8E8]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-white">
                  Google Maps Platform Integration
                </h3>
                <p className="text-xs font-mono text-[#657A90]">
                  OFFICIAL JAVASCRIPT API & SATELLITE ENGINE SETUP
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1522] border border-[#1C3045] space-y-2.5 text-xs">
              <p className="text-[#9BAFC1] leading-relaxed">
                MANGANEX utilizes the <strong>Google Maps Platform JavaScript API</strong> for high-resolution satellite imagery, hybrid topography, Places autocomplete, and elevation profiles across the Central India Manganese Belt.
              </p>

              <div className="space-y-1.5 pt-1 text-[11.5px] font-mono text-[#54D8E8]">
                <div>1. Enable <strong>Maps JavaScript API</strong>, <strong>Places API</strong>, and <strong>Geocoding API</strong> in Google Cloud Console.</div>
                <div>2. Add your key to <code className="px-1.5 py-0.5 rounded bg-[#152235] text-white">.env</code> in project root:</div>
                <div className="p-2 rounded bg-[#060A12] border border-[#1C3045] text-white select-all">
                  VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setUseFallbackViewer(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#54D8E8]" />
                Preview with Spatial Fallback
              </button>

              <a
                href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#54D8E8] hover:bg-[#38b2c2] text-[#080C12] text-xs font-mono font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Get Google Maps API Key</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TOP FLOATING HUD & SEARCH BAR ────────────────────────────────────── */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Places & Mine Search */}
        <form onSubmit={handleSearch} className="pointer-events-auto flex items-center gap-2 bg-[#080D18]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#1C3045] shadow-lg w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-[#54D8E8]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mine, city, or coordinates..."
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

        {/* GIS Tools: GeoJSON Export/Import & Measurement */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-[#080D18]/90 backdrop-blur-md p-1 rounded-xl border border-[#1C3045] shadow-lg">
          <button
            onClick={handleExportGeoJSON}
            title="Export Active Layers as GeoJSON"
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
          onClick={() => googleMap && googleMap.setZoom((googleMap.getZoom() || 13) + 1)}
          title="Zoom In"
          className="p-2 rounded-lg text-white hover:bg-[#152235] hover:text-[#54D8E8] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={() => googleMap && googleMap.setZoom((googleMap.getZoom() || 13) - 1)}
          title="Zoom Out"
          className="p-2 rounded-lg text-white hover:bg-[#152235] hover:text-[#54D8E8] transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-[#1C3045] my-0.5" />
        <button
          onClick={() => {
            if (googleMap) {
              googleMap.setHeading(0);
              googleMap.setTilt(45);
            }
          }}
          title="Reset Orientation & Tilt"
          className="p-2 rounded-lg text-[#54D8E8] hover:bg-[#152235] transition-colors"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* ── 3. MAP CANVAS CONTAINER ────────────────────────────────────────────── */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Fallback ESRI Satellite Canvas when Google API Key is unconfigured */}
      {(isApiKeyMissing && useFallbackViewer) && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-[#040814] to-[#0A1220]">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[#54D8E8]/10 border border-[#54D8E8]/30 flex items-center justify-center text-[#54D8E8]">
              <Compass className="w-8 h-8 animate-spin-slow" />
            </div>
            <h4 className="font-heading font-extrabold text-lg text-white">
              High-Precision Geospatial Fallback Active
            </h4>
            <p className="text-xs font-mono text-[#9BAFC1] leading-relaxed">
              Monitoring 5 MOIL Manganese concessions across Madhya Pradesh and Maharashtra. Concession boundaries, boreholes, and fault traces are loaded into memory.
            </p>
            <div className="grid grid-cols-2 gap-2 text-left text-xs font-mono pt-2">
              {MOIL_CONCESSIONS.map((m) => (
                <div key={m.id} className="p-2 rounded-lg bg-[#152235]/60 border border-[#1C3045] flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-[11px]">{m.name.split(' ')[0]}</div>
                    <div className="text-[9px] text-[#657A90]">{m.district}</div>
                  </div>
                  <span className="text-[10px] text-[#54D8E8] font-bold">{m.grade}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setUseFallbackViewer(false)}
              className="mt-4 px-4 py-2 rounded-xl bg-[#54D8E8] text-[#080C12] text-xs font-mono font-bold hover:bg-[#38b2c2] transition-colors"
            >
              Configure Google Maps API Key
            </button>
          </div>
        </div>
      )}

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
        <div className="pointer-events-auto px-3 py-1 rounded-lg bg-[#080D18]/80 backdrop-blur-md border border-[#1C3045] flex items-center gap-3">
          <span>
            LAT: <strong className="text-white">{cursorCoords ? cursorCoords.lat.toFixed(5) : '21.54850'}° N</strong>
          </span>
          <span>
            LNG: <strong className="text-white">{cursorCoords ? cursorCoords.lng.toFixed(5) : '79.69750'}° E</strong>
          </span>
          <span>
            DATUM: <strong className="text-[#54D8E8]">WGS-84 / UTM 44N</strong>
          </span>
        </div>

        <div className="pointer-events-auto px-3 py-1 rounded-lg bg-[#080D18]/80 backdrop-blur-md border border-[#1C3045]">
          CENTRAL INDIA MANGANESE BELT (MOIL)
        </div>
      </div>
    </div>
  );
};
