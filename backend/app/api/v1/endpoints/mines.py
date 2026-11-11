from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.models.entities import Mine
from app.schemas.all_schemas import ApiResponse, MineBase

router = APIRouter()

@router.get("", response_model=ApiResponse)
def get_all_mines(db: Session = Depends(get_db)):
    mines = db.query(Mine).all()
    result = []
    for m in mines:
        result.append({
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
        })
    return ApiResponse(data=result)

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

