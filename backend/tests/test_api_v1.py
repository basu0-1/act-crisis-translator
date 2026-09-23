"""
Unit & Integration Tests for ACT Enterprise API v1 (/api/*)
Verifies all standardized endpoints, roadblock recalculation demo, source hierarchy, and multi-emergency engine.
"""
from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.alert import Alert, AlertSeverity, AlertCertainty, HazardType, SourceLevel, SourceProvenance
from app.schemas.user import UserProfile, MobilityType, TransportType, CompanionType
from app.engines.risk_engine import RiskEngine
from app.engines.alert_engine import AlertEngine
from app.agents.action_planner import ActionPlannerAgent

client = TestClient(app)


def test_api_health_contract():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["ok", "healthy"]
    assert "service" in data
    assert "version" in data


def test_api_decision_current():
    res = client.get("/api/decision/current")
    assert res.status_code == 200
    data = res.json()
    assert "alert" in data
    assert "risk" in data
    assert "action_plan" in data
    assert "route_recommendation" in data
    assert "shelters" in data


def test_api_demo_roadblock_and_reset():
    # 1. Reset
    res_reset = client.post("/api/demo/reset")
    assert res_reset.status_code == 200
    state1 = res_reset.json()
    assert state1["route_recommendation"]["destination"]["id"] == "SHELTER_B"

    # 2. Trigger Roadblock on R3 (Highland Blvd)
    res_block = client.post("/api/demo/trigger-roadblock")
    assert res_block.status_code == 200
    state2 = res_block.json()
    # Route recalculates to Shelter C
    assert state2["route_recommendation"]["destination"]["id"] == "SHELTER_C"
    assert "ROAD BLOCKAGE DETECTED" in state2["last_event_description"]

    # 3. Reset again to restore Shelter B
    res_reset2 = client.post("/api/demo/reset")
    assert res_reset2.status_code == 200
    state3 = res_reset2.json()
    assert state3["route_recommendation"]["destination"]["id"] == "SHELTER_B"


def test_api_admin_sources_catalog():
    res = client.get("/api/admin/sources")
    assert res.status_code == 200
    catalog = res.json()
    titles = [item["title"] for item in catalog]
    assert any("Level 1" in t for t in titles)
    assert any("Level 2" in t for t in titles)
    assert any("Level 3" in t for t in titles)
    assert any("Level 4" in t for t in titles)


def test_api_routes_endpoints():
    res_shelters = client.get("/api/routes/shelters")
    assert res_shelters.status_code == 200
    assert len(res_shelters.json()) >= 3

    res_roads = client.get("/api/routes/roads")
    assert res_roads.status_code == 200
    assert len(res_roads.json()) >= 6

    res_recalc = client.post("/api/routes/recalculate?mobility=wheelchair")
    assert res_recalc.status_code == 200
    data = res_recalc.json()
    assert data["recommended_route"]["is_accessible"] is True


def test_source_conflict_resolution():
    alert_official = Alert(
        id="ALT-001",
        headline="Official Evacuation Notice",
        description="NDMA evacuation advisory",
        required_action="evacuate",
        severity=AlertSeverity.EXTREME,
        certainty=AlertCertainty.OBSERVED,
        hazard_type=HazardType.FLOOD,
        source_level=SourceLevel.LEVEL_1_OFFICIAL,
        provenance=SourceProvenance(
            source_name="NDMA Emergency Dispatch",
            source_level=SourceLevel.LEVEL_1_OFFICIAL,
            timestamp=datetime.now(timezone.utc).isoformat(),
            confidence=0.98,
            verified=True
        ),
        created_at=datetime.now(timezone.utc).isoformat(),
        lat=28.6139,
        lng=77.2090,
        radius_km=5.0,
        time_to_impact_minutes=25
    )
    alert_crowd = Alert(
        id="ALT-002",
        headline="Crowd Post: Water clearing",
        description="Social post",
        required_action="shelter_in_place",
        severity=AlertSeverity.LOW,
        certainty=AlertCertainty.POSSIBLE,
        hazard_type=HazardType.FLOOD,
        source_level=SourceLevel.LEVEL_4_UNVERIFIED_USER,
        provenance=SourceProvenance(
            source_name="Social Media User",
            source_level=SourceLevel.LEVEL_4_UNVERIFIED_USER,
            timestamp=datetime.now(timezone.utc).isoformat(),
            confidence=0.45,
            verified=False
        ),
        created_at=datetime.now(timezone.utc).isoformat(),
        lat=28.6139,
        lng=77.2090,
        radius_km=5.0,
        time_to_impact_minutes=90
    )

    winner = AlertEngine.resolve_source_conflict(alert_official, alert_crowd)
    assert winner.id == "ALT-001"
    assert winner.source_level == SourceLevel.LEVEL_1_OFFICIAL


