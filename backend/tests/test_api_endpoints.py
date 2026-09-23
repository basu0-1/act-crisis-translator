"""
Tests for FastAPI Integration Endpoints & Simulation Machine
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.simulation import SimulationEventType

client = TestClient(app)


def test_api_health():
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["ok", "healthy"]
    assert "ACT" in data["system"]
    assert len(data["agents_operational"]) == 5


def test_api_active_alert():
    res = client.get("/alerts/active")
    assert res.status_code == 200
    assert res.json()["hazard_type"] == "flood"


def test_api_user_profile():
    res = client.get("/user/profile")
    assert res.status_code == 200
    assert res.json()["name"] == "Demo User"


def test_api_risk_calculate():
    res = client.post("/risk/calculate")
    assert res.status_code == 200
    data = res.json()
    assert 0 <= data["score"] <= 100
    assert len(data["reasons"]) > 0


def test_api_route_recalculate():
    res = client.post("/route/recalculate")
    assert res.status_code == 200
    data = res.json()
    assert data["recommended_route"] is not None


def test_api_plan_generate():
    res = client.post("/plan/generate?language=en")
    assert res.status_code == 200
    data = res.json()
    assert len(data["now"]) > 0
    assert len(data["avoid"]) > 0


def test_simulation_workflow():
    # 1. Reset simulation
    res_reset = client.post("/simulate/reset")
    assert res_reset.status_code == 200
    state1 = res_reset.json()
    assert state1["route_recommendation"]["destination"]["id"] == "SHELTER_B"

    # 2. Trigger Road Blockage on R3 (Highland Blvd)
    res_block = client.post("/simulate/event", json={
        "event_type": "road_blocked",
        "road_id": "R3"
    })
    assert res_block.status_code == 200
    state2 = res_block.json()
    # Route should dynamically shift to Shelter C
    assert state2["route_recommendation"]["destination"]["id"] == "SHELTER_C"
    assert "ROAD BLOCKAGE DETECTED" in state2["last_event_description"]

    # 3. Change language to Japanese
    res_lang = client.post("/simulate/event", json={
        "event_type": "language_changed",
        "language": "ja"
    })
    assert res_lang.status_code == 200
    state3 = res_lang.json()
    assert state3["action_plan"]["language"] == "ja"
