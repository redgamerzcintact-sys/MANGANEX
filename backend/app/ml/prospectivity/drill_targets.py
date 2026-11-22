"""
MANGANEX - Next Drill Target Recommender Engine
Scores prospective cells using active learning & economic criteria:
  Score = P(mineralization) * Uncertainty-Aware Information Gain / Drilling-Cost Proxy
Applies Spatial Non-Maximum Suppression (NMS) to return diverse, actionable drill targets.
Wording is strictly indicative exploration guidance, NOT a reserve estimate.
"""
import math
import os
from typing import Any, Dict, List, Optional, Tuple
from app.ml.prospectivity.model import get_prospectivity_grid

# Known road & haulage hubs across the Central India Manganese Belt
HAULAGE_ROAD_HUBS = [
    {"name": "Balaghat-Bharweli Road", "lat": 21.8049, "lon": 80.2033},
    {"name": "Ukwa-Baihar Highway", "lat": 21.9682, "lon": 80.4674},
    {"name": "Dongri-Tumsar Corridor", "lat": 21.5422, "lon": 79.7025},
    {"name": "Kandri-Mansar Road", "lat": 21.4178, "lon": 79.2812},
    {"name": "Tirodi-Katangi State Highway", "lat": 21.6885, "lon": 79.7042},
    {"name": "Chikla-Sitasaongi Access", "lat": 21.5540, "lon": 79.7712},
]


