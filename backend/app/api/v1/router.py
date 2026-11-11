from fastapi import APIRouter
from app.api.v1.endpoints import (
    mines, geology, operations, nexus, optimization,
    production, satellite, risk_intelligence, data_hub, auth, ai, search
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Centralized Authentication & RBAC"])
api_router.include_router(ai.router, prefix="/ai", tags=["Hugging Face & RAG Knowledge Engine"])
api_router.include_router(mines.router, prefix="/mines", tags=["Mines Cadastre"])
api_router.include_router(geology.router, prefix="/geology", tags=["Geological Intelligence"])
api_router.include_router(operations.router, prefix="/operations", tags=["Operations & Simulation"])
api_router.include_router(optimization.router, prefix="/optimization", tags=["Mine Optimization & Reports"])
api_router.include_router(nexus.router, prefix="/nexus", tags=["Nexus AI Copilot"])
api_router.include_router(production.router, prefix="/production", tags=["Production Forecasting"])
api_router.include_router(satellite.router, prefix="/satellite", tags=["Satellite Intelligence"])
api_router.include_router(risk_intelligence.router, prefix="/risks", tags=["Risk Intelligence"])
api_router.include_router(data_hub.router, prefix="/datasets", tags=["Data Hub"])
api_router.include_router(search.router, prefix="/search", tags=["Global Intelligence Search"])
