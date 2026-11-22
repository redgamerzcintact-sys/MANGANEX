# MOIL Production Shortfall Simulation & Weather-Driven Forecasting

## 1. Context & Non-Negotiable Transparency Principle
MOIL (Manganese Ore India Limited) operational shift logs, blast timings, and machine telemetry are confidential enterprise data and are not publicly released.

To make the MANGANEX national hackathon MVP strictly credible, transparent, and auditable:
- **Weather Data is 100% REAL**: Historical precipitation, temperature, and soil moisture ($0\text{--}7\text{ cm}$ root zone) are ingested from the **Open-Meteo ERA5-Land Reanalysis Archive** ($365\text{ days}$) and **Open-Meteo 16-Day High-Resolution Numerical Weather Forecast**.
- **Production History is SIMULATED**: Generated deterministically using the physics-based mining engineering formula documented below, conditioned on real weather and explicit equipment/blasting interruption events.
- **Data Provenance**:
  ```json
  {
    "status": "DERIVED",
    "source": "Open-Meteo ERA5 & 16-Day Forecast (REAL) + Physics-Calibrated Extraction Simulator (SYNTHETIC)",
    "components": {
      "weather": "REAL",
      "production": "SYNTHETIC"
    },
    "note": "Weather real, production simulated, replace with MOIL production logs."
  }
  ```

---

## 2. Production Generation Formula

For day $t$, daily manganese ore production $Y_t$ (in metric tonnes) is modeled as:

$$
Y_t = \max\Big(Y_{\min},\; Y_0 \cdot \big[1 - f_{\text{rain}}(P_t, P_{t, 3d}) - f_{\text{soil}}(\theta_t)\big] - r_{\text{dt}} \cdot D_t - r_{\text{blast}} \cdot B_t + \epsilon_t\Big)
$$

Where:
- $Y_0$: Baseline nominal daily capacity (tonnes/day) for the mine under optimal operating conditions.
- $Y_{\min} = 0.05 \cdot Y_0$: Minimum baseline maintenance extraction floor.
- $P_t$: Daily precipitation ($\text{mm}$) on day $t$ from Open-Meteo.
- $P_{t, 3d} = \sum_{k=0}^{2} P_{t-k}$: 3-day antecedent precipitation ($\text{mm}$).
- $\theta_t$: Volumetric soil moisture ($\text{m}^3/\text{m}^3$) in the top $0\text{--}7\text{ cm}$ layer.
- $D_t$: Equipment downtime hours on day $t$ (haul truck breakdown, loader hydraulics, crusher maintenance).
- $B_t$: Blasting delay hours on day $t$ (bench clearance, pre-blast ventilation, misfire checks).
- $\epsilon_t \sim \mathcal{N}(0, \sigma^2)$: Stochastic geological heterogeneity factor ($\sigma = 0.03 \cdot Y_0$).

### 2.1 Precipitation Degradation Function $f_{\text{rain}}$
Precipitation causes surface runoff, bench ponding, and wet face extraction restrictions:

$$
f_{\text{rain}}(P_t, P_{t, 3d}) = \min\Big(0.50,\; 0.008 \cdot \max(0, P_t - 5.0) + 0.004 \cdot \max(0, P_{t, 3d} - 15.0)\Big)
$$

### 2.2 Soil Saturation & Haul-Road Derating Function $f_{\text{soil}}$
When soil moisture exceeds plastic limit threshold $\theta_0 = 0.28\ \text{m}^3/\text{m}^3$, heavy dumpers suffer tire slip, haul roads rut, and speed restrictions drop cycle times by up to $35\%$:

$$
f_{\text{soil}}(\theta_t) = \min\Big(0.35,\; 1.80 \cdot \big[\max(0, \theta_t - 0.28)\big]^2\Big)
$$

### 2.3 Equipment & Blasting Loss Rates
- $r_{\text{dt}}$: Extraction lost per equipment downtime hour ($\text{tonnes}/\text{hour}$).
- $r_{\text{blast}}$: Extraction lost per blasting delay hour ($\text{tonnes}/\text{hour}$).

---

## 3. Mine Parameter Calibration Table

Calibrated to MOIL published annual production capacities and geological bench profiles across the Central India Manganese Belt:

| Mine ID | Mine Name | State | Base Capacity $Y_0$ (TPD) | Monthly Target (T) | Downtime Penalty $r_{\text{dt}}$ (T/h) | Blasting Penalty $r_{\text{blast}}$ (T/h) |
|---|---|---|---|---|---|---|
| `mine-balaghat` | Balaghat (Bharweli) | Madhya Pradesh | 1,450 | 45,000 | 18.0 | 12.0 |
| `mine-ukwa` | Ukwa | Madhya Pradesh | 980 | 31,500 | 14.0 | 10.0 |
| `mine-dongri` | Dongri Buzurg | Maharashtra | 820 | 25,500 | 12.0 | 8.0 |
| `mine-kandri` | Kandri | Maharashtra | 760 | 24,000 | 11.0 | 8.0 |
| `mine-munsar` | Munsar | Maharashtra | 420 | 13,500 | 8.0 | 5.0 |
| `mine-chikla` | Chikla | Maharashtra | 380 | 12,000 | 7.0 | 5.0 |
| `mine-tirodi` | Tirodi | Madhya Pradesh | 290 | 9,300 | 6.0 | 4.0 |

---

## 4. Machine Learning Forecasting Architecture

### 4.1 Feature Matrix
For each day $t$, the feature vector $\mathbf{x}_t$ includes:
1. `rainfall_3d_rolling`: Rolling 3-day sum of precipitation ($\text{mm}$).
2. `rainfall_7d_rolling`: Rolling 7-day sum of precipitation ($\text{mm}$).
3. `rainfall_14d_rolling`: Rolling 14-day sum of precipitation ($\text{mm}$).
4. `soil_moisture`: 0–7 cm soil moisture ($\text{m}^3/\text{m}^3$).
5. `downtime_hours`: Equipment downtime (hours).
6. `blasting_delay_hours`: Blasting delays (hours).
7. `day_of_week`: Day of week (0 to 6, accounting for Sunday maintenance).
8. `lag_1`: Production output at $t-1$.
9. `lag_7`: Production output at $t-7$.

### 4.2 Quantile Gradient Boosting Regressor
Rather than symmetric Gaussian bands, MANGANEX trains three scikit-learn `GradientBoostingRegressor` models with **quantile loss** (`loss="quantile"`):
- $\alpha = 0.10 \to P_{10}$: Downside conservative production (worst-case rainfall/downtime confluence).
- $\alpha = 0.50 \to P_{50}$: Median expected production forecast.
- $\alpha = 0.90 \to P_{90}$: Upside optimistic production (dry spells, zero downtime).

Forecast horizons: $7$, $15$, and $30$ days ahead.

### 4.3 Rolling-Origin Walk-Forward Backtest
To avoid data leakage and report honest model performance:
- We execute a rolling-origin evaluation over the past $30$ historical days.
- Comparison against a naive baseline: $\hat{Y}_{t}^{\text{naive}} = \frac{1}{7} \sum_{k=1}^{7} Y_{t-k}$.
- Computed metrics:
  - **MAE**: Mean Absolute Error ($\text{tonnes}/\text{day}$).
  - **MAPE**: Mean Absolute Percentage Error ($\%$).
  - **Interval Coverage**: Fraction of actual production values falling within $[P_{10}, P_{90}]$ (target $\approx 80\%$).
  - **Baseline Comparison**: $\text{MAE}_{\text{model}}$ vs. $\text{MAE}_{\text{naive}}$.

All backtest metrics are strictly calculated on-the-fly and never hardcoded.

---

## 5. Counterfactual Action Evaluation in Scenario Lab
When an operator explores an intervention in the Scenario Lab (e.g. pre-emptive dewatering, fleet redeployment, shifted blasting):
1. The engine modifies the parameter vector (e.g. pump capacity increased to $140\%$, reducing soil saturation derate).
2. The model is re-executed with the modified parameters.
3. The delta tonnes recovered:
   $$
   \Delta T = \max\Big(0,\; \hat{Y}_{\text{action}}^{(P50)} - \hat{Y}_{\text{baseline}}^{(P50)}\Big)
   $$
4. Actions are ranked by recovered tonnage to provide actionable operational guidance.
