from pydantic import BaseModel
from typing import Optional

class OptimizationRequest(BaseModel):
    mineId: str = "mine-balaghat"
    targetProductionTonnes: float = 45000.0
    equipmentAvailabilityPercent: float = 85.0
    rainfallMm: float = 124.5
    dewateringCapacityPercent: float = 65.0
    shiftHours: float = 8.0

class MissionReportRequest(BaseModel):
    mineId: str = "mine-balaghat"
    generatedBy: str = "Chief Geologist & Operations Lead (MOIL)"
    includeShap: bool = True
    includeSatelliteCadence: bool = True
    includeOptimization: bool = True

