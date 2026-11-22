"""
MANGANEX - Production & Forecasting API Endpoints
GET /production/forecast/{mine_id}
GET /production/history/{mine_id}
GET /production/summary
POST /production/simulate
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Mine, ProductionRecord
from app.schemas.all_schemas import ApiResponse, DataProvenance, ScenarioInput
from app.ml.forecasting.model import (
    run_production_forecast,
    get_mine_history,
    evaluate_scenario_counterfactuals
)

router = APIRouter()

@router.get("/forecast/{mine_id}", response_model=ApiResponse)
def get_production_forecast(
    mine_id: str,
    horizon_days: int = Query(default=30, ge=7, le=90),
    planned_downtime_hours: float = Query(default=0.0, ge=0.0, le=100.0),
    blasting_delay_hours: float = Query(default=0.0, ge=0.0, le=50.0),
    db: Session = Depends(get_db)
):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")

    result = run_production_forecast(
        mine_id,
        horizon_days=horizon_days,
        planned_downtime_hours=planned_downtime_hours,
        blasting_delay_hours=blasting_delay_hours
    )

    return ApiResponse(
        data={
            **result,
            "mine_name": mine.mine_name,
            "mine_code": mine.mine_code,
            "ore_grade_mn_percent": mine.ore_grade_mn_percent,
        },
        data_provenance=DataProvenance(
            status="DERIVED",
            source="Open-Meteo ERA5 Reanalysis & 16-Day Forecast (REAL) + Quantile Gradient Boosting (SYNTHETIC Production)",
        )
    )


@router.post("/simulate", response_model=ApiResponse)
def simulate_production_scenario(
    input_data: ScenarioInput,
    db: Session = Depends(get_db)
):
    mine = db.query(Mine).filter(Mine.id == input_data.mineId).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{input_data.mineId}' not found")

    result = evaluate_scenario_counterfactuals(
        mine_id=input_data.mineId,
        rainfall_mm=input_data.rainfallMm,
        fleet_availability_pct=input_data.fleetAvailabilityPercent,
        pump_capacity_pct=input_data.dewateringCapacityPercent,
        downtime_hours=getattr(input_data, "downtimeHours", 0.0) or 0.0,
        blasting_delay_hours=getattr(input_data, "blastingDelayHours", 0.0) or 0.0,
        shift_hours=input_data.shiftHours
    )

    return ApiResponse(
        data=result,
        data_provenance=DataProvenance(
            status="DERIVED",
            source="Parametric Counterfactual Mine Simulator (docs/simulation.md)",
        )
    )


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

    return ApiResponse(
        data={
            "mine_id": mine_id,
            "mine_name": mine.mine_name,
            "days": days,
            "records": history,
            "data_status": "VALIDATED_SYNTHETIC_DEMO",
            "ui_note": "Weather real, production simulated, replace with MOIL production logs.",
        },
        data_provenance=DataProvenance(
            status="DERIVED",
            source="Open-Meteo ERA5 Reanalysis (REAL) + Production Simulator (SYNTHETIC)",
        )
    )


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
            "planned_monthly_tonnes": planned,
            "actual_monthly_tonnes": actual,
            "variance_percent": variance,
            "risk_level": "CRITICAL" if variance < -15 else "WARNING" if variance < -5 else "LOW"
        })

    total_shortfall = max(0, total_planned - total_actual)
    mines_at_risk = sum(1 for m in summary if m["risk_level"] in ("CRITICAL", "WARNING"))

    return ApiResponse(
        data={
            "mines": summary,
            "system_totals": {
                "total_planned_tonnes": total_planned,
                "total_actual_tonnes": total_actual,
                "total_shortfall_tonnes": total_shortfall,
                "mines_at_risk": mines_at_risk,
                "system_health": "WARNING" if mines_at_risk > 2 else "OPTIMAL"
            }
        },
        data_provenance=DataProvenance(
            status="DERIVED",
            source="MOIL Production History + Random Forest & Gradient Boosting Time-Series",
        )
    )
