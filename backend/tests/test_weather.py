"""
Unit & Integration Tests for Weather and Soil Moisture Ingestion (Open-Meteo).
Tests live parsing, SQLite caching, HTTP failure mocking, and offline snapshot fallback.
"""
import pytest
from unittest.mock import patch
import requests
from fastapi.testclient import TestClient
from app.main import app
from app.services.weather.open_meteo import (
    get_mine_weather,
    get_weather_summary,
    load_snapshot_data,
    MINE_COORDINATES
)

client = TestClient(app)

def test_snapshot_file_integrity():
    """Verify that backend/data/weather_snapshot.json exists and contains all 7 mines."""
    snap = load_snapshot_data()
    assert "mines" in snap
    assert "provider" in snap
    for mine_id in MINE_COORDINATES.keys():
        assert mine_id in snap["mines"], f"Missing {mine_id} in weather snapshot"
        mine_data = snap["mines"][mine_id]
        assert "current" in mine_data
        assert "daily" in mine_data
        assert len(mine_data["daily"]) >= 365
        assert "soil_moisture_m3m3" in mine_data["current"]
        assert "rainfall_24h_mm" in mine_data["current"]

def test_weather_summary_endpoint():
    """GET /api/v1/weather/summary returns summary across all 7 mines with provenance."""
    resp = client.get("/api/v1/weather/summary")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert "data_provenance" in body
    data = body["data"]
    assert "mines" in data
    assert len(data["mines"]) == 7
    assert "belt_telemetry" in data
    assert "max_soil_moisture_m3m3" in data["belt_telemetry"]
    
    prov = body["data_provenance"]
    assert prov["status"] in ("REAL", "REAL_CACHED")
    assert "Open-Meteo" in prov["source"]
    assert prov["retrieved_at"] is not None

def test_mine_weather_endpoint():
    """GET /api/v1/weather/{mineId} returns daily history and forecast with provenance."""
    resp = client.get("/api/v1/weather/mine-balaghat")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert "data_provenance" in body
    data = body["data"]
    assert data["mine_id"] == "mine-balaghat"
    assert "current" in data
    assert "daily" in data
    assert len(data["daily"]) >= 365
    
    # Assert daily record structure
    day_0 = data["daily"][0]
    assert "date" in day_0
    assert "precipitation_sum" in day_0
    assert "temperature_2m_max" in day_0
    assert "temperature_2m_min" in day_0
    assert "soil_moisture_mean" in day_0
    assert "is_forecast" in day_0
    
    prov = body["data_provenance"]
    assert prov["status"] in ("REAL", "REAL_CACHED")

def test_offline_fallback_on_network_failure():
    """Mock HTTP connection error and verify graceful fallback to snapshot with REAL_CACHED."""
    # Force requests.get to fail as if network is down
    with patch("requests.get", side_effect=requests.RequestException("Network unreachable / DNS failure")):
        # Bypass cache by testing through get_mine_weather with fresh mine id or clearing cache
        with patch("app.services.weather.open_meteo.load_cached_weather", return_value=None):
            data = get_mine_weather("mine-ukwa")
            assert data["mine_id"] == "mine-ukwa"
            assert "current" in data
            assert len(data["daily"]) >= 365
            assert data["data_provenance"]["status"] == "REAL_CACHED"
            assert "Snapshot" in data["data_provenance"]["source"]

