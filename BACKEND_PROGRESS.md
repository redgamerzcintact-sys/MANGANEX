# MANGANEX — BACKEND ENGINEERING STATUS & INTEGRATION REPORT
**THE EARTH'S HIDDEN INTELLIGENCE**  
*Enterprise AI, Geospatial Intelligence & Mining Analytics Platform*  
*Ministry of Steel / MOIL Limited Mining Corridor*

---

## 1. SYSTEM ARCHITECTURE & RUNNING SERVICES

| Component | Framework / Runtime | Port | Health Status | Verification URL |
|---|---|---|---|---|
| **Frontend Web Client** | React 18 + Vite + TailwindCSS + MapLibre + Three.js | `3000` | ✅ LIVE (HTTP 200) | `http://127.0.0.1:3000/` |
| **Java Enterprise Backend** | Spring Boot 3.3.3 + Spring Security + Data JPA (Java 25) | `8080` | ✅ LIVE (UP) | `http://127.0.0.1:8080/actuator/health` |
| **Python AI/ML Service** | FastAPI + SQLite / PostgreSQL + XGBoost + NumPy (Python 3.11) | `8000` | ✅ LIVE (HEALTHY) | `http://127.0.0.1:8000/health` |

---

## 2. COMPLETED MODULES & ENDPOINTS

### A. Centralized Authentication & Authorization (Java Spring Boot — Port 8080)
- **POST** `/api/v1/auth/login` — Verifies user credentials, validates multi-role access (Admin, Geologist, Mining Engineer, Data Analyst, Viewer), and issues HMAC-SHA512 JWT tokens with 24-hour expiration.
- **GET** `/actuator/health` — Spring Actuator health monitoring (`{"status": "UP"}`).
- **RBAC Entities**: `User`, `Role` (ROLE_ADMIN, ROLE_GEOLOGIST, ROLE_ENGINEER, ROLE_ANALYST, ROLE_VIEWER).

### B. Geological Intelligence & Mines Cadastre (Port 8000 & 8080)
- **GET** `/api/v1/mines` — MOIL mining corridor cadastre (Balaghat, Ukwa, Dongri Buzurg, Kandri, Munsar, Chikla, Tirodi) with production metrics, UNFC reserve estimates, ore grades, and active alerts.
- **GET** `/api/v1/mines/{id}` — Detailed parameters for a specific mine site.
- **GET** `/api/v1/geology/prospects` — AI-identified manganese anomalies with prospectivity scores, UNFC classifications, and drill readiness priorities.
- **GET** `/api/v1/geology/boreholes` — Subsurface borehole assays with lithological strata logs.
- **POST** `/api/v1/geology/prospectivity/score` — Custom feature evaluation model with full SHAP explainability attribution.

### C. Production Analytics & Forecasting
- **GET** `/api/v1/production/summary` — Corridor-wide production vs. target aggregates.
- **GET** `/api/v1/production/forecast/{mineId}` — 7/15/30-day ensemble forecast with confidence intervals.
- **GET** `/api/v1/production/history/{mineId}` — 90-day extraction historical series.

### D. Operational Risk & Scenario Simulation (Scenario Lab)
- **GET** `/api/v1/risks/all` — Active geotechnical, hydrological, and equipment risks.
- **GET** `/api/v1/risks/system-index` — System-wide operational risk posture index.
- **POST** `/api/v1/operations/scenarios/simulate` — Dynamic simulation engine evaluating rainfall, pump capacity, and fleet availability.

### E. NEXUS AI Copilot
- **POST** `/api/v1/nexus/chat` — Context-aware AI assistant with intent classification and tool dispatch (geology, risk assessment, production forecasting, and satellite intelligence).

### F. Satellite Intelligence & Data Hub
- **GET** `/api/v1/satellite/observations/{mineId}` — Sentinel-2 / Landsat-9 indices (NDVI, soil moisture, surface thermal bands).
- **GET** `/api/v1/datasets` & **POST** `/api/v1/datasets/upload` — Geological dataset ingestion with validation.

---

## 3. SEEDED DEMONSTRATION ACCOUNTS

All demonstration accounts are seeded with secure bcrypt hashes:

| Role | Username | Password | Organization / Jurisdiction |
|---|---|---|---|
| **Administrator** | `admin` | `ManganexAdmin2026!` | Ministry of Steel / MOIL |
| **Geologist** | `geologist` | `ManganexGeo2026!` | GSI / MOIL Exploration Wing |
| **Mining Engineer** | `engineer` | `ManganexEng2026!` | Balaghat Underground Operations |
| **Data Analyst** | `analyst` | `ManganexData2026!` | National Mineral Intelligence Unit |
| **Viewer** | `viewer` | `ManganexViewer2026!` | Public Mineral Observatory |

---

## 4. VERIFIED TEST EXECUTION RESULTS

- **Java Compilation & Packaging**: `BUILD SUCCESS` (Compiled 16 source files with release 21 into `manganex-backend-1.0.0.jar`).
- **Java Actuator Health Check**: Status `UP` (Verified via HTTP GET).
- **Java Authentication Verification**: Validated with `geologist` credentials; successfully returned signed JWT token and claims.
- **Python Fast-API Health Check**: Returned `{"status": "HEALTHY", "database": "CONNECTED", "intelligence_engines": {"geological_prospectivity": "ACTIVE", "satellite_cadence": "ACTIVE", "production_forecasting": "ACTIVE", "nexus_copilot": "READY"}}`.
- **Python Cadastre Verification**: Returned all 7 MOIL corridor mines with complete geological attributes.
- **NEXUS AI Copilot**: Successfully resolved natural language inquiry ("Forecast shortfall at Balaghat mine under monsoon surge") by dispatching tool `get_production_forecast` and returning verified variance analysis and recommendations.
- **Operations Scenario Simulation**: Successfully executed simulation with 135mm rainfall, 70% fleet availability, and 55% pump capacity, returning projected shortfall of 30,363 tonnes and "Critical" risk classification.
- **Geological Prospectivity Scoring**: Scored custom prospect (structural compatibility 92.5%, satellite score 88.0%, borehole evidence 85.0%), generating prospectivity score of 99.3% with ranked SHAP contributions (top driver: Structural Compatibility).
- **Frontend Build & Live Status**: Vite production preview serving at `http://127.0.0.1:3000/` returning HTTP `200 OK`.

---

## 5. LOCAL STARTUP PROCEDURES

To launch the full MANGANEX enterprise stack simultaneously:

### 1. Python AI Service (Port 8000)
```powershell
cd backend
python run_server.py
```

### 2. Java Enterprise Backend (Port 8080)
```powershell
cd java-backend
java -jar target/manganex-backend-1.0.0.jar
```

### 3. Frontend Web Client (Port 3000)
```powershell
node_modules\.bin\vite.cmd preview --host 127.0.0.1 --port 3000
```
