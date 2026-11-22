"""
Script to generate the offline snapshot backend/data/weather_snapshot.json
using real data from Open-Meteo for all 7 MOIL manganese mines.
"""
import datetime
import json
import os
import requests

MINE_COORDINATES = {
    "mine-balaghat": {
        "name": "Balaghat Mine (Bharweli)",
        "district": "Balaghat",
        "state": "Madhya Pradesh",
        "lat": 21.8049,
        "lon": 80.2033,
        "elevation_m": 345
    },
    "mine-ukwa": {
        "name": "Ukwa Mine",
        "district": "Balaghat",
        "state": "Madhya Pradesh",
        "lat": 21.9682,
        "lon": 80.4674,
        "elevation_m": 610
    },
    "mine-dongri": {
        "name": "Dongri Buzurg Mine",
        "district": "Bhandara",
        "state": "Maharashtra",
        "lat": 21.5422,
        "lon": 79.7025,
        "elevation_m": 312
    },
    "mine-kandri": {
        "name": "Kandri Mine",
        "district": "Nagpur",
        "state": "Maharashtra",
        "lat": 21.4178,
        "lon": 79.2812,
        "elevation_m": 328
    },
    "mine-munsar": {
        "name": "Munsar Mine",
        "district": "Nagpur",
        "state": "Maharashtra",
        "lat": 21.3965,
        "lon": 79.2941,
        "elevation_m": 335
    },
    "mine-chikla": {
        "name": "Chikla Mine",
        "district": "Bhandara",
        "state": "Maharashtra",
        "lat": 21.5540,
        "lon": 79.7712,
        "elevation_m": 295
    },
    "mine-tirodi": {
        "name": "Tirodi Mine",
        "district": "Balaghat",
        "state": "Madhya Pradesh",
        "lat": 21.6885,
        "lon": 79.7042,
        "elevation_m": 320
    }
}

def aggregate_hourly_to_daily(hourly_time, hourly_values):
    daily_map = {}
    for t_str, val in zip(hourly_time, hourly_values):
        if val is None:
            continue
        day = t_str.split("T")[0]
        daily_map.setdefault(day, []).append(float(val))
    return {d: round(sum(vals) / len(vals), 4) for d, vals in daily_map.items() if vals}

