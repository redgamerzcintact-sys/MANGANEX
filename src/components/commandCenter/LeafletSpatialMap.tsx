import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MINES_DATA } from '../../data/demoData';
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
  getConcessionCenter,
} from './moilSpatialData';

export interface SpatialZoomCommand {
  type: 'in' | 'out' | 'reset' | 'focus';
  seq: number;
  target?: [number, number];
  zoom?: number;
}

interface LeafletSpatialMapProps {
  center: [number, number];
  initialZoom?: number;
  mapType: MapTypeId;
  selectedMineId?: string;
  selectedYear: number;
  activeLayers: ActiveLayersConfig;
  importedGeoJson: unknown | null;
  zoomCommand: SpatialZoomCommand | null;
  onCursorMove: (coords: { lat: number; lng: number }) => void;
  onSelectFeature: (feature: SelectedMapFeature) => void;
  onSelectMine?: (mineId: string) => void;
}

function buildBaseTileLayers(type: MapTypeId): L.TileLayer[] {
  const esriAttr = 'Tiles &copy; Esri, Earthstar Geographics';
  const cartoAttr = '&copy; OpenStreetMap &copy; CARTO';

  // Fast, reliable dark tactical underlay so the viewport is NEVER a black void while satellite tiles load
  const baseUnderlay = L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: cartoAttr,
    }
  );

  if (type === 'roadmap') {
    return [baseUnderlay];
  }

  if (type === 'terrain') {
    const topo = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
        attribution: esriAttr,
      }
    );
    return [baseUnderlay, topo];
  }

  // Satellite and Hybrid
  const imagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 19,
      attribution: esriAttr,
    }
  );

  if (type === 'hybrid') {
    const referenceLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        opacity: 0.92,
      }
    );
    return [baseUnderlay, imagery, referenceLabels];
  }

  return [baseUnderlay, imagery];
}

