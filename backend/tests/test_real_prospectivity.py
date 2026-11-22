"""
Unit and Integration Tests for Real Prospectivity ML Pipeline.
Verifies spatial block cross-validation metrics, real SHAP drivers, model card,
and precomputed 500m prospectivity grid endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.ml.prospectivity.model import get_model_card, get_prospectivity_grid, run_prospectivity_model

client = TestClient(app)

def test_model_card_contents_and_limitations():
    """Verify model card has real spatial block CV metrics and required limitation statement."""
    card = get_model_card()
    assert "metrics" in card
    metrics = card["metrics"]
    assert "spatial_cv_roc_auc" in metrics
    assert "spatial_cv_pr_auc" in metrics
    assert "naive_baseline_pr_auc" in metrics
    assert metrics["spatial_cv_roc_auc"] > 0.8
    assert metrics["spatial_cv_pr_auc"] > metrics["naive_baseline_pr_auc"]
    
    # Non-negotiable limitation assertion
    assert "limitations" in card
    limitations_text = " ".join(card["limitations"])
    assert "Surface indicators only" in limitations_text
    assert "labels are public occurrences, not MOIL drill data" in limitations_text

def test_prospectivity_grid_geojson_properties():
    """Verify precomputed 500m grid has probability, uncertainty, and top-3 SHAP drivers."""
    grid = get_prospectivity_grid()
    assert grid.get("type") == "FeatureCollection"
    features = grid.get("features", [])
    assert len(features) > 100
    
    sample = features[0]["properties"]
    assert "probability" in sample
    assert "uncertainty" in sample
    assert "top_shap_drivers" in sample
    assert len(sample["top_shap_drivers"]) == 3
    assert 0.0 <= sample["probability"] <= 1.0
    assert 0.0 <= sample["uncertainty"] <= 1.0

def test_api_prospectivity_model_card():
    """GET /api/v1/geology/prospectivity/model-card returns 200 with REAL provenance."""
    resp = client.get("/api/v1/geology/prospectivity/model-card")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert "data_provenance" in body
    prov = body["data_provenance"]
    assert prov["status"] == "REAL"
    assert "Spatial Block" in prov["source"]
    assert "limitations" in body["data"]

def test_api_prospectivity_grid():
    """GET /api/v1/geology/prospectivity/grid returns 200 with DERIVED provenance."""
    resp = client.get("/api/v1/geology/prospectivity/grid")
    assert resp.status_code == 200
    body = resp.json()
    assert "data" in body
    assert body["data"]["type"] == "FeatureCollection"
    assert "data_provenance" in body
    assert body["data_provenance"]["status"] == "DERIVED"

def test_run_prospectivity_model_attribution():
    """Verify run_prospectivity_model returns SHAP-grounded attributions and uncertainty."""
    res = run_prospectivity_model({
        "iron_oxide_ratio": 0.82,
        "swir_ratio": 0.76,
        "fault_dist_km": 0.8,
        "elevation_m": 350.0,
        "slope_deg": 4.5,
        "ndvi": 0.20
    })
    assert "prospectivity_score" in res
    assert res["prospectivity_score"] > 60.0
    assert "shap_contributions" in res
    assert len(res["shap_contributions"]) >= 5
    assert "uncertainty_score" in res

