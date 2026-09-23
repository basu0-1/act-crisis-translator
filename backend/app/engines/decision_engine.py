"""
Decision Engine for ACT: Fact Harmonization, Safety Assurance & Fail-Safe Verification
"""
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.schemas.alert import Alert, SourceLevel
from app.schemas.user import UserProfile
from app.schemas.risk import PersonalRisk
from app.schemas.route import RouteRecommendation
from app.schemas.plan import ActionPlan, IfThenRule


class DecisionEngine:
    """Combines deterministic engine outputs into verified factual envelope"""

    @staticmethod
    def build_verified_facts(
        alert: Alert,
        user: UserProfile,
        risk: PersonalRisk,
        route_rec: RouteRecommendation
    ) -> Dict[str, Any]:
        """Produces strict verified structured facts for the AI Action Planner"""

        has_valid_route = route_rec.recommended_route is not None and route_rec.status == "available"
        has_valid_shelter = route_rec.destination is not None

        # Fail-Safe check
        failsafe_status = None
        failsafe_reason = None
        if not has_valid_route or not has_valid_shelter:
            failsafe_status = "⚠️ INSUFFICIENT INFORMATION"
            failsafe_reason = "Safe accessible route could not be guaranteed with current road telemetry. Shelter-in-place advisory activated."

        hazard_val = alert.hazard_type.value if hasattr(alert.hazard_type, "value") else str(alert.hazard_type)
        severity_val = alert.severity.value if hasattr(alert.severity, "value") else str(alert.severity)
        certainty_val = alert.certainty.value if hasattr(alert.certainty, "value") else str(alert.certainty)
        source_name = alert.provenance.source_name if (alert.provenance and alert.provenance.source_name) else "Information unavailable."
        source_lvl = alert.source_level.value if hasattr(alert.source_level, "value") else (int(alert.source_level) if alert.source_level else 1)

        user_name = user.name if user and user.name else "Information unavailable."
        user_mob = user.mobility.value if (user and hasattr(user.mobility, "value")) else (str(user.mobility) if user else "normal")
        user_trn = user.transport.value if (user and hasattr(user.transport, "value")) else (str(user.transport) if user else "walking")

        risk_score = risk.score if risk else 50
        risk_lvl = risk.level.value if (risk and hasattr(risk.level, "value")) else (str(risk.level) if risk else "medium")
        action_win = risk.estimated_action_window_minutes if risk else (alert.time_to_impact_minutes or 30)

        dest_name = route_rec.destination.name if has_valid_shelter else "Information unavailable."
        dest_addr = route_rec.destination.address if has_valid_shelter else "Information unavailable."
        dest_cap = (route_rec.destination.capacity - route_rec.destination.current_occupancy) if has_valid_shelter else 0
        route_nm = route_rec.recommended_route.name if has_valid_route else "Information unavailable."
        route_tm = route_rec.estimated_time_minutes if has_valid_route else 0
        route_sc = route_rec.safety_score if has_valid_route else 0
        rej_hazards = [r.get("reason", "") for r in (route_rec.rejected_routes or [])[:2]]

        facts = {
            "hazard_type": hazard_val,
            "severity": severity_val,
            "certainty": certainty_val,
            "time_to_impact_minutes": alert.time_to_impact_minutes,
            "source_authority": source_name,
            "source_level": source_lvl,
            "user_name": user_name,
            "user_mobility": user_mob,
            "user_transport": user_trn,
            "risk_score": risk_score,
            "risk_level": risk_lvl,
            "action_window_minutes": action_win,
            "has_valid_route": has_valid_route,
            "destination_shelter": dest_name,
            "destination_address": dest_addr,
            "destination_capacity_available": dest_cap,
            "route_name": route_nm,
            "route_time_minutes": route_tm,
            "route_safety_score": route_sc,
            "rejected_hazards": rej_hazards,
            "failsafe_status": failsafe_status,
            "failsafe_reason": failsafe_reason
        }
        return facts
