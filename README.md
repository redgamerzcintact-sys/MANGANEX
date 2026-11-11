# MANGANEX — The Earth's Hidden Intelligence
## AI-Powered Geological Exploration & Mining Operations Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![Python](https://img.shields.io/badge/FastAPI-Python_3.11-009688.svg)](https://fastapi.tiangolo.com/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.3-6DB33F.svg)](https://spring.io/projects/spring-boot)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black.svg)](https://threejs.org/)
[![Google Maps](https://img.shields.io/badge/Google_Maps-API_v3-4285F4.svg)](https://developers.google.com/maps)
[![Sentinel-2](https://img.shields.io/badge/Copernicus-Sentinel--2_MSI-003399.svg)](https://sentinels.copernicus.eu/)

Built for the **Ministry of Steel National Mining Intelligence Initiative** & **MOIL Limited**.  
*Fusing Remote Sensing, 3D Lithological Modeling, Explainable Machine Learning, and Real-Time IoT Telemetry to Discover High-Grade Manganese Reserves and Prevent Extraction Shortfalls.*

---

## 🏛️ Executive Architecture

MANGANEX is an integrated three-tier enterprise mining intelligence platform:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MANGANEX MISSION WEB APPLICATION                      │
│        React 19 • TypeScript • Tailwind CSS • Three.js WebGL • Recharts      │
│      Google Maps JavaScript API v3 • MapLibre GL • Web Speech STT / TTS      │
└───────────────────────▲─────────────────────────────▲───────────────────────┘
                        │ HTTP / JSON                 │ SSE / WebSockets
                        ▼                             ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     JAVA SPRING BOOT ENTERPRISE      │  │        PYTHON FASTAPI AI          │
│            (Port 8080)               │  │           (Port 8000)             │
│ • Zero-Trust IAM & RBAC Security     │  │ • 17 Geospatial Application Tools │
│ • BCrypt / Argon2 Password Hashing   │  │ • Multilingual NLP (26 Languages) │
│ • Audit Logging & Regulatory Reports │  │ • Sentinel-2 SWIR / NDVI Pipeline │
│ • UNFC 111/122 Resource Accounting   │  │ • XGBoost + RF Prospectivity AI   │
│ • JPA / Hibernate / H2 & PostgreSQL  │  │ • Dense Vector RAG (pgvector)     │
└──────────────────────────────────────┘  └───────────────────────────────────┘
```

---

## 🚀 Key Systems & Capabilities

### 1. 🤖 NEXUS AI Multilingual Geospatial Assistant
- **17 Application Tools:** Orchestrates real backend tools including `get_mine_details`, `get_formation_lithology`, `get_borehole_assays`, `get_swir_alteration`, `get_production_forecast`, `get_fleet_telemetry`, `run_prospectivity_score`, and `generate_geological_report`.
- **26 Languages Supported:**
  - *13 Indian Languages:* English, Hindi (हिन्दी), Marathi (मराठी), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Gujarati (ગુજરાતી), Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Punjabi (ਪੰਜਾਬੀ), Urdu (اردو), Odia (ଓଡ଼ିଆ), Assamese (অসমীয়া).
  - *13 International Languages:* Spanish, French, German, Japanese, Chinese, Arabic, Russian, Portuguese, Italian, Korean, Turkish, Indonesian, Persian.
- **ChatGPT-Grade User Experience:**
  - Conversation search, pinning/unpinning, rename, and session history management.
  - Message edit and resend capabilities.
  - Real-time streaming SSE responses with stop generation button.
  - Verified RAG document citations and follow-up recommendation action pills.
  - Native Web Speech API STT (voice transcription) & TTS (speech readout).

### 2. 🔐 Enterprise Authentication & Role-Based Portals (RBAC)
- **Zero-Trust IAM Architecture:** Secure authentication with BCrypt password hashing, session tokens, and lockout defense (HTTP 429 after 5 failed attempts).
- **Self-Service Registration:** Live password strength meter, email verification workflow with token activation.
- **Password Recovery Protocol:** Verified reset token flow with new credential encryption.
- **5 Dedicated Role Mission Portals:**
  - `Admin`: User governance, IAM security policies, and audit trails (`/admin/dashboard`).
  - `Geologist`: Borehole assays, 3D lithology, and prospectivity analytics (`/geologist/dashboard`).
  - `Mining Engineer`: Production pulse, fleet availability, and haulage tracking (`/operations/dashboard`).
  - `Data Analyst`: Sentinel-2 spectral indices, ML models, and analytics reports (`/analytics/dashboard`).
  - `Viewer`: Executive read-only overview, cadastre viewer, and approved reports (`/viewer/dashboard`).

### 3. 🌍 Scientific 3D Subsurface Digital Twin
- **Data-Driven Surface DEM:** High-resolution terrain mesh driven by digital elevation models with contour lines and vertical exaggeration controls ($1.0\times$ to $3.5\times$).
- **Sauser Belt Stratigraphy:** 4 authentic formations with true $72^\circ$ SE tectonic dip:
  1. *Laterite & Weathered Regolith* ($0\text{ to }45\text{m}$)
  2. *Mansar Quartz-Muscovite Schist* host rock ($45\text{ to }180\text{m}$)
  3. *Braunite-Pyrolusite Primary Ore Reef* ($180\text{ to }290\text{m}$, $48\%\text{ Mn}$)
  4. *Tirodi Biotite Gneiss* crystalline granitic basement ($>290\text{m}$)
- **Tirodi Regional Thrust Fault:** Semitransparent $68^\circ$ dipping fault zone.
- **Wireline Core Drillholes:** Real collar coordinates for `BH-BG-2023-14`, `BH-BG-2024-03`, `BH-UK-2022-09` with interactive core logging inspector.
- **Dynamic 2D Cross-Section Generator:** Instant transverse (**Line A-A'**) and longitudinal (**Line B-B'**) geological section generator.

### 4. 🗺️ Google Maps Cadastral Command Center
- **Google Maps API v3 Integration:** Satellite, Hybrid, Terrain, and Roadmap basemaps.
- **Places Autocomplete:** Quick search for mines, districts, and geological formations.
- **Cadastral Layers:** Concession boundaries, active pits, underground winzes, and boreholes.
- **GeoJSON Export / Import:** Seamless exchange of spatial boundaries with GIS software (QGIS/ArcGIS).

---

## 🔑 Pre-Seeded Demo Credentials

| Role Portal | Username / Email | Password | Primary Mission Scope |
| :--- | :--- | :--- | :--- |
| **Director / Admin** | `admin@moil.gov.in` | `ManganexAdmin2026!` | Governance, IAM, System Health |
| **Chief Geologist** | `geologist@moil.gov.in` | `ManganexGeo2026!` | Borehole Assays, 3D Subsurface |
| **Mining Engineer** | `engineer@moil.gov.in` | `ManganexEng2026!` | Production Pulse, Fleet Telemetry |
| **Geospatial Analyst** | `analyst@moil.gov.in` | `ManganexData2026!` | Sentinel-2 Indices, ML Models |
| **Executive Viewer** | `viewer@moil.gov.in` | `ManganexViewer2026!` | Executive Dashboards, Reports |

---

## 🛠️ Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0 or higher
- **Python**: v3.11 with `pip`
- **Java**: JDK 17 or higher (JDK 21 / 25 supported)
- **Maven**: (for building Java backend)

### 1-Click Launch (Windows)
Double-click `start_manganex.bat` or run:
```powershell
powershell -ExecutionPolicy Bypass -File launch_servers.ps1
```
This automatically verifies ports, starts the Python AI backend, Java backend, and Vite frontend.

### Manual Service Launch

#### 1. Frontend Web App (Port 3000)
```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

#### 2. Python AI Service (Port 8000)
```bash
cd backend
pip install -r requirements.txt
python run_server.py
```
API Documentation available at [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs).

#### 3. Java Spring Boot Enterprise API (Port 8080)
```bash
cd java-backend
mvn clean package -DskipTests
java -jar target/manganex-backend-1.0.0.jar
```
Health status at [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health).

---

## 🧪 Automated Test Suite

Run the full end-to-end verification audit:
```bash
python test_final_upgrade.py
```
*Current Result: 27 / 27 Tests Passed (100% Pass Rate).*

---

## 📜 Compliance & Security
- **UNFC-1997 / UNFC-2009**: Compliant resource classification categories (111 Proved, 122 Probable, 333 Inferred).
- **DGMS Safety Compliance**: Directorate General of Mines Safety blast vibration standards ($<10\text{ mm/s}$).
- **Zero-Trust IAM**: Role-based access control, cryptographic password hashing, and session expiration.

---
&copy; 2026 MANGANEX Consortium • Ministry of Steel • MOIL Limited
