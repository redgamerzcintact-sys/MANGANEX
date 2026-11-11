# MANGANEX — IMPLEMENTATION & ARCHITECTURAL STATUS
**THE EARTH'S HIDDEN INTELLIGENCE**  
*Enterprise Geospatial Intelligence & Mining Optimization Platform*  
*Ministry of Steel / MOIL Limited Mining Corridor*

---

## 1. RUNTIME & SERVICE ARCHITECTURE

| Layer | Runtime / Engine | Port | Status | Health & Verification Endpoint |
|---|---|---|---|---|
| **Frontend Web Client** | React 18 + Vite 6 + TailwindCSS + Three.js | `3000` | **LIVE (HTTP 200)** | `http://127.0.0.1:3000/` |
| **Java Enterprise Backend** | Spring Boot 3.3.3 + Spring Security + Data JPA (Java 25) | `8080` | **UP (Actuator Live)** | `http://127.0.0.1:8080/actuator/health` |
| **Python AI & RAG Engine** | FastAPI + NumPy + XGBoost + SQLite (Python 3.11) | `8000` | **HEALTHY** | `http://127.0.0.1:8000/health` |

---

## 2. COMPLETED FEATURE MODULES

### A. Centralized Identity & Access Management (Zero Mock / No Demo Login)
- **Role Clearance Selector**: Placed cleanly below the primary login form as directed.
- **Enterprise Fields**: Official identifier / email input, access key input with toggle visibility, remember session toggle, and forgot password modal.
- **Server-Side Enforcement**: All permissions are validated and enforced on the backend via HMAC-SHA512 signed JWTs.
- **5 Granular Enterprise Roles**:
  1. `ROLE_ADMIN` — System governance, audit logs, dataset deletion, user management.
  2. `ROLE_GEOLOGIST` — Borehole assays, geological formations, prospectivity runs, 3D subsurface digital twin.
  3. `ROLE_ENGINEER` — Underground haulage, fleet allocation, bench progression, shortfall mitigation.
  4. `ROLE_ANALYST` — Dataset governance, Sentinel-2 spectral indices, model validation, analytics reports.
  5. `ROLE_VIEWER` — Authorized read-only dashboards, approved maps, and compliance reports.

### B. Dark & Light Theme System
- **Geological Dark Mode (Default)**: `#080C12` background, `#101927` panel surface, `#152235` elevated, `#1C3045` borders, `#54D8E8` primary cyan accent.
- **Research Light Mode**: `#F5F7FA` background, `#FFFFFF` panels, `#F8FAFC` elevated, `#DCE4EC` borders, `#087F9B` primary teal accent, `#172333` primary text.
- **Persistence**: Synced with `localStorage.getItem('manganex_theme')` and applied via CSS root variables and HTML classes.

### C. Hugging Face & RAG Knowledge Engine
- **Provider Architecture**: Configurable via `HF_TOKEN`, `HF_MODEL_ID` (`meta-llama/Llama-3.2-3B-Instruct`), and `HF_EMBEDDING_MODEL` (`sentence-transformers/all-MiniLM-L6-v2`).
- **Dense Vector Search**: Multi-dimensional semantic embedding and lexical ranking over official MOIL stratigraphy reports, UNFC-1997/2009 standards, and Sentinel-2 index methodologies.
- **Verified Citations**: All RAG answers return source document title, section, page number, and relevance scores.

### D. NEXUS AI Copilot & Voice Interaction
- **Web Speech API**: Live Speech-to-Text with pulse animation, interim transcript rendering, and auto-submit.
- **Speech Synthesis**: Text-to-Speech audio readout with mute, cancel, and pitch/rate controls.
- **Tool Calling**: Backend intent dispatch calling live ML models:
  - `get_production_forecast`
  - `get_risk_assessment`
  - `get_prospect_analysis`
  - `get_satellite_intel`
  - `search_knowledge_base`

