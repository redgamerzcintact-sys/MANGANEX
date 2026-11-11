import { BOREHOLES_DATA, MINES_DATA } from '../../data/demoData';

export type MapTypeId = 'satellite' | 'roadmap' | 'terrain' | 'hybrid';

export interface ActiveLayersConfig {
  boreholes: boolean;
  seismic: boolean;
  groundwater: boolean;
  haulage: boolean;
  riskHeatmap: boolean;
}

export interface SelectedMapFeature {
  type: string;
  name: string;
  details: string;
  location: string;
}

export interface ConcessionPolygon {
  id: string;
  storeMineId: string;
  name: string;
  state: string;
  district: string;
  grade: string;
  reserves: string;
  type: string;
  coords: Array<{ lat: number; lng: number }>;
}

export interface FaultTrace {
  id: string;
  name: string;
  strike: string;
  displacement: string;
  points: Array<{ lat: number; lng: number }>;
}

export interface BoreholeMarkerData {
  id: string;
  lat: number;
  lng: number;
  depth: number;
  grade: number;
  recovery: number;
  lithology: string;
}

export interface HaulageCorridor {
  id: string;
  name: string;
  mineName: string;
  lengthKm: number;
  status: 'Active' | 'Restricted' | 'Maintenance';
  points: Array<{ lat: number; lng: number }>;
}

export interface GroundwaterZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusM: number;
  waterTableDepthM: number;
  inflowGpm: number;
  status: 'Nominal' | 'Elevated' | 'Critical Seepage';
}

export interface RiskAnomalyZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusM: number;
  severity: 'critical' | 'moderate' | 'low';
  hazardType: string;
  baseIntensity: number;
}

// Verified MOIL Central India Manganese Belt Concession Boundaries
export const MOIL_CONCESSIONS: ConcessionPolygon[] = [
  {
    id: 'mine-dongri-buzurg',
    storeMineId: 'mine-dongri',
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
      { lat: 21.5410, lng: 79.6950 },
    ],
  },
  {
    id: 'mine-balaghat',
    storeMineId: 'mine-balaghat',
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
      { lat: 21.8010, lng: 80.1810 },
    ],
  },
  {
    id: 'mine-chikla',
    storeMineId: 'mine-chikla',
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
      { lat: 21.5380, lng: 79.7640 },
    ],
  },
  {
    id: 'mine-ukwa',
    storeMineId: 'mine-ukwa',
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
      { lat: 21.9560, lng: 80.4720 },
    ],
  },
  {
    id: 'mine-munsar',
    storeMineId: 'mine-munsar',
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
      { lat: 21.3910, lng: 79.2920 },
    ],
  },
];

// Structural Fault Traces (Sausar Belt Thrust)
export const FAULT_TRACES: FaultTrace[] = [
  {
    id: 'fault-sausar-south',
    name: 'Dongri–Chikla Sausar Thrust Fault',
    strike: 'N68°E',
    displacement: '34m Reverse Dip-Slip',
    points: [
      { lat: 21.535, lng: 79.680 },
      { lat: 21.550, lng: 79.710 },
      { lat: 21.560, lng: 79.740 },
      { lat: 21.575, lng: 79.780 },
    ],
  },
  {
    id: 'fault-bharweli-shear',
    name: 'Bharweli Hanging-Wall Shear Zone',
    strike: 'N54°E',
    displacement: '52m Ductile Shear',
    points: [
      { lat: 21.800, lng: 80.160 },
      { lat: 21.815, lng: 80.185 },
      { lat: 21.830, lng: 80.210 },
    ],
  },
];

export const FAULT_LINES = FAULT_TRACES.map((trace) => trace.points);

