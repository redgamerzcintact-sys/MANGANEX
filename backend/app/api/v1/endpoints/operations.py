from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import RiskAssessment, Mine
from app.schemas.all_schemas import ApiResponse, ScenarioInput

router = APIRouter()

@router.get("/risks", response_model=ApiResponse)
def get_risk_alerts(db: Session = Depends(get_db)):
    risks = db.query(RiskAssessment).all()
    result = []
    for r in risks:
        mine = db.query(Mine).filter(Mine.id == r.mine_id).first()
        result.append({
            "id": r.id,
            "mineId": r.mine_id,
            "mineName": mine.mine_name if mine else "Facility",
            "severity": r.severity,
            "category": r.category,
            "title": r.title,
            "description": r.description,
            "probabilityPercent": r.probability_percent,
            "estimatedShortfallTonnes": r.estimated_shortfall_tonnes,
            "forecastDate": r.forecast_date,
            "workflowRipple": r.workflow_ripple,
            "recommendedAction": r.recommended_action,
            "acknowledged": r.acknowledged
        })
    return ApiResponse(data=result)

@router.post("/scenarios/simulate", response_model=ApiResponse)
def simulate_future_fork(input_data: ScenarioInput, db: Session = Depends(get_db)):
    mine = db.query(Mine).filter(Mine.id == input_data.mineId).first()
    baseline = mine.planned_monthly_target_tonnes if mine else 45000.0

    # Deterministic Engineering Simulation Logic:
    # Rainfall degradation: >50mm causes haul road & pump stress
    rain_penalty = max(0.0, (input_data.rainfallMm - 20.0) * 85.0)
    # Fleet availability effect
    fleet_factor = input_data.fleetAvailabilityPercent / 100.0
    # Dewatering capacity factor
    dewatering_factor = input_data.dewateringCapacityPercent / 100.0
    # Shift hours factor (standard = 8h)
    shift_factor = input_data.shiftHours / 8.0

    simulated_tonnes = baseline * fleet_factor * min(1.0, (0.5 + 0.5 * dewatering_factor)) * shift_factor - rain_penalty
    simulated_tonnes = max(5000.0, round(simulated_tonnes, 0))

    shortfall = max(0.0, round(baseline - simulated_tonnes, 0))
    recovery = round(shortfall * 0.72, 0)

    utilization = round((simulated_tonnes / baseline) * 100.0, 1)
    risk_level = "Critical" if shortfall > 6000 else "Moderate" if shortfall > 2000 else "Low"

    data = {
        "mineId": input_data.mineId,
        "baselineMonthlyTonnes": baseline,
        "simulatedMonthlyTonnes": simulated_tonnes,
        "projectedShortfallTonnes": shortfall,
        "estimatedRecoveryTonnes": recovery,
        "capacityUtilizationPercent": min(100.0, utilization),
        "riskIndex": risk_level,
        "assumptionsApplied": [
            f"Precipitation inflow calculated at {input_data.rainfallMm} mm/24h",
            f"Fleet availability constrained to {input_data.fleetAvailabilityPercent}%",
            f"Sump dewatering pump station operating at {input_data.dewateringCapacityPercent}% rating",
            f"Active underground face extraction scheduled across {input_data.shiftHours} hr shifts"
        ],
        "calculationEngineVersion": "Manganex-SimEngine-v2.1"
    }
    return ApiResponse(data=data)

