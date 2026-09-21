def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "ACT API" in data["service"]


def test_user_registration(client):
    res = client.post("/api/auth/register", json={
        "full_name": "Test Citizen",
        "email": "citizen_unique@test.com",
        "password": "Password123!",
        "preferred_language": "en",
        "mobility": "NORMAL"
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user_role"] == "END_USER"
    assert data["full_name"] == "Test Citizen"


def test_duplicate_registration_fails(client):
    # Try registering with existing test user email
    res = client.post("/api/auth/register", json={
        "full_name": "Duplicate User",
        "email": "user@example.com",
        "password": "Password123!",
        "preferred_language": "en",
        "mobility": "NORMAL"
    })
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]


def test_user_login_success(client):
    res = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user_role"] == "END_USER"


def test_user_login_invalid_password(client):
    res = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Incorrect email or password" in res.json()["detail"]


def test_protected_route_unauthorized(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_protected_route_authorized(client):
    login_res = client.post("/api/auth/login", json={
        "email": "user@example.com",
        "password": "User@ACT2026!"
    })
    token = login_res.json()["access_token"]
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["email"] == "user@example.com"
    assert user_data["profile"]["full_name"] == "Elena Chen"
