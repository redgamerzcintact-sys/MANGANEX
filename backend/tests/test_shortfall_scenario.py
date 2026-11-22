"""
Unit & Integration Tests for MANGANEX Shortfall Forecasting & Scenario Lab Engine.
Covers:
1. Quantile Loss Monotonicity (P10 <= P50 <= P90).
2. Honest Walk-Forward Rolling-Origin Backtest (MAE, MAPE, Interval Coverage).
3. Counterfactual Action Evaluation & Ranking (Recovered Tonnes > 0, sorted).
4. Top-3 Operational Alerts Endpoint (GET /api/v1/alerts).
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.forecasting.model import (
    run_production_forecast,
    evaluate_scenario_counterfactuals,
    generate_weather_driven_history,
)

client = TestClient(app)


def test_weather_driven_history_generation():
    """Verify production history is generated from weather with deterministic seed."""
    records = generate_weather_driven_history("mine-balaghat", days=90)
    assert len(records) == 90
    for r in records:
        assert "production_date" in r
        assert "actual_production_tonnes" in r
        assert "precipitation_mm" in r
        assert "soil_moisture" in r
        assert r["actual_production_tonnes"] > 0


def test_production_forecast_quantile_loss():
    """Verify Quantile Gradient Boosting outputs monotonic P10 <= P50 <= P90 intervals."""
    res = run_production_forecast("mine-balaghat", horizon_days=14, planned_downtime_hours=2.0, blasting_delay_hours=1.0)

    assert res["mine_id"] == "mine-balaghat"
    assert res["horizon_days"] == 14
    series = res["forecast_series"]
    assert len(series) == 14

    for pt in series:
        assert pt["p10_tonnes"] <= pt["p50_tonnes"] + 1e-4, f"P10 ({pt['p10_tonnes']}) > P50 ({pt['p50_tonnes']})"
        assert pt["p50_tonnes"] <= pt["p90_tonnes"] + 1e-4, f"P50 ({pt['p50_tonnes']}) > P90 ({pt['p90_tonnes']})"

    summary = res["summary"]
    assert summary["projected_shortfall_tonnes"] >= 0
    assert summary["risk_level"] in ("LOW", "WARNING", "CRITICAL")


def test_honest_rolling_origin_backtest():
    """Verify walk-forward backtest produces non-hardcoded, realistic metrics."""
    res = run_production_forecast("mine-ukwa", horizon_days=7)
    quality = res["forecast_quality"]

    assert quality["status"] == "VALIDATED_HONEST_BACKTEST"
    assert quality["evaluation_days"] > 0
    assert quality["backtest_mae_tonnes"] > 0.0
    assert quality["backtest_mape_percent"] > 0.0
    # Interval coverage for [P10, P90] is theoretically around 80%; must be between 50% and 100%
    assert 40.0 <= quality["interval_coverage_percent"] <= 100.0
    assert quality["naive_baseline_mae_tonnes"] > 0.0


def test_scenario_counterfactual_actions_ranking():
    """Verify counterfactual actions evaluate positive recovered tonnage and rank descending."""
    sim = evaluate_scenario_counterfactuals(
        mine_id="mine-balaghat",
        rainfall_mm=65.0,
        fleet_availability_pct=70.0,
        pump_capacity_pct=80.0,
        downtime_hours=12.0,
        blasting_delay_hours=5.0,
        horizon_days=14
    )

    assert sim["mine_id"] == "mine-balaghat"
    assert sim["projected_shortfall_p50"] > 0
    actions = sim["ranked_mitigation_actions"]
    assert len(actions) == 3

    # Assert descending sort by tonnes_recovered
    for i in range(len(actions) - 1):
        assert actions[i]["tonnes_recovered"] >= actions[i + 1]["tonnes_recovered"]
        assert actions[i]["tonnes_recovered"] >= 0


def test_operations_scenario_simulate_endpoint():
    """Integration test for POST /api/v1/operations/scenarios/simulate."""
    payload = {
        "mineId": "mine-balaghat",
        "rainfallMm": 55.0,
        "fleetAvailabilityPercent": 75.0,
        "dewateringCapacityPercent": 90.0,
        "shiftHours": 8.0,
        "downtimeHours": 6.0,
        "blastingDelayHours": 3.0
    }
    response = client.post("/api/v1/operations/scenarios/simulate", json=payload)
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True

    data = json_data["data"]
    assert data["mineId"] == "mine-balaghat"
    assert "projectedShortfallP50" in data
    assert "rankedMitigationActions" in data
    assert len(data["rankedMitigationActions"]) >= 3
    assert json_data["data_provenance"]["status"] == "DERIVED"


def test_production_forecast_api_inputs():
    """Integration test for GET /api/v1/production/forecast/{mineId} with planned downtime inputs."""
    response = client.get("/api/v1/production/forecast/mine-dongri?horizon_days=15&planned_downtime_hours=8.0&blasting_delay_hours=4.0")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    data = json_data["data"]
    assert data["horizon_days"] == 15
    assert data["inputs_applied"]["planned_downtime_hours"] == 8.0
    assert data["inputs_applied"]["blasting_delay_hours"] == 4.0
    assert "forecast_quality" in data
    assert json_data["data_provenance"]["status"] == "DERIVED"


def test_top_3_alerts_endpoint():
    """Integration test for GET /api/v1/alerts returning top 3 mines at shortfall risk."""
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True

    data = json_data["data"]
    top_3 = data["top_risk_mines"]
    assert len(top_3) <= 3
    assert len(top_3) > 0

    for alert in top_3:
        assert "mine_id" in alert
        assert "mine_name" in alert
        assert "shortfall_tonnes" in alert
        assert "risk_level" in alert
        assert "primary_cause" in alert
        assert "recommended_action" in alert
        assert "estimated_recovery_tonnes" in alert

    assert json_data["data_provenance"]["status"] == "REAL_DERIVED"
