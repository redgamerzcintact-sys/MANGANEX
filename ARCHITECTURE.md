# MANGANEX Enterprise Architecture Documentation

MANGANEX is an AI-powered Geospatial Intelligence and Production Decision Support Platform for manganese exploration and operations in the Central India Manganese Belt (MOIL Limited, Ministry of Steel).

---

## 1. Directory Structure

The repository is structured following clean architectural boundaries:

```
MANGANEX/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/          # FastAPI REST route controllers
│   │   │   │   ├── auth.py         # RBAC authentication & demo profiles
│   │   │   │   ├── mines.py        # Mines cadastre & unified metrics
│   │   │   │   ├── production.py   # Production forecasting & counterfactuals
│   │   │   │   ├── satellite.py    # Satellite observations & STAC metadata
│   │   │   │   ├── weather.py      # Open-Meteo precipitation & soil moisture
│   │   │   │   ├── geology.py      # Prospectivity & drill targets
│   │   │   │   ├── nexus.py        # NEXUS AI Copilot & session store
│   │   │   │   └── operations.py   # Parametric scenario simulator
│   │   │   └── router.py           # API v1 route aggregator
│   │   ├── core/                   # System config, CORS & security
│   │   ├── database/               # SQLAlchemy engine & session factory
│   │   ├── ml/                     # ML models & inference pipelines
│   │   │   ├── forecasting/        # Quantile Gradient Boosting (P10/P50/P90)
│   │   │   ├── prospectivity/      # Spatial-block CV Random Forest & drill targets
│   │   │   └── risk/               # Operational risk scoring engine
│   │   ├── models/                 # Database entities
│   │   ├── rag/                    # Geological knowledge retrieval engine
│   │   ├── schemas/                # Pydantic validation schemas
│   │   ├── services/               # Business logic & external clients
│   │   │   ├── mining_data.py      # CANONICAL SINGLE SOURCE OF TRUTH
│   │   │   ├── satellite/          # STAC client & spectral index processor
│   │   │   └── weather/            # Open-Meteo weather client with TTL cache
│   │   └── main.py                 # FastAPI application & tracing middleware
│   ├── data/                       # Local snapshots & offline fallbacks
│   └── tests/                      # Pytest suite & contract validation
├── src/                            # Frontend (React 19 + TypeScript + Vite)
│   ├── features/                   # Feature-sliced modules
│   │   ├── map/                    # Interactive map & spatial exploration
│   │   ├── forecast/               # Forecast band, shortfall drivers & recovery
│   │   ├── scenario/               # Scenario Lab counterfactual controls
│   │   ├── satellite/              # Sentinel-2 & Landsat spectral analysis
│   │   ├── nexus/                  # NEXUS Copilot & voice assistant
│   │   └── intelligence/           # Geological prospectivity & risk matrix
│   ├── shared/                     # Reusable infrastructure
│   │   ├── components/             # Common UI, navigation, modals, cards
│   │   ├── hooks/                  # useChartTheme, debounce
│   │   ├── services/               # api.ts (HTTP client & localStorage cache)
│   │   ├── stores/                 # Zustand stores (appStore, authStore)
│   │   └── types/                  # Domain TypeScript interfaces
│   ├── i18n/                       # Internationalization
│   │   ├── locales/                # en.json, hi.json, mr.json
│   │   ├── formatters.ts           # Locale-aware Intl number/date formatters
│   │   └── index.ts                # i18next configuration
│   ├── index.css                   # Global design tokens & light/dark CSS vars
│   ├── App.tsx                     # Route definitions & layout wrapper
│   └── main.tsx                    # React DOM entrypoint
├── scripts/                        # Maintenance & verification utilities
│   └── verify_i18n.mjs             # Zero-missing-key translation auditor
├── tests/
│   └── e2e/                        # Playwright verification suites
└── ARCHITECTURE.md                 # This specification document
```

---

## 2. Single Source of Truth for Mine Figures

To eliminate numerical discrepancies across pages (e.g. Balaghat reserves, monthly targets, and deficit figures), all backend endpoints and fallback data read from `backend/app/services/mining_data.py`:

```python
CANONICAL_MINES_DATA = {
    "mine-balaghat": {
        "monthly_target_tonnes": 45000.0,
        "current_output_tonnes": 42800.0,
        "deficit_tonnes": 2200.0,
        "reserves_mt": 23.4,
        "ore_grade_mn_percent": 43.5,
        "production_rate_tpd": 1450.0,
        ...
    },
    ...
}
```

- **Target vs. Deficit Reconciliation**: `deficit_tonnes = monthly_target_tonnes - current_output_tonnes` (e.g. 45,000 t - 42,800 t = 2,200 t).
- **Endpoint**: `GET /api/v1/mines/metrics/unified` exposes these figures to the frontend.
- **Client Fallback**: Cached in `localStorage` under `manganex_last_good_/mines/metrics/unified` if the API is momentarily unreachable.

---

## 3. Reconciled Production Forecast Calculation Path

The production forecast adheres strictly to the following mathematical invariant across models, endpoints, and UI:

$$\text{Shortfall} = \max(0, \text{Target} - \text{Output}_{P50})$$

$$\sum_{i=1}^{4} \text{Driver Tonnes}_i \equiv \text{Shortfall}$$