def test_multi_hazard_risk_and_plans():
    hazards = [
        HazardType.FLOOD,
        HazardType.WILDFIRE,
        HazardType.CYCLONE,
        HazardType.EARTHQUAKE,
        HazardType.EXTREME_HEAT,
        HazardType.URBAN_EMERGENCY
    ]

    user = UserProfile(
        id="USR-TEST",
        name="Test Citizen",
        mobility=MobilityType.WHEELCHAIR,
        transport=TransportType.WALKING,
        companions=CompanionType.CHILD,
        lat=28.6140,
        lng=77.2095
    )

    for h in hazards:
        prov = SourceProvenance(
            source_name="National Emergency Service",
            source_level=SourceLevel.LEVEL_1_OFFICIAL,
            timestamp=datetime.now(timezone.utc).isoformat(),
            confidence=0.95,
            verified=True
        )
        alert = Alert(
            id=f"ALT-{h.value.upper()}",
            headline=f"Major {h.value.title()} Emergency",
            description=f"Standard protocol for {h.value}.",
            required_action="evacuate",
            severity=AlertSeverity.HIGH,
            certainty=AlertCertainty.OBSERVED,
            hazard_type=h,
            source_level=SourceLevel.LEVEL_1_OFFICIAL,
            provenance=prov,
            created_at=datetime.now(timezone.utc).isoformat(),
            lat=28.6139,
            lng=77.2090,
            radius_km=6.0,
            time_to_impact_minutes=35
        )

        risk = RiskEngine.calculate_risk(alert, user)
        assert 0 <= risk.score <= 100
        assert len(risk.reasons) > 0
        assert risk.hazard_type == h.value

        plan = ActionPlannerAgent.generate_plan(
            verified_facts={
                "hazard_type": h.value,
                "risk_score": risk.score,
                "risk_level": risk.level.value,
                "destination_shelter": "Safe Haven Center",
                "route_name": "Verified Evacuation Route",
                "route_time_minutes": 15,
                "action_window_minutes": 35,
                "user_mobility": user.mobility.value
            },
            provenance=alert.provenance
        )
        assert len(plan.now) > 0
        assert len(plan.avoid) > 0
        assert len(plan.if_then) > 0
        assert plan.hazard == h.value


def test_failsafe_behavior():
    prov = SourceProvenance(
        source_name="Anonymous Forum",
        source_level=SourceLevel.LEVEL_4_UNVERIFIED_USER,
        timestamp=datetime.now(timezone.utc).isoformat(),
        confidence=0.2,
        verified=False
    )
    alert_incomplete = Alert(
        id="ALT-INCOMPLETE",
        headline="Unverified Rumor",
        description="Incomplete telemetry data",
        required_action="prepare",
        severity=AlertSeverity.MEDIUM,
        certainty=AlertCertainty.POSSIBLE,
        hazard_type=HazardType.FLOOD,
        source_level=SourceLevel.LEVEL_4_UNVERIFIED_USER,
        provenance=prov,
        created_at=datetime.now(timezone.utc).isoformat(),
        lat=0.0,
        lng=0.0,
        radius_km=0.0,
        time_to_impact_minutes=0
    )

    # Incomplete spatial data must apply conservative fail-safe exposure rather than crash
    user = UserProfile(id="U1", name="U1", mobility=MobilityType.NORMAL, lat=28.6, lng=77.2)
    risk = RiskEngine.calculate_risk(alert_incomplete, user)
    assert risk.score > 0
    assert any("fail-safe" in r.lower() or "boundary" in r.lower() for r in risk.reasons)
