"""
API: Health Check Endpoint
"""
from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(tags=["Health"])


@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "ACT API",
        "version": "1.0.0",
        "environment": "production",
        "mode": "DEMO / SIMULATION SUPPORTED",
        "system": "ACT — Actionable Crisis Translator",
        "tagline": "From Emergency Warnings to Personal Action.",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "agents_operational": [
            "Alert Analyst (Agent 1)",
            "Risk Analyst (Agent 2)",
            "Route Analyst (Agent 3)",
            "Action Planner (Agent 4)",
            "Communication Agent (Agent 5)"
        ],
        "zero_hallucination_guard": "ACTIVE",
        "offline_caching_ready": True
    }
