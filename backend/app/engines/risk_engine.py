"""
Risk Engine for ACT: Transparent Prototype Decision-Support Scoring
"""
from typing import List
from app.schemas.alert import Alert, AlertSeverity
from app.schemas.user import UserProfile, MobilityType, TransportType, CompanionType
from app.schemas.risk import PersonalRisk, RiskLevel, RiskBreakdownItem
from app.engines.alert_engine import AlertEngine


class RiskEngine:
    """Calculates personalized risk score based on transparent mathematical formula"""

    @staticmethod
    def calculate_risk(alert: Alert, user: UserProfile) -> PersonalRisk:
        hazard_name = alert.hazard_type.value.replace("_", " ").title() if hasattr(alert.hazard_type, "value") else str(alert.hazard_type).title()
        haz_val = alert.hazard_type.value if hasattr(alert.hazard_type, "value") else str(alert.hazard_type)

        # 1. Hazard Severity Factor (0.0 - 1.0)
        severity_map = {
            AlertSeverity.EXTREME: (1.0, f"Extreme {hazard_name.lower()} alert level active"),
            AlertSeverity.HIGH: (0.85, f"High {hazard_name.lower()} hazard severity warning issued"),
            AlertSeverity.MEDIUM: (0.50, f"Moderate {hazard_name.lower()} risk level"),
            AlertSeverity.LOW: (0.25, f"Low {hazard_name.lower()} advisory severity")
        }
        sev_weight, sev_exp = severity_map.get(alert.severity, (0.5, f"Standard {hazard_name.lower()} severity"))

        # 2. Exposure Factor (0.0 - 1.0) with Fail-Safe Check
        if not alert.lat or not alert.lng or alert.radius_km <= 0:
            exposure_weight, inside_zone = 0.6, True
            exp_text = "Insufficient hazard boundary data: conservative fail-safe exposure applied"
        else:
            exposure_weight, inside_zone = AlertEngine.evaluate_user_exposure(alert, user.lat, user.lng)
            exp_text = f"User is located directly inside the active {hazard_name.lower()} perimeter" if inside_zone else f"User is proximate to the {hazard_name.lower()} perimeter"

        # 3. Vulnerability Factor (0.0 - 1.0)
        mobility_map = {
            MobilityType.WHEELCHAIR: (0.95, "Wheelchair user (step-free path required)"),
            MobilityType.LIMITED: (0.80, "Limited mobility (reduced walking pace, stairs avoidance)"),
            MobilityType.NORMAL: (0.35, "Normal mobility capabilities")
        }
        mob_weight, mob_exp = mobility_map.get(user.mobility, (0.5, "Standard mobility"))

        trans_map = {
            TransportType.WALKING: (0.85, f"Evacuation on foot increases {hazard_name.lower()} ground exposure"),
            TransportType.BICYCLE: (0.65, "Bicycle transport viable on paved roads"),
            TransportType.PUBLIC_TRANSPORT: (0.60, "Public transit subject to emergency disruption"),
            TransportType.CAR: (0.40, "Motor vehicle evacuation")
        }
        trans_weight, _ = trans_map.get(user.transport, (0.5, "Standard transport"))

        comp_map = {
            CompanionType.CHILD: 0.85,
            CompanionType.ELDERLY: 0.90,
            CompanionType.PET: 0.70,
            CompanionType.NONE: 0.40
        }
        comp_weight = comp_map.get(user.companions, 0.4)

        base_vuln = (mob_weight * 0.6) + (trans_weight * 0.25) + (comp_weight * 0.15)

        # Hazard-specific vulnerability adjustments
        hazard_note = None
        if haz_val == "wildfire" and (user.transport == TransportType.WALKING or user.companions in [CompanionType.CHILD, CompanionType.ELDERLY]):
            base_vuln = min(1.0, base_vuln + 0.10)
            hazard_note = "Elevated particulate/smoke inhalation vulnerability"
        elif haz_val == "extreme_heat" and (user.transport == TransportType.WALKING or user.companions == CompanionType.ELDERLY or user.mobility != MobilityType.NORMAL):
            base_vuln = min(1.0, base_vuln + 0.12)
            hazard_note = "High heat-stress exposure risk during pedestrian transit"
        elif haz_val == "cyclone" and (user.transport == TransportType.WALKING or user.mobility == MobilityType.WHEELCHAIR):
            base_vuln = min(1.0, base_vuln + 0.10)
            hazard_note = "Severe wind gale and flying debris vulnerability"
        elif haz_val == "earthquake" and user.mobility != MobilityType.NORMAL:
            base_vuln = min(1.0, base_vuln + 0.10)
            hazard_note = "Compromised structural egress and ground fissure risk"

        vuln_weight = round(base_vuln, 2)

        # 4. Time Pressure Factor (0.0 - 1.0)
        t = alert.time_to_impact_minutes
        if t <= 15:
            time_weight = 1.0
            time_exp = f"Critical evacuation window: Only {t} minutes to impact"
        elif t <= 35:
            time_weight = 0.85
            time_exp = f"Short evacuation window: {t} minutes to impact"
        elif t <= 60:
            time_weight = 0.55
            time_exp = f"Moderate response window: {t} minutes"
        else:
            time_weight = 0.30
            time_exp = f"Extended planning window: {t} minutes"

        raw_composite = (sev_weight * 0.35) + (exposure_weight * 0.25) + (vuln_weight * 0.25) + (time_weight * 0.15)
        raw_score = int(round(raw_composite * 100))
        final_score = max(5, min(98, raw_score))

        if final_score >= 75:
            level = RiskLevel.HIGH if final_score < 90 else RiskLevel.EXTREME
        elif final_score >= 45:
            level = RiskLevel.MEDIUM
        else:
            level = RiskLevel.LOW

        reasons: List[str] = [
            f"High hazard severity ({alert.severity.value.upper()})",
            exp_text,
            mob_exp,
            time_exp,
            "Accessible shelter available within travel radius"
        ]
        if hazard_note:
            reasons.append(hazard_note)

        breakdown = [
            RiskBreakdownItem(
                factor="Hazard Severity",
                weight=0.35,
                contribution=round(sev_weight * 35, 1),
                explanation=sev_exp,
                satisfied=True
            ),
            RiskBreakdownItem(
                factor="Geographic Exposure",
                weight=0.25,
                contribution=round(exposure_weight * 25, 1),
                explanation=exp_text,
                satisfied=inside_zone
            ),
            RiskBreakdownItem(
                factor="Personal Vulnerability",
                weight=0.25,
                contribution=round(vuln_weight * 25, 1),
                explanation=f"{mob_exp} with {user.transport.value} transport",
                satisfied=user.mobility != MobilityType.NORMAL
            ),
            RiskBreakdownItem(
                factor="Time Pressure",
                weight=0.15,
                contribution=round(time_weight * 15, 1),
                explanation=time_exp,
                satisfied=t <= 35
            )
        ]

        return PersonalRisk(
            score=final_score,
            level=level,
            estimated_action_window_minutes=alert.time_to_impact_minutes,
            reasons=reasons,
            breakdown=breakdown,
            hazard_type=haz_val
        )
