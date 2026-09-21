def test_get_active_alerts_and_shelters(client):
    alerts_res = client.get("/api/alerts/active")
    assert alerts_res.status_code == 200
    alerts = alerts_res.json()
    assert len(alerts) >= 1
    assert alerts[0]["emergency_type"] == "FLOOD"
    assert alerts[0]["data_status"] == "DEMO"

    shelters_res = client.get("/api/shelters")
    assert shelters_res.status_code == 200
    shelters = shelters_res.json()
    assert len(shelters) >= 2


def test_calculate_risk(client):
    login = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    token = login.json()["access_token"]
    alerts = client.get("/api/alerts/active").json()
    alert_id = alerts[0]["id"]

    res = client.post(
        "/api/risk/calculate",
        headers={"Authorization": f"Bearer {token}"},
        json={"alert_id": alert_id}
    )
    assert res.status_code == 200
    risk = res.json()
    assert 0 <= risk["risk_score"] <= 100
    assert len(risk["risk_factors"]) >= 3
    assert risk["disclaimer"] == "Prototype decision-support score"


def test_calculate_route_and_dynamic_recalculation(client):
    # Login as user
    login = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    token = login.json()["access_token"]
    alerts = client.get("/api/alerts/active").json()
    alert_id = alerts[0]["id"]

    # 1. Initial route calculation
    calc_res = client.post(
        "/api/routes/calculate",
        headers={"Authorization": f"Bearer {token}"},
        json={"alert_id": alert_id}
    )
    assert calc_res.status_code == 200
    initial_route = calc_res.json()
    assert initial_route["is_blocked"] is False
    assert initial_route["distance_meters"] > 0
    route_id = initial_route["id"]

    # 2. Check full decision package
    dec_res = client.get("/api/decision/current", headers={"Authorization": f"Bearer {token}"})
    assert dec_res.status_code == 200
    dec = dec_res.json()
    assert len(dec["action_plan"]["do_now"]) >= 1
    assert len(dec["action_plan"]["avoid"]) >= 1
    assert len(dec["action_plan"]["if_then"]) >= 1

    # 3. Dynamic recalculation on road blockage
    recalc_res = client.post(
        "/api/routes/recalculate",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "route_id": route_id,
            "blockage_location": "Riverside Road Bridge",
            "blockage_lat": 37.7780,
            "blockage_lon": -122.4140,
            "reason": "Rapid flood water inundation"
        }
    )
    assert recalc_res.status_code == 200
    updated_route = recalc_res.json()
    assert updated_route["is_blocked"] is True
    assert "flood" in updated_route["blocked_reason"].lower()

    # 4. Verify updated decision package has detour instructions
    dec_after = client.get("/api/decision/current", headers={"Authorization": f"Bearer {token}"}).json()
    do_now_texts = " ".join([item["text"] for item in dec_after["action_plan"]["do_now"]])
    assert "Riverside Road" in do_now_texts or "Ridge" in do_now_texts
