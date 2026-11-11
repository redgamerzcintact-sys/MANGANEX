"""
MANGANEX - Risk Intelligence API Endpoints
GET /risks/all
POST /risks/predict
GET /risks/system-index
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Mine, RiskAssessment
from app.schemas.all_schemas import ApiResponse
from app.ml.risk.engine import predict_mine_risks, compute_system_risk_score
import datetime
import uuid

router = APIRouter()

@router.get("/all", response_model=ApiResponse)
def get_all_risks(db: Session = Depends(get_db)):
    """Get risk predictions for all mines."""
    mines = db.query(Mine).all()
    all_risks = []
    mine_risk_lists = []
    
    for mine in mines:
        mine_dict = {
            "id": mine.id,
            "mine_name": mine.mine_name,
            "rainfall_mm_24h": mine.rainfall_mm_24h,
            "active_equipment_units": mine.active_equipment_units,
            "total_equipment_units": mine.total_equipment_units,
            "geological_confidence": mine.geological_confidence,
            "mine_type": mine.mine_type,
        }
        mine_risks = predict_mine_risks(mine_dict)
        mine_risk_lists.append(mine_risks)
        
        for risk in mine_risks:
            all_risks.append({
                **risk,
                "mine_id": mine.id,
                "mine_name": mine.mine_name,
                "id": f"risk-{mine.id}-{risk['risk_type']}",
            })
    
    # Also include DB-seeded risks
    db_risks = db.query(RiskAssessment).all()
    for r in db_risks:
        mine = db.query(Mine).filter(Mine.id == r.mine_id).first()
        all_risks.append({
            "id": r.id,
            "mine_id": r.mine_id,
            "mine_name": mine.mine_name if mine else "Unknown",
            "severity": r.severity,
            "category": r.category,
            "title": r.title,
            "description": r.description,
            "probability_percent": r.probability_percent,
            "estimated_shortfall_tonnes": r.estimated_shortfall_tonnes,
            "forecast_date": r.forecast_date,
            "workflow_ripple": r.workflow_ripple,
            "recommended_action": r.recommended_action,
            "acknowledged": r.acknowledged,
            "risk_type": "seeded",
        })
    
    # Sort by severity
    severity_order = {"critical": 0, "warning": 1, "info": 2}
    all_risks.sort(key=lambda x: severity_order.get(x.get("severity", "info"), 3))
    
    system_score = compute_system_risk_score(mine_risk_lists)
    
    return ApiResponse(data={
        "risks": all_risks,
        "total_count": len(all_risks),
        "system_index": system_score,
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
    })


@router.post("/predict", response_model=ApiResponse)
def predict_risk_for_mine(payload: dict, db: Session = Depends(get_db)):
    """Predict risks for a specific mine given custom parameters."""
    mine_id = payload.get("mine_id", "mine-balaghat")
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")
    
    # Allow override of mine parameters
    mine_dict = {
        "id": mine.id,
        "mine_name": mine.mine_name,
        "rainfall_mm_24h": payload.get("rainfall_mm_24h", mine.rainfall_mm_24h),
        "active_equipment_units": payload.get("active_equipment_units", mine.active_equipment_units),
        "total_equipment_units": mine.total_equipment_units,
        "geological_confidence": mine.geological_confidence,
        "mine_type": mine.mine_type,
    }
    
    risks = predict_mine_risks(mine_dict)
    
    return ApiResponse(data={
        "mine_id": mine_id,
        "mine_name": mine.mine_name,
        "risks": [{**r, "id": f"risk-{mine_id}-{r['risk_type']}"} for r in risks],
        "total_count": len(risks),
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
    })


@router.get("/system-index", response_model=ApiResponse)
def get_system_risk_index(db: Session = Depends(get_db)):
    """Get the aggregate system-level risk index."""
    mines = db.query(Mine).all()
    mine_risk_lists = []
    
    for mine in mines:
        mine_dict = {
            "id": mine.id,
            "mine_name": mine.mine_name,
            "rainfall_mm_24h": mine.rainfall_mm_24h,
            "active_equipment_units": mine.active_equipment_units,
            "total_equipment_units": mine.total_equipment_units,
            "geological_confidence": mine.geological_confidence,
            "mine_type": mine.mine_type,
        }
        mine_risk_lists.append(predict_mine_risks(mine_dict))
    
    system_score = compute_system_risk_score(mine_risk_lists)
    
    return ApiResponse(data={
        **system_score,
        "mines_analyzed": len(mines),
        "analysis_timestamp": datetime.datetime.utcnow().isoformat(),
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
    })

