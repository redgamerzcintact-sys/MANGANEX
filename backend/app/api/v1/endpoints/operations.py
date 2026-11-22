from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import RiskAssessment, Mine
from app.schemas.all_schemas import ApiResponse, ScenarioInput, DataProvenance
from app.ml.forecasting.model import evaluate_scenario_counterfactuals

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
    
    dt_h = getattr(input_data, "downtimeHours", 0.0) or 0.0
    blast_h = getattr(input_data, "blastingDelayHours", 0.0) or 0.0

    eval_result = evaluate_scenario_counterfactuals(
        mine_id=input_data.mineId,
        rainfall_mm=input_data.rainfallMm,
        fleet_availability_pct=input_data.fleetAvailabilityPercent,
        pump_capacity_pct=input_data.dewateringCapacityPercent,
        downtime_hours=dt_h,
        blasting_delay_hours=blast_h,
        shift_hours=input_data.shiftHours,
        horizon_days=30  # evaluate on monthly baseline
    )

    baseline = mine.planned_monthly_target_tonnes if mine else eval_result["target_tonnes"]
    simulated_tonnes = eval_result["simulated_production_p50"]
    shortfall = eval_result["projected_shortfall_p50"]
    top_recovery = eval_result["ranked_mitigation_actions"][0]["tonnes_recovered"] if eval_result["ranked_mitigation_actions"] else 0.0

    risk_title = "Critical" if eval_result["risk_level"] == "CRITICAL" else "Moderate" if eval_result["risk_level"] == "WARNING" else "Low"

    data = {
        "mineId": input_data.mineId,
        "baselineMonthlyTonnes": baseline,
        "simulatedMonthlyTonnes": simulated_tonnes,
        "projectedShortfallTonnes": shortfall,
        "projectedShortfallP10": eval_result["projected_shortfall_p10"],
        "projectedShortfallP50": eval_result["projected_shortfall_p50"],
        "projectedShortfallP90": eval_result["projected_shortfall_p90"],
        "simulatedProductionP10": eval_result["simulated_production_p10"],
        "simulatedProductionP50": eval_result["simulated_production_p50"],
        "simulatedProductionP90": eval_result["simulated_production_p90"],
        "estimatedRecoveryTonnes": top_recovery,
        "capacityUtilizationPercent": eval_result["capacity_utilization_percent"],
        "riskIndex": risk_title,
        "riskLevel": eval_result["risk_level"],
        "rankedMitigationActions": eval_result["ranked_mitigation_actions"],
        "assumptionsApplied": eval_result["assumptions_applied"],
        "calculationEngineVersion": "MANGANEX-Quantile-SimEngine-v2.5"
    }

    return ApiResponse(
        data=data,
        data_provenance=DataProvenance(
            status="DERIVED",
            source="Parametric Counterfactual Mine Simulator (docs/simulation.md)",
        )
    )
