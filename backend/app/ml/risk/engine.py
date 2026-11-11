"""
MANGANEX - Risk Prediction Engine
Probabilistic risk scoring + ripple dependency graph.
"""
import datetime
import numpy as np
from typing import List, Dict, Any


RISK_TEMPLATES = {
    "rainfall_geohazard": {
        "category": "Rainfall & Geohazard",
        "title": "Critical Monsoon Inundation Risk",
        "severity_thresholds": {"critical": 100, "warning": 50, "info": 20},
        "shortfall_per_mm": 180,  # tonnes per mm above 50mm
    },
    "equipment_failure": {
        "category": "Equipment & Mechanical",
        "title": "Primary Hoist Gear Fatigue Risk",
        "severity_thresholds": {"critical": 70, "warning": 85, "info": 95},  # availability %
        "shortfall_per_pct": 450,  # tonnes per % below optimal
    },
    "geological_instability": {
        "category": "Geological Instability",
        "title": "Stope Roof Convergence Alert",
        "severity_thresholds": {"critical": 0.9, "warning": 0.7, "info": 0.5},
        "shortfall_base": 2000,
    },
    "supply_chain": {
        "category": "Supply Chain & Logistics",
        "title": "Rail Dispatch Bottleneck",
        "severity_thresholds": {"critical": 0.8, "warning": 0.6, "info": 0.4},
        "shortfall_base": 800,
    }
}