### E. Geological AI & Machine Learning
- **Prospectivity Scoring**: Evaluates structural compatibility, satellite alterations, borehole density, and iron oxide indices, generating probability scores with ranked SHAP evidence.
- **Production Forecasting**: Multi-variable time-series regression with 7/15/30-day forecast horizons, uncertainty bounds, and monsoon inflow attenuation.

### F. Enterprise Profile & Settings Hub
- Accessible via `/settings`, displays live authenticated user details, server-verified permissions, JWT token rotation button, theme toggle, voice options, and telemetry cadence.

---

## 3. VERIFIED API ENDPOINTS

| Endpoint | Method | Layer | Status | Purpose |
|---|---|---|---|---|
| `/api/v1/auth/login` | POST | Java (8080) & Python (8000) | ✅ Tested | Authenticates user and issues HMAC-SHA512 JWT |
| `/api/v1/auth/me` | GET | Java (8080) & Python (8000) | ✅ Tested | Returns user identity, role, and granular permissions |
| `/api/v1/auth/refresh` | POST | Java (8080) & Python (8000) | ✅ Tested | Rotates and extends JWT session token |
| `/api/v1/auth/forgot-password` | POST | Java (8080) & Python (8000) | ✅ Tested | Issues password recovery token |
| `/api/v1/auth/reset-password` | POST | Java (8080) & Python (8000) | ✅ Tested | Updates password hash with enterprise complexity |
| `/api/v1/auth/logout` | POST | Java (8080) & Python (8000) | ✅ Tested | Revokes token and terminates session |
| `/api/v1/ai/status` | GET | Python (8000) | ✅ Tested | Reports Hugging Face provider & vector memory state |
| `/api/v1/ai/documents` | GET/POST | Python (8000) | ✅ Tested | Ingests, chunks, and lists indexed RAG documents |
| `/api/v1/ai/search` | POST | Python (8000) | ✅ Tested | Semantic vector search across technical literature |
| `/api/v1/nexus/chat` | POST | Python (8000) | ✅ Tested | Intent-aware reasoning copilot with tool execution |
| `/api/v1/mines` | GET | Python (8000) & Java (8080) | ✅ Tested | MOIL 7-mine cadastre with production metrics |
| `/api/v1/geology/prospects` | GET | Python (8000) | ✅ Tested | AI-identified manganese anomalies with UNFC codes |
| `/api/v1/geology/prospectivity/score` | POST | Python (8000) | ✅ Tested | Feature scoring with SHAP explainability attribution |
| `/api/v1/operations/scenarios/simulate` | POST | Python (8000) | ✅ Tested | Future fork simulation (rainfall, fleet, pumps) |

---

## 4. VERIFIED TEST RESULTS

1. **Java Compilation**: `BUILD SUCCESS` (18 source files compiled with Java 25 release 21 into `manganex-backend-1.0.0.jar`).
2. **Frontend Build**: `npm run build` completed in 11.07s with **zero TypeScript errors**.
3. **Authentication Verification**:
   - Tested `/api/v1/auth/login` with `geologist` (`ManganexGeo2026!`). Returned signed JWT token.
   - Tested `/api/v1/auth/me` with Bearer token. Verified 6 assigned permissions (`GEOLOGY_READ`, `BOREHOLE_ASSAY_VIEW`, etc.).
4. **RAG Vector Search Verification**:
   - Query: *"What strata hosts the braunite manganese ore at Balaghat Bharweli?"*
   - Retrieved Top Chunk: `chk-7d1627ee` from *"MOIL Balaghat Underground Geology & Strata Assessment"* (Relevance Score: 1.343).
5. **NEXUS Tool Execution Verification**:
   - Natural language query successfully triggered `get_production_forecast` and returned verified variance calculations and recommendations.

---

## 5. LOCAL AUTO-STARTUP INSTRUCTIONS

- **Automatic**: Running silently via Windows Startup (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MANGANEX_AutoStart.vbs`).
- **Manual Launch**: Double-click **`MANGANEX Launch.lnk`** on your Desktop or run `START_MANGANEX.bat`.

