"""
MANGANEX - Production & Forecasting API Endpoints
GET /production/forecast/{mine_id}
GET /production/history/{mine_id}
GET /production/summary
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Mine, ProductionRecord
from app.schemas.all_schemas import ApiResponse
from app.ml.forecasting.model import run_production_forecast, get_mine_history
import datetime

router = APIRouter()

@router.get("/forecast/{mine_id}", response_model=ApiResponse)
def get_production_forecast(
    mine_id: str,
    horizon_days: int = Query(default=30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")
    
    # Pull history from DB if available, else generate synthetic
    db_records = db.query(ProductionRecord).filter(
        ProductionRecord.mine_id == mine_id
    ).order_by(ProductionRecord.production_date).all()
    
    if len(db_records) >= 30:
        history = [
            {
                "production_date": r.production_date,
                "actual_production_tonnes": r.actual_production_tonnes,
                "planned_production_tonnes": r.planned_production_tonnes,
                "ore_grade_mn_percent": r.ore_grade_mn_percent,
                "downtime_hours": r.downtime_hours,
                "monsoon_impact_factor": 0.0,
                "variance_percent": round(
                    (r.actual_production_tonnes - r.planned_production_tonnes) / 
                    max(1, r.planned_production_tonnes) * 100, 1
                ),
            }
            for r in db_records
        ]
    else:
        history = None  # ML engine will generate synthetic history
    
    result = run_production_forecast(mine_id, horizon_days=horizon_days, production_history=history)
    
    return ApiResponse(data={
        **result,
        "mine_name": mine.mine_name,
        "mine_code": mine.mine_code,
        "ore_grade_mn_percent": mine.ore_grade_mn_percent,
    })


@router.get("/history/{mine_id}", response_model=ApiResponse)
def get_production_history(
    mine_id: str,
    days: int = Query(default=90, ge=7, le=365),
    db: Session = Depends(get_db)
):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")
    
    history = get_mine_history(mine_id, days=days)
    
    return ApiResponse(data={
        "mine_id": mine_id,
        "mine_name": mine.mine_name,
        "days": days,
        "records": history,
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
    })


@router.get("/summary", response_model=ApiResponse)
def get_production_summary(db: Session = Depends(get_db)):
    mines = db.query(Mine).all()
    summary = []
    
    total_planned = 0
    total_actual = 0
    
    for mine in mines:
        planned = mine.planned_monthly_target_tonnes
        actual = mine.actual_monthly_production_tonnes
        variance = mine.forecast_variance_percent
        total_planned += planned
        total_actual += actual
        
        summary.append({
            "mine_id": mine.id,
            "mine_name": mine.mine_name,
            "mine_code": mine.mine_code,
            "state": mine.state,
            "planned_monthly_tonnes": planned,
            "actual_monthly_tonnes": actual,
            "variance_percent": variance,
            "ore_grade_mn_percent": mine.ore_grade_mn_percent,
            "operational_status": mine.operational_status,
            "risk_level": "CRITICAL" if variance < -15 else "WARNING" if variance < -5 else "OPTIMAL",
        })
    
    system_variance = round((total_actual - total_planned) / max(1, total_planned) * 100, 1)
    
    return ApiResponse(data={
        "mines": summary,
        "system_totals": {
            "total_planned_tonnes": round(total_planned, 0),
            "total_actual_tonnes": round(total_actual, 0),
            "total_shortfall_tonnes": round(max(0, total_planned - total_actual), 0),
            "system_variance_percent": system_variance,
            "mines_at_risk": sum(1 for m in mines if m.operational_status in ["critical", "warning"]),
        },
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
    })