// Combined Exploratory Borehole Collars
export const BOREHOLES: BoreholeMarkerData[] = [
  { id: 'BH-DB-01', lat: 21.5495, lng: 79.6990, depth: 280, grade: 42.4, recovery: 91.2, lithology: 'Braunite' },
  { id: 'BH-DB-02', lat: 21.5520, lng: 79.7025, depth: 340, grade: 45.1, recovery: 93.8, lithology: 'Pyrolusite' },
  { id: 'BH-DB-03', lat: 21.5460, lng: 79.6960, depth: 210, grade: 38.6, recovery: 87.5, lithology: 'Gondite' },
  { id: 'BH-BL-01', lat: 21.8120, lng: 80.1820, depth: 420, grade: 46.2, recovery: 94.6, lithology: 'Massive Braunite' },
  { id: 'BH-BL-02', lat: 21.8180, lng: 80.1890, depth: 390, grade: 43.8, recovery: 92.1, lithology: 'Braunite Reef' },
  ...BOREHOLES_DATA.map((bh) => {
    const peakStratum = bh.strata.reduce(
      (best, cur) => (cur.oreGradeMnPercent > best.oreGradeMnPercent ? cur : best),
      bh.strata[0]
    );
    return {
      id: bh.id,
      lat: bh.coordinates[0],
      lng: bh.coordinates[1],
      depth: bh.depthM,
      grade: peakStratum ? peakStratum.oreGradeMnPercent : 42.0,
      recovery: 92.4,
      lithology: peakStratum ? peakStratum.rockType : 'Gondite',
    };
  }),
];

export const HAULAGE_CORRIDORS: HaulageCorridor[] = [
  {
    id: 'haul-balaghat-siding',
    name: 'Balaghat Pithead -> Bharweli Rail Siding',
    mineName: 'Balaghat Mine (Bharweli)',
    lengthKm: 5.4,
    status: 'Restricted',
    points: [
      { lat: 21.8049, lng: 80.2033 },
      { lat: 21.8110, lng: 80.1940 },
      { lat: 21.8165, lng: 80.1845 },
      { lat: 21.8240, lng: 80.1720 },
    ],
  },
  {
    id: 'haul-dongri-crusher',
    name: 'Dongri Pit Bench -> Tumsar Road Siding',
    mineName: 'Dongri Buzurg Mine',
    lengthKm: 7.2,
    status: 'Active',
    points: [
      { lat: 21.5422, lng: 79.7025 },
      { lat: 21.5485, lng: 79.7180 },
      { lat: 21.5515, lng: 79.7410 },
      { lat: 21.5540, lng: 79.7712 },
    ],
  },
  {
    id: 'haul-ukwa-ropway',
    name: 'Ukwa Ghat Conveyor -> Balaghat Blending Yard',
    mineName: 'Ukwa Mine',
    lengthKm: 11.8,
    status: 'Maintenance',
    points: [
      { lat: 21.9682, lng: 80.4674 },
      { lat: 21.9540, lng: 80.4350 },
      { lat: 21.9100, lng: 80.3400 },
      { lat: 21.8049, lng: 80.2033 },
    ],
  },
];

export const GROUNDWATER_ZONES: GroundwaterZone[] = [
  {
    id: 'gw-balaghat-winze',
    name: 'Balaghat Sub-Level 7 Aquifer Zone',
    lat: 21.8065,
    lng: 80.1960,
    radiusM: 2200,
    waterTableDepthM: 48.2,
    inflowGpm: 850,
    status: 'Critical Seepage',
  },
  {
    id: 'gw-dongri-sump',
    name: 'Dongri Pit East Piezometric Lens',
    lat: 21.5470,
    lng: 79.7005,
    radiusM: 1500,
    waterTableDepthM: 64.5,
    inflowGpm: 210,
    status: 'Nominal',
  },
  {
    id: 'gw-ukwa-ghat',
    name: 'Ukwa Perched Monsoon Seepage Table',
    lat: 21.9640,
    lng: 80.4750,
    radiusM: 1800,
    waterTableDepthM: 32.0,
    inflowGpm: 420,
    status: 'Elevated',
  },
];

