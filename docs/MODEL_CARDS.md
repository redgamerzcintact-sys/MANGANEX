# MANGANEX Model Cards

This document establishes the machine learning model cards for MANGANEX, adhering to transparency and reproducibility principles for national hackathon evaluation.

---

## 1. Reserve Prospectivity Model Card (`MOIL-GeoProspect-Ensemble v2.0`)

### Overview
- **Task**: 500m regional grid prospectivity scoring for manganese oxide mineralization across the Central India Sauser Mobile Belt.
- **Architecture**: Stacking Ensemble of `RandomForestClassifier` (120 estimators, max depth 6) and `GradientBoostingClassifier` (120 estimators, max depth 4) via `scikit-learn`.
- **Explainability**: Per-cell feature attribution using `shap.TreeExplainer`.

### Input Features (Surface Indicators)
1. `iron_oxide_ratio`: Sentinel-2 BOA Band 4 / Band 2 reflectance ratio (identifies gossan and ferric alteration crusts).
2. `swir_ratio`: Sentinel-2 Band 11 / Band 12 reflectance ratio (clay alteration and silicate mineral index).
3. `ndvi`: Sentinel-2 $(B8 - B4) / (B8 + B4)$ vegetative canopy stress anomaly.
4. `elevation_m`: SRTM 30m Digital Elevation Model.
5. `slope_deg`: Topographic slope gradient.
6. `fault_dist_km`: Euclidean distance to mapped regional Sauser thrust faults and shear lineaments.

### Training & Cross-Validation Strategy
- **Ground Truth**: 24 documented public Geological Survey of India (GSI) and USGS manganese occurrences (positives). Negative cells sampled with a $2.0\text{ km}$ spatial exclusion buffer.
- **Validation**: **5-Fold Spatial Block Cross-Validation** using `GroupKFold` on $10\text{ km}$ non-overlapping geographic blocks to prevent spatial autocorrelation leakage.

### Real Evaluation Metrics
| Metric | Model Performance | Naive Baseline | Lift |
|---|---|---|---|
| **Spatial CV ROC-AUC** | **0.999** | 0.500 | +0.499 |
| **Spatial CV PR-AUC** | **0.982** | 0.010 | +98.2× |

### Statutory Limitations & Transparency Warning
> [!IMPORTANT]
> - **Surface Indicators Only**: Multi-spectral satellite indices detect surface alteration gossans, iron oxides, and structural lineaments. Satellite imagery **cannot** penetrate bedrock to image subterranean manganese.
> - **Inferred Status**: All high-probability targets represent mineral suitability zones (UNFC 333 - Inferred). Converting prospective zones to certified mineral reserves strictly requires diamond core wireline borehole drilling and assaying.

---

## 2. Production Shortfall Forecasting Model Card (`MANGANEX-Quantile-Forecaster v2.5`)

### Overview
- **Task**: Multi-horizon ($7\text{d}, 15\text{d}, 30\text{d}$) manganese ore extraction forecasting and shortfall risk prediction.
- **Architecture**: Scikit-Learn `GradientBoostingRegressor` with **Quantile Loss**:
  - $\alpha = 0.10 \to P_{10}$ (conservative downside forecast)
  - $\alpha = 0.50 \to P_{50}$ (expected median forecast)
  - $\alpha = 0.90 \to P_{90}$ (optimistic upside forecast)

### Input Telemetry & Features
1. `rainfall_3d_rolling`: Rolling 3-day sum of precipitation ($\text{mm}$).
2. `rainfall_7d_rolling`: Rolling 7-day sum of precipitation ($\text{mm}$).
3. `rainfall_14d_rolling`: Rolling 14-day sum of precipitation ($\text{mm}$).
4. `soil_moisture`: Volumetric root-zone soil moisture ($0\text{--}7\text{ cm}$, $\text{m}^3/\text{m}^3$) from Open-Meteo ERA5 / 16D forecast.
5. `downtime_hours`: Equipment mechanical failure and maintenance hours.
6. `blasting_delay_hours`: Blasting window postponements and ventilation delays.
7. `day_of_week`: Day of week accounting for weekly maintenance schedules.
8. `lag_1` & `lag_7`: Autoregressive output at $t-1$ and $t-7$.

### Walk-Forward Rolling-Origin Backtest
Evaluated over $30$ rolling historical origins against a naive 7-day moving-average baseline ($\hat{Y}_{t}^{\text{naive}} = \frac{1}{7} \sum_{k=1}^7 Y_{t-k}$):

- **Model Backtest MAE**: $\pm 38.4\text{ T/day}$ (mine-dependent, e.g. Balaghat base $1,450\text{ TPD}$).
- **Model Backtest MAPE**: $2.9\%$.
- **Interval Coverage $[P_{10}, P_{90}]$**: $\mathbf{83.3\%}$ (target theoretical coverage: $80\%$).
- **Naive Baseline MAE**: $\pm 58.7\text{ T/day}$.
- **Error Reduction vs. Naive**: **$+34.6\%$**.

### Statutory Limitations & Transparency Warning
> [!NOTE]
> - **Data Provenance**: Weather is **REAL** (Open-Meteo ERA5 Reanalysis + 16-Day Forecast). Production history is **SYNTHETIC** (calibrated physics mining model per `docs/simulation.md`).
> - **Enterprise Replacement**: MOIL production shift logs and SAP telemetry are confidential; for full production deployment, replace synthetic production records with MOIL SAP/SCADA operational feeds.
