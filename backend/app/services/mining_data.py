"""
Single Source of Truth for MANGANEX Mining Data.
Holds canonical figures per mine:
- Monthly target (tonnes)
- Reserves (Mt)
- Ore grade (% Mn)
- Current monthly output (tonnes)
- Projected shortfall / deficit (tonnes)
All endpoints and frontend components read from this module to eliminate numerical contradictions.
"""

import datetime
from typing import Dict, Any, List

CANONICAL_MINES_DATA: Dict[str, Dict[str, Any]] = {
    "mine-balaghat": {
        "id": "mine-balaghat",
        "name": "Balaghat Mine",
        "type": "Underground & Open Cast",
        "district": "Balaghat",
        "state": "Madhya Pradesh",
        "coordinates": [21.8049, 80.2033],
        "elevation_m": 330,
        "reserves_mt": 23.4,
        "ore_grade_mn_percent": 43.5,
        "monthly_target_tonnes": 45000.0,
        "current_output_tonnes": 42800.0,
        "deficit_tonnes": 2200.0,
        "production_rate_tpd": 1450.0,
        "predicted_annual_output_mt": 0.51,
        "status": "warning",
        "unfc_code": "UNFC 111",
        "active_haul_trucks": 18,
        "pump_capacity_gpm": 3200,
    },
    "mine-ukwa": {
        "id": "mine-ukwa",
        "name": "Ukwa Mine",
        "type": "Underground",
        "district": "Balaghat",
        "state": "Madhya Pradesh",
        "coordinates": [21.9667, 80.4667],
        "elevation_m": 410,
        "reserves_mt": 9.8,
        "ore_grade_mn_percent": 41.2,
        "monthly_target_tonnes": 18000.0,
        "current_output_tonnes": 16900.0,
        "deficit_tonnes": 1100.0,
        "production_rate_tpd": 580.0,
        "predicted_annual_output_mt": 0.21,
        "status": "optimal",
        "unfc_code": "UNFC 111",
        "active_haul_trucks": 8,
        "pump_capacity_gpm": 1800,
    },
    "mine-dongri-buzurg": {
        "id": "mine-dongri-buzurg",
        "name": "Dongri Buzurg Mine",
        "type": "Open Cast",
        "district": "Bhandara",
        "state": "Maharashtra",
        "coordinates": [21.5500, 79.6833],
        "elevation_m": 315,
        "reserves_mt": 14.2,
        "ore_grade_mn_percent": 38.5,
        "monthly_target_tonnes": 32000.0,
        "current_output_tonnes": 28500.0,
        "deficit_tonnes": 3500.0,
        "production_rate_tpd": 1050.0,
        "predicted_annual_output_mt": 0.36,
        "status": "critical",
        "unfc_code": "UNFC 111",
        "active_haul_trucks": 14,
        "pump_capacity_gpm": 4500,
    },
    "mine-kandri": {
        "id": "mine-kandri",
        "name": "Kandri Mine",
        "type": "Open Cast",
        "district": "Nagpur",
        "state": "Maharashtra",
        "coordinates": [21.4167, 79.2833],
        "elevation_m": 340,
        "reserves_mt": 6.5,
        "ore_grade_mn_percent": 42.0,
        "monthly_target_tonnes": 15000.0,
        "current_output_tonnes": 14200.0,
        "deficit_tonnes": 800.0,
        "production_rate_tpd": 500.0,
        "predicted_annual_output_mt": 0.18,
        "status": "optimal",
        "unfc_code": "UNFC 111",
        "active_haul_trucks": 6,
        "pump_capacity_gpm": 1200,
    },
    "mine-munsar": {
        "id": "mine-munsar",
        "name": "Mansar Mine",
        "type": "Underground",
        "district": "Nagpur",
        "state": "Maharashtra",
        "coordinates": [21.4000, 79.2667],
        "elevation_m": 325,
        "reserves_mt": 5.1,
        "ore_grade_mn_percent": 39.0,
        "monthly_target_tonnes": 12000.0,
        "current_output_tonnes": 11300.0,
        "deficit_tonnes": 700.0,
        "production_rate_tpd": 400.0,
        "predicted_annual_output_mt": 0.14,
        "status": "optimal",
        "unfc_code": "UNFC 111",
        "active_haul_trucks": 5,
        "pump_capacity_gpm": 1100,
    },
    "mine-chikla": {
        "id": "mine-chikla",
        "name": "Chikla Mine",
        "type": "Underground",
        "district": "Bhandara",
        "state": "Maharashtra",
        "coordinates": [21.5500, 79.7500],
        "elevation_m": 310,
        "reserves_mt": 7.8,
        "ore_grade_mn_percent": 40.5,
        "monthly_target_tonnes": 20000.0,
        "current_output_tonnes": 18600.0,
        "deficit_tonnes": 1400.0,
        "production_rate_tpd": 650.0,
        "predicted_annual_output_mt": 0.23,
        "status": "warning",
        "unfc_code": "UNFC 111",
        "active_haul_trucks": 8,
        "pump_capacity_gpm": 2200,
    },
    "mine-tirodi": {
        "id": "mine-tirodi",
        "name": "Tirodi Mine",
        "type": "Open Cast",
        "district": "Balaghat",
        "state": "Madhya Pradesh",
        "coordinates": [21.6833, 79.7000],
        "elevation_m": 355,
        "reserves_mt": 4.9,
        "ore_grade_mn_percent": 37.5,
        "monthly_target_tonnes": 10000.0,
        "current_output_tonnes": 9400.0,
        "deficit_tonnes": 600.0,
        "production_rate_tpd": 320.0,
        "predicted_annual_output_mt": 0.12,
        "status": "optimal",
        "unfc_code": "UNFC 111",
        "active_haul_trucks": 5,
        "pump_capacity_gpm": 900,
    },
}

DATA_PROVENANCE = {
    "status": "DERIVED",
    "source": "Synthetic operations data, calibrated to published MOIL output",
    "retrieved_at": datetime.datetime.utcnow().isoformat() + "Z"
}

def get_mine_metrics(mine_id: str) -> Dict[str, Any]:
    """Retrieve canonical metrics for a specific mine."""
    normalized_id = mine_id.lower().replace("_", "-")
    if not normalized_id.startswith("mine-"):
        normalized_id = f"mine-{normalized_id}"
    
    data = CANONICAL_MINES_DATA.get(normalized_id, CANONICAL_MINES_DATA["mine-balaghat"])
    return {
        **data,
        "data_provenance": DATA_PROVENANCE
    }

def get_all_mines_metrics() -> Dict[str, Any]:
    """Retrieve canonical metrics for all 7 MOIL mines plus regional aggregates."""
    mines_list = list(CANONICAL_MINES_DATA.values())
    total_target = sum(m["monthly_target_tonnes"] for m in mines_list)
    total_output = sum(m["current_output_tonnes"] for m in mines_list)
    total_deficit = sum(m["deficit_tonnes"] for m in mines_list)
    total_reserves = sum(m["reserves_mt"] for m in mines_list)

    return {
        "mines": mines_list,
        "regional_summary": {
            "total_monthly_target_tonnes": total_target,
            "total_current_output_tonnes": total_output,
            "total_deficit_tonnes": total_deficit,
            "total_reserves_mt": round(total_reserves, 1),
            "average_grade_mn_percent": 40.8,
            "reporting_period": "Current Operational Month",
        },
        "data_provenance": DATA_PROVENANCE
    }
