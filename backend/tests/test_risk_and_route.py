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


def test_mobility_tier_route_recalculation(client):
    # Login as user
    login = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    token = login.json()["access_token"]
    alerts = client.get("/api/alerts/active").json()
    alert_id = alerts[0]["id"]

    # 1. Reset demo to ensure clean unblocked state
    client.post("/api/demo/reset", headers={"Authorization": f"Bearer {token}"})

    # 2. Test NORMAL mobility tier (Default)
    res_normal = client.post(
        "/api/routes/calculate",
        headers={"Authorization": f"Bearer {token}"},
        json={"alert_id": alert_id, "mobility": "NORMAL"}
    )
    assert res_normal.status_code == 200
    route_normal = res_normal.json()
    assert route_normal["mobility_tier"] == "NORMAL"
    assert route_normal["distance_meters"] == 1600
    assert route_normal["estimated_time_minutes"] == 10
    props_normal = route_normal["waypoints_geojson"]["properties"]
    assert "Standard pedestrian corridor" in props_normal.get("accessibility_info", "")

    # 3. Test NORMAL -> LIMITED_WALKING
    res_limited = client.post(
        "/api/routes/calculate",
        headers={"Authorization": f"Bearer {token}"},
        json={"alert_id": alert_id, "mobility": "LIMITED_WALKING"}
    )
    assert res_limited.status_code == 200
    route_limited = res_limited.json()
    assert route_limited["mobility_tier"] == "LIMITED_WALKING"
    assert route_limited["distance_meters"] == 1600
    assert route_limited["estimated_time_minutes"] == 14
    props_limited = route_limited["waypoints_geojson"]["properties"]
    assert "step-free corridor with rest zones" in props_limited.get("accessibility_info", "")

    # 4. Test LIMITED_WALKING -> WHEELCHAIR
    res_wheelchair = client.post(
        "/api/routes/calculate",
        headers={"Authorization": f"Bearer {token}"},
        json={"alert_id": alert_id, "mobility": "WHEELCHAIR"}
    )
    assert res_wheelchair.status_code == 200
    route_wheelchair = res_wheelchair.json()
    assert route_wheelchair["mobility_tier"] == "WHEELCHAIR"
    assert route_wheelchair["distance_meters"] == 1650
    assert route_wheelchair["estimated_time_minutes"] == 16
    props_wheelchair = route_wheelchair["waypoints_geojson"]["properties"]
    assert "Step-free curb-cut corridor" in props_wheelchair.get("accessibility_info", "")
    assert route_wheelchair["shelter"]["wheelchair_accessible"] is True

    # 5. Verify user profile and current decision package reflect WHEELCHAIR
    dec_wheelchair = client.get("/api/decision/current", headers={"Authorization": f"Bearer {token}"}).json()
    assert dec_wheelchair["route"]["mobility_tier"] == "WHEELCHAIR"
    assert dec_wheelchair["route"]["estimated_time_minutes"] == 16

    # 6. Test with Riverside Road BLOCKED while preserving WHEELCHAIR mobility
    client.post("/api/demo/trigger-roadblock", headers={"Authorization": f"Bearer {token}"})
    res_blocked_wheelchair = client.post(
        "/api/routes/calculate",
        headers={"Authorization": f"Bearer {token}"},
        json={"alert_id": alert_id, "mobility": "WHEELCHAIR"}
    )
    assert res_blocked_wheelchair.status_code == 200
    route_blocked_wheelchair = res_blocked_wheelchair.json()
    assert route_blocked_wheelchair["is_blocked"] is True
    assert route_blocked_wheelchair["mobility_tier"] == "WHEELCHAIR"
    assert route_blocked_wheelchair["distance_meters"] == 2350
    assert route_blocked_wheelchair["estimated_time_minutes"] == 26

