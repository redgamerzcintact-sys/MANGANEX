import datetime
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.models.entities import (
    Mine, GeologicalProspect, Borehole, SatelliteObservation,
    ProductionRecord, Equipment, RiskAssessment, OperationalScenario, Dataset, User
)

def seed_database(db: Session):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    # 1. Check if already seeded
    if db.query(Mine).count() > 0:
        return

    # Seed User
    admin = User(
        id="usr-moil-lead",
        name="Chief Geologist & Operations Lead",
        email="lead.geologist@moil.gov.in",
        password_hash="mock_argon2_hash_secure",
        role="GEOLOGICAL_ANALYST",
        organization="MOIL Limited"
    )
    db.add(admin)

    # 2. Seed Mines (Exact Cadastre from demoData.ts)
    mines_seed = [
        Mine(
            id="mine-balaghat",
            mine_name="Balaghat Mine (Bharweli)",
            mine_code="MOIL-BG-01",
            district="Balaghat",
            state="Madhya Pradesh",
            latitude=21.8049,
            longitude=80.2033,
            elevation_m=345,
            operational_status="critical",
            mine_type="Underground",
            production_rate_tpd=1450,
            planned_monthly_target_tonnes=45000,
            actual_monthly_production_tonnes=36200,
            forecast_variance_percent=-19.5,
            ore_grade_mn_percent=43.8,
            reserves_mt=18.4,
            reserve_category="Proven (UNFC 111)",
            geological_confidence=94,
            active_equipment_units=28,
            total_equipment_units=36,
            weather_risk_index="Critical",
            rainfall_mm_24h=124.5,
            active_alerts_count=3,
            description="MOIL's flagship and Asia's deepest underground manganese mine, reaching past 385m below surface with high-grade pyrolusite & psilomelane reefs.",
            key_challenge="Excessive monsoon seepage inundating deep haulage winzes; secondary hoist winch gear fatigue."
        ),
        Mine(
            id="mine-ukwa",
            mine_name="Ukwa Mine",
            mine_code="MOIL-UK-02",
            district="Balaghat",
            state="Madhya Pradesh",
            latitude=21.9682,
            longitude=80.4674,
            elevation_m=610,
            operational_status="warning",
            mine_type="Underground",
            production_rate_tpd=620,
            planned_monthly_target_tonnes=19000,
            actual_monthly_production_tonnes=16400,
            forecast_variance_percent=-13.7,
            ore_grade_mn_percent=40.2,
            reserves_mt=9.2,
            reserve_category="Probable (UNFC 122)",
            geological_confidence=86,
            active_equipment_units=14,
            total_equipment_units=18,
            weather_risk_index="Moderate",
            rainfall_mm_24h=42.0,
            active_alerts_count=2,
            description="Plateau-top underground manganese operation with continuous belt conveyor haulage spanning rugged forested terrain.",
            key_challenge="Haul road slope instability on steep Ghat sections and localized strata fracturing near fault intersection."
        ),
        Mine(
            id="mine-dongri",
            mine_name="Dongri Buzurg Mine",
            mine_code="MOIL-DB-03",
            district="Bhandara",
            state="Maharashtra",
            latitude=21.5422,
            longitude=79.7025,
            elevation_m=312,
            operational_status="optimal",
            mine_type="Opencast",
            production_rate_tpd=2100,
            planned_monthly_target_tonnes=62000,
            actual_monthly_production_tonnes=64100,
            forecast_variance_percent=3.4,
            ore_grade_mn_percent=46.5,
            reserves_mt=22.8,
            reserve_category="Proven (UNFC 111)",
            geological_confidence=96,
            active_equipment_units=44,
            total_equipment_units=46,
            weather_risk_index="Low",
            rainfall_mm_24h=12.0,
            active_alerts_count=0,
            description="Premier opencast manganese mine yielding world-renowned dioxide-grade ore for chemical and battery precursor manufacturing.",
            key_challenge="High stripping ratio requiring precise shovel-dumper dispatch coordination across deeper benches."
        ),
        Mine(
            id="mine-kandri",
            mine_name="Kandri Mine",
            mine_code="MOIL-KD-04",
            district="Nagpur",
            state="Maharashtra",
            latitude=21.4178,
            longitude=79.2812,
            elevation_m=328,
            operational_status="active",
            mine_type="Mixed",
            production_rate_tpd=890,
            planned_monthly_target_tonnes=26000,
            actual_monthly_production_tonnes=25100,
            forecast_variance_percent=-3.5,
            ore_grade_mn_percent=41.5,
            reserves_mt=8.7,
            reserve_category="Proven (UNFC 111)",
            geological_confidence=89,
            active_equipment_units=20,
            total_equipment_units=24,
            weather_risk_index="Low",
            rainfall_mm_24h=8.5,
            active_alerts_count=1,
            description="Historical hill deposit transition to high-capacity vertical shaft underground mining system.",
            key_challenge="Shaft deepening civil works causing temporary scheduling bottlenecks for ore hoisting."
        ),
        Mine(
            id="mine-munsar",
            mine_name="Munsar Mine",
            mine_code="MOIL-MN-05",
            district="Nagpur",
            state="Maharashtra",
            latitude=21.3965,
            longitude=79.2941,
            elevation_m=335,
            operational_status="warning",
            mine_type="Underground",
            production_rate_tpd=710,
            planned_monthly_target_tonnes=22000,
            actual_monthly_production_tonnes=19500,
            forecast_variance_percent=-11.4,
            ore_grade_mn_percent=39.8,
            reserves_mt=6.4,
            reserve_category="Probable (UNFC 122)",
            geological_confidence=82,
            active_equipment_units=16,
            total_equipment_units=20,
            weather_risk_index="Moderate",
            rainfall_mm_24h=18.0,
            active_alerts_count=2,
            description="Steeply dipping gonditic bed deposits requiring specialized cut-and-fill stope backfilling operations.",
            key_challenge="Stope void backfilling delays restricting secondary ore pillar extraction."
        ),
        Mine(
            id="mine-chikla",
            mine_name="Chikla Mine",
            mine_code="MOIL-CK-06",
            district="Bhandara",
            state="Maharashtra",
            latitude=21.5540,
            longitude=79.7712,
            elevation_m=295,
            operational_status="active",
            mine_type="Underground",
            production_rate_tpd=680,
            planned_monthly_target_tonnes=20500,
            actual_monthly_production_tonnes=20100,
            forecast_variance_percent=-1.9,
            ore_grade_mn_percent=42.1,
            reserves_mt=5.9,
            reserve_category="Proven (UNFC 111)",
            geological_confidence=91,
            active_equipment_units=15,
            total_equipment_units=18,
            weather_risk_index="Low",
            rainfall_mm_24h=9.0,
            active_alerts_count=0,
            description="Continuous underground production with modernized hydraulic drilling jumbos and electric LHDs.",
            key_challenge="Ventilation thermal load management on deeper sub-levels."
        ),
        Mine(
            id="mine-tirodi",
            mine_name="Tirodi Mine",
            mine_code="MOIL-TR-07",
            district="Balaghat",
            state="Madhya Pradesh",
            latitude=21.6885,
            longitude=79.7042,
            elevation_m=320,
            operational_status="optimal",
            mine_type="Opencast",
            production_rate_tpd=1100,
            planned_monthly_target_tonnes=32000,
            actual_monthly_production_tonnes=32800,
            forecast_variance_percent=2.5,
            ore_grade_mn_percent=44.0,
            reserves_mt=11.5,
            reserve_category="Proven (UNFC 111)",
            geological_confidence=93,
            active_equipment_units=26,
            total_equipment_units=28,
            weather_risk_index="Low",
            rainfall_mm_24h=14.5,
            active_alerts_count=0,
            description="Multi-pit opencast cluster producing metallurgical grade lumps and fines for regional ferro-alloy smelters.",
            key_challenge="Periodic pit dewatering pipe refurbishment across older quarry sections."
        )
    ]
    for m in mines_seed:
        db.add(m)

    # 3. Seed Prospects
    prospects_seed = [
        GeologicalProspect(
            id="prospect-sauser-north",
            mine_id="mine-balaghat",
            name="Sauser Belt Fold Extension (North Balaghat)",
            latitude=21.8920,
            longitude=80.2980,
            region="Balaghat-Bhandara Belt",
            state="Madhya Pradesh",
            prospectivity_score=91.4,
            confidence_score=78.5,
            unfc_status="UNFC 333 (Inferred)",
            depth_min_m=85,
            depth_max_m=240,
            estimated_tonnage_potential_mt=14.2,
            primary_lithology="Mansar Quartzite & Gondite Bedded Horizon",
            structural_compatibility=94.0,
            satellite_indicator_score=88.5,
            borehole_evidence_score=72.0,
            validation_priority="P1 - Immediate Core Drilling",
            surface_indicators=[
                "Gondite float mapping matching Mansar Formation strike",
                "Landsat-9 SWIR hydrothermal alteration spectral band ratio anomaly",
                "Structural anticlinal axial plunge tracing 4.2 km eastward"
            ],
            nearby_boreholes_count=6,
            recommended_action="Deploy 4 diamond wireline exploratory boreholes down to 250m on 200m grid spacing.",
            radar_metrics={"geological": 94, "structural": 92, "satellite": 89, "borehole": 72, "completeness": 81, "confidence": 79},
            shap_explanations={"SWIR Alteration Ratio": 0.38, "Anticlinal Fold Compatibility": 0.32, "Magnetic Gradient": 0.18, "Proximity to Core Anomaly": 0.12}
        ),
        GeologicalProspect(
            id="prospect-bhandara-south",
            mine_id="mine-tirodi",
            name="South Tirodi Synclinal Limb",
            latitude=21.6250,
            longitude=79.6450,
            region="Tirodi Gneissic Complex",
            state="Maharashtra",
            prospectivity_score=84.8,
            confidence_score=83.2,
            unfc_status="UNFC 332 (Indicated)",
            depth_min_m=40,
            depth_max_m=160,
            estimated_tonnage_potential_mt=8.7,
            primary_lithology="Banded Braunitic Quartzite with Spessartine Schist",
            structural_compatibility=88.5,
            satellite_indicator_score=81.0,
            borehole_evidence_score=86.0,
            validation_priority="P1 - Immediate Core Drilling",
            surface_indicators=[
                "High ground-magnetic anomaly gradient along contact shear",
                "Sentinel-2 iron-oxide index enrichment cluster",
                "Historical trench assays averaging 38.6% Mn"
            ],
            nearby_boreholes_count=11,
            recommended_action="Execute infill core sampling to convert UNFC 332 to UNFC 122 reserves for open-pit expansion.",
            radar_metrics={"geological": 89, "structural": 88, "satellite": 81, "borehole": 86, "completeness": 85, "confidence": 83},
            shap_explanations={"Ground Magnetic Gradient": 0.41, "Iron Oxide Index": 0.29, "Assay Proximity": 0.18, "Lithologic Conformity": 0.12}
        )
    ]
    for p in prospects_seed:
        db.add(p)

    # 4. Seed Boreholes
    bh_seed = [
        Borehole(
            id="BH-BG-2023-14",
            mine_id="mine-balaghat",
            borehole_code="BH-BG-14",
            latitude=21.8055,
            longitude=80.2045,
            depth_m=320,
            collar_elevation_m=346,
            drilled_year=2023,
            strata=[
                {"fromM": 0, "toM": 18, "rockType": "Laterite & Weathered Topsoil", "oreGradeMnPercent": 4.2, "color": "#C28251"},
                {"fromM": 18, "toM": 75, "rockType": "Muscovite Schist & Quartzite", "oreGradeMnPercent": 7.1, "color": "#7E8B92"},
                {"fromM": 75, "toM": 135, "rockType": "Gondite / Spessartite Bed", "oreGradeMnPercent": 24.8, "color": "#5C4A6F"},
                {"fromM": 135, "toM": 220, "rockType": "High-Grade Braunite-Pyrolusite Reef", "oreGradeMnPercent": 48.4, "color": "#54D8E8"},
                {"fromM": 220, "toM": 285, "rockType": "Manganiferous Quartzite Interbed", "oreGradeMnPercent": 31.2, "color": "#6A5688"},
                {"fromM": 285, "toM": 320, "rockType": "Tirodi Gneiss Basement", "oreGradeMnPercent": 2.1, "color": "#3A4856"}
            ]
        ),
        Borehole(
            id="BH-BG-2024-03",
            mine_id="mine-balaghat",
            borehole_code="BH-BG-03",
            latitude=21.8038,
            longitude=80.2018,
            depth_m=390,
            collar_elevation_m=344,
            drilled_year=2024,
            strata=[
                {"fromM": 0, "toM": 22, "rockType": "Colluvium & Alluvium", "oreGradeMnPercent": 3.5, "color": "#C28251"},
                {"fromM": 22, "toM": 95, "rockType": "Mica Schist", "oreGradeMnPercent": 5.8, "color": "#7E8B92"},
                {"fromM": 95, "toM": 165, "rockType": "Gonditic Ore Zone", "oreGradeMnPercent": 29.5, "color": "#5C4A6F"},
                {"fromM": 165, "toM": 275, "rockType": "Massive Braunite Orebody", "oreGradeMnPercent": 51.2, "color": "#54D8E8"},
                {"fromM": 275, "toM": 340, "rockType": "Low-Grade Siliceous Ore", "oreGradeMnPercent": 22.0, "color": "#6A5688"},
                {"fromM": 340, "toM": 390, "rockType": "Gneissic Footwall", "oreGradeMnPercent": 1.8, "color": "#3A4856"}
            ]
        )
    ]
    for b in bh_seed:
        db.add(b)

    # 5. Seed Risk Assessments
    risk_seed = [
        RiskAssessment(
            id="RISK-BG-2026-081",
            mine_id="mine-balaghat",
            risk_code="R-BG-081",
            severity="critical",
            category="Rainfall & Geohazard",
            title="Severe Inundation & Deep Haulage Winze Flooding",
            description="Continuous 124.5mm monsoon downpour has overwhelmed sump dewatering station #4 on Sub-Level 7. Inflow velocity exceeds 850 gpm.",
            probability_percent=92,
            estimated_shortfall_tonnes=8800,
            forecast_date="2026-11-04",
            workflow_ripple=[
                {"stage": "Sub-Level Drainage", "impact": "Pump capacity operating at 115% threshold; 45cm standing water in drive 4B", "severity": "critical"},
                {"stage": "Drilling & Blasting", "impact": "Sub-Level 7 stopes halted due to wet explosive misfire protocol", "severity": "high"},
                {"stage": "Underground Tramming", "impact": "Battery locomotives restricted from haulage crosscuts", "severity": "high"},
                {"stage": "Shaft Hoisting", "impact": "Ore skips running 40% below daily tonnage throughput", "severity": "critical"},
                {"stage": "Surface Dispatch", "impact": "Direct shortfall in high-grade 44% Mn lump delivery to Bhilai Steel Plant", "severity": "critical"}
            ],
            recommended_action="Activate auxiliary high-head submersible pump bank #2 and divert haulage locomotives to Upper Level 4."
        )
    ]
    for r in risk_seed:
        db.add(r)

    db.commit()

if __name__ == "__main__":
    db = SessionLocal()
    seed_database(db)
    print("Database seeded successfully with validated MOIL mining cadastre records.")

