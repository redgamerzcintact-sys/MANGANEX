from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
import datetime

class DataProvenance(BaseModel):
    status: str = "SYNTHETIC"  # REAL | DERIVED | SYNTHETIC
    source: str = "MOIL Exploratory & Production Cadastre"
    retrieved_at: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())

class ApiResponse(BaseModel):
    success: bool = True
    data: Any
    data_provenance: Optional[DataProvenance] = Field(default_factory=DataProvenance)
    metadata: Dict[str, Any] = Field(default_factory=lambda: {
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "source": "MOIL Cadastre & Satellite Ingestion",
        "model_version": "v2.4.0",
        "data_status": "VALIDATED_SYNTHETIC_DEMO"
    })
    error: Optional[str] = None

class MineBase(BaseModel):
    id: str
    name: str
    district: str
    state: str
    coordinates: List[float]  # [lat, lng]
    elevationM: float
    status: str
    type: str
    productionRateTpd: float
    plannedMonthlyTargetTonnes: float
    actualMonthlyProductionTonnes: float
    forecastVariancePercent: float
    oreGradeMnPercent: float
    reservesMt: float
    reserveCategory: str
    geologicalConfidence: float
    activeEquipmentUnits: int
    totalEquipmentUnits: int
    weatherRiskIndex: str
    rainfallMm24h: float
    activeAlertsCount: int
    description: Optional[str] = None
    keyChallenge: Optional[str] = None

class ProspectBase(BaseModel):
    id: str
    name: str
    coordinates: List[float]
    region: str
    state: str
    prospectivityScore: float
    confidenceScore: float
    unfcStatus: str
    depthMetersEstimated: List[float]
    estimatedTonnagePotentialMt: float
    primaryLithology: str
    structuralCompatibility: float
    satelliteIndicatorScore: float
    boreholeEvidenceScore: float
    validationPriority: str
    surfaceIndicators: List[str]
    nearbyBoreholesCount: int
    recommendedAction: str
    radarMetrics: Dict[str, float]

class BoreholeBase(BaseModel):
    id: str
    mineId: str
    coordinates: List[float]
    depthM: float
    collarElevationM: float
    drilledYear: int
    strata: List[Dict[str, Any]]

class RiskAlertBase(BaseModel):
    id: str
    mineId: str
    mineName: str
    severity: str
    category: str
    title: str
    description: str
    probabilityPercent: float
    estimatedShortfallTonnes: float
    forecastDate: str
    workflowRipple: List[Dict[str, Any]]
    recommendedAction: str
    acknowledged: bool

class ScenarioInput(BaseModel):
    mineId: str = "mine-balaghat"
    rainfallMm: float = 20.0
    fleetAvailabilityPercent: float = 85.0
    dewateringCapacityPercent: float = 90.0
    shiftHours: float = 8.0
    downtimeHours: Optional[float] = 0.0
    blastingDelayHours: Optional[float] = 0.0

class NexusChatRequest(BaseModel):
    query: str
    conversation_id: Optional[str] = None
    mine_id: Optional[str] = "mine-balaghat"
    selected_region: Optional[str] = "Balaghat-Bhandara Belt"
    context: Optional[Dict[str, Any]] = None
    language: Optional[str] = "en"
    history: Optional[List[Dict[str, str]]] = None

class NexusChatResponse(BaseModel):
    answer: str
    intent: str
    entities: List[str]
    supporting_data: Dict[str, Any]
    sources: List[Dict[str, str]]
    recommendations: List[str]
    confidence: float

