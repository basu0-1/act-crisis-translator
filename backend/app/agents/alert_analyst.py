"""
Agent 1: Alert Analyst
Question: "What is happening?"
Normalizes incoming alerts and extracts structured parameters.
"""
from typing import Dict, Any
from app.schemas.alert import Alert, HazardType, AlertSeverity, AlertCertainty, SourceLevel, SourceProvenance


class AlertAnalystAgent:
    """Agent 1: Normalizes raw emergency telemetry into validated structured JSON"""

    @classmethod
    def analyze(cls, alert: Alert) -> Dict[str, Any]:
        return {
            "hazard": alert.hazard_type.value,
            "severity": alert.severity.value,
            "certainty": alert.certainty.value,
            "headline": alert.headline,
            "affected_radius_km": alert.radius_km,
            "time_to_impact_minutes": alert.time_to_impact_minutes,
            "required_action": alert.required_action,
            "source_level": f"Level {alert.source_level.value} ({alert.provenance.source_name})",
            "confidence": alert.provenance.confidence,
            "timestamp": alert.provenance.timestamp
        }
