"""
MANGANEX - Satellite Intelligence API Endpoints
GET /satellite/observations/{mine_id}
GET /satellite/composite/{mine_id}
POST /satellite/process
GET /satellite/anomalies
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Mine, SatelliteObservation
from app.schemas.all_schemas import ApiResponse
from app.services.satellite.processor import (
    generate_synthetic_satellite_series,
    compute_band_composite,
)
import datetime

router = APIRouter()

@router.get("/observations/{mine_id}", response_model=ApiResponse)
def get_satellite_observations(
    mine_id: str,
    days: int = Query(default=30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")
    
    observations = generate_synthetic_satellite_series(mine_id, days=days)
    
    return ApiResponse(data={
        "mine_id": mine_id,
        "mine_name": mine.mine_name,
        "observations": observations,
        "total_count": len(observations),
        "valid_count": sum(1 for o in observations if o.get("valid_observation", False)),
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
        "satellite_sources": ["Sentinel-2 MSI Level-2A"],
        "disclaimer": "All band values and indices are synthetically generated for demonstration purposes."
    })


@router.get("/composite/{mine_id}", response_model=ApiResponse)
def get_satellite_composite(
    mine_id: str,
    days: int = Query(default=30, ge=7, le=90),
    db: Session = Depends(get_db)
):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail=f"Mine '{mine_id}' not found")
    
    observations = generate_synthetic_satellite_series(mine_id, days=days)
    composite = compute_band_composite(observations)
    
    return ApiResponse(data={
        "mine_id": mine_id,
        "mine_name": mine.mine_name,
        "composite_period_days": days,
        "composite": composite,
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
    })


@router.get("/anomalies", response_model=ApiResponse)
def get_spectral_anomalies(db: Session = Depends(get_db)):
    """Get all recent spectral anomalies across all mines."""
    mines = db.query(Mine).all()
    anomalies = []
    
    for mine in mines:
        observations = generate_synthetic_satellite_series(mine.id, days=14)
        for obs in observations:
            if obs.get("spectral_anomaly_detected") and obs.get("valid_observation"):
                anomalies.append({
                    "mine_id": mine.id,
                    "mine_name": mine.mine_name,
                    "observation_date": obs["observation_date"],
                    "anomaly_type": obs.get("anomaly_type"),
                    "swir_alteration_index": obs.get("swir_alteration_index"),
                    "iron_oxide_ratio": obs.get("iron_oxide_ratio"),
                    "latitude": obs.get("latitude", mine.latitude),
                    "longitude": obs.get("longitude", mine.longitude),
                })
    
    # Sort by date desc
    anomalies.sort(key=lambda x: x["observation_date"], reverse=True)
    
    return ApiResponse(data={
        "anomalies": anomalies,
        "total_count": len(anomalies),
        "monitoring_period_days": 14,
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
    })


@router.get("/status", response_model=ApiResponse)
def get_satellite_status(db: Session = Depends(get_db)):
    """Get current satellite coverage status across all mines."""
    mines = db.query(Mine).all()
    status_list = []
    
    for mine in mines:
        obs = generate_synthetic_satellite_series(mine.id, days=7)
        valid = [o for o in obs if o.get("valid_observation")]
        last_valid = valid[-1] if valid else None
        
        status_list.append({
            "mine_id": mine.id,
            "mine_name": mine.mine_name,
            "last_valid_observation": last_valid["observation_date"] if last_valid else None,
            "cloud_coverage_percent": last_valid["cloud_coverage_percent"] if last_valid else 100,
            "ndvi": last_valid.get("ndvi") if last_valid else None,
            "soil_moisture": last_valid.get("soil_moisture") if last_valid else None,
            "land_surface_temperature_c": last_valid.get("land_surface_temperature_c") if last_valid else None,
            "rainfall_mm": last_valid.get("rainfall_mm") if last_valid else None,
            "anomaly_detected": last_valid.get("spectral_anomaly_detected", False) if last_valid else False,
            "telemetry_status": "ACTIVE" if last_valid else "CLOUD_MASKED",
        })
    
    return ApiResponse(data={
        "mines": status_list,
        "coverage_active_count": sum(1 for s in status_list if s["telemetry_status"] == "ACTIVE"),
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
        "satellite_constellation": "Sentinel-2A/2B (ESA Copernicus)",
        "revisit_frequency_days": 5,
    })

