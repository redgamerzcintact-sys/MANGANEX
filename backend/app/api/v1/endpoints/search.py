"""
MANGANEX — Global Intelligence Search Engine
Endpoint: GET /api/v1/search?q=...
Performs debounced unified search across Mines, Geology, Prospects, Boreholes,
Datasets, Equipment, and System Navigation.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Mine, GeologicalProspect, Borehole
from app.schemas.all_schemas import ApiResponse

router = APIRouter()

# Static / System Navigation Items
PLATFORM_ACTIONS = [
    {"title": "Open Command Center (GIS Map)", "category": "Navigation", "type": "route", "route": "/command-center", "icon": "MapPin", "keywords": "map gis cadastre satellite earth layers"},
    {"title": "Open Mineral Exploration Console", "category": "Navigation", "type": "route", "route": "/exploration", "icon": "Compass", "keywords": "exploration geology prospectivity anomaly reserves shap"},
    {"title": "Open 3D Subsurface Digital Twin", "category": "Navigation", "type": "route", "route": "/subsurface", "icon": "Box", "keywords": "3d subsurface twin strata depth boreholes lithology"},
    {"title": "Open Satellite & Remote Sensing Studio", "category": "Navigation", "type": "route", "route": "/satellite", "icon": "Layers", "keywords": "satellite sentinel landsat ndvi moisture lst earth observation"},
    {"title": "Open Production Pulse & Forecast", "category": "Navigation", "type": "route", "route": "/production", "icon": "Activity", "keywords": "production forecast shortfall targets variance tonnage haulage"},
    {"title": "Open Shortfall Radar & Risk Center", "category": "Navigation", "type": "route", "route": "/risk-center", "icon": "AlertTriangle", "keywords": "risk shortfall radar threats monsoon flood equipment breakdown"},
    {"title": "Open Future Fork Scenario Lab", "category": "Navigation", "type": "route", "route": "/scenario-lab", "icon": "GitFork", "keywords": "scenario lab simulation future fork what if optimization"},
    {"title": "Open Mine Planning & Optimization", "category": "Navigation", "type": "route", "route": "/optimization", "icon": "Sliders", "keywords": "optimization fleet or-tools allocation haulage scheduling"},
    {"title": "Open Data Hub & Dataset Governance", "category": "Navigation", "type": "route", "route": "/datasets", "icon": "Database", "keywords": "data hub datasets upload geojson csv validation ingestion"},
    {"title": "Open NEXUS AI Copilot", "category": "Navigation", "type": "route", "route": "/nexus", "icon": "Bot", "keywords": "nexus ai copilot rag llm assistant voice chat question"},
    {"title": "Open Security & IAM Settings", "category": "Navigation", "type": "route", "route": "/settings", "icon": "ShieldCheck", "keywords": "settings user profile permissions token rbac security"},
]

GEOLOGICAL_FORMATIONS = [
    {"name": "Mansar Formation (Manganese Ore Horizon)", "category": "Geology", "age": "Paleoproterozoic (2.2 Ga)", "lithology": "Manganiferous Schist & Quartzite", "route": "/exploration", "coordinates": [21.8049, 80.2033]},
    {"name": "Sauser Belt Anticlinal Fold Axis", "category": "Geology", "age": "Precambrian", "lithology": "Gneissic Complex & Schist", "route": "/exploration", "coordinates": [21.7210, 79.8830]},
    {"name": "Bharweli Strike Fault (Deep Thrust)", "category": "Geology", "age": "Tectonic Fault Line", "lithology": "Fault Breccia & Gouge", "route": "/subsurface", "coordinates": [21.8049, 80.2033]},
    {"name": "Sitasaongi Formation (Basal Quartzite)", "category": "Geology", "age": "Sauser Group", "lithology": "Feldspathic Quartzite", "route": "/exploration", "coordinates": [21.5422, 79.7025]},
    {"name": "Chorbaoli Formation (Marble & Calc-Silicate)", "category": "Geology", "age": "Sauser Group", "lithology": "Dolomitic Calcite Marble", "route": "/exploration", "coordinates": [21.5080, 79.3450]},
    {"name": "Tirodi Biotite Gneissic Basement", "category": "Geology", "age": "Archaean Basement", "lithology": "Granitic Biotite Gneiss", "route": "/subsurface", "coordinates": [21.6600, 79.9400]}
]

EQUIPMENT_FLEET = [
    {"code": "LHD-01", "name": "Sandvik LH410 Electric LHD", "mine": "Balaghat Mine", "status": "Operational (Sub-Level 7)", "route": "/production"},
    {"code": "LHD-02", "name": "Caterpillar R1300G Diesel LHD", "mine": "Balaghat Mine", "status": "Maintenance Pending", "route": "/production"},
    {"code": "RIG-01", "name": "Tamrock Monomatic Jumbo Drill Rig", "mine": "Ukwa Mine", "status": "Drilling Stope Face", "route": "/production"},
    {"code": "DMP-01", "name": "Volvo FMX 460 Tipper Convoy", "mine": "Dongri Buzurg", "status": "Active Haulage Incline", "route": "/optimization"},
    {"code": "PMP-02", "name": "Kirloskar High-Head Dewatering Pump Bank", "mine": "Balaghat Bharweli", "status": "Pumping 920 gpm", "route": "/risk-center"}
]

@router.get("", response_model=ApiResponse)
def global_search(
    q: str = Query("", min_length=1, description="Search query string"),
    db: Session = Depends(get_db)
):
    query_str = q.strip().lower()
    if not query_str:
        return ApiResponse(data={"results": [], "total": 0})

    results = []

    # 1. Search Mines
    try:
        mines = db.query(Mine).all()
        for m in mines:
            searchable = f"{m.mine_name} {m.mine_code} {m.district} {m.state} {m.mine_type}".lower()
            if query_str in searchable:
                results.append({
                    "id": m.id,
                    "title": m.mine_name,
                    "subtitle": f"{m.mine_code} • {m.district}, {m.state} ({m.mine_type})",
                    "category": "Mines & Cadastre",
                    "type": "mine",
                    "coordinates": [m.latitude, m.longitude],
                    "route": "/command-center",
                    "mineId": m.id,
                    "badge": m.operational_status.upper()
                })
    except Exception as e:
        print("Mine search error:", e)

    # 2. Search Geological Prospects
    try:
        prospects = db.query(GeologicalProspect).all()
        for p in prospects:
            searchable = f"{p.name} {p.region} {p.state} {p.unfc_status} {p.primary_lithology}".lower()
            if query_str in searchable:
                results.append({
                    "id": p.id,
                    "title": p.name,
                    "subtitle": f"{p.region} • {p.unfc_status} • Score: {p.prospectivity_score}%",
                    "category": "Geological Targets",
                    "type": "prospect",
                    "coordinates": [p.latitude, p.longitude],
                    "route": "/exploration",
                    "prospectId": p.id,
                    "badge": f"{p.prospectivity_score}% AI SCORE"
                })
    except Exception as e:
        print("Prospect search error:", e)

    # 3. Search Core Boreholes
    try:
        boreholes = db.query(Borehole).all()
        for b in boreholes:
            searchable = f"{b.borehole_code} {b.mine_id} {b.strata} {b.depth_m}".lower()
            if query_str in searchable:
                results.append({
                    "id": b.id,
                    "title": f"Borehole {b.borehole_code}",
                    "subtitle": f"Depth: {b.depth_m}m • Strata: {b.strata}",
                    "category": "Boreholes & Assays",
                    "type": "borehole",
                    "coordinates": [b.latitude, b.longitude],
                    "route": "/subsurface",
                    "boreholeId": b.id,
                    "badge": f"{b.depth_m}M DEPTH"
                })
    except Exception as e:
        print("Borehole search error:", e)

    # 4. Search Geological Formations
    for gf in GEOLOGICAL_FORMATIONS:
        searchable = f"{gf['name']} {gf['lithology']} {gf['age']}".lower()
        if query_str in searchable:
            results.append({
                "id": gf["name"],
                "title": gf["name"],
                "subtitle": f"{gf['lithology']} • Age: {gf['age']}",
                "category": "Formations & Faults",
                "type": "geology",
                "coordinates": gf["coordinates"],
                "route": gf["route"],
                "badge": "LITHOLOGY"
            })

    # 5. Search Equipment
    for eq in EQUIPMENT_FLEET:
        searchable = f"{eq['code']} {eq['name']} {eq['mine']} {eq['status']}".lower()
        if query_str in searchable:
            results.append({
                "id": eq["code"],
                "title": f"{eq['code']} — {eq['name']}",
                "subtitle": f"{eq['mine']} • {eq['status']}",
                "category": "Equipment Telemetry",
                "type": "equipment",
                "route": eq["route"],
                "badge": "FLEET"
            })

    # 6. Search Platform Actions & Navigation
    for act in PLATFORM_ACTIONS:
        searchable = f"{act['title']} {act['keywords']}".lower()
        if query_str in searchable:
            results.append({
                "id": act["title"],
                "title": act["title"],
                "subtitle": "Platform Workspace Command",
                "category": "Platform Navigation",
                "type": "action",
                "route": act["route"],
                "badge": "NAV"
            })

    return ApiResponse(data={
        "query": q,
        "results": results[:25],
        "total": len(results)
    })