def predict_mine_risks(mine_data: Dict[str, Any]) -> List[Dict]:
    """Generate probabilistic risk predictions for a mine."""
    rng = np.random.default_rng(hash(mine_data.get("id", "")) % (2**31))
    risks = []
    today = datetime.date.today()
    
    # Rainfall risk
    rainfall = mine_data.get("rainfall_mm_24h", 0)
    if rainfall > 20:
        prob = min(0.98, 0.3 + (rainfall - 20) / 150)
        severity = "critical" if rainfall > 100 else "warning" if rainfall > 50 else "info"
        shortfall = max(0, (rainfall - 20) * 180 * prob)
        
        risks.append({
            "risk_type": "rainfall_geohazard",
            "severity": severity,
            "category": "Rainfall & Geohazard",
            "title": f"Monsoon Inundation Risk — {rainfall}mm/24h",
            "description": (
                f"Satellite precipitation analysis indicates {rainfall}mm accumulated rainfall over the past 24 hours. "
                f"Sub-level sump inflow velocities are projected to exceed safe dewatering thresholds within 6 hours. "
                f"Skip hoisting throughput throttled by an estimated 35-55%."
            ),
            "probability_percent": round(prob * 100, 1),
            "estimated_shortfall_tonnes": round(shortfall, 0),
            "forecast_date": (today + datetime.timedelta(days=2)).isoformat(),
            "workflow_ripple": [
                {"node": "Rainfall Accumulation", "status": "critical", "impact": f"{rainfall}mm"},
                {"node": "Sump Dewatering Overload", "status": "critical", "impact": "850+ gpm"},
                {"node": "Skip Hoist Throttled", "status": "warning", "impact": "-40% throughput"},
                {"node": "Production Shortfall", "status": "critical", "impact": f"-{round(shortfall):,}T"},
            ],
            "recommended_action": (
                "1. Activate secondary high-head submersible pump bank #2 immediately. "
                "2. Divert battery locomotive haulage to Upper Level 4 crosscut. "
                "3. Delay scheduled ring blasting in Stope 7-North until sump stabilizes. "
                "4. Alert plant stockpile to absorb pending tonnage deficit."
            )
        })
    
    # Equipment risk
    availability = mine_data.get("active_equipment_units", 20) / max(1, mine_data.get("total_equipment_units", 25)) * 100
    if availability < 90:
        prob = min(0.95, 0.4 + (90 - availability) / 100)
        severity = "critical" if availability < 70 else "warning" if availability < 80 else "info"
        shortfall = max(0, (90 - availability) * 450 * prob)
        
        risks.append({
            "risk_type": "equipment_failure",
            "severity": severity,
            "category": "Equipment & Mechanical",
            "title": f"Fleet Availability Warning — {availability:.0f}% operational",
            "description": (
                f"Primary fleet availability has declined to {availability:.0f}% ({mine_data.get('active_equipment_units')} of "
                f"{mine_data.get('total_equipment_units')} units operational). Load-Haul-Dump cycle efficiency is "
                f"degraded. Risk of cascade failures on aging hydraulic circuits within 72 hours."
            ),
            "probability_percent": round(prob * 100, 1),
            "estimated_shortfall_tonnes": round(shortfall, 0),
            "forecast_date": (today + datetime.timedelta(days=3)).isoformat(),
            "workflow_ripple": [
                {"node": "Equipment Degradation", "status": severity, "impact": f"{availability:.0f}% availability"},
                {"node": "LHD Cycle Reduction", "status": "warning", "impact": "-25% capacity"},
                {"node": "Ore Stockpile Depletion", "status": "warning", "impact": "72hr exposure"},
                {"node": "Production Variance", "status": severity, "impact": f"-{round(shortfall):,}T"},
            ],
            "recommended_action": (
                f"1. Redeploy 2 LHD units from Sector 3 development to Stope 5 primary ore extraction. "
                f"2. Schedule emergency hydraulic circuit inspection for WJ-14 and WJ-19. "
                f"3. Coordinate with central workshop for 48-hour expedited maintenance cycle."
            )
        })
    
    # Geological instability (probabilistic)
    geological_confidence = mine_data.get("geological_confidence", 90)
    if geological_confidence < 85 or mine_data.get("mine_type", "") == "Underground":
        prob = rng.uniform(0.25, 0.65)
        severity = "warning" if prob < 0.5 else "info"
        
        risks.append({
            "risk_type": "geological_instability",
            "severity": severity,
            "category": "Geological Instability",
            "title": "Stope Convergence Monitoring Alert",
            "description": (
                "Extensometer readings in Stope 6-South show wall convergence of 8mm over 72h, "
                "approaching the 12mm threshold for conditional evacuation protocol. "
                "Pyrolusite ore band integrity compromised by water-weakened joint planes."
            ),
            "probability_percent": round(prob * 100, 1),
            "estimated_shortfall_tonnes": 1800,
            "forecast_date": (today + datetime.timedelta(days=5)).isoformat(),
            "workflow_ripple": [
                {"node": "Wall Convergence", "status": "warning", "impact": "8mm/72h"},
                {"node": "Ore Access Restriction", "status": "warning", "impact": "Stope 6-South"},
                {"node": "Ore Flow Disruption", "status": "info", "impact": "-1800T"},
                {"node": "Safety Protocol Trigger", "status": "info", "impact": "Conditional"},
            ],
            "recommended_action": (
                "1. Increase extensometer monitoring frequency to 4-hour intervals. "
                "2. Install additional rock bolts at identified joint intersections. "
                "3. Prepare conditional evacuation protocol for Stope 6-South level."
            )
        })
    
    return risks


def compute_system_risk_score(mine_risks_list: List[List[Dict]]) -> Dict:
    """Aggregate risk scores across all mines into a system-level risk index."""
    all_risks = [r for mine in mine_risks_list for r in mine]
    
    if not all_risks:
        return {"system_risk_level": "LOW", "total_shortfall_exposure": 0, "critical_count": 0, "warning_count": 0}
    
    total_shortfall = sum(r["estimated_shortfall_tonnes"] for r in all_risks)
    critical_count = sum(1 for r in all_risks if r["severity"] == "critical")
    warning_count = sum(1 for r in all_risks if r["severity"] == "warning")
    
    system_level = "CRITICAL" if critical_count > 0 else "WARNING" if warning_count > 1 else "MODERATE"
    
    return {
        "system_risk_level": system_level,
        "total_shortfall_exposure": round(total_shortfall, 0),
        "critical_count": critical_count,
        "warning_count": warning_count,
        "total_risk_events": len(all_risks),
    }

