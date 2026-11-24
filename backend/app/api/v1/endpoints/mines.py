from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import datetime
from app.database.session import get_db
from app.models.entities import Mine
from app.schemas.all_schemas import ApiResponse, MineBase
from app.services.mining_data import get_all_mines_metrics, get_mine_metrics, CANONICAL_MINES_DATA, DATA_PROVENANCE

router = APIRouter()

@router.get("/metrics/unified", response_model=ApiResponse)
def get_unified_metrics():
    """Single source of truth metrics across all mines."""
    return ApiResponse(data=get_all_mines_metrics(), data_provenance=DATA_PROVENANCE)

@router.get("", response_model=ApiResponse)
def get_all_mines(db: Session = Depends(get_db)):
    mines = db.query(Mine).all()
    result = []
    for m in mines:
        # Overlay canonical metrics if available to prevent discrepancies
        c = CANONICAL_MINES_DATA.get(m.id, {})
        target = c.get("monthly_target_tonnes", m.planned_monthly_target_tonnes or 45000.0)
        actual = c.get("current_output_tonnes", m.actual_monthly_production_tonnes or 42800.0)
        reserves = c.get("reserves_mt", m.reserves_mt or 23.4)
        deficit = c.get("deficit_tonnes", target - actual)
        
        result.append({
            "id": m.id,
            "name": m.mine_name,
            "district": m.district,
            "state": m.state,
            "coordinates": [m.latitude, m.longitude],
            "elevationM": m.elevation_m,
            "status": c.get("status", m.operational_status),
            "type": m.mine_type,
            "productionRateTpd": c.get("production_rate_tpd", m.production_rate_tpd),
            "plannedMonthlyTargetTonnes": target,
            "actualMonthlyProductionTonnes": actual,
            "deficitTonnes": deficit,
            "forecastVariancePercent": round(((actual - target) / target) * 100, 1),
            "oreGradeMnPercent": c.get("ore_grade_mn_percent", m.ore_grade_mn_percent),
            "reservesMt": reserves,
            "reserveCategory": m.reserve_category,
            "geologicalConfidence": m.geological_confidence,
            "activeEquipmentUnits": c.get("active_haul_trucks", m.active_equipment_units),
            "totalEquipmentUnits": m.total_equipment_units,
            "weatherRiskIndex": m.weather_risk_index,
            "rainfallMm24h": m.rainfall_mm_24h,
            "activeAlertsCount": m.active_alerts_count,
            "description": m.description,
            "keyChallenge": m.key_challenge
        })
    return ApiResponse(data=result, data_provenance=DATA_PROVENANCE)

@router.get("/{mine_id}", response_model=ApiResponse)
def get_mine_by_id(mine_id: str, db: Session = Depends(get_db)):
    m = db.query(Mine).filter(Mine.id == mine_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mine not found")
    data = {
        "id": m.id,
        "name": m.mine_name,
        "district": m.district,
        "state": m.state,
        "coordinates": [m.latitude, m.longitude],
        "elevationM": m.elevation_m,
        "status": m.operational_status,
        "type": m.mine_type,
        "productionRateTpd": m.production_rate_tpd,
        "plannedMonthlyTargetTonnes": m.planned_monthly_target_tonnes,
        "actualMonthlyProductionTonnes": m.actual_monthly_production_tonnes,
        "forecastVariancePercent": m.forecast_variance_percent,
        "oreGradeMnPercent": m.ore_grade_mn_percent,
        "reservesMt": m.reserves_mt,
        "reserveCategory": m.reserve_category,
        "geologicalConfidence": m.geological_confidence,
        "activeEquipmentUnits": m.active_equipment_units,
        "totalEquipmentUnits": m.total_equipment_units,
        "weatherRiskIndex": m.weather_risk_index,
        "rainfallMm24h": m.rainfall_mm_24h,
        "activeAlertsCount": m.active_alerts_count,
        "description": m.description,
        "keyChallenge": m.key_challenge
    }
    return ApiResponse(data=data)

