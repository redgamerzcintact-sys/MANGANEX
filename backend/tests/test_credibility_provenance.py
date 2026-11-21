import pytest
import zlib
from fastapi.testclient import TestClient
from app.main import app
from app.ml.forecasting.model import _generate_synthetic_history, run_production_forecast
from app.ml.prospectivity.model import run_prospectivity_model
from app.schemas.all_schemas import DataProvenance, ApiResponse

client = TestClient(app)

def test_deterministic_seeding():
    """Verify that forecasting history seeding is stable and reproducible across runs."""
    h1 = _generate_synthetic_history("mine-balaghat", days=30)
    h2 = _generate_synthetic_history("mine-balaghat", days=30)
    assert len(h1) == 30
    assert len(h2) == 30
    assert h1[0]["actual_production_tonnes"] == h2[0]["actual_production_tonnes"]
    assert h1[-1]["actual_production_tonnes"] == h2[-1]["actual_production_tonnes"]

def test_provenance_schema():
    """Verify DataProvenance model attributes."""
    dp = DataProvenance(status="REAL", source="MOIL Assay Registry")
    assert dp.status == "REAL"
    assert dp.source == "MOIL Assay Registry"
    assert dp.retrieved_at is not None

def test_health_check_model_names():
    """Verify /health reports credible scikit-learn model names (no unbacked XGBoost/ARIMA claims)."""
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    engines = data.get("intelligence_engines", {})
    assert "Random Forest + Gradient Boosting" in engines.get("geological_prospectivity", "")
    assert "Random Forest + Gradient Boosting" in engines.get("production_forecasting", "")
    assert "Surface Indicators" in engines.get("satellite_cadence", "")

def test_production_forecast_provenance():
    """Verify /production/forecast returns data_provenance."""
    resp = client.get("/api/v1/production/forecast/mine-balaghat")
    assert resp.status_code == 200
    data = resp.json()
    assert "data_provenance" in data
    prov = data["data_provenance"]
    assert prov["status"] == "DERIVED"
    assert "source" in prov
    assert "retrieved_at" in prov

def test_prospectivity_explain_provenance():
    """Verify /geology/prospects/{id}/explain returns data_provenance."""
    resp = client.get("/api/v1/geology/prospects/prospect-sauser-north/explain")
    assert resp.status_code == 200
    data = resp.json()
    assert "data_provenance" in data
    prov = data["data_provenance"]
    assert prov["status"] == "DERIVED"
    assert "Random Forest + Gradient Boosting" in prov["source"]

