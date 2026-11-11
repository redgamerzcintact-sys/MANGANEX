export type MineStatus = 'active' | 'warning' | 'critical' | 'optimal';
export type ReserveCategory = 'Proven (UNFC 111)' | 'Probable (UNFC 122)' | 'Inferred (UNFC 333)';

export interface Mine {
  id: string;
  name: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  elevationM: number;
  status: MineStatus;
  type: 'Underground' | 'Opencast' | 'Mixed';
  productionRateTpd: number; // Tonnes per day
  plannedMonthlyTargetTonnes: number;
  actualMonthlyProductionTonnes: number;
  forecastVariancePercent: number;
  oreGradeMnPercent: number; // e.g. 42.5%
  stripRatio?: number;
  reservesMt: number; // Million tonnes
  reserveCategory: ReserveCategory;
  geologicalConfidence: number; // 0 - 100%
  activeEquipmentUnits: number;
  totalEquipmentUnits: number;
  weatherRiskIndex: 'Low' | 'Moderate' | 'Severe' | 'Critical';
  rainfallMm24h: number;
  activeAlertsCount: number;
  description: string;
  keyChallenge: string;
}

export interface GeologicalProspect {
  id: string;
  name: string;
  coordinates: [number, number];
  region: string;
  state: string;
  prospectivityScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  unfcStatus: string;
  depthMetersEstimated: [number, number];
  estimatedTonnagePotentialMt: number;
  primaryLithology: string;
  structuralCompatibility: number; // 0 - 100
  satelliteIndicatorScore: number; // 0 - 100
  boreholeEvidenceScore: number; // 0 - 100
  validationPriority: 'P1 - Immediate Core Drilling' | 'P2 - High Priority Geophysics' | 'P3 - Detailed Mapping';
  surfaceIndicators: string[];
  nearbyBoreholesCount: number;
  recommendedAction: string;
  radarMetrics: {
    geological: number;
    structural: number;
    satellite: number;
    borehole: number;
    completeness: number;
    confidence: number;
  };
}

export interface Borehole {
  id: string;
  mineId: string;
  coordinates: [number, number];
  depthM: number;
  collarElevationM: number;
  drilledYear: number;
  strata: {
    fromM: number;
    toM: number;
    rockType: string;
    oreGradeMnPercent: number;
    color: string;
  }[];
}

export interface RiskAlert {
  id: string;
  mineId: string;
  mineName: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'Rainfall & Geohazard' | 'Equipment Failure' | 'Blasting Delay' | 'Grade Dilution' | 'Haul Road Flooding';
  title: string;
  description: string;
  probabilityPercent: number;
  estimatedShortfallTonnes: number;
  forecastDate: string;
  workflowRipple: {
    stage: string;
    impact: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  recommendedAction: string;
  acknowledged: boolean;
}

export interface ProductionStage {
  name: string;
  status: 'optimal' | 'warning' | 'bottleneck' | 'idle';
  capacityUtilPercent: number;
  flowRateTph: number;
  delayHours: number;
  contributingFactor?: string;
}

export interface SatelliteObservation {
  id: string;
  mineId: string;
  date: string;
  sensor: 'Sentinel-2 Multispectral' | 'Landsat-9 OLI-2' | 'Sentinel-1 SAR' | 'MODIS LST';
  ndviMean: number;
  soilMoistureIndex: number;
  landSurfaceTempC: number;
  rainfallAccumulationMm: number;
  cloudCoverPercent: number;
  processingLevel: string;
  anomalyDetected: boolean;
  anomalyType?: string;
}

