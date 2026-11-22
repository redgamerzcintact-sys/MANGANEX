"""
Tests for Next Drill Target Recommender Endpoint & Active Learning Logic.
Endpoint: GET /api/v1/geology/drill-targets
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.prospectivity.drill_targets import compute_drill_targets, _haversine_distance_km

client = TestClient(app)


def test_compute_drill_targets_logic():
    targets = compute_drill_targets(top_k=5, nms_radius_km=1.5)
    assert len(targets) == 5

    for i, t in enumerate(targets):
        assert t["rank"] == i + 1
        assert "target_id" in t
        assert len(t["coordinates"]) == 2
        assert 0.0 <= t["probability"] <= 1.0
        assert 0.0 <= t["uncertainty"] <= 1.0
        assert t["cost_class"] in ("LOW", "MODERATE", "HIGH")
        assert len(t["top_shap_drivers"]) >= 2
        assert "indicative_disclaimer" in t
        assert "reserve estimate" in t["indicative_disclaimer"].lower() or "indicative" in t["indicative_disclaimer"].lower()

    # Verify spatial separation (NMS)
    for i in range(len(targets)):
        for j in range(i + 1, len(targets)):
            dist = _haversine_distance_km(
                targets[i]["coordinates"][0],
                targets[i]["coordinates"][1],
                targets[j]["coordinates"][0],
                targets[j]["coordinates"][1],
            )
            assert dist >= 1.2, f"Targets {i+1} and {j+1} too close ({dist:.2f} km)"


def test_api_drill_targets_endpoint():
    response = client.get("/api/v1/geology/drill-targets")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True

    data = json_data["data"]
    assert "targets" in data
    assert len(data["targets"]) == 5
    assert json_data["data_provenance"]["status"] == "DERIVED"

    first = data["targets"][0]
    assert first["rank"] == 1
    assert "probability" in first
    assert "uncertainty" in first
    assert "cost_class" in first
    assert "top_shap_drivers" in first
