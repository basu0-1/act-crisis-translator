def test_admin_alert_creation_and_update(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@act-emergency.org",
        "password": "Admin@ACT2026!"
    })
    token = admin_login.json()["access_token"]

    # Create new alert
    create_res = client.post(
        "/api/admin/alerts",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "Severe Storm Surge Advisory",
            "description": "High tide confluence expected to impact coastal harbor zone.",
            "emergency_type": "STORM",
            "severity": "MODERATE",
            "certainty": "LIKELY",
            "time_to_impact_minutes": 45,
            "data_status": "DEMO",
            "is_active": True
        }
    )
    assert create_res.status_code == 201
    alert_data = create_res.json()
    new_alert_id = alert_data["id"]
    assert alert_data["title"] == "Severe Storm Surge Advisory"

    # Update the alert
    update_res = client.put(
        f"/api/admin/alerts/{new_alert_id}",
        headers={"Authorization": f"Bearer {token}"},
        json={"severity": "EXTREME", "time_to_impact_minutes": 20}
    )
    assert update_res.status_code == 200
    assert update_res.json()["severity"] == "EXTREME"
    assert update_res.json()["time_to_impact_minutes"] == 20


def test_admin_shelter_creation(client):
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@act-emergency.org",
        "password": "Admin@ACT2026!"
    })
    token = admin_login.json()["access_token"]

    create_res = client.post(
        "/api/admin/shelters",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "North Hill Secondary Gymnasium",
            "address": "902 North Hill Way",
            "latitude": 37.7900,
            "longitude": -122.4200,
            "capacity_total": 300,
            "capacity_available": 240,
            "wheelchair_accessible": True,
            "medical_support": True,
            "pet_friendly": True,
            "status": "OPEN"
        }
    )
    assert create_res.status_code == 201
    assert create_res.json()["name"] == "North Hill Secondary Gymnasium"


def test_demo_urgency_trigger(client):
    user_login = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    token = user_login.json()["access_token"]

    # Trigger urgency shift to 10 minutes
    res = client.post(
        "/api/demo/trigger-urgency?minutes=10",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "10 minutes" in data["message"]
    assert data["new_risk_score"] > 0
