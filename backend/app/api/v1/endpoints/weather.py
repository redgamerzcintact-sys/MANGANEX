"""
Weather and Soil Moisture Endpoints for MANGANEX.
Integrates real Open-Meteo archive and 16-day forecast data.
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.all_schemas import ApiResponse, DataProvenance
from app.services.weather.open_meteo import (
    get_mine_weather,
    get_weather_summary,
    MINE_COORDINATES
)

router = APIRouter()

@router.get("/summary", response_model=ApiResponse)
def get_all_mines_weather_summary(db: Session = Depends(get_db)):
    """
    Returns regional weather & soil moisture telemetry across all 7 MOIL manganese mines,
    including 24h precipitation, 7-day predicted rainfall, soil moisture status, and shortfall risk correlation.
    """
    try:
        data = get_weather_summary()
        prov_data = data.get("data_provenance", {})
        prov = DataProvenance(
            status=prov_data.get("status", "REAL"),
            source=prov_data.get("source", "Open-Meteo Archive (ERA5) & Forecast API"),
            retrieved_at=prov_data.get("retrieved_at")
        )
        return ApiResponse(data=data, data_provenance=prov)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate weather summary: {str(e)}")

@router.get("/{mine_id}", response_model=ApiResponse)
def get_mine_weather_telemetry(mine_id: str, db: Session = Depends(get_db)):
    """
    Returns full 365-day historical weather + 16-day forecast with daily precipitation,
    temperature max/min, and soil moisture (0-7cm) for the specified mine.
    """
    try:
        data = get_mine_weather(mine_id)
        prov_data = data.get("data_provenance", {})
        prov = DataProvenance(
            status=prov_data.get("status", "REAL"),
            source=prov_data.get("source", "Open-Meteo Archive (ERA5) & Forecast API"),
            retrieved_at=prov_data.get("retrieved_at")
        )
        return ApiResponse(data=data, data_provenance=prov)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Weather telemetry for mine '{mine_id}' unavailable: {str(e)}")

