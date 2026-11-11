"""
MANGANEX - Data Hub & Knowledge Base Endpoints
GET /datasets
POST /datasets/upload  (metadata only)
GET /datasets/{id}
POST /knowledge/search
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.entities import Dataset
from app.schemas.all_schemas import ApiResponse
import datetime
import uuid

router = APIRouter()

DEMO_DATASETS = [
    {
        "id": "ds-moil-cadastre-001",
        "dataset_name": "MOIL Mine Cadastre & Boundary Survey 2024",
        "dataset_type": "Geospatial / Vector (GeoJSON)",
        "source": "MOIL Limited — Geological Survey Division",
        "trust_score": 97.2,
        "completeness_score": 99.1,
        "validation_status": "VALIDATED",
        "file_size_mb": 4.2,
        "records": 7,
        "last_updated": "2024-10-15",
        "description": "Official cadastral boundaries for all 7 MOIL operational mines including mine lease boundaries, collar coordinates, and shaft positions.",
        "tags": ["cadastre", "boundary", "geojson", "moil"],
    },
    {
        "id": "ds-borehole-core-002",
        "dataset_name": "Diamond Drill Core Logs — Balaghat & Ukwa 2023-24",
        "dataset_type": "Tabular / Geological Logs",
        "source": "MOIL Core Lab — Balaghat Division",
        "trust_score": 94.8,
        "completeness_score": 92.3,
        "validation_status": "VALIDATED",
        "file_size_mb": 18.7,
        "records": 24,
        "last_updated": "2024-09-22",
        "description": "Diamond wireline drill core logs with strata descriptions, ore grade assay results (Mn%, Fe%, SiO2%), and geotechnical parameters.",
        "tags": ["borehole", "drill core", "ore grade", "stratigraphy"],
    },
    {
        "id": "ds-sentinel-msi-003",
        "dataset_name": "Sentinel-2 MSI Level-2A — Central India Manganese Belt 2024",
        "dataset_type": "Raster / Satellite Multispectral",
        "source": "ESA Copernicus Open Access Hub",
        "trust_score": 91.5,
        "completeness_score": 78.4,
        "validation_status": "VALIDATED",
        "file_size_mb": 2847.0,
        "records": 143,
        "last_updated": "2024-11-01",
        "description": "Annual stack of Sentinel-2 10m resolution multispectral imagery (13 bands) for the Balaghat-Nagpur manganese belt. Cloud-masked composite.",
        "tags": ["sentinel-2", "satellite", "ndvi", "swir", "multispectral"],
    },
    {
        "id": "ds-production-history-004",
        "dataset_name": "MOIL Production Records 2019-2024 (90-day synthetic extension)",
        "dataset_type": "Tabular / Time-Series",
        "source": "MOIL Operations Centre (Synthetic extension for demo)",
        "trust_score": 88.6,
        "completeness_score": 95.2,
        "validation_status": "VALIDATED_SYNTHETIC_DEMO",
        "file_size_mb": 5.1,
        "records": 2187,
        "last_updated": "2024-11-06",
        "description": "Daily production tonnage, ore grade, equipment downtime, and shift records from 2019 onwards. Last 90 days extended with validated synthetic data.",
        "tags": ["production", "time-series", "daily", "tonnage"],
    },
    {
        "id": "ds-dem-topography-005",
        "dataset_name": "SRTM 30m Digital Elevation Model — Vidarbha & Balaghat",
        "dataset_type": "Raster / Elevation (DEM)",
        "source": "NASA SRTM / USGS EarthExplorer",
        "trust_score": 93.1,
        "completeness_score": 100.0,
        "validation_status": "VALIDATED",
        "file_size_mb": 412.0,
        "records": 1,
        "last_updated": "2023-02-14",
        "description": "30m resolution Shuttle Radar Topography Mission DEM covering the operational mine region. Used for drainage analysis and geological modeling.",
        "tags": ["dem", "elevation", "srtm", "topography"],
    },
    {
        "id": "ds-geological-map-006",
        "dataset_name": "GSI Geological Survey — Sauser Belt Mapping 1:50000",
        "dataset_type": "Geospatial / Raster + Vector",
        "source": "Geological Survey of India — Central Region",
        "trust_score": 96.4,
        "completeness_score": 87.9,
        "validation_status": "VALIDATED",
        "file_size_mb": 134.5,
        "records": 892,
        "last_updated": "2022-06-30",
        "description": "Detailed 1:50,000 scale geological mapping of the Sauser Fold Belt covering lithology, structural features, fold axes, and known Mn-bearing horizons.",
        "tags": ["geological map", "gsi", "lithology", "structural", "sauser belt"],
    },
    {
        "id": "ds-equipment-telemetry-007",
        "dataset_name": "MOIL Equipment Health Telemetry — 2024 Q3",
        "dataset_type": "Tabular / IoT Telemetry",
        "source": "MOIL Equipment Management System (EMS)",
        "trust_score": 89.3,
        "completeness_score": 82.1,
        "validation_status": "VALIDATED_SYNTHETIC_DEMO",
        "file_size_mb": 23.4,
        "records": 15640,
        "last_updated": "2024-10-31",
        "description": "LHD, jumbo rig, hoist, and conveyor health metrics including vibration, temperature, operating hours, and maintenance events.",
        "tags": ["equipment", "iot", "telemetry", "maintenance", "lhd"],
    },
]


@router.get("", response_model=ApiResponse)
def list_datasets(db: Session = Depends(get_db)):
    """List all available datasets in the intelligence hub."""
    return ApiResponse(data={
        "datasets": DEMO_DATASETS,
        "total_count": len(DEMO_DATASETS),
        "total_size_gb": round(sum(d["file_size_mb"] for d in DEMO_DATASETS) / 1024, 2),
        "data_status": "VALIDATED_SYNTHETIC_DEMO",
        "pipeline_status": "INGESTION_COMPLETE",
    })


@router.get("/{dataset_id}", response_model=ApiResponse)
def get_dataset_detail(dataset_id: str, db: Session = Depends(get_db)):
    for ds in DEMO_DATASETS:
        if ds["id"] == dataset_id:
            return ApiResponse(data=ds)
    raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")


@router.post("/upload", response_model=ApiResponse)
def register_dataset(payload: dict, db: Session = Depends(get_db)):
    """Register a new dataset (metadata only)."""
    new_ds = {
        "id": f"ds-user-{uuid.uuid4().hex[:8]}",
        "dataset_name": payload.get("dataset_name", "Unnamed Dataset"),
        "dataset_type": payload.get("dataset_type", "Tabular"),
        "source": payload.get("source", "User Upload"),
        "trust_score": 70.0,
        "completeness_score": 80.0,
        "validation_status": "PENDING_VALIDATION",
        "records": payload.get("records", 0),
        "last_updated": datetime.date.today().isoformat(),
        "description": payload.get("description", ""),
        "tags": payload.get("tags", []),
    }
    return ApiResponse(data={
        "message": "Dataset registered for validation pipeline",
        "dataset": new_ds,
        "next_step": "Automated validation pipeline will process within 24h",
    })


@router.post("/knowledge/search", response_model=ApiResponse)
def knowledge_search(payload: dict, db: Session = Depends(get_db)):
    """Basic keyword search across dataset catalog."""
    query = payload.get("query", "").lower()
    
    results = []
    for ds in DEMO_DATASETS:
        score = 0
        searchable = (ds["dataset_name"] + ds["description"] + " ".join(ds["tags"])).lower()
        
        for word in query.split():
            if word in searchable:
                score += 1
        
        if score > 0:
            results.append({**ds, "relevance_score": score})
    
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return ApiResponse(data={
        "query": query,
        "results": results[:5],
        "total_results": len(results),
    })

