from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import GeologicalProspect, Borehole
from app.schemas.all_schemas import ApiResponse
from app.ml.prospectivity.model import run_prospectivity_model

router = APIRouter()

@router.get("/prospects", response_model=ApiResponse)
def get_all_prospects(db: Session = Depends(get_db)):
    prospects = db.query(GeologicalProspect).all()
    result = []
    for p in prospects:
        result.append({
            "id": p.id,
            "name": p.name,
            "coordinates": [p.latitude, p.longitude],
            "region": p.region,
            "state": p.state,
            "prospectivityScore": p.prospectivity_score,
            "confidenceScore": p.confidence_score,
            "unfcStatus": p.unfc_status,
            "depthMetersEstimated": [p.depth_min_m, p.depth_max_m],
            "estimatedTonnagePotentialMt": p.estimated_tonnage_potential_mt,
            "primaryLithology": p.primary_lithology,
            "structuralCompatibility": p.structural_compatibility,
            "satelliteIndicatorScore": p.satellite_indicator_score,
            "boreholeEvidenceScore": p.borehole_evidence_score,
            "validationPriority": p.validation_priority,
            "surfaceIndicators": p.surface_indicators,
            "nearbyBoreholesCount": p.nearby_boreholes_count,
            "recommendedAction": p.recommended_action,
            "radarMetrics": p.radar_metrics,
            "data_status": "VALIDATED_SYNTHETIC_DEMO",
        })
    return ApiResponse(data=result)


@router.get("/boreholes", response_model=ApiResponse)
def get_all_boreholes(db: Session = Depends(get_db)):
    boreholes = db.query(Borehole).all()
    result = []
    for b in boreholes:
        result.append({
            "id": b.id,
            "mineId": b.mine_id,
            "boreholeCode": b.borehole_code,
            "coordinates": [b.latitude, b.longitude],
            "depthM": b.depth_m,
            "collarElevationM": b.collar_elevation_m,
            "drilledYear": b.drilled_year,
            "strata": b.strata,
            "verificationStatus": b.verification_status,
        })
    return ApiResponse(data=result)


@router.get("/prospects/{prospect_id}/explain", response_model=ApiResponse)
def explain_prospect_ai(prospect_id: str, db: Session = Depends(get_db)):
    p = db.query(GeologicalProspect).filter(GeologicalProspect.id == prospect_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Prospect not found")
    
    # Run ML model
    features = {
        "structural_compatibility": p.structural_compatibility,
        "satellite_indicator_score": p.satellite_indicator_score,
        "borehole_evidence_score": p.borehole_evidence_score,
        "geological_confidence": p.confidence_score,
        "depth_min_m": p.depth_min_m,
        "ndvi_anomaly": 0.14,
        "soil_moisture_index": 0.61,
        "land_surface_temp_anomaly_c": 2.3,
        "iron_oxide_ratio": 0.74,
        "drainage_anomaly_score": 78.0,
    }
    ml_result = run_prospectivity_model(features)
    
    explanation = {
        "prospect_id": p.id,
        "name": p.name,
        "region": p.region,
        "unfc_status": p.unfc_status,
        "ml_prospectivity_score": ml_result["prospectivity_score"],
        "db_prospectivity_score": p.prospectivity_score,
        "confidence_band": ml_result["confidence_band"],
        "top_driver": ml_result["top_driver"],
        "shap_contributions": ml_result["shap_contributions"],
        "model_metadata": ml_result["model_metadata"],
        "scientific_rationale": (
            f"The {p.name} zone exhibits high SWIR alteration (Sentinel-2 Band 11/12) consistent with "
            f"hydrothermal Mn-oxide gossans along the {p.region} formation. "
            f"Structural compatibility analysis indicates {p.structural_compatibility}% conformity with the regional "
            f"anticlinal fold axis. {p.nearby_boreholes_count} proximal boreholes confirm Mn-bearing horizons "
            f"between {p.depth_min_m}m and {p.depth_max_m}m depth."
        ),
        "uncertainty_index": round(100 - p.confidence_score, 1),
        "recommended_action": p.recommended_action,
        "disclaimer": "ML prospectivity score is NOT a UNFC mineral reserve estimate. Field validation required.",
    }
    return ApiResponse(data=explanation)


@router.post("/prospectivity/score", response_model=ApiResponse)
def score_custom_prospect(features: dict, db: Session = Depends(get_db)):
    """Score a custom prospect through the ML prospectivity engine."""
    result = run_prospectivity_model(features)
    return ApiResponse(data=result)
