def test_normal_user_denied_admin_access(client):
    # Login as regular user
    user_login = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    user_token = user_login.json()["access_token"]
    
    # Try accessing admin stats
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    assert res.status_code == 403
    assert "Administrative privileges required" in res.json()["detail"]

    # Try listing admin audit logs
    res_audit = client.get("/api/admin/audit", headers={"Authorization": f"Bearer {user_token}"})
    assert res_audit.status_code == 403


def test_admin_permitted_access(client):
    # Login as admin
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@act-emergency.org",
        "password": "Admin@ACT2026!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]

    # Access admin stats
    res = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    stats = res.json()
    assert stats["total_users"] >= 2
    assert stats["active_alerts"] >= 1
    assert stats["system_status"] == "HEALTHY_OPERATIONAL"

    # Access audit logs
    res_audit = client.get("/api/admin/audit", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_audit.status_code == 200


def test_user_profile_isolation(client):
    # User A logs in
    login_a = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    token_a = login_a.json()["access_token"]

    # User A updates profile
    res = client.put(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token_a}"},
        json={"full_name": "Elena Updated Chen"}
    )
    assert res.status_code == 200
    assert res.json()["full_name"] == "Elena Updated Chen"

    # Wheelchair user logs in
    login_b = client.post("/api/auth/login", json={
        "email": "wheelchair@example.com",
        "password": "User@ACT2026!"
    })
    token_b = login_b.json()["access_token"]

    # Wheelchair user profile remains untouched
    res_b = client.get("/api/users/me", headers={"Authorization": f"Bearer {token_b}"})
    assert res_b.status_code == 200
    assert res_b.json()["profile"]["full_name"] == "Marcus Vance"
