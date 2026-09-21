from typing import List, Dict, Any, Tuple
import math
from app.models.models import (
    EmergencyAlert, MobilityTier, SeverityLevel, CertaintyLevel, RiskLevel
)
from app.schemas.schemas import RiskFactorDetail

class RiskEngine:
    @staticmethod
    def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Haversine distance in meters"""
        R = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        a = (math.sin(delta_phi / 2.0) ** 2 +
             math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    @classmethod
    def evaluate(
        cls,
        alert: EmergencyAlert,
        mobility: MobilityTier,
        user_lat: float,
        user_lon: float
    ) -> Tuple[float, RiskLevel, List[RiskFactorDetail], int]:
        """
        Calculates a transparent multi-factor risk assessment.
        Returns: (risk_score, risk_level, risk_factors, action_window_minutes)
        """
        factors: List[RiskFactorDetail] = []
        total_score: float = 0.0

        # 1. Emergency Severity & Certainty Factor (0 - 40 pts)
        severity_map = {
            SeverityLevel.EXTREME: (40.0, "Critical threat to life and infrastructure from rapid flood surge"),
            SeverityLevel.SEVERE: (30.0, "Major flood waters approaching residential zones"),
            SeverityLevel.MODERATE: (20.0, "Rising river level with potential localized waterlogging"),
            SeverityLevel.LOW: (10.0, "Minor flood watch advisory in low-lying sectors")
        }
        sev_pts, sev_desc = severity_map.get(alert.severity, (25.0, "Active emergency event"))
        
        # Certainty adjustment
        if alert.certainty == CertaintyLevel.OBSERVED:
            sev_pts = min(40.0, sev_pts + 5.0)
            sev_desc += " [Directly Observed]"
        
        factors.append(RiskFactorDetail(
            name="Emergency Severity",
            score_impact=sev_pts,
            description=sev_desc,
            severity_level=alert.severity.value
        ))
        total_score += sev_pts

        # 2. Urgency & Time-to-Impact Factor (0 - 30 pts)
        time_to_impact = alert.time_to_impact_minutes
        if time_to_impact <= 12:
            time_pts = 30.0
            time_desc = f"Immediate evacuation window: ~{time_to_impact} minutes until critical threshold"
            time_sev = "CRITICAL"
        elif time_to_impact <= 35:
            time_pts = 20.0
            time_desc = f"Urgent action required: ~{time_to_impact} minutes until localized inundation"
            time_sev = "HIGH"
        elif time_to_impact <= 60:
            time_pts = 12.0
            time_desc = f"Prep window: ~{time_to_impact} minutes to mobilize"
            time_sev = "MODERATE"
        else:
            time_pts = 5.0
            time_desc = f"Monitoring window: ~{time_to_impact} minutes remaining"
            time_sev = "LOW"

        factors.append(RiskFactorDetail(
            name="Time Urgency",
            score_impact=time_pts,
            description=time_desc,
            severity_level=time_sev
        ))
        total_score += time_pts

        # 3. Hazard Proximity Factor (0 - 20 pts)
        # Centroid of Riverside hazard zone ~ (37.7770, -122.4170)
        hazard_center_lat = 37.7770
        hazard_center_lon = -122.4170
        dist_to_hazard = cls.calculate_distance(user_lat, user_lon, hazard_center_lat, hazard_center_lon)

        if dist_to_hazard < 500:
            prox_pts = 20.0
            prox_desc = f"High exposure: Located inside/adjacent to flood plain (~{int(dist_to_hazard)}m away)"
            prox_sev = "CRITICAL"
        elif dist_to_hazard < 1500:
            prox_pts = 14.0
            prox_desc = f"Moderate buffer: Within direct catchment zone (~{int(dist_to_hazard)}m away)"
            prox_sev = "HIGH"
        else:
            prox_pts = 5.0
            prox_desc = f"Peripheral zone (~{int(dist_to_hazard)}m away)"
            prox_sev = "MODERATE"

        factors.append(RiskFactorDetail(
            name="Hazard Proximity",
            score_impact=prox_pts,
            description=prox_desc,
            severity_level=prox_sev
        ))
        total_score += prox_pts

        # 4. Mobility Vulnerability Adjustment (0 - 15 pts)
        if mobility == MobilityTier.WHEELCHAIR:
            mob_pts = 15.0
            mob_desc = "Wheelchair mobility: Curbs, debris, and low-elevation bridges pose high impassability risk"
            mob_sev = "CRITICAL"
        elif mobility == MobilityTier.LIMITED_WALKING:
            mob_pts = 10.0
            mob_desc = "Limited walking mobility: Evacuation velocity reduced; steep grades require avoidance"
            mob_sev = "HIGH"
        else:
            mob_pts = 0.0
            mob_desc = "Standard mobility: Unconstrained pedestrian speed"
            mob_sev = "LOW"

        factors.append(RiskFactorDetail(
            name="Mobility Vulnerability",
            score_impact=mob_pts,
            description=mob_desc,
            severity_level=mob_sev
        ))
        total_score += mob_pts

        # Cap total score at 100
        final_score = min(100.0, round(total_score, 1))

        # Determine overall level
        if final_score >= 75.0:
            risk_level = RiskLevel.CRITICAL
        elif final_score >= 50.0:
            risk_level = RiskLevel.HIGH
        elif final_score >= 25.0:
            risk_level = RiskLevel.MODERATE
        else:
            risk_level = RiskLevel.LOW

        action_window = max(5, time_to_impact - (8 if mobility != MobilityTier.NORMAL else 3))

        return final_score, risk_level, factors, action_window
