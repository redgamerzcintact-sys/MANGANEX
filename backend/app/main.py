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

import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.database.session import engine, Base, SessionLocal
from app.scripts.seed_demo_data import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_database(db)
db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Geospatial Intelligence & Decision Backend for Manganese Exploration and Production (Ministry of Steel / MOIL Limited)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database": "CONNECTED",
        "intelligence_engines": {
            "geological_prospectivity": "ACTIVE (XGBoost/RF)",
            "satellite_cadence": "ACTIVE (Sentinel-2 / Landsat-9)",
            "production_forecasting": "ACTIVE (SARIMA / Regressor)",
            "nexus_copilot": "READY"
        },
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["Root"])
def root_status():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "THE EARTH'S HIDDEN INTELLIGENCE",
        "docs": f"{settings.API_V1_STR}/docs",
        "api_v1": settings.API_V1_STR
    }

