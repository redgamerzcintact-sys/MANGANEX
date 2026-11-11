import sys
import os
from importlib.machinery import (
    FileFinder,
    SourceFileLoader,
    SourcelessFileLoader,
    ExtensionFileLoader,
    SOURCE_SUFFIXES,
    BYTECODE_SUFFIXES,
    EXTENSION_SUFFIXES,
)


class CythonFallbackExtensionLoader(ExtensionFileLoader):
    def create_module(self, spec):
        try:
            return super().create_module(spec)
        except (ImportError, OSError):
            dir_name, base_name = os.path.split(spec.origin)
            simple_name = base_name.split(".")[0] + ".py"
            py_path = os.path.join(dir_name, simple_name)
            if os.path.exists(py_path):
                loader = SourceFileLoader(spec.name, py_path)
                spec.loader = loader
                spec.origin = py_path
                return loader.create_module(spec)
            raise

    def exec_module(self, module):
        if getattr(module, "__spec__", None) and isinstance(module.__spec__.loader, SourceFileLoader):
            module.__spec__.loader.exec_module(module)
            return
        try:
            super().exec_module(module)
        except (ImportError, OSError):
            dir_name, base_name = os.path.split(module.__file__)
            simple_name = base_name.split(".")[0] + ".py"
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
    (SourcelessFileLoader, BYTECODE_SUFFIXES),
]
sys.path_hooks = [FileFinder.path_hook(*loaders)]
sys.path_importer_cache.clear()

import datetime
from fastapi import FastAPI, Request
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

is_prod = settings.ENVIRONMENT.lower() == "production"

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Geospatial Intelligence & Decision Backend for Manganese Exploration and Production (Ministry of Steel / MOIL Limited)",
    openapi_url=None if is_prod else f"{settings.API_V1_STR}/openapi.json",
    docs_url=None if is_prod else f"{settings.API_V1_STR}/docs",
    redoc_url=None if is_prod else f"{settings.API_V1_STR}/redoc",
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(self), geolocation=(self)"
    if request.url.path.startswith(f"{settings.API_V1_STR}/auth"):
        response.headers["Cache-Control"] = "no-store"
        response.headers["Pragma"] = "no-cache"
    return response


# CORS configuration for frontend & Cloudflare Pages domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=settings.BACKEND_CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"],
)

# Mount API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "database": "CONNECTED",
        "intelligence_engines": {
            "geological_prospectivity": "ACTIVE (XGBoost/RF)",
            "satellite_cadence": "ACTIVE (Sentinel-2 / Landsat-9)",
            "production_forecasting": "ACTIVE (SARIMA / Regressor)",
            "nexus_copilot": "READY",
        },
        "environment": settings.ENVIRONMENT,
    }


@app.get("/", tags=["Root"])
def root_status():
    return {
        "name": settings.PROJECT_NAME,
        "tagline": "THE EARTH'S HIDDEN INTELLIGENCE",
        "docs": None if is_prod else f"{settings.API_V1_STR}/docs",
        "api_v1": settings.API_V1_STR,
    }