export const RISK_ANOMALY_ZONES: RiskAnomalyZone[] = [
  {
    id: 'risk-balaghat-flood',
    name: 'Balaghat Winze Inundation Cluster',
    lat: 21.8080,
    lng: 80.1910,
    radiusM: 1900,
    severity: 'critical',
    hazardType: 'Monsoon Sump Overflow & Shear Fracture',
    baseIntensity: 0.92,
  },
  {
    id: 'risk-ukwa-slope',
    name: 'Ukwa Ghat Slope Instability Sector',
    lat: 21.9645,
    lng: 80.4740,
    radiusM: 1650,
    severity: 'moderate',
    hazardType: 'Bench Toe Creep Near Shear Trace',
    baseIntensity: 0.72,
  },
  {
    id: 'risk-dongri-bench',
    name: 'Dongri Buzurg Deep Bench Monitoring',
    lat: 21.5485,
    lng: 79.6980,
    radiusM: 1450,
    severity: 'low',
    hazardType: 'Active Overburden Stripping',
    baseIntensity: 0.35,
  },
  {
    id: 'risk-munsar-stope',
    name: 'Munsar Steep Stope Void Zone',
    lat: 21.3985,
    lng: 79.2950,
    radiusM: 1400,
    severity: 'moderate',
    hazardType: 'Cut-and-Fill Backfill Lag',
    baseIntensity: 0.68,
  },
];

export function normalizeMineId(id: string): string {
  if (id === 'mine-dongri-buzurg') return 'mine-dongri';
  return id;
}

export function getConcessionCenter(concession: ConcessionPolygon): [number, number] {
  const sum = concession.coords.reduce(
    (acc, pt) => ({ lat: acc.lat + pt.lat, lng: acc.lng + pt.lng }),
    { lat: 0, lng: 0 }
  );
  return [sum.lat / concession.coords.length, sum.lng / concession.coords.length];
}

export function parseLatLngSearch(query: string): [number, number] | null {
  const match = query
    .trim()
    .match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }
  return [lat, lng];
}

export function searchSpatialFeatures(rawQuery: string): {
  center: [number, number];
  zoom: number;
  feature: SelectedMapFeature;
  storeMineId?: string;
} | null {
  const coords = parseLatLngSearch(rawQuery);
  if (coords) {
    return {
      center: coords,
      zoom: 14,
      feature: {
        type: 'Coordinate Waypoint',
        name: `${coords[0].toFixed(5)}° N, ${coords[1].toFixed(5)}° E`,
        details: 'WGS-84 / UTM Zone 44N spatial target lock',
        location: 'Central India Manganese Belt',
      },
    };
  }

  const term = rawQuery.trim().toLowerCase();
  if (!term) return null;

  const matchedMine = MINES_DATA.find(
    (m) =>
      m.name.toLowerCase().includes(term) ||
      m.district.toLowerCase().includes(term) ||
      m.state.toLowerCase().includes(term)
  );
  if (matchedMine) {
    return {
      center: matchedMine.coordinates,
      zoom: 13,
      storeMineId: matchedMine.id,
      feature: {
        type: 'MOIL Mine Operation',
        name: matchedMine.name,
        details: `${matchedMine.type} | Grade: ${matchedMine.oreGradeMnPercent}% Mn | Reserves: ${matchedMine.reservesMt} Mt`,
        location: `${matchedMine.district}, ${matchedMine.state}`,
      },
    };
  }

  const matchedConcession = MOIL_CONCESSIONS.find(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.district.toLowerCase().includes(term) ||
      c.state.toLowerCase().includes(term)
  );
  if (matchedConcession) {
    return {
      center: getConcessionCenter(matchedConcession),
      zoom: 14,
      storeMineId: matchedConcession.storeMineId,
      feature: {
        type: 'Concession Search Result',
        name: matchedConcession.name,
        details: `${matchedConcession.type} | Grade: ${matchedConcession.grade} | Reserves: ${matchedConcession.reserves}`,
        location: `${matchedConcession.district}, ${matchedConcession.state}`,
      },
    };
  }

  const matchedBorehole = BOREHOLES.find(
    (bh) => bh.id.toLowerCase().includes(term) || bh.lithology.toLowerCase().includes(term)
  );
  if (matchedBorehole) {
    return {
      center: [matchedBorehole.lat, matchedBorehole.lng],
      zoom: 15,
      feature: {
        type: 'Borehole Collar',
        name: matchedBorehole.id,
        details: `Depth: ${matchedBorehole.depth}m | Recovery: ${matchedBorehole.recovery}% | Assay: ${matchedBorehole.grade}% Mn`,
        location: `Lithology: ${matchedBorehole.lithology}`,
      },
    };
  }

  return null;
}

