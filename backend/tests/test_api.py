import sys
import os
import importlib.machinery
from importlib.machinery import FileFinder, SourceFileLoader, SourcelessFileLoader, ExtensionFileLoader, SOURCE_SUFFIXES, BYTECODE_SUFFIXES, EXTENSION_SUFFIXES

class CythonFallbackExtensionLoader(ExtensionFileLoader):
    def create_module(self, spec):
        try:
            return super().create_module(spec)
        except (ImportError, OSError):
            dir_name, base_name = os.path.split(spec.origin)
            simple_name = base_name.split('.')[0] + '.py'
            py_path = os.path.join(dir_name, simple_name)
            if os.path.exists(py_path):
                loader = SourceFileLoader(spec.name, py_path)
                spec.loader = loader
                spec.origin = py_path
                return loader.create_module(spec)
            raise

    def exec_module(self, module):
        if getattr(module, '__spec__', None) and isinstance(module.__spec__.loader, SourceFileLoader):
            module.__spec__.loader.exec_module(module)
            return
        try:
            super().exec_module(module)
        except (ImportError, OSError):
            dir_name, base_name = os.path.split(module.__file__)
            simple_name = base_name.split('.')[0] + '.py'
            py_path = os.path.join(dir_name, simple_name)
            if os.path.exists(py_path):
                loader = SourceFileLoader(module.__name__, py_path)
                module.__file__ = py_path
                loader.exec_module(module)
            else:
                raise

loaders = [
    (CythonFallbackExtensionLoader, EXTENSION_SUFFIXES),
    (SourceFileLoader, SOURCE_SUFFIXES),
    (SourcelessFileLoader, BYTECODE_SUFFIXES)
]
sys.path_hooks = [FileFinder.path_hook(*loaders)]
sys.path_importer_cache.clear()

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "HEALTHY"

def test_mines_list():
    res = client.get("/api/v1/mines")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["data"]) >= 7

def test_geology_prospects():
    res = client.get("/api/v1/geology/prospects")
    assert res.status_code == 200
    assert res.json()["success"] is True

def test_future_fork_simulation():
    payload = {
        "mineId": "mine-balaghat",
        "rainfallMm": 120.0,
        "fleetAvailabilityPercent": 75.0,
        "dewateringCapacityPercent": 60.0,
        "shiftHours": 8.0
    }
    res = client.post("/api/v1/operations/scenarios/simulate", json=payload)
    assert res.status_code == 200
    body = res.json()["data"]
    assert body["projectedShortfallTonnes"] > 0
    assert body["riskIndex"] in ["Critical", "Moderate", "Low"]

def test_nexus_chat():
    payload = {"query": "What is the primary risk at Balaghat mine?"}
    res = client.post("/api/v1/nexus/chat", json=payload)
    assert res.status_code == 200
    assert "answer" in res.json()["data"]
    assert res.json()["data"]["confidence"] > 0.8
