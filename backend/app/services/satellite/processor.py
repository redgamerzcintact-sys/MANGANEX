"""
MANGANEX - Satellite Data Processor
Synthetic satellite observation processing pipeline.
Computes NDVI, soil moisture, LST anomalies, and spectral indices from seeded data.
"""
import datetime
import numpy as np
from typing import List, Dict, Any, Optional


def compute_ndvi(nir: float, red: float) -> float:
    """NDVI = (NIR - Red) / (NIR + Red)"""
    if nir + red < 1e-6:
        return 0.0
    return round(float((nir - red) / (nir + red)), 4)


def compute_swir_alteration_index(swir1: float, nir: float) -> float:
    """SWIR/NIR ratio — elevated values indicate hydrothermal clay alteration (kaolinite, smectite)."""
    if nir < 1e-6:
        return 0.0
    return round(float(swir1 / nir), 4)


def compute_iron_oxide_ratio(red: float, blue: float) -> float:
    """Iron Oxide Ratio = Red / Blue — elevated in Fe-Mn gossans."""
    if blue < 1e-6:
        return 0.0
    return round(float(red / blue), 4)


def compute_lst_celsius(thermal_band_k: float) -> float:
    """Convert thermal band (Kelvin) to Land Surface Temperature in °C."""
    return round(float(thermal_band_k - 273.15), 2)


def process_observation(raw_obs: Dict) -> Dict:
    """
    Process a raw satellite observation into derived spectral indices.
    Input: raw band values (synthetic)
    Output: processed observation with NDVI, moisture, LST, anomaly flags
    """
    rng = np.random.default_rng(hash(raw_obs.get("id", "")) % (2**31))
    
    # Synthetic band values (Sentinel-2 style, normalized 0-1)
    nir = rng.uniform(0.2, 0.7)
    red = rng.uniform(0.05, 0.35)
    blue = rng.uniform(0.03, 0.15)
    swir1 = rng.uniform(0.1, 0.5)
    thermal_k = rng.uniform(295, 320)  # 22-47°C range
    
    ndvi = compute_ndvi(nir, red)
    swir_index = compute_swir_alteration_index(swir1, nir)
    iron_ratio = compute_iron_oxide_ratio(red, blue)
    lst = compute_lst_celsius(thermal_k)
    
    # Anomaly detection: SWIR > 0.7 and iron_ratio > 1.8 → potential Mn gossans
    spectral_anomaly = swir_index > 0.7 and iron_ratio > 1.8
    
    return {
        **raw_obs,
        "derived_indices": {
            "ndvi": round(ndvi, 4),
            "swir_alteration_index": round(swir_index, 4),
            "iron_oxide_ratio": round(iron_ratio, 4),
            "lst_celsius": round(lst, 2),
            "soil_moisture_index": round(float(rng.uniform(0.3, 0.8)), 3),
        },
        "spectral_anomaly_detected": spectral_anomaly,
        "anomaly_type": "Hydrothermal Alteration + Fe-Mn Gossan Signature" if spectral_anomaly else None,
        "processing_level": "Level-2A BOA Reflectance (Sen2Cor 2.11)",
        "processing_timestamp": datetime.datetime.utcnow().isoformat(),
    }


