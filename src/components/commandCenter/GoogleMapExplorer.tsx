import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Search,
  Download,
  Upload,
  Key,
  ExternalLink,
  X,
  Plus,
  Minus,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { Mine, GeologicalProspect } from '../../types';
import { useAppStore } from '../../stores/appStore';
import { LeafletSpatialMap, SpatialZoomCommand } from './LeafletSpatialMap';
import {
  ActiveLayersConfig,
  BOREHOLES,
  FAULT_TRACES,
  GROUNDWATER_ZONES,
  HAULAGE_CORRIDORS,
  MOIL_CONCESSIONS,
  MapTypeId,
  RISK_ANOMALY_ZONES,
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

declare global {
  interface Window {
    __manganexGmAuthFailed?: boolean;
    gm_authFailure?: () => void;
  }
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

  const apiKey = (((import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY as string) || '').trim();
  const hasValidApiKeyShape =
    Boolean(apiKey) && apiKey !== 'YOUR_GOOGLE_MAPS_API_KEY_HERE' && apiKey.length >= 15;

  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const googleOverlaysRef = useRef<any[]>([]);
  const googleImportedLayerRef = useRef<any[]>([]);

  const [googleMap, setGoogleMap] = useState<any>(null);
  const [useFallbackViewer, setUseFallbackViewer] = useState<boolean>(
    () => !hasValidApiKeyShape || Boolean(window.__manganexGmAuthFailed)
  );
  const [authFailureDetected, setAuthFailureDetected] = useState<boolean>(
    () => Boolean(window.__manganexGmAuthFailed)
  );
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);

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

  // Switch cleanly to Spatial GIS Engine whenever Google Maps fails auth, errors, or times out
  const activateSpatialFallback = (reason: 'auth' | 'load' | 'missing') => {
    if (reason === 'auth') {
      window.__manganexGmAuthFailed = true;
      setAuthFailureDetected(true);
    }
    setGoogleMap(null);
    setUseFallbackViewer(true);
  };

  // Initialize Google Maps JS API only if key is configured and hasn't failed auth
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn(
        'Google Maps API authentication failed or domain restricted. Activating built-in ESRI Satellite GIS engine.'
      );
      activateSpatialFallback('auth');
    };

    if (!hasValidApiKeyShape) {
      activateSpatialFallback('missing');
      return;
    }

    if (window.__manganexGmAuthFailed) {
      activateSpatialFallback('auth');
      return;
    }

    let cancelled = false;
    let fallbackTimer: number | undefined;
    let observer: MutationObserver | undefined;

    const watchForGoogleError = () => {
      const container = mapRef.current;
      if (!container) return;

      const checkDom = () => {
        if (cancelled) return;
        if (container.querySelector('.gm-err-container')) {
          activateSpatialFallback('auth');
        }
      };

      observer = new MutationObserver(checkDom);
      observer.observe(container, { childList: true, subtree: true });

      fallbackTimer = window.setTimeout(() => {
        if (cancelled) return;
        const hasRenderedMap = Boolean(container.querySelector('.gm-style'));
        const hasErrorBox = Boolean(container.querySelector('.gm-err-container'));
        if (!hasRenderedMap || hasErrorBox) {
          activateSpatialFallback('load');
        }
      }, 4500);
    };

    const startGoogleMap = () => {
      if (cancelled || window.__manganexGmAuthFailed) return;
      initGoogleMap();
      watchForGoogleError();
    };

    if ((window as any).google?.maps?.Map) {
      startGoogleMap();
    } else {
      const scriptId = 'manganex-google-maps-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
          apiKey
        )}&libraries=places,drawing,geometry&v=weekly`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      const handleLoad = () => {
        if ((window as any).google?.maps?.Map) {
          startGoogleMap();
        } else {
          activateSpatialFallback('load');
        }
      };
      const handleError = () => {
        console.warn('Google Maps script failed to load. Switching to built-in ESRI Satellite GIS.');
        activateSpatialFallback('load');
      };

      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);

      // Guard if script tag stalled prior to mount
      fallbackTimer = window.setTimeout(() => {
        if (cancelled) return;
        if (!(window as any).google?.maps?.Map) {
          activateSpatialFallback('load');
        }
      }, 5000);

      return () => {
        cancelled = true;
        script?.removeEventListener('load', handleLoad);
        script?.removeEventListener('error', handleError);
        observer?.disconnect();
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
      };
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (fallbackTimer) window.clearTimeout(fallbackTimer);
    };
  }, [apiKey, hasValidApiKeyShape]);

  const initGoogleMap = () => {
    if (!mapRef.current || !(window as any).google?.maps?.Map) return;

    const google = (window as any).google;
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: activeCenter[0], lng: activeCenter[1] },
      zoom: 12,
      mapTypeId: google.maps.MapTypeId.HYBRID,
      tilt: 45,
      disableDefaultUI: true,
      zoomControl: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    setGoogleMap(map);

    // Places Autocomplete integration when enabled
    if (searchInputRef.current && google.maps.places) {
      try {
        const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ['geometry', 'name', 'formatted_address'],
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            map.panTo(place.geometry.location);
            map.setZoom(14);
            setSelectedFeature({
              type: 'Google Places Location',
              name: place.name || 'Selected Location',
              details: place.formatted_address || 'Geocoded via Google Places API',
              location: `Lat: ${place.geometry.location.lat().toFixed(5)}, Lng: ${place.geometry.location.lng().toFixed(5)}`,
            });
          }
        });
      } catch (e) {
        console.warn('Places Autocomplete initialization notice:', e);
      }
    }

    map.addListener('mousemove', (e: any) => {
      setCursorCoords({ lat: e.latLng.lat(), lng: e.latLng.lng() });
    });

    // Persistent MOIL Concession Polygons
    MOIL_CONCESSIONS.forEach((concession) => {
      const polygon = new google.maps.Polygon({
        paths: concession.coords,
        strokeColor: '#54D8E8',
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: '#54D8E8',
        fillOpacity: 0.15,
        map,
      });

      polygon.addListener('click', () => {
        setSelectedFeature({
          type: 'Concession Boundary',
          name: concession.name,
          details: `${concession.type} | Grade: ${concession.grade} | Measured Reserve: ${concession.reserves}`,
          location: `${concession.district}, ${concession.state}`,
        });
        selectMine(concession.storeMineId);
      });
    });
  };

  // Pan Google Map smoothly when selected mine/prospect changes
  useEffect(() => {
    if (!googleMap || useFallbackViewer) return;
    googleMap.panTo({ lat: activeCenter[0], lng: activeCenter[1] });
  }, [googleMap, useFallbackViewer, activeCenter]);

  // Sync dynamic GIS layers on Google Maps when native engine is active
  useEffect(() => {
    const google = (window as any).google;
    if (!googleMap || !google?.maps || useFallbackViewer) return;

    googleOverlaysRef.current.forEach((item) => item.setMap(null));
    googleOverlaysRef.current = [];

    const yearFactor = 0.85 + Math.max(0, Math.min(5, selectedYear - 2020)) * 0.06;

    if (activeLayers.riskHeatmap) {
      RISK_ANOMALY_ZONES.forEach((zone) => {
        const color =
          zone.severity === 'critical'
            ? '#FF4D6A'
            : zone.severity === 'moderate'
              ? '#F59E0B'
              : '#10B981';
        const circle = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.65,
          strokeWeight: 1.5,
          fillColor: color,
          fillOpacity: 0.18 * zone.baseIntensity,
          map: googleMap,
          center: { lat: zone.lat, lng: zone.lng },
          radius: zone.radiusM * yearFactor,
        });
        googleOverlaysRef.current.push(circle);
      });
    }

    if (activeLayers.groundwater) {
      GROUNDWATER_ZONES.forEach((gw) => {
        const circle = new google.maps.Circle({
          strokeColor: '#38BDF8',
          strokeOpacity: 0.8,
          strokeWeight: 1.5,
          fillColor: '#0284C7',
          fillOpacity: 0.14,
          map: googleMap,
          center: { lat: gw.lat, lng: gw.lng },
          radius: gw.radiusM,
        });
        googleOverlaysRef.current.push(circle);
      });
    }

    if (activeLayers.seismic) {
      FAULT_TRACES.forEach((trace) => {
        const line = new google.maps.Polyline({
          path: trace.points,
          strokeColor: '#FF6878',
          strokeOpacity: 0.9,
          strokeWeight: 3,
          map: googleMap,
        });
        googleOverlaysRef.current.push(line);
      });
    }

    if (activeLayers.haulage) {
      HAULAGE_CORRIDORS.forEach((corridor) => {
        const line = new google.maps.Polyline({
          path: corridor.points,
          strokeColor: '#F59E0B',
          strokeOpacity: 0.85,
          strokeWeight: 3,
          map: googleMap,
        });
        googleOverlaysRef.current.push(line);
      });
    }

    if (activeLayers.boreholes) {
      BOREHOLES.forEach((bh) => {
        const marker = new google.maps.Marker({
          position: { lat: bh.lat, lng: bh.lng },
          map: googleMap,
          title: `${bh.id}: ${bh.lithology} (${bh.grade}% Mn)`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: bh.grade > 44 ? '#A78BFA' : '#F4B860',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 1.5,
          },
        });
        marker.addListener('click', () => {
          setSelectedFeature({
            type: 'Borehole Collar',
            name: bh.id,
            details: `Depth: ${bh.depth}m | Recovery: ${bh.recovery}% | Assay: ${bh.grade}% Mn`,
            location: `Lithology: ${bh.lithology}`,
          });
        });
        googleOverlaysRef.current.push(marker);
      });
    }
  }, [googleMap, useFallbackViewer, activeLayers, selectedYear]);

  // Sync imported GeoJSON onto Google Maps when native engine is active
  useEffect(() => {
    if (!googleMap || useFallbackViewer || !importedGeoJson) return;
    googleImportedLayerRef.current.forEach((f) => googleMap.data.remove(f));
    try {
      const added = googleMap.data.addGeoJson(importedGeoJson);
      googleImportedLayerRef.current = added || [];
      googleMap.data.setStyle({
        strokeColor: '#00E69A',
        strokeWeight: 2.5,
        fillColor: '#00E69A',
        fillOpacity: 0.2,
      });
    } catch {
      // Ignore malformed GeoJSON on native layer
    }
  }, [googleMap, useFallbackViewer, importedGeoJson]);

  const handleMapTypeChange = (type: MapTypeId) => {
    setMapType(type);
    if (!googleMap || useFallbackViewer || !(window as any).google?.maps) return;
    const google = (window as any).google;
    const types: Record<MapTypeId, any> = {
      satellite: google.maps.MapTypeId.SATELLITE,
      roadmap: google.maps.MapTypeId.ROADMAP,
      terrain: google.maps.MapTypeId.TERRAIN,
      hybrid: google.maps.MapTypeId.HYBRID,
    };
    googleMap.setMapTypeId(types[type]);
  };

  const handleZoomIn = () => {
    if (!useFallbackViewer && googleMap) {
      googleMap.setZoom((googleMap.getZoom() || 12) + 1);
    } else {
      issueZoomCommand('in');
    }
  };

  const handleZoomOut = () => {
    if (!useFallbackViewer && googleMap) {
      googleMap.setZoom((googleMap.getZoom() || 12) - 1);
    } else {
      issueZoomCommand('out');
    }
  };

  const handleResetOrientation = () => {
    if (!useFallbackViewer && googleMap) {
      googleMap.panTo({ lat: activeCenter[0], lng: activeCenter[1] });
      googleMap.setZoom(12);
      googleMap.setHeading(0);
      googleMap.setTilt(45);
    } else {
      issueZoomCommand('reset', activeCenter, 12);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const match = searchSpatialFeatures(searchQuery);
    if (match) {
      setSelectedFeature(match.feature);
      if (match.storeMineId) selectMine(match.storeMineId);

      if (!useFallbackViewer && googleMap) {
        googleMap.panTo({ lat: match.center[0], lng: match.center[1] });
        googleMap.setZoom(match.zoom);
      } else {
        issueZoomCommand('focus', match.center, match.zoom);
      }
      return;
    }

    if (!useFallbackViewer && (window as any).google?.maps?.Geocoder && googleMap) {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ address: `${searchQuery}, India` }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          googleMap.setCenter(results[0].geometry.location);
          googleMap.setZoom(13);
        }
      });
      return;
    }

    setSelectedFeature({
      type: 'Search Lookup',
      name: `"${searchQuery.trim()}"`,
      details: 'No direct match. Try Balaghat, Dongri, Chikla, Ukwa, Munsar, BH-BL-01, or lat,lng coordinates.',
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
          details: `${count} spatial feature(s) rendered onto active GIS viewport.`,
          location: 'Custom Cadastre Layer',
        });
      } catch {
        setSelectedFeature({
          type: 'GeoJSON Error',
          name: file.name,
          details: 'Invalid GeoJSON file format.',
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
      {/* ── 1. OPTIONAL DISMISSIBLE GOOGLE MAPS SETUP MODAL ────────────────────── */}
      {showKeyModal && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-6 bg-[#040812]/85 backdrop-blur-md">
          <div className="max-w-xl w-full p-6 rounded-2xl bg-[#090E18] border border-[#1C3045] shadow-[0_0_50px_rgba(84,216,232,0.18)] space-y-4 relative">
            <button
              onClick={() => setShowKeyModal(false)}
              title="Close"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9BAFC1] hover:text-white hover:bg-[#152235] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#54D8E8]/15 border border-[#54D8E8]/40 flex items-center justify-center text-[#54D8E8]">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-base text-white">
                  Spatial GIS Engine & Google Maps Setup
                </h3>
                <p className="text-xs font-mono text-[#657A90]">
                  {authFailureDetected
                    ? 'GOOGLE KEY RESTRICTED FOR THIS ORIGIN — ESRI SATELLITE GIS ACTIVE'
                    : hasValidApiKeyShape
                      ? 'GOOGLE MAPS API CONFIGURED + ESRI FALLBACK READY'
                      : 'BUILT-IN ESRI SATELLITE GIS ACTIVE (NO API KEY NEEDED)'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D1522] border border-[#1C3045] space-y-2.5 text-xs">
              <p className="text-[#9BAFC1] leading-relaxed">
                MANGANEX runs natively on high-resolution <strong>ESRI World Imagery, Topographic & CartoDB Dark GIS tiles</strong> with zero API key required. To optionally overlay Google Places & 3D tilt imagery:
              </p>

              <div className="space-y-1.5 pt-1 text-[11.5px] font-mono text-[#54D8E8]">
                <div>1. Enable <strong>Maps JavaScript API</strong> &amp; <strong>Places API</strong> in Google Cloud Console.</div>
                <div>2. Whitelist your deployment domain under HTTP referrers and set <code className="px-1.5 py-0.5 rounded bg-[#152235] text-white">VITE_GOOGLE_MAPS_API_KEY</code>.</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                onClick={() => {
                  setUseFallbackViewer(true);
                  setShowKeyModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#152235] hover:bg-[#1E2F46] border border-[#1C3045] text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#00E69A]" />
                Use Built-In Satellite GIS
              </button>

              <a
                href="https://developers.google.com/maps/documentation/javascript/get-api-key"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#54D8E8] hover:bg-[#38b2c2] text-[#080C12] text-xs font-mono font-extrabold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Google Maps Docs</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
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
            onClick={() => setShowKeyModal(true)}
            title="Spatial GIS Engine Info & Google Maps Setup"
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono font-bold text-[#00E69A] bg-[#00E69A]/10 border border-[#00E69A]/25 hover:bg-[#00E69A]/20 transition-colors"
          >
            <Globe className="w-3 h-3" />
            <span className="hidden md:inline">
              {useFallbackViewer ? 'ESRI GIS' : 'GOOGLE MAPS'}
            </span>
          </button>
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

      {/* ── 3. ISOLATED MAP ENGINE CONTAINER (Never Collapses to Blank Screen) ──── */}
      <div className="absolute inset-0 z-0 isolate">
        {useFallbackViewer ? (
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
        ) : (
          <div ref={mapRef} className="w-full h-full" />
        )}
      </div>

      {/* Keep hidden Google container outside fallback toggle? Not needed because Google only mounts when !useFallbackViewer */}

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
