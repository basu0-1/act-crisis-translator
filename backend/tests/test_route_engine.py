"""
Tests for Route Engine, Graph Pathfinding, Accessibility & Dynamic Recalculation
"""
import pytest
from app.schemas.user import UserProfile, MobilityType, TransportType, CompanionType, LanguageType
from app.schemas.route import Road, RoadStatus, Shelter, ShelterStatus
from app.engines.route_engine import RouteEngine
from app.data.mock_database import DEFAULT_ROADS, DEFAULT_SHELTERS


def test_limited_mobility_rejects_stairs():
    limited_user = UserProfile(
        id="user-lim",
        name="Limited User",
        lat=28.6139,
        lng=77.2090,
        language=LanguageType.EN,
        mobility=MobilityType.LIMITED,
        transport=TransportType.WALKING,
        companions=CompanionType.NONE
    )
    rec = RouteEngine.calculate_best_route(DEFAULT_ROADS, DEFAULT_SHELTERS, limited_user)
    assert rec.recommended_route is not None
    assert rec.destination is not None
    # Verify recommended route has no stairs
    assert rec.recommended_route.has_stairs is False
    # Verify rejected routes list includes Old Town Stairway
    rejected_reasons = [r.get("reason", "") for r in rec.rejected_routes]
    assert any("stairs" in r.lower() for r in rejected_reasons)


def test_dynamic_roadblock_recalculates_to_new_shelter():
    limited_user = UserProfile(
        id="user-lim",
        name="Limited User",
        lat=28.6139,
        lng=77.2090,
        language=LanguageType.EN,
        mobility=MobilityType.LIMITED,
        transport=TransportType.WALKING,
        companions=CompanionType.NONE
    )
    # Initial state: Highland Blvd (R3) goes to Shelter B
    rec1 = RouteEngine.calculate_best_route(DEFAULT_ROADS, DEFAULT_SHELTERS, limited_user)
    assert rec1.destination.id == "SHELTER_B"

    # Simulate R3 becoming BLOCKED
    modified_roads = [r.model_copy() for r in DEFAULT_ROADS]
    for r in modified_roads:
        if r.id == "R3":
            r.status = RoadStatus.BLOCKED

    # Recalculate: Should now choose Ridge Connector (R6) -> Shelter C
    rec2 = RouteEngine.calculate_best_route(modified_roads, DEFAULT_SHELTERS, limited_user)
    assert rec2.recommended_route is not None
    assert rec2.destination.id == "SHELTER_C"


def test_no_open_shelter_returns_insufficient_info():
    user = UserProfile()
    closed_shelters = [s.model_copy() for s in DEFAULT_SHELTERS]
    for s in closed_shelters:
        s.status = ShelterStatus.CLOSED

    rec = RouteEngine.calculate_best_route(DEFAULT_ROADS, closed_shelters, user)
    assert rec.status == "insufficient_info"
    assert rec.recommended_route is None
