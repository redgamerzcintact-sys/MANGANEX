"""
MANGANEX - Operational Shortfall Alerts Engine
GET /api/v1/alerts
Evaluates all 7 MOIL mines over the next 14 days using real 16-day numerical weather forecasts
and identifies the top 3 mines at highest shortfall risk with counterfactual recovery plans.
"""
import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Mine
from app.schemas.all_schemas import ApiResponse, DataProvenance
from app.ml.forecasting.model import run_production_forecast, evaluate_scenario_counterfactuals
from app.services.weather.open_meteo import get_mine_weather, MINE_COORDINATES

router = APIRouter()

@router.get("", response_model=ApiResponse)
@router.get("/", response_model=ApiResponse)
def get_top_shortfall_risk_alerts(db: Session = Depends(get_db)):
    """
    Returns top 3 mines at shortfall risk in the next 14 days using the real forecast.
    Data provenance: REAL_DERIVED from Open-Meteo 16-day numerical forecast + Quantile GB ML.
    """
    evaluated_mines = []
    
    for mine_id, info in MINE_COORDINATES.items():
        try:
            weather_data = get_mine_weather(mine_id)
            cur = weather_data.get("current", {})
            next_7d_rain = cur.get("next_7d_rainfall_mm", 0.0)
            cur_sm = cur.get("soil_moisture_m3m3", 0.28)
            
            # Run 14-day forecast driven by real weather
            fc = run_production_forecast(mine_id, horizon_days=14)
            summary = fc.get("summary", {})
            shortfall_p50 = summary.get("shortfall_p50_tonnes", 0.0)
            shortfall_p10 = summary.get("shortfall_p10_tonnes", 0.0)
            shortfall_p90 = summary.get("shortfall_p90_tonnes", 0.0)
            shortfall_pct = summary.get("shortfall_percent", 0.0)
            risk_lvl = summary.get("risk_level", "LOW")

            # Determine primary root cause
            if next_7d_rain >= 35.0:
                cause = f"Monsoon surge forecast ({next_7d_rain:.1f} mm/7d) causing pit bench ponding"
                rec_action = "Engage high-capacity centrifugal pumps (+40% dewatering) before peak deluge"
            elif cur_sm >= 0.35:
                cause = f"Saturated soil profile ({cur_sm:.2f} m³/m³) causing severe haul road rutting & dumper slip"
                rec_action = "Spread crushed dolomite aggregate on primary haul ramp corridors"
            elif shortfall_p50 > 1000:
                cause = "Extraction rate lag and maintenance scheduling constraints"
                rec_action = "Reschedule non-critical crusher maintenance and shift blasting to 06:00 dry slot"
            else:
                cause = "Optimal operational conditions; minimal weather attenuation"
                rec_action = "Maintain continuous face extraction tempo"

            # Compute potential recovered tonnes via scenario counterfactual
            counterfactual = evaluate_scenario_counterfactuals(
                mine_id=mine_id,
                rainfall_mm=float(cur.get("rainfall_24h_mm", 10.0)),
                fleet_availability_pct=85.0,
                pump_capacity_pct=100.0,
                downtime_hours=2.0,
                blasting_delay_hours=1.5,
                horizon_days=14
            )
            top_rec = counterfactual.get("ranked_mitigation_actions", [{}])[0]
            recovered_t = top_rec.get("tonnes_recovered", round(shortfall_p50 * 0.45, 0))

            evaluated_mines.append({
                "mine_id": mine_id,
                "mine_name": info["name"],
                "district": info["district"],
                "state": info["state"],
                "shortfall_tonnes": round(shortfall_p50, 0),
                "shortfall_p10_tonnes": round(shortfall_p10, 0),
                "shortfall_p90_tonnes": round(shortfall_p90, 0),
                "shortfall_percent": shortfall_pct,
                "risk_level": risk_lvl,
                "primary_cause": cause,
                "next_7d_rainfall_mm": round(next_7d_rain, 1),
                "soil_moisture_m3m3": round(cur_sm, 3),
                "recommended_action": rec_action,
                "estimated_recovery_tonnes": round(recovered_t, 0),
                "horizon_days": 14,
            })
        except Exception as e:
            logger.warning(f"Error computing alert for {mine_id}: {e}")

    # Rank by shortfall tonnes and shortfall percent descending
    ranked = sorted(evaluated_mines, key=lambda x: (x["shortfall_tonnes"], x["shortfall_percent"]), reverse=True)
    top_3 = ranked[:3]

    return ApiResponse(
        data={
            "top_risk_mines": top_3,
            "all_mines_evaluated": len(ranked),
            "horizon_days": 14,
            "evaluation_timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat() + "Z",
        },
        data_provenance=DataProvenance(
            status="REAL_DERIVED",
            source="Open-Meteo 16-Day Numerical Forecast (REAL) + Quantile Gradient Boosting Shortfall Engine",
            retrieved_at=datetime.datetime.now(datetime.timezone.utc).isoformat() + "Z",
        )
    )