def _haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute great-circle distance between two GPS points in kilometers."""
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return r * c


def _get_feature_centroid(feature: Dict[str, Any]) -> Tuple[float, float]:
    """Extract (lat, lon) centroid from a GeoJSON feature."""
    geom = feature.get("geometry", {})
    gtype = geom.get("type", "")
    coords = geom.get("coordinates", [])

    if gtype == "Point" and len(coords) >= 2:
        return float(coords[1]), float(coords[0])
    elif gtype == "Polygon" and coords and len(coords[0]) > 0:
        ring = coords[0]
        avg_lon = sum(pt[0] for pt in ring) / len(ring)
        avg_lat = sum(pt[1] for pt in ring) / len(ring)
        return float(avg_lat), float(avg_lon)
    return 21.8049, 80.2033


def compute_drill_targets(
    existing_boreholes: Optional[List[Dict[str, Any]]] = None,
    top_k: int = 5,
    nms_radius_km: float = 1.5
) -> List[Dict[str, Any]]:
    """
    Score prospectivity grid cells and return the top K non-overlapping drill target recommendations.
    Score = P(mineralization) * Information Gain / Drilling-Cost Proxy
    """
    grid = get_prospectivity_grid()
    features = grid.get("features", [])
    if not features:
        return []

    # Reference boreholes (DB or canonical MOIL collars)
    boreholes_coords = []
    if existing_boreholes:
        for b in existing_boreholes:
            lat = b.get("latitude") or (b.get("coordinates", [0, 0])[0] if isinstance(b.get("coordinates"), list) else 0)
            lon = b.get("longitude") or (b.get("coordinates", [0, 0])[1] if isinstance(b.get("coordinates"), list) else 0)
            if lat and lon:
                boreholes_coords.append((float(lat), float(lon)))

    if not boreholes_coords:
        boreholes_coords = [
            (21.8080, 80.2050),
            (21.8020, 80.1980),
            (21.9650, 80.4620),
            (21.5450, 79.7080),
            (21.4190, 79.2850),
            (21.6850, 79.7010),
        ]

    candidates = []

    for f in features:
        props = f.get("properties", {})
        p = float(props.get("probability", 0.0))
        if p < 0.20:
            continue  # prune non-prospective cells

        u = float(props.get("uncertainty", 0.08))
        lat, lon = _get_feature_centroid(f)
        elev = float(props.get("elevation_m", 300.0))
        slope = float(props.get("slope_deg", 5.0))
        fault_dist = float(props.get("fault_dist_km", 2.0))

        # 1. Uncertainty-Aware Information Gain:
        # High probability + high epistemic uncertainty maximizes exploration learning
        info_gain = 0.5 + 1.8 * u + 0.4 * (4.0 * p * (1.0 - p))

        # 2. Distance to nearest existing borehole:
        min_dist_bh = min(_haversine_distance_km(lat, lon, b_lat, b_lon) for b_lat, b_lon in boreholes_coords)

        # 3. Distance to nearest access road:
        min_dist_road = min(_haversine_distance_km(lat, lon, r["lat"], r["lon"]) for r in HAULAGE_ROAD_HUBS)

        # 4. Depth Proxy (structural dip model: deeper further from lineament):
        est_depth_m = max(50.0, min(320.0, 75.0 + slope * 8.0 + fault_dist * 22.0 + (elev - 200.0) * 0.15))

        # 5. Drilling-Cost Proxy:
        # Depth cost + road construction cost + borehole spacing penalty
        c_depth = 1.0 + (est_depth_m / 130.0)
        c_road = 1.0 + 0.30 * min(8.0, min_dist_road)
        
        # Penalize if too close to an existing borehole (<300m = redundancy)
        redundancy_penalty = 2.5 if min_dist_bh < 0.3 else 1.0
        
        c_total = c_depth * c_road * redundancy_penalty * (1.0 + 0.04 * slope)

        # 6. Composite Score:
        score = (p * info_gain) / max(0.1, c_total)

        # Cost Class
        if c_total < 2.4:
            cost_class = "LOW"
        elif c_total <= 3.8:
            cost_class = "MODERATE"
        else:
            cost_class = "HIGH"

        candidates.append({
            "cell_id": props.get("cell_id", "CELL"),
            "coordinates": [round(lat, 5), round(lon, 5)],
            "probability": round(p, 3),
            "uncertainty": round(u, 3),
            "information_gain": round(info_gain, 3),
            "drilling_cost_proxy": round(c_total, 2),
            "cost_class": cost_class,
            "estimated_depth_m": round(est_depth_m, 1),
            "distance_to_road_km": round(min_dist_road, 2),
            "distance_to_borehole_km": round(min_dist_bh, 2),
            "top_shap_drivers": props.get("top_shap_drivers", [
                "Iron Oxide Alteration (B4/B2)",
                "SWIR Clay Ratio (B11/B12)",
                "Lineament Proximity"
            ]),
            "score": score,
            "elevation_m": round(elev, 1),
            "slope_deg": round(slope, 1),
            "fault_dist_km": round(fault_dist, 2),
        })

    # Sort candidates by composite score descending
    candidates.sort(key=lambda x: x["score"], reverse=True)

    # Spatial Non-Maximum Suppression (NMS) to guarantee geographic diversity
    selected: List[Dict[str, Any]] = []
    for cand in candidates:
        if len(selected) >= top_k:
            break
        c_lat, c_lon = cand["coordinates"]
        
        # Check if too close to any previously selected target
        too_close = False
        for s in selected:
            s_lat, s_lon = s["coordinates"]
            if _haversine_distance_km(c_lat, c_lon, s_lat, s_lon) < nms_radius_km:
                too_close = True
                break
        if not too_close:
            rank = len(selected) + 1
            cand["rank"] = rank
            cand["target_id"] = f"TARGET-0{rank}"
            
            # Descriptive target zone naming
            if cand["coordinates"][0] >= 21.80:
                zone_name = f"North Sauser Fold Belt Sector {rank}"
            elif cand["coordinates"][1] <= 79.50:
                zone_name = f"Western Mansar-Kandri Extension {rank}"
            else:
                zone_name = f"Central Bhandara Thrust Horizon {rank}"

            cand["target_name"] = zone_name
            cand["rationale"] = (
                f"High surface anomaly convergence (P={cand['probability']:.2f}, "
                f"InfoGain={cand['information_gain']:.2f}) with optimal {cand['cost_class'].lower()} cost profile "
                f"({cand['distance_to_road_km']} km to haulage, est. depth {cand['estimated_depth_m']} m)."
            )
            cand["recommended_action"] = (
                f"Step-out diamond core drillhole (HQ wireline, inclined 60° towards S30W) "
                f"to intersect braunite/gondite horizon at target depth ~{cand['estimated_depth_m']}m."
            )
            cand["indicative_disclaimer"] = (
                "Indicative exploration target only. Surface indicators (Sentinel-2, SRTM, structural lineaments). "
                "Core drilling and chemical assaying strictly required for UNFC reserve certification; not a reserve estimate."
            )
            selected.append(cand)

    return selected
