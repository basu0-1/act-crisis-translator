"""
End-to-End full system validation script for ACT (Actionable Crisis Translator).
Validates complete user journey, decision engine, dynamic road blockage recalculation,
and strict RBAC / admin isolation against a running or test FastAPI instance.
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal, engine, Base
from app.db.seed import seed_database

def run_e2e_verification():
    print("=== STARTING ACT END-TO-END SYSTEM VERIFICATION ===")
    
    # 1. Ensure DB & Seeds
    Base.metadata.create_all(bind=engine)
    seed_database()

    with TestClient(app) as client:
        # Step 1: Health check
        res_health = client.get("/health")
        assert res_health.status_code == 200, f"Health check failed: {res_health.text}"
        print("[PASS] Step 1: System Health Endpoint Verified (200 OK)")

        # Step 2: User Registration with Wheelchair Mobility
        import time
        unique_email = f"jordan.{int(time.time())}@crisis-test.org"
        reg_payload = {
            "full_name": "Jordan Rivera",
            "email": unique_email,
            "password": "SecurePassword123!",
            "preferred_language": "en",
            "mobility": "WHEELCHAIR"
        }
        res_reg = client.post("/api/auth/register", json=reg_payload)
        assert res_reg.status_code == 201, f"Registration failed: {res_reg.text}"
        reg_data = res_reg.json()
        user_token = reg_data["access_token"]
        user_headers = {"Authorization": f"Bearer {user_token}"}
        print(f"[PASS] Step 2: Citizen Registration Verified (Created User #{reg_data['user_id']})")

        # Step 3: Verify Profile & Mobility Tier
        res_me = client.get("/api/users/me", headers=user_headers)
        assert res_me.status_code == 200
        user_obj = res_me.json()
        assert user_obj["profile"]["mobility"] == "WHEELCHAIR"
        print("[PASS] Step 3: User Profile & Wheelchair Mobility Persistence Verified")

        # Step 4: Fetch Emergency Decision Package
        res_decision = client.get("/api/decision/current", headers=user_headers)
        assert res_decision.status_code == 200, f"Decision fetch failed: {res_decision.text}"
        decision = res_decision.json()

        # Check Alert
        assert decision["alert"]["emergency_type"] == "FLOOD"
        assert decision["alert"]["data_status"] == "DEMO"
        print("[PASS] Step 4: Emergency Alert Loaded with DEMO Provenance")

        # Check Risk (mobility factor for wheelchair should be present)
        risk = decision["risk"]
        assert risk["risk_score"] > 0
        factor_names = [f["name"] for f in risk["risk_factors"]]
        assert "Mobility Vulnerability" in factor_names
        print(f"[PASS] Step 5: Personalized Risk Score Computed ({risk['risk_score']} / 100 - {risk['risk_level']})")

        # Check Route
        initial_route = decision["route"]
        assert initial_route["is_blocked"] is False
        assert initial_route["shelter"] is not None
        print(f"[PASS] Step 6: Safe Initial Route Computed to {decision['shelter']['name']} ({initial_route['estimated_time_minutes']} mins)")

        # Step 5: Trigger Roadblock Simulation (Riverside Road blocked by flood waters)
        res_recalc = client.post(
            "/api/routes/recalculate",
            headers=user_headers,
            json={
                "route_id": initial_route["id"],
                "blockage_location": "Riverside Road Bridge",
                "blockage_lat": 37.7780,
                "blockage_lon": -122.4140,
                "reason": "Rapid flood water inundation (>45cm standing water)"
            }
        )
        assert res_recalc.status_code == 200
        recalculated_route = res_recalc.json()
        assert recalculated_route["is_blocked"] is True
        print("[PASS] Step 7: Riverside Road Blockage Event Triggered & Recalculated")

        # Step 6: Verify Updated Decision Package has Diversion Directives
        res_updated_decision = client.get("/api/decision/current", headers=user_headers)
        updated_decision = res_updated_decision.json()
        do_now_items = updated_decision["action_plan"]["do_now"]
        do_now_texts = " ".join([item["text"] for item in do_now_items])
        assert "Riverside Road" in do_now_texts or "Ridge Avenue" in do_now_texts
        assert updated_decision["route"]["is_blocked"] is True
        print("[PASS] Step 8: Action Plan Dynamically Updated with Bypass Directives (DO NOW / IF->THEN)")

        # Step 7: Security Check — Regular citizen attempting Admin Endpoint
        res_admin_denied = client.get("/api/admin/stats", headers=user_headers)
        assert res_admin_denied.status_code == 403
        print("[PASS] Step 9: Regular Citizen Access to Admin Console Blocked (403 Forbidden Verified)")

        # Step 8: Admin Authentication & Console Verification
        admin_login = client.post("/api/auth/login", json={
            "email": "admin@act-emergency.org",
            "password": "Admin@ACT2026!"
        })
        assert admin_login.status_code == 200
        admin_token = admin_login.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        res_admin_stats = client.get("/api/admin/stats", headers=admin_headers)
        assert res_admin_stats.status_code == 200
        stats = res_admin_stats.json()
        assert stats["total_users"] >= 2
        print(f"[PASS] Step 10: Admin Clearance Verified (System Users: {stats['total_users']}, Active Alerts: {stats['active_alerts']})")

        # Step 9: Security Audit Trail Verification
        res_audit = client.get("/api/admin/audit", headers=admin_headers)
        assert res_audit.status_code == 200
        logs = res_audit.json()
        assert len(logs) > 0
        actions = [log["action"] for log in logs]
        assert "REGISTER" in actions or "LOGIN" in actions or "ROUTE_RECALCULATED" in actions
        print("[PASS] Step 11: Security Audit Log Trail Inspected & Verified")

    print("=== ALL ACT END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY ===")
    return True

if __name__ == "__main__":
    run_e2e_verification()
