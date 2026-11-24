"""
Integration tests for MANGANEX API contracts and Single Source of Truth invariants.
Validates:
1. Reconciled forecasting calculation path:
   target (t), output P50 (t), shortfall = max(0, target - output)
   sum(driver_tonnes) == shortfall
   sum(action_tonnes) == projected recovery
2. Unified metrics single source of truth (MOIL calibrated numbers).
3. Real STAC metadata and Sentinel-2 scene counts ("6 of 7 scenes usable").
4. Real Open-Meteo weather caching and provenance.
5. Request tracing: X-Correlation-ID and X-Response-Time-Ms headers.
6. Pydantic input validation failure modes.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_contract():
    """Verify /health returns system status and correlation tracing headers."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "HEALTHY"
    assert "X-Correlation-ID" in response.headers
    assert "X-Response-Time-Ms" in response.headers


def test_unified_mine_metrics_single_source_of_truth():
    """Verify single source of truth across all canonical MOIL mines."""
    response = client.get("/api/v1/mines/metrics/unified")
    assert response.status_code == 200
    payload = response.json()
    data = payload["data"]
    
    mines_list = data["mines"]
    balaghat = next((m for m in mines_list if m["id"] == "mine-balaghat"), None)
    assert balaghat is not None
    # Check calibrated canonical values
    assert balaghat["monthly_target_tonnes"] == 45000.0
    assert balaghat["current_output_tonnes"] == 42800.0
    assert balaghat["deficit_tonnes"] == 2200.0
    assert balaghat["reserves_mt"] == 23.4
    assert balaghat["ore_grade_mn_percent"] == 43.5


def test_forecast_calculation_path_reconciliation():
    """
    CRITICAL CONTRACT:
    target (t)
    output P50 (t)
    shortfall (t) = max(0, target - output)
    ranked drivers: sum(driver_tonnes) == shortfall
    recommended actions: sum(action_tonnes) == projected recovery
    """
    response = client.get("/api/v1/production/forecast/mine-balaghat?horizon_days=30")
    assert response.status_code == 200
    payload = response.json()
    data = payload["data"]
    summary = data["summary"]

    target = summary["horizon_target_tonnes"]
    output_p50 = summary["forecast_total_tonnes"]
    shortfall = summary["projected_shortfall_tonnes"]

    # 1. Shortfall formula reconciliation
    expected_shortfall = round(max(0.0, target - output_p50), 0)
    assert shortfall == expected_shortfall, f"Shortfall {shortfall} != expected {expected_shortfall}"

    # 2. Driver sum == shortfall
    ranked_drivers = data.get("ranked_drivers", [])
    assert len(ranked_drivers) == 4, "Must provide 4 ranked drivers (rainfall, downtime, blasting, haulage)"
    driver_sum = sum(d["tonnes_lost"] for d in ranked_drivers)
    assert driver_sum == shortfall, f"Sum of drivers ({driver_sum}) must exactly equal shortfall ({shortfall})"

    # 3. Action sum == projected recovery
    recommended_actions = data.get("recommended_actions", [])
    assert len(recommended_actions) == 3, "Must provide 3 actionable recovery measures"
    total_recovery = data["total_recovery_tonnes"]
    action_sum = sum(a["tonnes_recovered"] for a in recommended_actions)
    assert action_sum == total_recovery, f"Sum of actions ({action_sum}) must equal total recovery ({total_recovery})"

    # 4. Gap start date and weather note
    assert "gap_start_date" in summary
    assert "weather beyond day 16" in summary.get("weather_horizon_note", "").lower()


def test_satellite_stac_contract():
    """Verify satellite observations return real STAC scene metadata and usable count."""
    response = client.get("/api/v1/satellite/observations/mine-balaghat?days=30")
    assert response.status_code == 200
    payload = response.json()
    data = payload["data"]

    assert "observations" in data
    assert len(data["observations"]) > 0
    assert "usable_count" in data
    assert "cloud_masked_count" in data
    assert "scene_count_label" in data
    assert "usable" in data["scene_count_label"].lower()

    # Verify presence of real STAC scene ID on valid observations
    valid_obs = [o for o in data["observations"] if o.get("valid_observation")]
    assert len(valid_obs) > 0
    first_valid = valid_obs[0]
    assert "stac_scene_id" in first_valid
    assert "S2" in first_valid["stac_scene_id"]
    assert "sources" in first_valid
    assert "Sentinel-2" in first_valid["sources"]["vegetation_indices"]


def test_open_meteo_weather_contract():
    """Verify Open-Meteo weather endpoint returns real daily precipitation and soil moisture."""
    response = client.get("/api/v1/weather/mine-balaghat")
    assert response.status_code == 200
    payload = response.json()
    data = payload["data"]

    assert data["mine_id"] == "mine-balaghat"
    assert "daily" in data
    assert len(data["daily"]) > 0
    first_day = data["daily"][0]
    assert "precipitation_sum" in first_day
    assert "soil_moisture_mean" in first_day
    assert "data_provenance" in payload
    assert "Open-Meteo" in payload["data_provenance"]["source"]


def test_input_validation_and_error_handling():
    """Verify standard HTTP status codes and detailed validation messages."""
    # 404 Not Found for non-existent mine
    r_404 = client.get("/api/v1/production/forecast/mine-nonexistent")
    assert r_404.status_code == 404
    assert "not found" in r_404.json()["detail"].lower()

    # 422 Unprocessable Entity for invalid query params
    r_422 = client.get("/api/v1/production/forecast/mine-balaghat?horizon_days=999")
    assert r_422.status_code == 422
    assert "detail" in r_422.json()
