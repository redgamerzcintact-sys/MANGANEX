# MANGANEX Java Backend (Experimental / Deprecated Prototype)

> [!WARNING]
> **Status: Experimental & Not Used by Frontend**
> The MANGANEX React + TypeScript production frontend communicates strictly with the high-performance **FastAPI Python ML backend** located in `backend/app/`. 
> 
> This Java Spring Boot prototype in `java-backend/` was an early exploratory harness and is retained strictly for architectural reference. It is **not** required, compiled, or called during judge evaluation, local Docker composition (`docker compose up`), or production deployment.

## Active Production Backend
Please refer to `backend/` for the authoritative backend service:
- **Framework**: FastAPI (Python 3.11+)
- **ML Engines**: Scikit-Learn (Random Forest + Gradient Boosting Spatial CV Prospectivity, Quantile GB Shortfall Forecasting)
- **Database**: SQLite with SQLAlchemy ORM
- **Interactive Documentation**: `http://127.0.0.1:8000/docs`
