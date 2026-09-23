"""
Tests for Multi-User Authentication and Server-Side Role-Based Access Control (RBAC)
"""
import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_user_registration_and_jwt():
    unique_email = f"sarah.{uuid.uuid4().hex[:6]}@emergency.ai"
    res = client.post("/auth/register", json={
        "email": unique_email,
        "password": "SecurePassword999!",
        "name": "Sarah Connor",
        "mobility": "limited",
        "transport": "walking",
        "companions": "child",
        "language": "en",
        "accessibility_requirements": ["Step-free access"]
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == unique_email
    assert data["user"]["role"] == "user"
    assert data["user"]["mobility"] == "limited"


def test_user_login_invalid_password():
    unique_email = f"user.{uuid.uuid4().hex[:6]}@emergency.ai"
    client.post("/auth/register", json={
        "email": unique_email,
        "password": "CorrectPassword123!",
        "name": "Test User",
        "mobility": "normal"
    })
    res = client.post("/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword!"
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_user_login_success():
    unique_email = f"user.{uuid.uuid4().hex[:6]}@emergency.ai"
    client.post("/auth/register", json={
        "email": unique_email,
        "password": "CorrectPassword123!",
        "name": "Test User",
        "mobility": "normal"
    })
    res = client.post("/auth/login", json={
        "email": unique_email,
        "password": "CorrectPassword123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_demo_quick_logins():
    # Regular Demo User
    res_user = client.post("/auth/demo-login", json={"role": "user"})
    assert res_user.status_code == 200
    assert res_user.json()["user"]["role"] == "user"

    # Admin Tester User
    res_admin = client.post("/auth/demo-login", json={"role": "admin"})
    assert res_admin.status_code == 200
    assert res_admin.json()["user"]["role"] == "admin"


def test_rbac_end_user_blocked_from_admin():
    # 1. Login as standard end user
    res_user = client.post("/auth/demo-login", json={"role": "user"})
    user_token = res_user.json()["access_token"]

    # 2. Attempt to access Admin User DB
    res_blocked = client.get(
        "/admin/users",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    # MUST return 403 Forbidden!
    assert res_blocked.status_code == 403
    assert "Forbidden" in res_blocked.json()["detail"]


def test_rbac_admin_permitted_to_manage_db():
    # 1. Login as Admin
    res_admin = client.post("/auth/demo-login", json={"role": "admin"})
    admin_token = res_admin.json()["access_token"]

    # 2. Access Admin Users
    res_users = client.get(
        "/admin/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_users.status_code == 200
    assert len(res_users.json()) >= 2

    # 3. Access Admin Audit Logs
    res_audit = client.get(
        "/admin/audit-logs",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_audit.status_code == 200

    # 4. Access Admin Config
    res_config = client.get(
        "/admin/config",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_config.status_code == 200
    assert res_config.json()["security_policy"] == "Strict RBAC (JWT HS256)"


def test_admin_create_and_delete_alert():
    res_admin = client.post("/auth/demo-login", json={"role": "admin"})
    admin_token = res_admin.json()["access_token"]

    # Create live alert
    res_create = client.post(
        "/admin/alerts",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "hazard_type": "flood",
            "severity": "extreme",
            "certainty": "observed",
            "headline": "LIVE FLASH FLOOD WARNING: East Sector",
            "description": "Critical dam overflow triggered.",
            "source_type": "live",
            "source_name": "Central Water Commission Telemetry",
            "time_to_impact_minutes": 15
        }
    )
    assert res_create.status_code == 200
    alert_id = res_create.json()["id"]

    # Delete alert
    res_del = client.delete(
        f"/admin/alerts/{alert_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "deleted"