export const LeafletSpatialMap: React.FC<LeafletSpatialMapProps> = ({
  center,
  initialZoom = 12,
  mapType,
  selectedMineId,
  selectedYear,
  activeLayers,
  importedGeoJson,
  zoomCommand,
  onCursorMove,
  onSelectFeature,
  onSelectMine,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileGroupRef = useRef<L.LayerGroup | null>(null);
  const baseVectorGroupRef = useRef<L.LayerGroup | null>(null);
  const overlayGroupRef = useRef<L.LayerGroup | null>(null);
  const importedGroupRef = useRef<L.LayerGroup | null>(null);

  const onCursorMoveRef = useRef(onCursorMove);
  const onSelectFeatureRef = useRef(onSelectFeature);
  const onSelectMineRef = useRef(onSelectMine);
  onCursorMoveRef.current = onCursorMove;
  onSelectFeatureRef.current = onSelectFeature;
  onSelectMineRef.current = onSelectMine;

  // Vector rendering helper for Concessions + Active Mine Hubs
  const renderBaseVectors = (group: L.LayerGroup, activeMineId?: string) => {
    group.clearLayers();

    // 1. Concession Polygons
    MOIL_CONCESSIONS.forEach((concession) => {
      const isSelected = activeMineId === concession.storeMineId || activeMineId === concession.id;
      const latLngs: L.LatLngExpression[] = concession.coords.map((pt) => [pt.lat, pt.lng]);

      const polygon = L.polygon(latLngs, {
        color: isSelected ? '#00E69A' : '#54D8E8',
        weight: isSelected ? 2.5 : 2,
        opacity: 0.95,
        fillColor: isSelected ? '#00E69A' : '#54D8E8',
        fillOpacity: isSelected ? 0.22 : 0.14,
      });

      polygon.bindTooltip(
        `<div class="font-mono text-[10px]"><strong>${concession.name}</strong><br/><span style="color:#54D8E8">${concession.grade} • ${concession.reserves}</span></div>`,
        {
          sticky: true,
          className: 'manganex-map-tooltip',
          direction: 'top',
        }
      );

      polygon.on('click', () => {
        onSelectFeatureRef.current({
          type: 'Concession Boundary',
          name: concession.name,
          details: `${concession.type} | Grade: ${concession.grade} | Measured Reserve: ${concession.reserves}`,
          location: `${concession.district}, ${concession.state}`,
        });
        if (onSelectMineRef.current) {
          onSelectMineRef.current(concession.storeMineId);
        }
      });

      polygon.addTo(group);

      // Concession centroid anchor
      const [cLat, cLng] = getConcessionCenter(concession);
      L.circleMarker([cLat, cLng], {
        radius: 3.5,
        color: '#54D8E8',
        weight: 1.5,
        fillColor: '#080D18',
        fillOpacity: 1,
      }).addTo(group);
    });

    // 2. Mine Operational Hubs
    MINES_DATA.forEach((mine) => {
      const statusColor =
        mine.status === 'critical'
          ? '#FF6878'
          : mine.status === 'warning'
            ? '#F4B860'
            : mine.status === 'optimal'
              ? '#00E69A'
              : '#54D8E8';

      const isSelected = activeMineId === mine.id;

      const halo = L.circleMarker(mine.coordinates, {
        radius: isSelected ? 15 : 10,
        color: statusColor,
        weight: isSelected ? 2.2 : 1,
        opacity: isSelected ? 0.9 : 0.45,
        fillColor: statusColor,
        fillOpacity: isSelected ? 0.28 : 0.12,
      });

      const marker = L.circleMarker(mine.coordinates, {
        radius: isSelected ? 7 : 5,
        color: '#FFFFFF',
        weight: 1.5,
        fillColor: statusColor,
        fillOpacity: 1,
      });

      const tooltipHtml = `<div class="font-mono text-[10px]"><strong>${mine.name}</strong><br/><span style="color:${statusColor}">${mine.status.toUpperCase()}</span> • ${mine.oreGradeMnPercent}% Mn</div>`;
      marker.bindTooltip(tooltipHtml, {
        permanent: isSelected,
        direction: 'right',
        offset: [8, 0],
        className: 'manganex-map-tooltip',
      });

      const handleClick = () => {
        onSelectFeatureRef.current({
          type: `MOIL ${mine.type} Mine`,
          name: mine.name,
          details: `Output: ${mine.productionRateTpd} TPD | Grade: ${mine.oreGradeMnPercent}% Mn | Reserves: ${mine.reservesMt} Mt`,
          location: `${mine.district}, ${mine.state} (${mine.elevationM}m ASL)`,
        });
        if (onSelectMineRef.current) {
          onSelectMineRef.current(mine.id);
        }
      };

      halo.on('click', handleClick);
      marker.on('click', handleClick);

      halo.addTo(group);
      marker.addTo(group);
    });
  };

  // Overlay rendering helper for toggled layers + temporal year
  const renderOverlays = (
    group: L.LayerGroup,
    layers: ActiveLayersConfig,
    year: number
  ) => {
    group.clearLayers();
    const yearFactor = 0.85 + Math.max(0, Math.min(5, year - 2020)) * 0.06;

    // A. Risk Heatmap Halos
    if (layers.riskHeatmap) {
      RISK_ANOMALY_ZONES.forEach((zone) => {
        const zoneColor =
          zone.severity === 'critical'
            ? '#FF4D6A'
            : zone.severity === 'moderate'
              ? '#F59E0B'
              : '#10B981';

        const scaledRadius = zone.radiusM * yearFactor;
        const outer = L.circle([zone.lat, zone.lng], {
          radius: scaledRadius,
          color: zoneColor,
          weight: 1,
          opacity: 0.4,
          fillColor: zoneColor,
          fillOpacity: 0.14 * zone.baseIntensity,
        });

        const inner = L.circle([zone.lat, zone.lng], {
          radius: scaledRadius * 0.48,
          color: zoneColor,
          weight: 1.5,
          opacity: 0.7,
          fillColor: zoneColor,
          fillOpacity: 0.28 * zone.baseIntensity,
        });

        const onClick = () => {
          onSelectFeatureRef.current({
            type: `Risk Anomaly (${year})`,
            name: zone.name,
            details: `${zone.hazardType} | Index: ${(zone.baseIntensity * yearFactor * 100).toFixed(0)}%`,
            location: `Severity: ${zone.severity.toUpperCase()}`,
          });
        };
        outer.on('click', onClick);
        inner.on('click', onClick);
        outer.addTo(group);
        inner.addTo(group);
      });
    }

    // B. Groundwater Table Contours
    if (layers.groundwater) {
      GROUNDWATER_ZONES.forEach((gw) => {
        const ring = L.circle([gw.lat, gw.lng], {
          radius: gw.radiusM,
          color: '#38BDF8',
          weight: 1.5,
          dashArray: '5 5',
          opacity: 0.85,
          fillColor: '#0284C7',
          fillOpacity: 0.15,
        });

        ring.bindTooltip(
          `<div class="font-mono text-[10px]"><strong>${gw.name}</strong><br/><span style="color:#38BDF8">Inflow: ${gw.inflowGpm} gpm • Depth: ${gw.waterTableDepthM}m</span></div>`,
          { sticky: true, className: 'manganex-map-tooltip' }
        );

        ring.on('click', () => {
          onSelectFeatureRef.current({
            type: 'Hydrogeology Layer',
            name: gw.name,
            details: `Water Table: ${gw.waterTableDepthM}m BGL | Pumping Load: ${gw.inflowGpm} gpm`,
            location: `Status: ${gw.status}`,
          });
        });

        ring.addTo(group);
      });
    }

    // C. Structural Fault & Seismic Traces
    if (layers.seismic) {
      FAULT_TRACES.forEach((trace) => {
        const line = L.polyline(
          trace.points.map((pt) => [pt.lat, pt.lng] as L.LatLngExpression),
          {
            color: '#FF6878',
            weight: 3,
            opacity: 0.9,
            dashArray: '8 6',
          }
        );

        line.bindTooltip(
          `<div class="font-mono text-[10px]"><strong>${trace.name}</strong><br/><span style="color:#FF6878">Strike: ${trace.strike} • ${trace.displacement}</span></div>`,
          { sticky: true, className: 'manganex-map-tooltip' }
        );

        line.on('click', () => {
          onSelectFeatureRef.current({
            type: 'Structural Fault Trace',
            name: trace.name,
            details: `Strike: ${trace.strike} | Kinematics: ${trace.displacement}`,
            location: 'Sausar Fold Belt Seismic Profile',
          });
        });

        line.addTo(group);
      });
    }

    // D. Haulage & Transport Corridors
    if (layers.haulage) {
      HAULAGE_CORRIDORS.forEach((corridor) => {
        const line = L.polyline(
          corridor.points.map((pt) => [pt.lat, pt.lng] as L.LatLngExpression),
          {
            color: corridor.status === 'Restricted' ? '#F59E0B' : '#FBBF24',
            weight: 3,
            opacity: 0.85,
            dashArray: '4 6',
          }
        );

        line.bindTooltip(
          `<div class="font-mono text-[10px]"><strong>${corridor.name}</strong><br/><span style="color:#FBBF24">${corridor.lengthKm} km • ${corridor.status}</span></div>`,
          { sticky: true, className: 'manganex-map-tooltip' }
        );

        line.on('click', () => {
          onSelectFeatureRef.current({
            type: 'Haulage Corridor',
            name: corridor.name,
            details: `Route Span: ${corridor.lengthKm} km | Dispatch Status: ${corridor.status}`,
            location: corridor.mineName,
          });
        });

        line.addTo(group);
      });
    }

    // E. Exploratory Borehole Collars
    if (layers.boreholes) {
      BOREHOLES.forEach((bh) => {
        const fillColor = bh.grade > 44 ? '#A78BFA' : '#F4B860';
        const marker = L.circleMarker([bh.lat, bh.lng], {
          radius: 5.5,
          color: '#FFFFFF',
          weight: 1.5,
          fillColor,
          fillOpacity: 1,
        });

        marker.bindTooltip(
          `<div class="font-mono text-[10px]"><strong>${bh.id}</strong><br/><span style="color:${fillColor}">${bh.grade}% Mn • ${bh.depth}m</span></div>`,
          { direction: 'top', className: 'manganex-map-tooltip' }
        );

        marker.on('click', () => {
          onSelectFeatureRef.current({
            type: 'Borehole Collar',
            name: bh.id,
            details: `Depth: ${bh.depth}m | Recovery: ${bh.recovery}% | Assay: ${bh.grade}% Mn`,
            location: `Lithology: ${bh.lithology}`,
          });
        });

        marker.addTo(group);
      });
    }
  };

  // 1. Initialize Leaflet Map once cleanly
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Remove any leftover map instance on container or _leaflet_id
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // ignore cleanup error
      }
      mapInstanceRef.current = null;
    }
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const map = L.map(container, {
      center,
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: false, // SVG renderer for 100% reliable crisp vector rendering
      worldCopyJump: false,
    });

    const tileGroup = L.layerGroup().addTo(map);
    const baseVectorGroup = L.layerGroup().addTo(map);
    const overlayGroup = L.layerGroup().addTo(map);
    const importedGroup = L.layerGroup().addTo(map);

    // Populate base tile layers immediately
    buildBaseTileLayers(mapType).forEach((layer) => layer.addTo(tileGroup));

    // Populate vectors immediately
    renderBaseVectors(baseVectorGroup, selectedMineId);
    renderOverlays(overlayGroup, activeLayers, selectedYear);

    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      onCursorMoveRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    mapInstanceRef.current = map;
    tileGroupRef.current = tileGroup;
    baseVectorGroupRef.current = baseVectorGroup;
    overlayGroupRef.current = overlayGroup;
    importedGroupRef.current = importedGroup;

    // Multi-stage invalidation to guarantee Leaflet bounds sync with flex layout
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    const rafId = requestAnimationFrame(invalidate);
    const t1 = window.setTimeout(invalidate, 100);
    const t2 = window.setTimeout(invalidate, 300);
    const t3 = window.setTimeout(invalidate, 700);
    const t4 = window.setTimeout(invalidate, 1400);

    const resizeObserver = new ResizeObserver(() => invalidate());
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
      resizeObserver.disconnect();
      try {
        map.remove();
      } catch {
        // ignore
      }
      mapInstanceRef.current = null;
      tileGroupRef.current = null;
      baseVectorGroupRef.current = null;
      overlayGroupRef.current = null;
      importedGroupRef.current = null;
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, []);

  // 2. Sync Base Tile Layer (Satellite / Hybrid / Terrain / Roadmap)
  useEffect(() => {
    const tileGroup = tileGroupRef.current;
    if (!tileGroup) return;
    tileGroup.clearLayers();
    buildBaseTileLayers(mapType).forEach((layer) => layer.addTo(tileGroup));
  }, [mapType]);

  // 3. Respond cleanly when active center changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(center, Math.max(map.getZoom(), 12), { duration: 0.7 });
  }, [center[0], center[1]]);

  // 4. Respond cleanly to external Zoom / Focus / Reset HUD controls
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !zoomCommand) return;
    if (zoomCommand.type === 'in') {
      map.zoomIn();
    } else if (zoomCommand.type === 'out') {
      map.zoomOut();
    } else if (zoomCommand.type === 'focus' && zoomCommand.target) {
      map.flyTo(zoomCommand.target, zoomCommand.zoom ?? 14, { duration: 0.65 });
    } else if (zoomCommand.type === 'reset') {
      const target = zoomCommand.target ?? center;
      map.flyTo(target, zoomCommand.zoom ?? 12, { duration: 0.65 });
    }
  }, [zoomCommand]);

  // 5. Render MOIL Concessions + Mine Hubs when selection changes
  useEffect(() => {
    const group = baseVectorGroupRef.current;
    if (!group) return;
    renderBaseVectors(group, selectedMineId);
  }, [selectedMineId]);

  // 6. Render Interactive Layer Toggles + Temporal Year Scaling
  useEffect(() => {
    const group = overlayGroupRef.current;
    if (!group) return;
    renderOverlays(group, activeLayers, selectedYear);
  }, [activeLayers, selectedYear]);

  // 7. Render Imported GeoJSON Overlay
  useEffect(() => {
    const group = importedGroupRef.current;
    const map = mapInstanceRef.current;
    if (!group || !map) return;
    group.clearLayers();
    if (!importedGeoJson) return;

    try {
      const geoLayer = L.geoJSON(importedGeoJson as GeoJSON.GeoJsonObject, {
        style: () => ({
          color: '#00E69A',
          weight: 2.5,
          fillColor: '#00E69A',
          fillOpacity: 0.2,
        }),
        pointToLayer: (_feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 6,
            color: '#FFFFFF',
            weight: 1.5,
            fillColor: '#00E69A',
            fillOpacity: 0.95,
          }),
      }).addTo(group);

      const bounds = geoLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
      }
    } catch {
      // Ignore malformed GeoJSON silently
    }
  }, [importedGeoJson]);

  return (
    <div
      ref={containerRef}
      data-testid="manganex-leaflet-map"
      className="absolute inset-0 w-full h-full bg-[#050D1A] overflow-hidden"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
    />
  );
};
