import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="GEOLOGICAL_ANALYST")
    organization = Column(String, default="MOIL Limited")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Mine(Base):
    __tablename__ = "mines"
    id = Column(String, primary_key=True, index=True)
    mine_name = Column(String, nullable=False)
    mine_code = Column(String, unique=True, index=True, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=300.0)
    mine_type = Column(String, default="Underground")  # Underground, Opencast, Mixed
    operational_status = Column(String, default="active")  # active, warning, critical, optimal
    production_rate_tpd = Column(Float, default=1000.0)
    planned_monthly_target_tonnes = Column(Float, default=30000.0)
    actual_monthly_production_tonnes = Column(Float, default=28000.0)
    forecast_variance_percent = Column(Float, default=0.0)
    ore_grade_mn_percent = Column(Float, default=42.0)
    reserves_mt = Column(Float, default=10.0)
    reserve_category = Column(String, default="Proven (UNFC 111)")
    geological_confidence = Column(Float, default=90.0)
    active_equipment_units = Column(Integer, default=20)
    total_equipment_units = Column(Integer, default=25)
    weather_risk_index = Column(String, default="Low")
    rainfall_mm_24h = Column(Float, default=0.0)
    active_alerts_count = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    key_challenge = Column(Text, nullable=True)
    boundary_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    boreholes = relationship("Borehole", back_populates="mine")
    satellite_observations = relationship("SatelliteObservation", back_populates="mine")
    production_records = relationship("ProductionRecord", back_populates="mine")
    risks = relationship("RiskAssessment", back_populates="mine")

class GeologicalProspect(Base):
    __tablename__ = "prospects"
    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    region = Column(String, nullable=False)
    state = Column(String, nullable=False)
    prospectivity_score = Column(Float, nullable=False)
    confidence_score = Column(Float, nullable=False)
    unfc_status = Column(String, default="UNFC 333 (Inferred)")
    depth_min_m = Column(Float, default=50.0)
    depth_max_m = Column(Float, default=250.0)
    estimated_tonnage_potential_mt = Column(Float, default=5.0)
    primary_lithology = Column(String, nullable=False)
    structural_compatibility = Column(Float, default=85.0)
    satellite_indicator_score = Column(Float, default=80.0)
    borehole_evidence_score = Column(Float, default=70.0)
    validation_priority = Column(String, default="P1 - Immediate Core Drilling")
    surface_indicators = Column(JSON, default=list)
    nearby_boreholes_count = Column(Integer, default=4)
    recommended_action = Column(Text, nullable=True)
    radar_metrics = Column(JSON, nullable=True)
    shap_explanations = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Borehole(Base):
    __tablename__ = "boreholes"
    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    borehole_code = Column(String, unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    depth_m = Column(Float, nullable=False)
    collar_elevation_m = Column(Float, default=300.0)
    drilled_year = Column(Integer, default=2024)
    strata = Column(JSON, default=list)  # list of from_m, to_m, rock_type, ore_grade_mn_percent, color
    verification_status = Column(String, default="VERIFIED_CORE_LAB")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mine = relationship("Mine", back_populates="boreholes")

class SatelliteObservation(Base):
    __tablename__ = "satellite_observations"
    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    satellite_source = Column(String, default="Sentinel-2 Multispectral")
    observation_date = Column(String, nullable=False)
    ndvi = Column(Float, default=0.5)
    soil_moisture = Column(Float, default=0.5)
    land_surface_temperature_c = Column(Float, default=30.0)
    rainfall_mm = Column(Float, default=0.0)
    cloud_coverage_percent = Column(Float, default=10.0)
    processing_status = Column(String, default="Level-2A BOA Reflectance")
    anomaly_detected = Column(Boolean, default=False)
    anomaly_type = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mine = relationship("Mine", back_populates="satellite_observations")

class ProductionRecord(Base):
    __tablename__ = "production_records"
    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    production_date = Column(String, nullable=False)
    planned_production_tonnes = Column(Float, nullable=False)
    actual_production_tonnes = Column(Float, nullable=False)
    ore_grade_mn_percent = Column(Float, default=42.0)
    shift = Column(String, default="General")
    downtime_hours = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mine = relationship("Mine", back_populates="production_records")

class Equipment(Base):
    __tablename__ = "equipment"
    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    equipment_code = Column(String, unique=True, index=True, nullable=False)
    equipment_type = Column(String, nullable=False)  # LHD, Jumbo Rig, Hoist, Conveyor, Dumper
    operational_status = Column(String, default="OPERATIONAL")  # OPERATIONAL, MAINTENANCE, BREAKDOWN
    availability_percent = Column(Float, default=90.0)
    operating_hours = Column(Float, default=1200.0)
    assigned_sector = Column(String, default="Level 4 Haulage")
    recommended_sector = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    risk_code = Column(String, unique=True, index=True, nullable=False)
    severity = Column(String, default="warning")  # critical, warning, info
    category = Column(String, nullable=False)  # Rainfall & Geohazard, Equipment Failure, etc.
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    probability_percent = Column(Float, default=50.0)
    estimated_shortfall_tonnes = Column(Float, default=1000.0)
    forecast_date = Column(String, nullable=False)
    workflow_ripple = Column(JSON, default=list)
    recommended_action = Column(Text, nullable=False)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mine = relationship("Mine", back_populates="risks")

class OperationalScenario(Base):
    __tablename__ = "scenarios"
    id = Column(String, primary_key=True, index=True)
    mine_id = Column(String, ForeignKey("mines.id"), nullable=False)
    scenario_name = Column(String, nullable=False)
    rainfall_mm = Column(Float, default=20.0)
    fleet_availability_percent = Column(Float, default=85.0)
    dewatering_capacity_percent = Column(Float, default=90.0)
    shift_hours = Column(Float, default=8.0)
    baseline_tonnes = Column(Float, default=45000.0)
    simulated_tonnes = Column(Float, default=42000.0)
    projected_shortfall_tonnes = Column(Float, default=3000.0)
    estimated_recovery_tonnes = Column(Float, default=2200.0)
    capacity_utilization_percent = Column(Float, default=82.0)
    risk_index = Column(String, default="Moderate")
    assumptions = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"
    id = Column(String, primary_key=True, index=True)
    dataset_name = Column(String, nullable=False)
    dataset_type = Column(String, nullable=False)
    source = Column(String, default="MOIL Cadastre")
    file_location = Column(String, nullable=True)
    trust_score = Column(Float, default=95.0)
    completeness_score = Column(Float, default=98.0)
    validation_status = Column(String, default="VALIDATED")
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