def generate_synthetic_satellite_series(mine_id: str, days: int = 30) -> List[Dict]:
    """Generate synthetic satellite observation time series for a mine."""
    rng = np.random.default_rng(hash(mine_id) % (2**31))
    today = datetime.date.today()
    observations = []
    
    mine_coords = {
        "mine-balaghat": (21.8049, 80.2033),
        "mine-ukwa":     (21.7210, 79.8830),
        "mine-dongri":   (21.4780, 79.3200),
        "mine-kandri":   (21.5080, 79.3450),
        "mine-munsar":   (21.3930, 79.3700),
        "mine-chikla":   (21.4000, 79.1700),
        "mine-tirodi":   (21.6600, 79.9400),
    }
    lat, lon = mine_coords.get(mine_id, (21.5, 79.5))
    
    for i in range(days, 0, -1):
        obs_date = today - datetime.timedelta(days=i)
        month = obs_date.month
        
        # Cloud coverage higher during monsoon
        cloud_base = 0.6 if month in [6, 7, 8, 9] else 0.1
        cloud_coverage = min(1.0, rng.beta(2, 5) + cloud_base)
        
        # Only valid observation if <70% cloud cover
        is_valid = cloud_coverage < 0.7
        
        if is_valid:
            nir = rng.uniform(0.25, 0.65)
            red = rng.uniform(0.06, 0.30)
            blue = rng.uniform(0.04, 0.12)
            swir1 = rng.uniform(0.12, 0.48)
            thermal_k = rng.uniform(295, 328)
            
            ndvi = compute_ndvi(nir, red)
            swir_idx = compute_swir_alteration_index(swir1, nir)
            iron_ratio = compute_iron_oxide_ratio(red, blue)
            lst = compute_lst_celsius(thermal_k)
            soil_m = rng.uniform(0.25, 0.85)
            rainfall = max(0, rng.exponential(10) if month in [6,7,8,9] else rng.exponential(2))
            
            anomaly = swir_idx > 0.72 and iron_ratio > 1.75
            
            observations.append({
                "id": f"sat-{mine_id}-{obs_date.isoformat()}",
                "mine_id": mine_id,
                "latitude": round(lat + rng.uniform(-0.02, 0.02), 6),
                "longitude": round(lon + rng.uniform(-0.02, 0.02), 6),
                "satellite_source": "Sentinel-2 MSI Level-2A",
                "observation_date": obs_date.isoformat(),
                "cloud_coverage_percent": round(cloud_coverage * 100, 1),
                "ndvi": round(ndvi, 4),
                "swir_alteration_index": round(swir_idx, 4),
                "iron_oxide_ratio": round(iron_ratio, 4),
                "soil_moisture": round(float(soil_m), 3),
                "land_surface_temperature_c": round(lst, 2),
                "rainfall_mm": round(float(rainfall), 1),
                "spectral_anomaly_detected": anomaly,
                "anomaly_type": "Hydrothermal Alteration Signature" if anomaly else None,
                "processing_status": "Level-2A BOA Reflectance",
                "valid_observation": True,
            })
        else:
            observations.append({
                "id": f"sat-{mine_id}-{obs_date.isoformat()}",
                "mine_id": mine_id,
                "satellite_source": "Sentinel-2 MSI Level-2A",
                "observation_date": obs_date.isoformat(),
                "cloud_coverage_percent": round(cloud_coverage * 100, 1),
                "valid_observation": False,
                "processing_status": "CLOUD_MASKED — insufficient data quality",
            })
    
    return observations


def compute_band_composite(observations: List[Dict]) -> Dict:
    """Compute temporal composites from a series of valid satellite observations."""
    valid = [o for o in observations if o.get("valid_observation", False)]
    
    if not valid:
        return {"error": "No valid observations in period"}
    
    ndvi_vals = [o["ndvi"] for o in valid]
    lst_vals = [o["land_surface_temperature_c"] for o in valid]
    moisture_vals = [o["soil_moisture"] for o in valid]
    rain_vals = [o["rainfall_mm"] for o in valid]
    
    return {
        "valid_observations": len(valid),
        "total_observations": len(observations),
        "coverage_percent": round(len(valid) / len(observations) * 100, 1),
        "ndvi_composite": {
            "mean": round(float(np.mean(ndvi_vals)), 4),
            "max": round(float(np.max(ndvi_vals)), 4),
            "min": round(float(np.min(ndvi_vals)), 4),
            "trend": "increasing" if ndvi_vals[-1] > ndvi_vals[0] else "decreasing",
        },
        "lst_composite": {
            "mean_c": round(float(np.mean(lst_vals)), 2),
            "max_c": round(float(np.max(lst_vals)), 2),
            "anomaly_days": sum(1 for v in lst_vals if v > np.mean(lst_vals) + 2 * np.std(lst_vals)),
        },
        "moisture_composite": {
            "mean": round(float(np.mean(moisture_vals)), 3),
            "dry_days": sum(1 for v in moisture_vals if v < 0.35),
            "saturated_days": sum(1 for v in moisture_vals if v > 0.75),
        },
        "rainfall_composite": {
            "total_mm": round(float(sum(rain_vals)), 1),
            "max_24h_mm": round(float(max(rain_vals)), 1),
            "heavy_rain_events": sum(1 for v in rain_vals if v > 50),
        },
        "anomaly_detections": sum(1 for o in valid if o.get("spectral_anomaly_detected", False)),
    }