def fetch_weather_for_mine(mine_id, info):
    today = datetime.date.today()
    start_archive = today - datetime.timedelta(days=365)
    end_archive = today - datetime.timedelta(days=1)
    
    # 1. Fetch Forecast (16 days ahead + past 92 days)
    forecast_url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={info['lat']}&longitude={info['lon']}"
        f"&daily=precipitation_sum,temperature_2m_max,temperature_2m_min"
        f"&hourly=soil_moisture_0_to_1cm"
        f"&forecast_days=16&past_days=92&timezone=Asia/Kolkata"
    )
    r_fc = requests.get(forecast_url, timeout=15)
    r_fc.raise_for_status()
    fc_json = r_fc.json()
    
    fc_daily = fc_json.get("daily", {})
    fc_hourly = fc_json.get("hourly", {})
    fc_soil_daily = aggregate_hourly_to_daily(
        fc_hourly.get("time", []),
        fc_hourly.get("soil_moisture_0_to_1cm", [])
    )
    
    # 2. Fetch Archive for days prior to forecast window (days -365 to -93)
    archive_end = today - datetime.timedelta(days=93)
    archive_url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={info['lat']}&longitude={info['lon']}"
        f"&start_date={start_archive.isoformat()}&end_date={archive_end.isoformat()}"
        f"&daily=precipitation_sum,temperature_2m_max,temperature_2m_min"
        f"&hourly=soil_moisture_0_to_7cm&timezone=Asia/Kolkata"
    )
    r_arch = requests.get(archive_url, timeout=15)
    r_arch.raise_for_status()
    arch_json = r_arch.json()
    
    arch_daily = arch_json.get("daily", {})
    arch_hourly = arch_json.get("hourly", {})
    arch_soil_daily = aggregate_hourly_to_daily(
        arch_hourly.get("time", []),
        arch_hourly.get("soil_moisture_0_to_7cm", [])
    )
    
    # Combine daily records
    combined_days = {}
    # First archive records
    for i, t in enumerate(arch_daily.get("time", [])):
        p = arch_daily.get("precipitation_sum", [])[i]
        tmax = arch_daily.get("temperature_2m_max", [])[i]
        tmin = arch_daily.get("temperature_2m_min", [])[i]
        combined_days[t] = {
            "date": t,
            "precipitation_sum": round(float(p) if p is not None else 0.0, 2),
            "temperature_2m_max": round(float(tmax) if tmax is not None else 30.0, 1),
            "temperature_2m_min": round(float(tmin) if tmin is not None else 20.0, 1),
            "soil_moisture_mean": arch_soil_daily.get(t, 0.28),
            "is_forecast": False
        }
    
    # Then forecast/recent records (overwrites any overlapping days with freshest observations)
    for i, t in enumerate(fc_daily.get("time", [])):
        p = fc_daily.get("precipitation_sum", [])[i]
        tmax = fc_daily.get("temperature_2m_max", [])[i]
        tmin = fc_daily.get("temperature_2m_min", [])[i]
        dt = datetime.datetime.strptime(t, "%Y-%m-%d").date()
        is_fc = dt > today
        combined_days[t] = {
            "date": t,
            "precipitation_sum": round(float(p) if p is not None else 0.0, 2),
            "temperature_2m_max": round(float(tmax) if tmax is not None else 30.0, 1),
            "temperature_2m_min": round(float(tmin) if tmin is not None else 20.0, 1),
            "soil_moisture_mean": fc_soil_daily.get(t, 0.28),
            "is_forecast": is_fc
        }
    
    sorted_days = [combined_days[k] for k in sorted(combined_days.keys())]
    
    # Today or latest actual record
    today_str = today.isoformat()
    latest_rec = combined_days.get(today_str, sorted_days[-1])
    
    # 7-day predicted rainfall
    next_7_rain = sum(
        d["precipitation_sum"]
        for d in sorted_days
        if d["is_forecast"] and (datetime.datetime.strptime(d["date"], "%Y-%m-%d").date() - today).days <= 7
    )
    
    cur_sm = latest_rec.get("soil_moisture_mean", 0.28)
    if cur_sm >= 0.40:
        sm_status = "SATURATED"
    elif cur_sm >= 0.28:
        sm_status = "ELEVATED"
    else:
        sm_status = "NORMAL"
        
    cur_rain = latest_rec.get("precipitation_sum", 0.0)
    if cur_rain >= 40.0 or (next_7_rain >= 100.0 and cur_sm >= 0.35):
        risk_lvl = "CRITICAL"
    elif cur_rain >= 15.0 or next_7_rain >= 50.0:
        risk_lvl = "HIGH"
    elif cur_rain >= 5.0 or cur_sm >= 0.30:
        risk_lvl = "MODERATE"
    else:
        risk_lvl = "LOW"
        
    return {
        "mine_id": mine_id,
        "mine_name": info["name"],
        "district": info["district"],
        "state": info["state"],
        "latitude": info["lat"],
        "longitude": info["lon"],
        "elevation_m": info["elevation_m"],
        "current": {
            "date": latest_rec["date"],
            "temperature_c": round((latest_rec["temperature_2m_max"] + latest_rec["temperature_2m_min"]) / 2, 1),
            "temp_max_c": latest_rec["temperature_2m_max"],
            "temp_min_c": latest_rec["temperature_2m_min"],
            "rainfall_24h_mm": cur_rain,
            "soil_moisture_m3m3": cur_sm,
            "soil_moisture_status": sm_status,
            "next_7d_rainfall_mm": round(next_7_rain, 1),
            "risk_level": risk_lvl,
            "impact_warning": (
                "Haul road surface softening and sump pump drainage surcharge risk."
                if risk_lvl in ("CRITICAL", "HIGH")
                else "Normal operational weather conditions across open benches and portals."
            )
        },
        "daily": sorted_days,
        "total_days": len(sorted_days)
    }

def main():
    snapshot = {
        "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
        "provider": "Open-Meteo Archive (ERA5-Land) & Forecast API",
        "mines": {}
    }
    for mine_id, info in MINE_COORDINATES.items():
        print(f"Fetching real Open-Meteo weather for {info['name']}...")
        mine_data = fetch_weather_for_mine(mine_id, info)
        snapshot["mines"][mine_id] = mine_data
        print(f"  -> Got {mine_data['total_days']} daily records. Current soil moisture: {mine_data['current']['soil_moisture_m3m3']}")
        
    out_dir = os.path.join("backend", "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "weather_snapshot.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(snapshot, f, indent=2)
    print(f"Successfully generated real weather snapshot at {out_path} ({os.path.getsize(out_path)} bytes)")

if __name__ == "__main__":
    main()