$$\sum_{j=1}^{3} \text{Action Tonnes}_j \equiv \text{Total Projected Recovery}$$

1. **Horizon Target**: Computed as $(\text{Monthly Target} / 30) \times \text{Horizon Days}$.
2. **P50 Output**: Aggregated daily quantile predictions from scikit-learn `GradientBoostingRegressor(loss='quantile', alpha=0.50)` conditioned on real 16-day Open-Meteo weather.
3. **Ranked Drivers**: Tonnes lost are apportioned across 4 physical factors (Rainfall Ingress, Equipment Downtime, Blasting Delays, Haulage Slippage) with exact remainder reconciliation to ensure the sum equals the integer shortfall.
4. **Recommended Actions**: 3 actionable measures (Dewatering pumps, fleet redeployment, blasting re-sequencing) whose recovered tonnes sum precisely to the total recovery.
5. **UI Application**: Clicking "Apply plan" simulates the recovery, shifting the P50 curve upward towards the target line.

---

## 4. NEXUS AI Copilot Data Flow

The NEXUS copilot operates via a multi-tiered context assembly pipeline:

1. **Client Query**: Sent via `POST /api/v1/nexus/chat` with active mine ID, selected region, and current UI locale (`en`, `hi`, `mr`).
2. **Geological RAG Retrieval**: `backend/app/rag/engine.py` embeds the query and retrieves relevant excerpts from the MOIL Geological Knowledge Base and GSI Exploration Reports.
3. **Operational State Injection**: The current mine's canonical metrics (target, deficit, rainfall, pump status) are injected into the system prompt.
4. **Local Reasoning Engine**: A calibrated domain-expert prompt synthesizes actionable recommendations citing specific benches, water sumps, and equipment IDs.
5. **Session Persistence**: Conversations are saved to the SQLite session store, retrievable via `GET /api/v1/nexus/sessions`.

---

## 5. Dual Theme System (Dark / Light)

The application implements a systemic dual-theme architecture without hard-coded color values:

- **CSS Variables**: Defined in `src/index.css` under `:root` (dark) and `html.light` (light).
  - Backgrounds: `--bg-primary`, `--bg-secondary`, `--panel-surface`, `--elevated-surface`
  - Borders: `--border-color`, `--border-highlight`
  - Typography: `--text-primary`, `--text-secondary`, `--text-muted`
  - Brand & Status: `--accent-primary` (#FB923C in dark, #C2410C in light), `--color-success`, `--color-warning`, `--color-critical`
  - Chart Series: `--chart-series-1` through `--chart-series-5`, `--chart-grid`, `--chart-tooltip-bg`
- **Zero-Flash Execution**: An inline script in `<head>` of `index.html` inspects `localStorage` and `prefers-color-scheme` to set `<html class="light">` before first render.
- **Chart Re-theming**: The `useChartTheme()` hook listens to the active theme and provides dynamic hex values to Recharts components at render time.

---

## 6. Internationalization (i18n) Setup

Full multilingual capability across English, Hindi, and Marathi:

- **Library**: `react-i18next` with `i18next`.
- **Locale Files**: `src/i18n/locales/{en,hi,mr}.json` (123 identical keys per language).
- **Coverage Enforcement**: `scripts/verify_i18n.mjs` runs during CI and fails if any key is missing or untranslated.
- **Locale Formatters**: `src/i18n/formatters.ts` wraps standard `Intl.NumberFormat` and `Intl.DateTimeFormat` for metric tonnes, percentages, and ISO dates.
- **Typography**: `Noto Sans Devanagari` font loaded in `index.html` as fallback for Hindi/Marathi script rendering.

---

## 7. Extensibility Guide

### Adding a New Mine
1. **Define in Backend**: Add the mine coordinates and parameters to `CANONICAL_MINES_DATA` in `backend/app/services/mining_data.py`.
2. **Add STAC BBox**: Add the bounding box to `MINE_BBOXES` in `backend/app/services/satellite/stac.py`.
3. **Add Weather Coordinates**: Add coordinates to `MINE_COORDINATES` in `backend/app/services/weather/open_meteo.py`.
4. **Seed Database**: Add a row to `backend/app/scripts/seed_demo_data.py`.
5. **Frontend Demo Data**: Add the mine to `src/data/demoData.ts` for offline resilience.

### Adding a New Machine Learning Model
1. **Module Creation**: Create a submodule under `backend/app/ml/<model_name>/model.py`.
2. **Dataset & Training**: Implement feature engineering and honest cross-validation (e.g. spatial block CV or rolling origin).
3. **Endpoint Integration**: Mount a route in `backend/app/api/v1/endpoints/` and register it in `router.py`.
4. **Provenance Tracking**: Return `DataProvenance(status="REAL"|"DERIVED", source="...")` in the response schema.
5. **Contract Test**: Add verification tests in `backend/tests/test_api_contract.py`.

---

## 8. Verification & CI Commands

Run these commands to verify code quality and tests:

```bash
# 1. Verify i18n translation key consistency across English, Hindi, and Marathi
npm run test:i18n

# 2. TypeScript compilation check
npm run typecheck

# 3. Frontend production build
npm run build

# 4. Backend pytest test suite (41 passing tests)
npm run test:backend
```
